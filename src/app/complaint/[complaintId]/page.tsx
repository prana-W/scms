'use client'

import {useRouter} from 'next/navigation'
import {use, useEffect, useState} from 'react'
import toast from "react-hot-toast";

interface created_by {
    _id: string;
    name: string
}

interface Complaint {
    _id: string
    complaintNumber: string
    title: string
    description: string
    type: string
    image: string,
    assignedTo: string,
    status: string,
    qrCode: string,
    priority: string,
    createdBy: created_by
}

interface Worker {
    _id: string
    name: string
    workerId: string
}

interface Props {
    params: {
        complaintId: string
    }
}


const fetchUser = async () => {
    const res = await fetch('/api/auth/user', {credentials: 'include'})
    const data = await res.json()
    return data.user
}

const getCurrentUserRole = async (): Promise<"resident" | "manager" | "worker"> => {
    try {
        const user = await fetchUser()
        return user?.role || 'resident'
    } catch {
        return 'resident'
    }
}

const getCurrentUserId = async (): Promise<string> => {
    try {
        const user = await fetchUser()
        return user?._id || ''
    } catch {
        return ''
    }
}


export default function ComplaintPage({params}: Props) {
    const router = useRouter()
    const [complaint, setComplaint] = useState<Complaint | null>(null)
    const [workers, setWorkers] = useState<Worker[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [qrCodeInput, setQrCodeInput] = useState('')
    const [userRole, setUserRole] = useState<"resident" | "manager" | "worker">("resident")
    const [userId, setUserId] = useState<string>('')

    // @ts-ignore
    const {complaintId} = use(params)

// Fetch complaint and workers on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [role, id] = await Promise.all([
                    getCurrentUserRole(),
                    getCurrentUserId()
                ])
                setUserRole(role)
                setUserId(id)

                // Fetch complaint
                const complaintRes = await fetch(`/api/complaint/${complaintId}`)
                if (!complaintRes.ok) throw new Error('Complaint not found')
                const complaintData = await complaintRes.json()
                setComplaint(complaintData)

                // Fetch workers if user is manager
                if (role === 'manager') {
                    const workersRes = await fetch('/api/workers')
                    if (workersRes.ok) {
                        const workersData = await workersRes.json()
                        setWorkers(workersData)
                    }
                }
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [complaintId])

    // Update handler for residents
    const handleResidentUpdate = async () => {
        try {
            const res = await fetch(`/api/complaint/${complaintId}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    title: complaint?.title,
                    description: complaint?.description,
                    type: complaint?.type,
                }),
            })

            if (!res.ok) throw new Error('Failed to update complaint')
            toast.success('Complaint updated successfully!')
            router.push('/complaint')

        } catch (err: any) {
            toast.error('Complaint was not updated!')
        }
    }

    // Assignment handler for managers
    const handleManagerAssignment = async () => {
        try {
            const res = await fetch(`/api/complaint/${complaintId}/assign`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    assignedTo: complaint?.assignedTo,
                    priority: complaint?.priority,
                }),
            })

            if (!res.ok) throw new Error('Failed to assign complaint')
            toast.success('Complaint assigned successfully!')

            // Refresh complaint data
            const updatedRes = await fetch(`/api/complaint/${complaintId}`)
            const updatedData = await updatedRes.json()
            setComplaint(updatedData)
        } catch (err: any) {
            toast.error('Unable to assign complaint!')
        }
    }

    // Accept complaint handler for workers
    const handleWorkerAccept = async () => {
        try {
            const res = await fetch(`/api/complaint/${complaintId}/accept`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({workerId: userId}),
            })

            if (!res.ok) throw new Error('Failed to accept complaint')
            alert('Complaint accepted!')

            // Refresh complaint data
            const updatedRes = await fetch(`/api/complaint/${complaintId}`)
            const updatedData = await updatedRes.json()
            setComplaint(updatedData)
        } catch (err: any) {
            alert(err.message)
        }
    }

    // Resolve complaint handler for workers
    const handleWorkerResolve = async () => {
        if (!qrCodeInput.trim()) {
            alert('Please enter the QR code or confirmation string')
            return
        }

        try {
            const res = await fetch(`/api/complaint/${complaintId}/resolve`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    qrCode: qrCodeInput,
                    workerId: userId
                }),
            })

            if (!res.ok) throw new Error('Failed to resolve complaint')
            alert('Complaint resolved successfully!')

            // Refresh complaint data
            const updatedRes = await fetch(`/api/complaint/${complaintId}`)
            const updatedData = await updatedRes.json()
            setComplaint(updatedData)
        } catch (err: any) {
            alert(err.message)
        }
    }

    // Delete handler for residents
    const handleDelete = async () => {
        const confirmed = confirm('Are you sure you want to delete this complaint?')
        if (!confirmed) return

        try {
            const res = await fetch(`/api/complaint/${complaintId}`, {
                method: 'DELETE',
            })

            if (!res.ok) throw new Error('Failed to delete complaint')
            toast.success('Complaint was marked as resolved!')
            router.push('/complaint')
        } catch (err: any) {
            toast.error("Unable to delete complaint!")
            alert(err.message)
        }
    }

    // Controlled input change
    const handleChange = (field: keyof Complaint, value: string) => {
        if (complaint) setComplaint({...complaint, [field]: value})
    }

    if (loading) return <div className="p-6">Loading...</div>
    if (error) return <div className="p-6 text-red-600">Error: {error}</div>

    console.log(complaint)

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold mb-2">
                        Complaint #{complaint?.complaintNumber}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Created By: {complaint?.createdBy?.name}</span>
                        <span>Status: {complaint?.status}</span>
                        <span>Priority: {complaint?.priority}</span>
                    </div>
                </div>

                {/* Complaint Image - Everyone can see */}
                {complaint?.image && (
                    <div className="mb-6">
                        <img
                            src={complaint.image}
                            alt="Complaint"
                            className="max-w-md rounded-lg shadow-sm"
                        />
                    </div>
                )}
                {complaint?.qrCode && userRole === 'resident' && (
                    <div className="mt-4">
                        <h3 className="font-semibold">QR Code:</h3>
                        <img src={complaint.qrCode} alt="QR Code" className="w-48 h-48"/>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column - Complaint Details */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Complaint Details</h2>

                        {/* Title - Everyone sees, only resident can edit */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Title</label>
                            {userRole === 'resident' ? (
                                <input
                                    type="text"
                                    value={complaint?.title || ''}
                                    onChange={(e) => handleChange('title', e.target.value)}
                                    className="w-full border rounded p-2"
                                    placeholder="Title"
                                />
                            ) : (
                                <p className="p-2 bg-gray-50 rounded">{complaint?.title}</p>
                            )}
                        </div>

                        {/* Description - Everyone sees, only resident can edit */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            {userRole === 'resident' ? (
                                <textarea
                                    value={complaint?.description || ''}
                                    onChange={(e) => handleChange('description', e.target.value)}
                                    className="w-full border rounded p-2"
                                    placeholder="Description"
                                    rows={4}
                                />
                            ) : (
                                <p className="p-2 bg-gray-50 rounded min-h-[100px]">{complaint?.description}</p>
                            )}
                        </div>

                        {/* Type - Everyone sees, only resident can edit */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Type</label>

                            <p className="p-2 bg-gray-50 rounded">{complaint?.type}</p>

                        </div>

                        {/* Assigned To - Everyone sees */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Assigned To</label>
                            <p className="p-2 bg-gray-50 rounded">{complaint?.assignedTo || 'Not assigned'}</p>
                        </div>

                    </div>

                    {/* Right Column - Role-specific Actions */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Actions</h2>

                        {/* Resident Actions */}
                        {userRole === 'resident' && (
                            <div className="space-y-3">
                                <button
                                    onClick={handleResidentUpdate}
                                    className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                >
                                    Update Complaint
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                                >
                                    Delete Complaint
                                </button>
                            </div>
                        )}

                        {/* Manager Actions */}
                        {userRole === 'manager' && (
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Assign to Worker</label>
                                    <select
                                        value={complaint?.assignedTo || ''}
                                        onChange={(e) => handleChange('assignedTo', e.target.value)}
                                        className="w-full border rounded p-2"
                                    >
                                        <option value="">Select a worker</option>
                                        {workers.map(worker => (
                                            <option key={worker._id} value={worker.workerId}>
                                                {worker.name} ({worker.workerId})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Priority</label>
                                    <select
                                        value={complaint?.priority || ''}
                                        onChange={(e) => handleChange('priority', e.target.value)}
                                        className="w-full border rounded p-2"
                                    >
                                        <option value="">Select priority</option>
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>

                                <button
                                    onClick={handleManagerAssignment}
                                    className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                >
                                    Assign Complaint
                                </button>
                            </div>
                        )}

                        {/* Worker Actions */}
                        {userRole === 'worker' && (
                            <div className="space-y-3">
                                {complaint?.status === 'assigned' && complaint?.assignedTo === userId && (
                                    <button
                                        onClick={handleWorkerAccept}
                                        className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                    >
                                        Accept Complaint
                                    </button>
                                )}

                                {complaint?.status === 'in-progress' && complaint?.assignedTo === userId && (
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium">QR Code / Confirmation
                                            String</label>
                                        <input
                                            type="text"
                                            value={qrCodeInput}
                                            onChange={(e) => setQrCodeInput(e.target.value)}
                                            className="w-full border rounded p-2"
                                            placeholder="Enter QR code or confirmation string"
                                        />
                                        <button
                                            onClick={handleWorkerResolve}
                                            className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                        >
                                            Resolve Complaint
                                        </button>
                                    </div>
                                )}

                                {complaint?.assignedTo !== userId && (
                                    <p className="text-gray-600 text-sm">
                                        This complaint is not assigned to you.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}