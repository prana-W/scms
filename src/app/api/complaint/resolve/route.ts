import {NextResponse} from 'next/server';
import Complaint from "../../../../models/Complaint"

export async function POST(req: Request) {
    const {code} = await req.json();

    await Complaint.deleteOne({complaintNumber: code})

    return NextResponse.json({success: true, received: code});
}
