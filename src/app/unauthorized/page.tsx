'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function UnauthorizedPage() {
    const searchParams = useSearchParams()
    const router = useRouter()

    useEffect(() => {
        const msg = searchParams.get('message')
        if (msg) {
            toast.error(decodeURIComponent(msg))
        }
    }, [searchParams])

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
            <h1 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-4">
                Unauthorized Access
            </h1>
            <p className="text-gray-700 dark:text-gray-300 mb-6 text-center max-w-md">
                You do not have permission to view this page.
            </p>
            <button
                onClick={() => router.push('/')}
                className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all"
            >
                Go back to Home
            </button>
        </div>
    )
}
