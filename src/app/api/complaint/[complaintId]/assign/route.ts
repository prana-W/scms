import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Complaint from '@/models/Complaint'
import Worker from '@/models/Worker'

interface Params {
    params: {
        complaintId: string
    }
}

export async function PUT(req: NextRequest, { params }: Params) {
    try {
        await connectDB()

        const { complaintId } = await params
        const { assignedTo, priority } = await req.json()

        const worker = await Worker.findOne({workerId: assignedTo})

        if (!assignedTo || !priority) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const updatedComplaint = await Complaint.findByIdAndUpdate(
            complaintId,
            { assignedTo: worker._id, priority },
            { new: true }
        )

        console.log(updatedComplaint)

        if (!updatedComplaint) {
            return NextResponse.json({ error: 'Complaint not found' }, { status: 404 })
        }

        return NextResponse.json(updatedComplaint)
    } catch (err) {
        console.error('Error assigning complaint:', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
