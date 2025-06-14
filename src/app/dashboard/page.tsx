'use client'

import { useRouter } from 'next/navigation';
import Link from "next/link";

export default function DashboardPage() {
    const router = useRouter();
    router.push('/')

}