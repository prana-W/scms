'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Types
interface User {
    _id: string;
    role: 'resident' | 'worker' | 'manager';
    name: string;
    phone: string
}

interface Complaint {
    _id: string;
    title: string;
    description: string;
    status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
    priority: 'low' | 'medium' | 'high';
    type: string;
    createdBy: {
        _id: string;
        name: string;
        email: string;
    };
    assignedTo?: {
        _id: string;
        name: string;
        email: string;
    };
    createdAt: string;
    updatedAt: string;
}

// Filter types
type FilterType = 'all' | 'recent' | 'open' | 'pending' | 'in-progress' | 'resolved' | 'high-priority' | 'assigned' | 'unassigned';
type SortType = 'newest' | 'oldest' | 'priority' | 'status';

const ComplaintPage = () => {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [sortBy, setSortBy] = useState<SortType>('newest');
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    const getCookie = (name: string): string | null => {
        if (typeof window === 'undefined') return null; // SSR safety

        const cookieString = document.cookie;
        const cookies = cookieString.split('; '); // safer with space after ;

        for (const cookie of cookies) {
            const [key, value] = cookie.split('=');
            if (key === name) {
                return decodeURIComponent(value);
            }
        }

        return null;
    }

    const getUserFromToken = () => {
        try {
            const token = getCookie('token')
            console.log(token)
            if (!token) {
                router.push('/login');
                return null;
            }

            // Decode JWT token (simple base64 decode for payload)
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.user;
        } catch (error) {
            console.error('Error decoding token:', error);
            router.push('/login');
            return null;
        }
    };

    // Fetch complaints based on user role
    const fetchComplaints = async (userRole: string, userId: string) => {
        try {
            const token = getCookie('token');
            const response = await fetch('/api/complaints', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch complaints');
            }

            const data = await response.json();
            let filteredComplaints = data.complaints;

            // Filter complaints based on user role
            switch (userRole) {
                case 'manager':
                    // Manager gets all complaints
                    break;
                case 'resident':
                    // Resident gets only their complaints
                    filteredComplaints = data.complaints.filter(
                        (complaint: Complaint) => complaint.createdBy._id === userId
                    );
                    break;
                case 'worker':
                    // Worker gets complaints assigned to them
                    filteredComplaints = data.complaints.filter(
                        (complaint: Complaint) => complaint.assignedTo?._id === userId
                    );
                    break;
                default:
                    filteredComplaints = [];
            }

            setComplaints(filteredComplaints);
        } catch (error) {
            console.error('Error fetching complaints:', error);
            setError('Failed to fetch complaints');
        }
    };

    useEffect(() => {
        const currentUser = getUserFromToken();
        if (currentUser) {
            setUser(currentUser);
            fetchComplaints(currentUser.role, currentUser._id);
        }
        setLoading(false);
    }, []);

    // Filter and sort complaints
    useEffect(() => {
        let filtered = [...complaints];

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(
                (complaint) =>
                    complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    complaint.type.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply status/type filters
        switch (activeFilter) {
            case 'recent':
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                filtered = filtered.filter(
                    (complaint) => new Date(complaint.createdAt) >= sevenDaysAgo
                );
                break;
            case 'open':
                filtered = filtered.filter(
                    (complaint) => complaint.status === 'pending' || complaint.status === 'in-progress'
                );
                break;
            case 'pending':
                filtered = filtered.filter((complaint) => complaint.status === 'pending');
                break;
            case 'in-progress':
                filtered = filtered.filter((complaint) => complaint.status === 'in-progress');
                break;
            case 'resolved':
                filtered = filtered.filter((complaint) => complaint.status === 'resolved');
                break;
            case 'high-priority':
                filtered = filtered.filter((complaint) => complaint.priority === 'high');
                break;
            case 'assigned':
                filtered = filtered.filter((complaint) => complaint.assignedTo);
                break;
            case 'unassigned':
                filtered = filtered.filter((complaint) => !complaint.assignedTo);
                break;
            case 'all':
            default:
                break;
        }

        // Apply sorting
        switch (sortBy) {
            case 'newest':
                filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
            case 'oldest':
                filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                break;
            case 'priority':
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                filtered.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
                break;
            case 'status':
                const statusOrder = { pending: 4, 'in-progress': 3, resolved: 2, rejected: 1 };
                filtered.sort((a, b) => statusOrder[b.status] - statusOrder[a.status]);
                break;
            default:
                break;
        }

        setFilteredComplaints(filtered);
    }, [complaints, activeFilter, sortBy, searchTerm]);

    // Get available filters based on user role
    const getAvailableFilters = (): { key: FilterType; label: string; count?: number }[] => {
        const baseFilters = [
            { key: 'all' as FilterType, label: 'All', count: complaints.length },
            { key: 'recent' as FilterType, label: 'Recent (7 days)', count: complaints.filter(c => {
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                    return new Date(c.createdAt) >= sevenDaysAgo;
                }).length },
            { key: 'open' as FilterType, label: 'Open', count: complaints.filter(c => c.status === 'pending' || c.status === 'in-progress').length },
            { key: 'pending' as FilterType, label: 'Pending', count: complaints.filter(c => c.status === 'pending').length },
            { key: 'in-progress' as FilterType, label: 'In Progress', count: complaints.filter(c => c.status === 'in-progress').length },
            { key: 'resolved' as FilterType, label: 'Resolved', count: complaints.filter(c => c.status === 'resolved').length },
            { key: 'high-priority' as FilterType, label: 'High Priority', count: complaints.filter(c => c.priority === 'high').length },
        ];

        // Add role-specific filters
        if (user?.role === 'manager') {
            baseFilters.push(
                { key: 'assigned' as FilterType, label: 'Assigned', count: complaints.filter(c => c.assignedTo).length },
                { key: 'unassigned' as FilterType, label: 'Unassigned', count: complaints.filter(c => !c.assignedTo).length }
            );
        }

        return baseFilters;
    };
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'in-progress':
                return 'bg-blue-100 text-blue-800';
            case 'resolved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Get priority color
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'bg-red-100 text-red-800';
            case 'medium':
                return 'bg-orange-100 text-orange-800';
            case 'low':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Get page title based on user role
    const getPageTitle = () => {
        switch (user?.role) {
            case 'manager':
                return 'All Complaints - Manager Dashboard';
            case 'resident':
                return 'My Complaints';
            case 'worker':
                return 'Assigned Complaints';
            default:
                return 'Complaints';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-xl mb-4">{error}</div>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">{getPageTitle()}</h1>
                    <p className="mt-2 text-gray-600">
                        {user?.role === 'manager' && `Viewing all complaints in the system`}
                        {user?.role === 'resident' && `Your submitted complaints`}
                        {user?.role === 'worker' && `Complaints assigned to you`}
                    </p>
                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <span className="text-sm text-gray-500">
              Showing {filteredComplaints.length} of {complaints.length} complaint{complaints.length !== 1 ? 's' : ''}
            </span>
                        {user?.role === 'resident' && (
                            <button
                                onClick={() => router.push('/complaints/new')}
                                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors w-full sm:w-auto"
                            >
                                New Complaint
                            </button>
                        )}
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="mb-6 space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search complaints by title, description, or category..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex flex-wrap gap-2">
                        {getAvailableFilters().map((filter) => (
                            <button
                                key={filter.key}
                                onClick={() => setActiveFilter(filter.key)}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                    activeFilter === filter.key
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {filter.label}
                                {filter.count !== undefined && (
                                    <span className={`ml-1.5 ${
                                        activeFilter === filter.key ? 'text-blue-100' : 'text-gray-500'
                                    }`}>
                    ({filter.count})
                  </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Sort Options */}
                    <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-700">Sort by:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortType)}
                            className="border rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="priority">Priority</option>
                            <option value="status">Status</option>
                        </select>
                    </div>
                </div>

                {/* Complaints List */}
                {filteredComplaints.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-500 text-lg">
                            {searchTerm || activeFilter !== 'all' ? (
                                <>
                                    No complaints found matching your filters.
                                    <button
                                        onClick={() => {
                                            setSearchTerm('');
                                            setActiveFilter('all');
                                        }}
                                        className="block mx-auto mt-2 text-blue-500 hover:text-blue-600"
                                    >
                                        Clear filters
                                    </button>
                                </>
                            ) : (
                                <>
                                    {user?.role === 'resident' && "You haven't submitted any complaints yet."}
                                    {user?.role === 'worker' && "No complaints assigned to you."}
                                    {user?.role === 'manager' && "No complaints in the system."}
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredComplaints.map((complaint) => (
                            <div
                                key={complaint._id}
                                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {complaint.title}
                                            </h3>
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                                    complaint.status
                                                )}`}
                                            >
                        {complaint.status.replace('-', ' ').toUpperCase()}
                      </span>
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                                                    complaint.priority
                                                )}`}
                                            >
                        {complaint.priority.toUpperCase()}
                      </span>
                                        </div>

                                        <p className="text-gray-600 mb-4">{complaint.description}</p>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                                            <div>
                                                <span className="font-medium">Category:</span> {complaint.type}
                                            </div>
                                            <div>
                                                <span className="font-medium">Created by:</span> {complaint.createdBy.name}
                                            </div>
                                            {complaint.assignedTo && (
                                                <div>
                                                    <span className="font-medium">Assigned to:</span> {complaint.assignedTo.name}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                            <div className="text-sm text-gray-500">
                                                <span className="font-medium">Created:</span> {formatDate(complaint.createdAt)}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                <span className="font-medium">Updated:</span> {formatDate(complaint.updatedAt)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="ml-4 flex-shrink-0">
                                        <button
                                            onClick={() => router.push(`/complaints/${complaint._id}`)}
                                            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ComplaintPage;