import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Complaint from '@/models/Complaint'

// GET: Fetch a single complaint by ID
export async function GET(req: Request, { params }: { params: { complaintId: string } }) {
    try {
        await connectDB()
        const complaint = await Complaint.findById(await params.complaintId)

        if (!complaint) {
            return NextResponse.json({ error: 'Complaint not found' }, { status: 404 })
        }

        return NextResponse.json(complaint)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch complaint' }, { status: 500 })
    }
}

// PUT: Update a complaint by ID
export async function PUT(req: Request, { params }: { params: { complaintId: string } }) {
    try {
        await connectDB()
        const body = await req.json()

        const updatedComplaint = await Complaint.findByIdAndUpdate(await (params.complaintId), body, {
            new: true,
            runValidators: true,
        })

        if (!updatedComplaint) {
            return NextResponse.json({ error: 'Complaint not found' }, { status: 404 })
        }

        return NextResponse.json(updatedComplaint)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update complaint' }, { status: 500 })
    }
}

// DELETE: Remove a complaint by ID
export async function DELETE(req: Request, { params }: { params: { complaintId: string } }) {
    try {
        await connectDB()
        const deleted = await Complaint.findByIdAndDelete(await params.complaintId)

        if (!deleted) {
            return NextResponse.json({ error: 'Complaint not found' }, { status: 404 })
        }

        return NextResponse.json({ message: 'Complaint deleted successfully' })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete complaint' }, { status: 500 })
    }
}
