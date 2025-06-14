import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import connectDB  from '@/lib/mongodb';
import Complaint from '@/models/Complaint';
import Worker from '../../../models/Worker'
import jwt from 'jsonwebtoken';

// Types
interface JWTPayload {
    user: {
        _id: string;
        role: 'resident' | 'worker' | 'manager';
        name: string;
        email: string;
    };
}

interface ComplaintCreateData {
    title: string;
    description: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
}

interface ComplaintUpdateData {
    title?: string;
    description?: string;
    category?: string;
    priority?: 'low' | 'medium' | 'high';
    status?: 'pending' | 'in-progress' | 'resolved' | 'rejected';
    assignedTo?: string;
}

async function cloudinaryFun(req: NextRequest) {
    const formData = await req.formData();

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const type = formData.get('type') as string;
    const image = formData.get('image') as File;

    if (!title || !description || !type || !image) {
        return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const buffer = Buffer.from(await image.arrayBuffer());

    return new Promise((resolve) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'scms-complaints' },
            (error, result) => {
                if (error || !result) {
                    resolve(
                        NextResponse.json({ error: 'Cloudinary upload failed' }, { status: 500 })
                    );
                } else {
                    resolve(
                        NextResponse.json({
                            message: 'Complaint submitted successfully',
                            imageUrl: result.secure_url,
                            title,
                            description,
                            type,
                        })
                    );
                }
            }
        );

        uploadStream.end(buffer);
    });
}


// Helper function to verify JWT token
const verifyToken = (request: NextRequest): JWTPayload | null => {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
        return decoded;
    } catch (error) {
        console.error('Token verification failed:', error);
        return null;
    }
};

