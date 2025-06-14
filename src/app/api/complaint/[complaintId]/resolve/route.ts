import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import Complaint from '../../../../../models/Complaint';
import Worker from '../../../../../models/Worker';

const JWT_SECRET = process.env.JWT_SECRET!

export async function POST(req: Request) {
    try {

        const { code } = await req.json();
        if (!code) return NextResponse.json({ success: false, message: "No complaint code provided" }, { status: 400 });

        const complaint = await Complaint.findOne({ complaintNumber: code });
        if (!complaint) return NextResponse.json({ success: false, message: "Complaint not found" }, { status: 404 });

        const timeTakenMs = Date.now() - new Date(complaint.updatedAt).getTime();
        const timeTakenHr = timeTakenMs / (1000 * 60 * 60);

        let tokens = 10;
        if (timeTakenHr < 6) tokens = 500;
        else if (timeTakenHr < 12) tokens = 250;
        else if (timeTakenHr < 24) tokens = 100;
        else if (timeTakenHr < 48) tokens = 50;

        await Complaint.deleteOne({ complaintNumber: code });

        const cookieHeader = req.headers.get('cookie') || '';
        const jwtMatch = cookieHeader.match(/token=([^;]+)/);
        if (!jwtMatch) return NextResponse.json({ success: false, message: "Token not found in cookies" }, { status: 401 });

        const decoded = jwt.verify(jwtMatch[1], JWT_SECRET) as { _id: string };
        const userId = decoded._id;

        // 7. Update worker token balance
        const worker = await Worker.findById(userId);
        if (!worker) return NextResponse.json({ success: false, message: "Worker not found" }, { status: 404 });

        worker.tokens = (worker.tokens || 0) + tokens;
        await worker.save();

        return NextResponse.json({
            success: true,
            complaintCode: code,
            timeTakenHr: Math.round(timeTakenHr * 100) / 100,
            tokenAwarded: tokens,
        });
    } catch (error) {
        console.error('Error resolving complaint:', error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}
