'use client';
import { useState, FormEvent, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useParams, useRouter } from 'next/navigation';

export default function ResetPasswordConfirmPage() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [error, setError] = useState<string | null | Record<string, any>>(null);
    const [message, setMessage] = useState<string | null>(null);
    const { confirmPasswordReset } = useAuth();
    const params = useParams();
    const router = useRouter();

    const [uidb64, setUidb64] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const slugParams = params?.params as string[];
        if (slugParams && slugParams.length === 2) {
            setUidb64(slugParams[0]);
            setToken(slugParams[1]);
        } else if (!slugParams && router) { // Check if page is loaded without params to avoid infinite loop
            // Handle case where params are not yet available or invalid
            // For now, we assume they will be available. Could add a loading state.
        }
    }, [params, router]);


    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setMessage(null);

        if (!uidb64 || !token) {
            setError("Missing required parameters from URL.");
            return;
        }
        if (newPassword !== confirmNewPassword) {
            setError("Passwords do not match.");
            return;
        }
        try {
            const response = await confirmPasswordReset(uidb64, token, newPassword, confirmNewPassword);
            setMessage(response.message || 'Password reset successful! You can now log in with your new password.');
            setTimeout(() => router.push('/login'), 3000);
        } catch (err: any) {
            setError(err.new_password || err.detail || err.message || 'Password reset failed.');
        }
    };
    
    if (!uidb64 || !token) {
        return (
            <div className="max-w-md mx-auto mt-10 text-center">
                 <h1 className="text-2xl font-bold mb-5">Reset Password</h1>
                <p className="text-red-500">Invalid password reset link. Please request a new one.</p>
            </div>
        )
    }

    return (
        <div className="max-w-md mx-auto mt-10">
            <h1 className="text-2xl font-bold mb-5 text-center">Reset Your Password</h1>
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newPassword">
                        New Password
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="newPassword" type="password" placeholder="******************" value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)} required
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmNewPassword">
                        Confirm New Password
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                        id="confirmNewPassword" type="password" placeholder="******************" value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)} required
                    />
                </div>

                {error && <p className="text-red-500 text-xs italic mb-4">{typeof error === 'string' ? error : JSON.stringify(error)}</p>}
                {message && <p className="text-green-500 text-xs italic mb-4">{message}</p>}

                <div className="flex items-center justify-center">
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="submit">
                        Reset Password
                    </button>
                </div>
            </form>
        </div>
    );
}