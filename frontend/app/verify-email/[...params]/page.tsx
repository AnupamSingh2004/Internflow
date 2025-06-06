'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';

export default function VerifyEmailPage() {
    const { verifyEmail } = useAuth();
    const params = useParams();
    const router = useRouter();
    const [message, setMessage] = useState<string>('Verifying your email...');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const handleVerification = async () => {
            const slugParams = params?.params as string[];
            
            console.log('Raw params:', params);
            console.log('Slug params:', slugParams);
            
            if (slugParams && Array.isArray(slugParams) && slugParams.length === 2) {
                const [uidb64, token] = slugParams;
                
                console.log('🔧 Starting verification with:', { uidb64, token });
                setMessage('Verifying your email...');
                
                try {
                    // Add minimum 5 second delay to handle slow API
                    const verificationPromise = verifyEmail(uidb64, token);
                    const minimumDelay = new Promise(resolve => setTimeout(resolve, 5000));
                    
                    // Wait for both the API call and minimum delay
                    const [response] = await Promise.all([verificationPromise, minimumDelay]);
                    
                    console.log('✅ Verification successful:', response);
                    
                    setIsLoading(false);
                    setMessage(response.message || 'Email verified successfully! You can now log in.');
                    setError(null);
                    
                    // Show success toast
                    toast.success('Successfully Verified, Please Login', {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                    
                    // Redirect after successful verification
                    setTimeout(() => router.push('/login'), 3000);
                    
                } catch (err) {
                    console.error('❌ Verification failed:', err);
                    
                    // Still wait for minimum 5 seconds before showing error
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    
                    setIsLoading(false);
                    setMessage('');
                    
                    // Better error handling
                    let errorMessage = 'Email verification failed. The link may be invalid or expired.';
                    
                    if (err?.response?.data?.error) {
                        errorMessage = err.response.data.error;
                    } else if (err?.response?.data?.detail) {
                        errorMessage = err.response.data.detail;
                    } else if (err?.message) {
                        errorMessage = err.message;
                    } else if (typeof err === 'string') {
                        errorMessage = err;
                    }
                    
                    setError(errorMessage);
                    
                    // Show error toast
                    toast.error('Verification Failed', {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                }
            } else {
                console.error('Invalid params structure:', { params, slugParams });
                
                // Wait 5 seconds before showing invalid link error
                await new Promise(resolve => setTimeout(resolve, 5000));
                
                setIsLoading(false);
                setMessage('');
                setError('Invalid verification link format.');
                
                // Show error toast for invalid link
                toast.error('Invalid verification link format', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            }
        };

        handleVerification();
    }, []);

    // Manual retry function
    const handleRetryVerification = async () => {
        const slugParams = params?.params as string[];
        if (slugParams && Array.isArray(slugParams) && slugParams.length === 2) {
            const [uidb64, token] = slugParams;
            
            setIsLoading(true);
            setError(null);
            setMessage('Retrying verification...');
            
            try {
                // Add minimum 5 second delay for retry as well
                const verificationPromise = verifyEmail(uidb64, token);
                const minimumDelay = new Promise(resolve => setTimeout(resolve, 5000));
                
                const [response] = await Promise.all([verificationPromise, minimumDelay]);
                
                console.log('✅ Retry verification successful:', response);
                
                setIsLoading(false);
                setMessage(response.message || 'Email verified successfully!');
                
                // Show success toast for retry
                toast.success('Successfully Verified, Please Login', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                
                setTimeout(() => router.push('/login'), 3000);
            } catch (err) {
                console.error('❌ Retry verification failed:', err);
                
                // Wait minimum 5 seconds before showing retry error
                await new Promise(resolve => setTimeout(resolve, 5000));
                
                setIsLoading(false);
                setError(err?.message || 'Verification failed');
                setMessage('');
                
                // Show error toast for retry failure
                toast.error('Retry verification failed', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            }
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 text-center">
            <h1 className="text-2xl font-bold mb-5">Email Verification</h1>
            
            {isLoading && (
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-blue-500">{message}</p>
                </div>
            )}
            
            {!isLoading && message && (
                <div className="mb-4">
                    <div className="text-green-500 text-xl mb-2">✅</div>
                    <p className="text-green-500">{message}</p>
                    <p className="text-sm text-gray-500 mt-2">
                        Redirecting to login page in 3 seconds...
                    </p>
                </div>
            )}
            
            {!isLoading && error && (
                <div className="mb-4">
                    <div className="text-red-500 text-xl mb-2">❌</div>
                    <p className="text-red-500">{error}</p>
                </div>
            )}
            
            {!isLoading && (
                <div className="space-y-2">
                    <Link 
                        href="/login" 
                        className="block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
                    >
                        Go to Login
                    </Link>
                    
                    {error && (
                        <>
                            <button
                                onClick={handleRetryVerification}
                                className="block w-full bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded transition-colors"
                            >
                                Retry Verification
                            </button>
                            
                            <Link 
                                href="/signup" 
                                className="block bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors"
                            >
                                Sign Up Again
                            </Link>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}