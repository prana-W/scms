"use client";

import React, {useState, useEffect} from 'react';
import Link from 'next/link';
import {
    User,
    Phone,
    Mail,
    MapPin,
    Home,
    Coins,
    FileText,
    Settings,
    Building,
    UserCheck,
    AlertCircle,
    LogIn,
    UserPlus
} from 'lucide-react';

// Type definitions
interface JWTPayload {
    _id: string | '';
    role: 'worker' | 'resident' | 'manager';
    name?: string;
    phone?: string;
    exp?: number;
    iat?: number;
}

interface WorkerData {
    _id: string;
    name: string;
    phone: string;
    workerId: string;
    role: string;
    tokens: number;
}

interface ResidentData {
    _id: string;
    name: string;
    flatNumber: string;
    address: string;
    phone: string;
    email: string;
}

interface ManagerData {
    _id: string;
    name: string;
    email: string;
    phone: string;
    managerId: string;
}

type UserData = WorkerData | ResidentData | ManagerData;

interface ProfileCardProps {
    children: React.ReactNode;
    title: string;
}

interface ActionLinkProps {
    href: string;
    icon: React.ElementType;
    title: string;
    description: string;
    color?: 'blue' | 'red' | 'purple' | 'green';
}

interface InfoItemProps {
    icon: React.ElementType;
    label: string;
    value: string;
    highlight?: boolean;
}

