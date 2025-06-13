import { NextResponse } from 'next/server';
import Complaint from '@/models/Complaint';
import connectDB from '@/lib/mongodb';
import getUserFromToken from '@/lib/auth';

export async function POST(req: Request) {

    const currentUser = await getUserFromToken();

    try {

        await connectDB();
        const body = await req.json();

        const complaint = await Complaint.create({
            ...body,
            // @ts-ignore
            createdBy: currentUser._id,
            // @ts-ignore
            complaintNumber: `C${currentUser._id}${Date.now()}`
        });

        return NextResponse.json(complaint);
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
