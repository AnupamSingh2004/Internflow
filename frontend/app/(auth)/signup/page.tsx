'use client';
import { useState, FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [error, setError] = useState<string | null | Record<string, any>>(null);
    const [message, setMessage] = useState<string | null>(null);
    const { signup } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setMessage(null);
        if (password !== password2) {
            setError("Passwords do not match");
            return;
        }
        try {
            const response = await signup({ username, email, password, password2, first_name: firstName, last_name: lastName });
            setMessage(response.message || 'Signup successful! Please check your email to verify.');
            // Optionally redirect or clear form
            // router.push('/login'); 
        } catch (err: any) {
            setError(err || 'Signup failed');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <h1 className="text-2xl font-bold mb-5 text-center">Sign Up</h1>
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                {/* Form Fields for username, email, password, password2, firstName, lastName */}
                {/* Example for username: */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                        Username
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="username" type="text" placeholder="Username" value={username}
                        onChange={(e) => setUsername(e.target.value)} required
                    />
                </div>
                 <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                        Email
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="email" type="email" placeholder="Email" value={email}
                        onChange={(e) => setEmail(e.target.value)} required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                        Password
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                        id="password" type="password" placeholder="******************" value={password}
                        onChange={(e) => setPassword(e.target.value)} required
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password2">
                        Confirm Password
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                        id="password2" type="password" placeholder="******************" value={password2}
                        onChange={(e) => setPassword2(e.target.value)} required
                    />
                </div>
                {/* Add first_name and last_name fields similarly if desired */}

                {error && <p className="text-red-500 text-xs italic mb-4">{typeof error === 'string' ? error : JSON.stringify(error)}</p>}
                {message && <p className="text-green-500 text-xs italic mb-4">{message}</p>}

                <div className="flex items-center justify-between">
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="submit">
                        Sign Up
                    </button>
                    <Link href="/login" className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">
                        Already have an account?
                    </Link>
                </div>
            </form>
        </div>
    );
}