const Dashboard: React.FC = () => {
    const [user, setUser] = useState<JWTPayload | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [userData, setUserData] = useState<UserData | null>(null);

    const parseJWTFromCookie = (): JWTPayload | null => {
        try {
            const cookies = document.cookie.split(';').reduce((acc: Record<string, string>, cookie) => {
                const [key, value] = cookie.trim().split('=');
                if (key && value) {
                    acc[key] = value;
                }
                return acc;
            }, {});

            const token = cookies.token || cookies.authToken || cookies.jwt || cookies.accessToken;

            if (!token) {
                setLoading(false)
                return null;
            }
            const payload = JSON.parse(atob(token.split('.')[1])) as JWTPayload;

            if (payload.exp && Date.now() >= payload.exp * 1000) {
                return null;
            }

            return payload;
        } catch (error) {
            console.error('Error parsing JWT:', error);
            return null;
        }
    };

    const getUserData = async (role: string, id: string): Promise<UserData | null> => {
        let endpoint = '';

        switch (role) {
            case 'worker':
                endpoint = `/api/workers/${id}`;
                break;
            case 'resident':
                endpoint = `/api/residents/${id}`;
                break;
            case 'manager':
                endpoint = `/api/managers/${id}`;
                break;
            default:
                return null;
        }

        try {
            const res = await fetch(endpoint);
            if (!res.ok) {
                console.error(`Failed to fetch ${role} data:`, res.statusText);
                return null;
            }

            const user = await res.json();

            switch (role) {
                case 'worker':
                    return {
                        name: user.name,
                        phone: user.phone,
                        workerId: user.workerId,
                        role: user.role || 'Maintenance Worker',
                        tokens: user.tokens || 0
                    } as WorkerData;

                case 'resident':
                    return {
                        name: user.name,
                        flatNumber: user.flatNumber,
                        address: user.address,
                        phone: user.phone,
                        email: user.email
                    } as ResidentData;

                case 'manager':
                    return {
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                        managerId: user.managerId
                    } as ManagerData;

                default:
                    return null;
            }
        } catch (err) {
            console.error('Error fetching user data:', err);
            return null;
        }
    };

    useEffect(() => {
        const userData = parseJWTFromCookie();
        setUser(userData);
    }, []);

    useEffect(() => {
        const callData = async () => {
            if (!user?._id || !user?.role) return;

            try {
                const getData = await getUserData(user.role, user._id);
                setUserData(getData);

            } catch (err) {
                console.error("Failed to fetch user data:", err);
            } finally {
                setLoading(false);
            }
        };

        callData();
    }, [user]);

    const ProfileCard: React.FC<ProfileCardProps> = ({children, title}) => (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <User className="text-blue-600" size={24}/>
                {title}
            </h2>
            {children}
        </div>
    );

    const ActionLink: React.FC<ActionLinkProps> = ({
                                                       href,
                                                       icon: Icon,
                                                       title,
                                                       description,
                                                       color = "blue"
                                                   }) => {
        const colorClasses = {
            blue: "border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-blue-600 hover:text-blue-700 text-blue-800 hover:text-blue-900",
            red: "border-red-200 hover:border-red-400 hover:bg-red-50 text-red-600 hover:text-red-700 text-red-800 hover:text-red-900",
            purple: "border-purple-200 hover:border-purple-400 hover:bg-purple-50 text-purple-600 hover:text-purple-700 text-purple-800 hover:text-purple-900",
            green: "border-green-200 hover:border-green-400 hover:bg-green-50 text-green-600 hover:text-green-700 text-green-800 hover:text-green-900"
        };

        return (
            <Link
                href={href}
                className={`block p-4 rounded-lg border-2 transition-all duration-200 group ${
                    color === 'blue' ? 'border-blue-200 hover:border-blue-400 hover:bg-blue-50' :
                        color === 'red' ? 'border-red-200 hover:border-red-400 hover:bg-red-50' :
                            color === 'purple' ? 'border-purple-200 hover:border-purple-400 hover:bg-purple-50' :
                                'border-green-200 hover:border-green-400 hover:bg-green-50'
                }`}
            >
                <div className="flex items-center gap-3">
                    <Icon
                        className={`${
                            color === 'blue' ? 'text-blue-600 group-hover:text-blue-700' :
                                color === 'red' ? 'text-red-600 group-hover:text-red-700' :
                                    color === 'purple' ? 'text-purple-600 group-hover:text-purple-700' :
                                        'text-green-600 group-hover:text-green-700'
                        }`}
                        size={24}
                    />
                    <div>
                        <h3 className={`font-semibold ${
                            color === 'blue' ? 'text-blue-800 group-hover:text-blue-900' :
                                color === 'red' ? 'text-red-800 group-hover:text-red-900' :
                                    color === 'purple' ? 'text-purple-800 group-hover:text-purple-900' :
                                        'text-green-800 group-hover:text-green-900'
                        }`}>
                            {title}
                        </h3>
                        <p className="text-gray-600 text-sm">{description}</p>
                    </div>
                </div>
            </Link>
        );
    };

    const InfoItem: React.FC<InfoItemProps> = ({
                                                   icon: Icon,
                                                   label,
                                                   value,
                                                   highlight = false
                                               }) => (
        <div className="flex items-center gap-3 py-2">
            <Icon className="text-gray-500" size={20}/>
            <div className="flex-1">
                <span className="text-gray-600 text-sm">{label}:</span>
                <span className={`ml-2 font-medium ${highlight ? 'text-green-600 text-lg' : 'text-gray-800'}`}>
          {value}
        </span>
            </div>
        </div>
    );

    const LandingPage: React.FC = () => (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Hero Section */}
                    <div className="mb-12">
                        <Building className="mx-auto text-blue-600 mb-6" size={80}/>
                        <h1 className="text-5xl font-bold text-gray-800 mb-4">
                            Community Management
                            <span className="text-blue-600"> Dashboard</span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                            Streamline your community operations with our comprehensive management platform.
                            Connect residents, workers, and managers in one unified system.
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-3 gap-8 mb-12">
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                            <UserCheck className="text-blue-600 mx-auto mb-4" size={48}/>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">For Residents</h3>
                            <p className="text-gray-600">Raise complaints, track requests, and manage your profile
                                effortlessly.</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                            <Settings className="text-green-600 mx-auto mb-4" size={48}/>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">For Workers</h3>
                            <p className="text-gray-600">Access assigned tasks, earn tokens, and manage work
                                efficiently.</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                            <Building className="text-purple-600 mx-auto mb-4" size={48}/>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">For Managers</h3>
                            <p className="text-gray-600">Oversee operations, assign tasks, and maintain community
                                standards.</p>
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link
                            href="/login"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
                        >
                            <LogIn size={20}/>
                            Sign In to Continue
                        </Link>
                        <Link
                            href="/register"
                            className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
                        >
                            <UserPlus size={20}/>
                            Create New Account
                        </Link>
                    </div>

                    {/* Info Banner */}
                    <div className="mt-12 bg-blue-100 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-center gap-2 text-blue-800">
                            <AlertCircle size={20}/>
                            <span className="font-medium">Please log in or register to access your personalized dashboard</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    // If no user or no role, show landing page
    if (!user || !user.role) {
        return <LandingPage/>;
    }


    // @ts-ignore


    if (!userData) {
        return <LandingPage/>;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 capitalize">
                        Welcome back, {userData?.name?.split(' ')[0]}!
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {user.role === 'worker' && 'Manage your assigned tasks and earn tokens'}
                        {user.role === 'resident' && 'Access your community services and raise complaints'}
                        {user.role === 'manager' && 'Oversee community operations and manage assignments'}
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Profile Section */}
                    <div className="lg:col-span-2">
                        {user.role === 'worker' && (
                            <ProfileCard title="Worker Profile">
                                <div className="space-y-4">
                                    <InfoItem icon={User} label="Name" value={(userData as WorkerData).name}/>
                                    <InfoItem icon={Phone} label="Phone" value={(userData as WorkerData).phone}/>
                                    <InfoItem icon={FileText} label="Worker ID"
                                              value={(userData as WorkerData).workerId}/>
                                    <InfoItem icon={Settings} label="Role" value={(userData as WorkerData).role}/>
                                    <InfoItem
                                        icon={Coins}
                                        label="Available Tokens"
                                        value={`${(userData as WorkerData).tokens}`}
                                        highlight={true}
                                    />
                                </div>
                            </ProfileCard>
                        )}

                        {user.role === 'resident' && (
                            <ProfileCard title="Resident Profile">
                                <div className="space-y-4">
                                    <InfoItem icon={User} label="Name" value={(userData as ResidentData).name}/>
                                    <InfoItem icon={Home} label="Flat Number"
                                              value={(userData as ResidentData).flatNumber}/>
                                    <InfoItem icon={MapPin} label="Address" value={(userData as ResidentData).address}/>
                                    <InfoItem icon={Phone} label="Phone" value={(userData as ResidentData).phone}/>
                                    <InfoItem icon={Mail} label="Email" value={(userData as ResidentData).email}/>
                                </div>
                            </ProfileCard>
                        )}

                        {user.role === 'manager' && (
                            <ProfileCard title="Manager Profile">
                                <div className="space-y-4">
                                    <InfoItem icon={User} label="Name" value={(userData as ManagerData).name}/>
                                    <InfoItem icon={Mail} label="Email" value={(userData as ManagerData).email}/>
                                    <InfoItem icon={Phone} label="Phone" value={(userData as ManagerData).phone}/>
                                    <InfoItem icon={Building} label="Manager ID"
                                              value={(userData as ManagerData).managerId}/>
                                </div>
                            </ProfileCard>
                        )}
                    </div>

                    {/* Actions Section */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                {user.role === 'worker' && (
                                    <ActionLink
                                        href="/complaint"
                                        icon={FileText}
                                        title="Assigned Complaints"
                                        description="View and manage your assigned tasks"
                                        color="blue"
                                    />
                                )}

                                {user.role === 'resident' && (
                                    <>
                                        <ActionLink
                                            href="/raise-complaint"
                                            icon={AlertCircle}
                                            title="Raise Complaint"
                                            description="Submit a new complaint or request"
                                            color="red"
                                        />
                                        <ActionLink
                                            href="/complaint"
                                            icon={FileText}
                                            title="My Complaints"
                                            description="Track all your submitted complaints"
                                            color="blue"
                                        />
                                    </>
                                )}

                                {user.role === 'manager' && (
                                    <ActionLink
                                        href="/complaint"
                                        icon={Settings}
                                        title="Manage Complaints"
                                        description="Assign and oversee complaint resolution"
                                        color="purple"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Stats Card */}
                        <div
                            className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                            <h3 className="text-lg font-semibold mb-2">
                                {user.role === 'worker' && 'Tasks This Month'}
                                {user.role === 'resident' && 'Active Complaints'}
                                {user.role === 'manager' && 'Pending Assignments'}
                            </h3>
                            <p className="text-3xl font-bold">
                                {user.role === 'worker' && '12'}
                                {user.role === 'resident' && '3'}
                                {user.role === 'manager' && '8'}
                            </p>
                            <p className="text-blue-100 text-sm">
                                {user.role === 'worker' && 'Great work! Keep it up.'}
                                {user.role === 'resident' && 'We\'re working on them.'}
                                {user.role === 'manager' && 'Requires your attention.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;