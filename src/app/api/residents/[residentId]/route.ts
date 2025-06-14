import {NextResponse} from 'next/server';
import connectDB from '@/lib/mongodb';
import Resident from '@/models/Resident';

export const dynamic = 'force-dynamic';

export async function GET(
    req: Request,
    {params}: { params: { residentId: string } }
) {
    try {
        await connectDB();

        const {residentId} = await params;

        if (!residentId) {
            return NextResponse.json({error: 'Resident ID is required'}, {status: 400});
        }

        const resident = await Resident.findById(residentId);

        if (!resident) {
            return NextResponse.json({error: 'Resident not found'}, {status: 404});
        }

        return NextResponse.json(resident);
    } catch (err) {
        console.error('Error fetching resident:', err);
        return NextResponse.json({error: 'Failed to fetch resident'}, {status: 500});
    }
}
