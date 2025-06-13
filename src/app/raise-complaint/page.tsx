'use client';

import React from 'react';
import {useForm} from 'react-hook-form';
import {useRouter} from 'next/navigation';
import toast from 'react-hot-toast';

interface ComplaintFormInputs {
    title: string;
    description: string;
    type: string;
    image: FileList;
}

const RaiseComplaintPage = () => {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: {isSubmitting},
        reset,
    } = useForm<ComplaintFormInputs>();

    const onSubmit = async (data: ComplaintFormInputs) => {
        toast.loading('Submitting complaint...');

        try {
            let imageUrl = '';
            if (data.image && data.image.length > 0) {
                const formData = new FormData();
                formData.append('file', data.image[0]);
                formData.append('upload_preset', 'scms_v0');

                const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/dptrdejjc/image/upload`, {
                    method: 'POST',
                    body: formData,
                });

                const cloudData = await cloudRes.json();

                if (!cloudData.secure_url) throw new Error('Image upload failed');
                imageUrl = cloudData.secure_url;
            }

            const res = await fetch('/api/complaint/raise-complaint', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    title: data.title,
                    description: data.description,
                    type: data.type,
                    image: imageUrl || null,
                }),
            });

            if (!res.ok) throw new Error('Failed to submit');

            toast.dismiss();
            toast.success('Complaint submitted!');
            reset();
            router.push('/dashboard');
        } catch (err) {
            toast.dismiss();
            toast.error('Failed to submit complaint');
        }
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 px-6 py-12">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold text-orange-600 mb-6">Raise a Complaint</h1>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-6 bg-gray-50 p-6 rounded-lg shadow-md"
                >
                    <div>
                        <label className="block font-semibold mb-1">Title</label>
                        <input
                            type="text"
                            {...register('title', {required: true})}
                            className="w-full border px-3 py-2 rounded-md"
                            placeholder="Leak in bathroom..."
                        />
                    </div>

                    <div>
                        <label className="block font-semibold mb-1">Description</label>
                        <textarea
                            {...register('description', {required: true})}
                            className="w-full border px-3 py-2 rounded-md"
                            rows={4}
                            placeholder="Describe the issue in detail..."
                        />
                    </div>

                    <div>
                        <label className="block font-semibold mb-1">Complaint Type</label>
                        <select
                            {...register('type', {required: true})}
                            className="w-full border px-3 py-2 rounded-md"
                        >
                            <option value="">Select type</option>
                            <option value="electricity">Electricity</option>
                            <option value="plumbing">Plumbing</option>
                            <option value="cleaning">Cleaning</option>
                            <option value="damage">Damage</option>
                            <option value="theft">Theft</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block font-semibold mb-1">Image (optional)</label>
                        <input
                            type="file"
                            accept="image/*"
                            {...register('image')}
                            className="w-full"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 transition-colors"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RaiseComplaintPage;
