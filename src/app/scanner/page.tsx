'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import jsQR from 'jsqr';
import toast from "react-hot-toast";
import Link from "next/link";

const ScanPage = () => {
    const [qrData, setQrData] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

    // Camera QR Scan
    const startCameraScan = async () => {
        setIsScanning(true);

        const html5QrCode = new Html5Qrcode('reader');
        html5QrCodeRef.current = html5QrCode;

        try {
            const devices = await Html5Qrcode.getCameras();
            if (devices.length === 0) {
                alert('No camera found on this device.');
                setIsScanning(false);
                return;
            }

            await html5QrCode.start(
                { facingMode: 'environment' }, // Rear camera
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText) => {
                    console.log('QR Code scanned:', decodedText);
                    html5QrCode.stop();
                    setIsScanning(false);
                    setQrData(decodedText);
                    handlePostRequest(decodedText);
                },
                (err) => {
                    console.warn('QR Scan error:', err);
                }
            );
        } catch (err) {
            console.error('Camera start error:', err);
            alert('Unable to access camera. Please check browser permissions or device settings.');
            setIsScanning(false);
        }
    };

    // Image QR Scan
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const imageBitmap = await createImageBitmap(file);
        const canvas = document.createElement('canvas');
        canvas.width = imageBitmap.width;
        canvas.height = imageBitmap.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(imageBitmap, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const qrCode = jsQR(imageData.data, canvas.width, canvas.height);

        if (qrCode) {
            setQrData(qrCode.data);
            handlePostRequest(qrCode.data);
        } else {
            toast.error('No QR code found in the uploaded image.');
        }
    };

    // API POST
    const handlePostRequest = async (data: string) => {
        try {
            const res = await fetch('/api/complaint/resolve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: data }),
            });

            const result = await res.json();
            toast.success('Complaint was deleted!');
        } catch (err) {
            toast.error('Some error encountered!')
            console.error('POST failed:', err);
        }
    };

    // Stop camera when component unmounts
    useEffect(() => {
        return () => {
            if (html5QrCodeRef.current) {
                html5QrCodeRef.current.stop().catch(() => {});
            }
        };
    }, []);

    return (
        <div className="p-6 flex flex-col items-center gap-4 min-h-screen">
            <h1 className="text-xl font-bold">QR Code Scanner</h1>

            <button
                onClick={startCameraScan}
                className="bg-blue-600 text-white px-4 py-2 rounded"
            >
                Scan Using Camera
            </button>

            <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="mt-4"
            />

            {isScanning && (
                <div id="reader" className="w-full max-w-md mt-4 border" />
            )}

            {qrData && (
                <div className="mt-4 p-3 border rounded bg-gray-100 flex flex-col items-center">
                    <Link
                        href="/"
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Go back to Dashboard
                    </Link>
                </div>
            )}
        </div>
    );
};

export default ScanPage;
