'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const { user, isLoading, accessToken } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user && !accessToken) {
            router.replace('/login'); // Use replace to not add to history stack
        }
    }, [user, isLoading, accessToken, router]);

    if (isLoading || (!user && !accessToken)) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>; // Or a proper spinner
    }

    return <>{children}</>;
}