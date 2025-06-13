import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
    const formData = await req.formData();

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const type = formData.get('type') as string;
    const image = formData.get('image') as File;

    if (!title || !description || !type || !image) {
        return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const buffer = Buffer.from(await image.arrayBuffer());

    return new Promise((resolve) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'scms-complaints' },
            (error, result) => {
                if (error || !result) {
                    resolve(
                        NextResponse.json({ error: 'Cloudinary upload failed' }, { status: 500 })
                    );
                } else {
                    resolve(
                        NextResponse.json({
                            message: 'Complaint submitted successfully',
                            imageUrl: result.secure_url,
                            title,
                            description,
                            type,
                        })
                    );
                }
            }
        );

        uploadStream.end(buffer);
    });
}