// GET - Fetch complaints based on user role
export async function GET(request: NextRequest) {
    try {
        // Verify authentication
        const decoded = verifyToken(request);
        if (!decoded) {
            return NextResponse.json(
                { error: 'Unauthorized - Invalid or missing token' },
                { status: 401 }
            );
        }

        const { user } = decoded;

        // Connect to database
        await connectDB();

        let complaints;

        // Fetch complaints based on user role
        switch (user.role) {
            case 'manager':
                // Manager gets all complaints with full details
                complaints = await Complaint.find({})
                    .populate('createdBy', 'name email')
                    .populate('assignedTo', 'name email')
                    .sort({ createdAt: -1 });
                break;

            case 'resident':
                // Resident gets only their complaints
                complaints = await Complaint.find({ createdBy: user._id })
                    .populate('createdBy', 'name email')
                    .populate('assignedTo', 'name email')
                    .sort({ createdAt: -1 });
                break;

            case 'worker':
                // Worker gets complaints assigned to them
                complaints = await Complaint.find({ assignedTo: user._id })
                    .populate('createdBy', 'name email')
                    .populate('assignedTo', 'name email')
                    .sort({ createdAt: -1 });
                break;

            default:
                return NextResponse.json(
                    { error: 'Invalid user role' },
                    { status: 403 }
                );
        }

        return NextResponse.json({
            success: true,
            complaints,
            count: complaints.length,
            userRole: user.role
        });

    } catch (error) {
        console.error('Error fetching complaints:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST - Create new complaint (residents only)
export async function POST(request: NextRequest) {
    try {

        cloudinaryFun(request)

        // Verify authentication
        const decoded = verifyToken(request);
        if (!decoded) {
            return NextResponse.json(
                { error: 'Unauthorized - Invalid or missing token' },
                { status: 401 }
            );
        }

        const { user } = decoded;

        // Only residents can create complaints
        if (user.role !== 'resident') {
            return NextResponse.json(
                { error: 'Only residents can create complaints' },
                { status: 403 }
            );
        }

        // Parse request body
        const body: ComplaintCreateData = await request.json();
        const { title, description, category, priority } = body;

        // Validate required fields
        if (!title || !description || !category) {
            return NextResponse.json(
                { error: 'Title, description, and category are required' },
                { status: 400 }
            );
        }

        // Validate priority
        if (priority && !['low', 'medium', 'high'].includes(priority)) {
            return NextResponse.json(
                { error: 'Priority must be low, medium, or high' },
                { status: 400 }
            );
        }

        // Connect to database
        await connectDB();

        // Create new complaint
        const newComplaint = new Complaint({
            title: title.trim(),
            description: description.trim(),
            category: category.trim(),
            priority: priority || 'medium',
            status: 'pending',
            createdBy: user._id,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const savedComplaint = await newComplaint.save();

        // Populate the created complaint
        const populatedComplaint = await Complaint.findById(savedComplaint._id)
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email');

        return NextResponse.json({
            success: true,
            message: 'Complaint created successfully',
            complaint: populatedComplaint
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating complaint:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT - Update complaint (role-based permissions)
export async function PUT(request: NextRequest) {
    try {
        // Verify authentication
        const decoded = verifyToken(request);
        if (!decoded) {
            return NextResponse.json(
                { error: 'Unauthorized - Invalid or missing token' },
                { status: 401 }
            );
        }

        const { user } = decoded;
        const { searchParams } = new URL(request.url);
        const complaintId = searchParams.get('id');

        if (!complaintId) {
            return NextResponse.json(
                { error: 'Complaint ID is required' },
                { status: 400 }
            );
        }

        // Parse request body
        const body: ComplaintUpdateData = await request.json();

        // Connect to database
        await connectDB();

        // Find the complaint
        const complaint = await Complaint.findById(complaintId);
        if (!complaint) {
            return NextResponse.json(
                { error: 'Complaint not found' },
                { status: 404 }
            );
        }

        // Role-based update permissions
        let allowedUpdates: string[] = [];

        switch (user.role) {
            case 'manager':
                // Manager can update everything
                allowedUpdates = ['title', 'description', 'category', 'priority', 'status', 'assignedTo'];
                break;

            case 'worker':
                // Worker can only update status and add notes (if implemented)
                allowedUpdates = ['status'];
                // Only if assigned to them
                if (complaint.assignedTo?.toString() !== user._id) {
                    return NextResponse.json(
                        { error: 'You can only update complaints assigned to you' },
                        { status: 403 }
                    );
                }
                break;

            case 'resident':
                // Resident can only update their own complaints and only if pending
                if (complaint.createdBy.toString() !== user._id) {
                    return NextResponse.json(
                        { error: 'You can only update your own complaints' },
                        { status: 403 }
                    );
                }
                if (complaint.status !== 'pending') {
                    return NextResponse.json(
                        { error: 'You can only update pending complaints' },
                        { status: 403 }
                    );
                }
                allowedUpdates = ['title', 'description', 'category', 'priority'];
                break;

            default:
                return NextResponse.json(
                    { error: 'Invalid user role' },
                    { status: 403 }
                );
        }

        // Filter updates based on permissions
        const updateData: any = {};
        Object.keys(body).forEach(key => {
            if (allowedUpdates.includes(key) && body[key as keyof ComplaintUpdateData] !== undefined) {
                updateData[key] = body[key as keyof ComplaintUpdateData];
            }
        });

        // Validate assignedTo if being updated
        if (updateData.assignedTo) {
            const assignedUser = await Worker.findById(updateData.assignedTo);
            if (!assignedUser || assignedUser.role !== 'worker') {
                return NextResponse.json(
                    { error: 'Invalid worker assignment' },
                    { status: 400 }
                );
            }
        }

        // Validate status transition
        if (updateData.status) {
            const validStatuses = ['pending', 'in-progress', 'resolved', 'rejected'];
            if (!validStatuses.includes(updateData.status)) {
                return NextResponse.json(
                    { error: 'Invalid status' },
                    { status: 400 }
                );
            }
        }

        // Update timestamp
        updateData.updatedAt = new Date();

        // Update the complaint
        const updatedComplaint = await Complaint.findByIdAndUpdate(
            complaintId,
            updateData,
            { new: true, runValidators: true }
        )
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email');

        return NextResponse.json({
            success: true,
            message: 'Complaint updated successfully',
            complaint: updatedComplaint
        });

    } catch (error) {
        console.error('Error updating complaint:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE - Delete complaint (manager only)
export async function DELETE(request: NextRequest) {
    try {
        // Verify authentication
        const decoded = verifyToken(request);
        if (!decoded) {
            return NextResponse.json(
                { error: 'Unauthorized - Invalid or missing token' },
                { status: 401 }
            );
        }

        const { user } = decoded;

        // Only managers can delete complaints
        if (user.role !== 'manager') {
            return NextResponse.json(
                { error: 'Only managers can delete complaints' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const complaintId = searchParams.get('id');

        if (!complaintId) {
            return NextResponse.json(
                { error: 'Complaint ID is required' },
                { status: 400 }
            );
        }

        // Connect to database
        await connectDB();

        // Find and delete the complaint
        const deletedComplaint = await Complaint.findByIdAndDelete(complaintId);

        if (!deletedComplaint) {
            return NextResponse.json(
                { error: 'Complaint not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Complaint deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting complaint:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}



