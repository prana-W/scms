'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import toast from "react-hot-toast";

export default function UnauthorizedPage() {
    const searchParams = useSearchParams()
    const message = searchParams.get('message') || 'Unauthorized access.'
    toast.error(message)

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 dark:bg-zinc-900 text-center p-4">
            <h1 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-4">Access Denied</h1>
            <p className="text-lg text-gray-800 dark:text-gray-200 mb-6">{message}</p>
            <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                Back to Home
            </Link>
        </div>
    )
}
