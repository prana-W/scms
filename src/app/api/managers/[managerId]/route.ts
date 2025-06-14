import {NextResponse} from 'next/server';
import connectDB from '@/lib/mongodb';
import Manager from '@/models/Manager';

export const dynamic = 'force-dynamic';

export async function GET(
    req: Request,
    {params}: { params: { managerId: string } }
) {
    try {
        await connectDB();

        const {managerId} = await params;

        if (!managerId) {
            return NextResponse.json({error: 'Manager ID is required'}, {status: 400});
        }

        const manager = await Manager.findById(managerId);

        if (!manager) {
            return NextResponse.json({error: 'Manager not found'}, {status: 404});
        }

        return NextResponse.json(manager);
    } catch (err) {
        console.error('Error fetching manager:', err);
        return NextResponse.json({error: 'Failed to fetch manager'}, {status: 500});
    }
}
