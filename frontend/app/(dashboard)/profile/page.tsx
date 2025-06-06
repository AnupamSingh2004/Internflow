'use client';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfilePage() {
    const { user } = useAuth();

    if (!user) {
        return <p>Loading profile...</p>; // Should be handled by layout, but good fallback
    }

    return (
        <div className="max-w-md mx-auto mt-10 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <h1 className="text-2xl font-bold mb-5">User Profile</h1>
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>First Name:</strong> {user.first_name || 'N/A'}</p>
            <p><strong>Last Name:</strong> {user.last_name || 'N/A'}</p>
            {/* Add more profile information or edit functionality here */}
        </div>
    );
}