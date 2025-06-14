'use client';

import React from 'react';

const AboutPage = () => {
    return (
        <main className="max-w-5xl mx-auto px-4 py-12 bg-white text-black">
            <h1 className="text-4xl font-bold mb-10 text-center text-orange-600">
                About SCMS
            </h1>

            <section className="mb-10 space-y-4 p-6 rounded-xl shadow border">
                <p>
                    <strong>SCMS (Society Complaint Management System)</strong> is a full-stack web platform developed as the
                    third problem statement during a 3-day hackathon conducted by the Web Team of <strong>NIT Jamshedpur</strong>.
                </p>
                <p>
                    Built using <strong>Next.js v15.3</strong> (App Router), <strong>TypeScript</strong>, and <strong>Tailwind CSS</strong>,
                    SCMS focuses on seamless communication between <strong>Residents</strong>, <strong>Workers</strong>, and <strong>Maintenance Managers</strong>.
                </p>
            </section>

            <section className="mb-10 p-6 rounded-xl shadow border">
                <h2 className="text-2xl font-semibold mb-3">👤 Resident Features</h2>
                <ul className="list-disc list-inside space-y-2">
                    <li>Raise complaints with appropriate categories and image attachments.</li>
                    <li>Each complaint auto-generates a unique <strong>QR code</strong>.</li>
                    <li>Once the complaint is resolved, the QR code is scanned by the worker for verification.</li>
                    <li>Account access is protected via secure registration and JWT-based login.</li>
                </ul>
            </section>

            <section className="mb-10 p-6 rounded-xl shadow border">
                <h2 className="text-2xl font-semibold mb-3">🛠️ Worker Features</h2>
                <ul className="list-disc list-inside space-y-2">
                    <li>View all complaints assigned to them by the manager.</li>
                    <li>After resolving a complaint, scan the QR code from the resident to mark it as complete.</li>
                    <li>Earn <strong>tokens</strong> based on how quickly they resolve complaints.</li>
                    <li>Tokens act as a performance metric and can be used for reward systems.</li>
                </ul>
            </section>

            <section className="mb-10 p-6 rounded-xl shadow border">
                <h2 className="text-2xl font-semibold mb-3">👨‍💼 Manager Features</h2>
                <ul className="list-disc list-inside space-y-2">
                    <li>Monitor all complaints registered in the system.</li>
                    <li>Assign unresolved complaints to available workers.</li>
                    <li>Track worker performance through token analytics.</li>
                </ul>
            </section>

            <section className="mb-10 p-6 rounded-xl shadow border">
                <h2 className="text-2xl font-semibold mb-3">🔐 Security</h2>
                <ul className="list-disc list-inside space-y-2">
                    <li>All application routes are protected using server-side middleware.</li>
                    <li>Only authorized users can access specific dashboards and functionality.</li>
                    <li>Authentication is managed via signed <strong>JWT tokens</strong>.</li>
                </ul>
            </section>

            <section className="mb-10 p-6 rounded-xl shadow border">
                <h2 className="text-2xl font-semibold mb-3">🖼️ Image Hosting</h2>
                <p>
                    All complaint-related images are uploaded and stored using <strong>Cloudinary</strong>,
                    allowing optimized and secure media delivery without server load.
                </p>
            </section>

            <section className="mb-10 p-6 rounded-xl shadow border">
                <h2 className="text-2xl font-semibold mb-3">🚀 Getting Started</h2>
                <p className="mb-2">To get started with the SCMS project locally:</p>
                <pre className="bg-gray-100 text-sm rounded-md p-4 overflow-x-auto">
<code>git clone https://github.com/&lt;your-username&gt;/scms.git
cd scms
npm install
npm run dev</code>
        </pre>

                <p className="mt-4">
                    Or directly visit the live deployment:{' '}
                    <a
                        href="https://scms-flax.vercel.app"
                        className="text-purple-700 underline font-medium"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        scms-flax.vercel.app
                    </a>
                </p>
            </section>

            <section className="mb-10 p-6 rounded-xl shadow border">
                <h2 className="text-2xl font-semibold mb-3">🏗️ Future Scope</h2>
                <ul className="list-disc list-inside space-y-2">
                    <li>Introduce a leaderboard for workers based on token rankings.</li>
                    <li>Enable real-time analytics and reporting for managers.</li>
                    <li>Add push notifications for new complaint updates.</li>
                    <li>Progressively enhance with PWA features for offline support.</li>
                </ul>
            </section>

            <section className="mb-6 p-6 rounded-xl shadow border">
                <h2 className="text-2xl font-semibold mb-3">📦 Tech Stack</h2>
                <ul className="list-disc list-inside space-y-2">
                    <li><strong>Frontend</strong>: Next.js (App Router), TypeScript, Tailwind CSS</li>
                    <li><strong>Backend</strong>: API Routes (Next.js), Middleware for route protection</li>
                    <li><strong>Database</strong>: MongoDB (via Mongoose)</li>
                    <li><strong>Image Storage</strong>: Cloudinary</li>
                    <li><strong>Auth</strong>: JWT Tokens (Signed & Verified)</li>
                </ul>
            </section>

            <section className="mb-10 p-6 rounded-xl shadow border">
                <h2 className="text-2xl font-semibold mb-3">✅ Conclusion</h2>
                <p>
                    SCMS is a modern, secure, and efficient solution for society-level complaint management. It streamlines
                    communication between residents, workers, and management while providing transparency and accountability.
                    With future improvements, SCMS aims to become a complete platform for smart society governance.
                </p>
            </section>
        </main>
    );
};

export default AboutPage;
