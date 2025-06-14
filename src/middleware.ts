import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
    try {
        const { pathname } = req.nextUrl
        const token = req.cookies.get('token')?.value

        if (!token) {
            const loginUrl = new URL('/unauthorized', req.url)
            loginUrl.searchParams.set('message', 'Please log in first.')
            return NextResponse.redirect(loginUrl)
        }

        // 🔓 Decode JWT without verification
        const base64Payload = token.split('.')[1]
        const decoded = JSON.parse(Buffer.from(base64Payload, 'base64').toString('utf-8')) as { role: string }

        // 🔐 Basic role check (not secure, but useful for UX gating)
        if (pathname.startsWith('/admin') && decoded.role !== 'admin') {
            const unauthorizedUrl = new URL('/unauthorized', req.url)
            unauthorizedUrl.searchParams.set('message', 'Only admins can access this page.')
            return NextResponse.redirect(unauthorizedUrl)
        }

        if (pathname.startsWith('/raise-complaint') && decoded.role !== 'resident') {
            const unauthorizedUrl = new URL('/unauthorized', req.url)
            unauthorizedUrl.searchParams.set('message', 'Only residents can access this page.')
            return NextResponse.redirect(unauthorizedUrl)
        }

        return NextResponse.next()
    } catch (err) {
        console.error('JWT Decode Error:', err)
        const errUrl = new URL('/unauthorized', req.url)
        errUrl.searchParams.set('message', 'Invalid token format.')
        return NextResponse.redirect(errUrl)
    }
}

export const config = {
    matcher: [
        '/complaint/:path*',
        '/about',
        '/contact',
        '/admin/:path*',
        '/raise-complaint',
        '/dashboard/:path*',
    ],
}
