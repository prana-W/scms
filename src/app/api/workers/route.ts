import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Worker from '@/models/Worker'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        await connectDB()
        const workers = await Worker.find()
        return NextResponse.json(workers)
    } catch (err) {
        console.error('Error fetching workers:', err)
        return NextResponse.json({ error: 'Failed to fetch workers' }, { status: 500 })
    }
}
