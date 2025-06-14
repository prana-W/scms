import {NextResponse} from 'next/server';
import connectDB from '@/lib/mongodb';
import Worker from '@/models/Worker';

export const dynamic = 'force-dynamic';

export async function GET(
    req: Request,
    {params}: { params: { workerId: string } }
) {
    try {
        await connectDB();

        const {workerId} = await params;

        if (!workerId) {
            return NextResponse.json({error: 'Worker ID is required'}, {status: 400});
        }

        const worker = await Worker.findById(workerId);

        if (!worker) {
            return NextResponse.json({error: 'Worker not found'}, {status: 404});
        }

        return NextResponse.json(worker);
    } catch (err) {
        console.error('Error fetching worker:', err);
        return NextResponse.json({error: 'Failed to fetch worker'}, {status: 500});
    }
}
