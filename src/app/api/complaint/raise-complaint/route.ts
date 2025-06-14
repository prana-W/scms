import { NextResponse } from 'next/server';
import Complaint from '@/models/Complaint';
import connectDB from '@/lib/mongodb';
import getUserFromToken from "@/lib/auth";
import QRCode from 'qrcode'
import {nanoid} from 'nanoid';

export async function POST(req: Request) {

    try {
        const currentUser = await getUserFromToken()
        await connectDB();
        const body = await req.json();
        const complaintNumber = nanoid(10);
        const qrCodeDataURL = await QRCode.toDataURL(complaintNumber)

        const complaint = await Complaint.create({
            ...body,
            // @ts-ignore
            createdBy: currentUser._id,
            // @ts-ignore
            complaintNumber,
            qrCode: qrCodeDataURL
        });

        return NextResponse.json(complaint);
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
