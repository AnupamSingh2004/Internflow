'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useParams, useRouter } // useParams for client components
from 'next/navigation';
import Link from 'next/link';

export default function VerifyEmailPage() {
    const { verifyEmail } = useAuth();
    const params = useParams(); // { params: ['uidb64', 'token'] }
    const router = useRouter();
    const [message, setMessage] = useState<string>('Verifying your email...');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // params.params will be an array like ['uidb64_value', 'token_value']
        const slugParams = params?.params as string[]; 

        if (slugParams && slugParams.length === 2) {
            const [uidb64, token] = slugParams;
            verifyEmail(uidb64, token)
                .then(response => {
                    setMessage(response.message || 'Email verified successfully! You can now log in.');
                    // Optionally redirect to login after a delay
                    setTimeout(() => router.push('/login'), 3000);
                })
                .catch(err => {
                    setError(err.detail || err.message || 'Email verification failed. The link may be invalid or expired.');
                    setMessage(''); // Clear loading message
                });
        } else {
            setError('Invalid verification link format.');
            setMessage('');
        }
    }, [params, verifyEmail, router]);

    return (
        <div className="max-w-md mx-auto mt-10 text-center">
            <h1 className="text-2xl font-bold mb-5">Email Verification</h1>
            {message && <p className="text-green-500">{message}</p>}
            {error && <p className="text-red-500">{error}</p>}
            {(message || error) && (
                <Link href="/login" className="mt-4 inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Go to Login
                </Link>
            )}
        </div>
    );
}