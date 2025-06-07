'use client';
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { apiRequest } from '../lib/api';
import { useRouter } from 'next/navigation'; // For App Router

interface User {
    id: number;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
}

interface AuthContextType {
    user: User | null;
    accessToken: string | null;
    isLoading: boolean;
    login: (usernameOrEmail: string, password: string) => Promise<void>;
    signup: (userData: any) => Promise<void>; // Define more specific type for userData
    logout: () => void;
    verifyEmail: (uidb64: string, token: string) => Promise<any>;
    requestPasswordReset: (email: string) => Promise<any>;
    confirmPasswordReset: (uidb64: string, token: string, newPassword: string, confirmNewPassword: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const initializeAuth = async () => {
            const storedToken = localStorage.getItem('accessToken');
            const storedUser = localStorage.getItem('user');

            if (storedToken && storedUser) {
                setAccessToken(storedToken);
                setUser(JSON.parse(storedUser));
                // Optionally: verify token with backend here to ensure it's still valid
            }
            setIsLoading(false);
        };
        initializeAuth();
    }, []);

    const handleAuthSuccess = (data: any) => {
        setAccessToken(data.access);
        setUser(data.user);
        localStorage.setItem('accessToken', data.access);
        localStorage.setItem('user', JSON.stringify(data.user));
        // Potentially store refresh token in localStorage or httpOnly cookie (more complex setup)
        // localStorage.setItem('refreshToken', data.refresh);
    };

    const login = async (usernameOrEmail: string, password: string) => {
        const data = await apiRequest('/login/', 'POST', { username_or_email: usernameOrEmail, password });
        handleAuthSuccess(data);
    };

    const signup = async (userData: any) => { // { username, email, password, password2, first_name?, last_name? }
        const data = await apiRequest('/register/', 'POST', userData);
        // User needs to verify email, so not calling handleAuthSuccess here
        return data; // Return response for message display
    };

    const logout = () => {
        setUser(null);
        setAccessToken(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        // Optionally: call a backend logout endpoint to blacklist refresh token if using SimpleJWT blacklist app
        // await apiRequest('/logout/', 'POST', { refresh: localStorage.getItem('refreshToken') });
        // localStorage.removeItem('refreshToken');
        router.push('/login');
    };

    const verifyEmail = async (uidb64: string, token: string) => {
        // The Django view is GET, but we make a request from frontend.
        // Or, the Django view could redirect to a frontend page upon success.
        // For now, let's assume the Django GET view returns JSON.
        return apiRequest(`/verify-email/${uidb64}/${token}/`, 'GET');
    };

    const requestPasswordReset = async (email: string) => {
        return apiRequest('/password-reset/request/', 'POST', { email });
    };

    const confirmPasswordReset = async (uidb64: string, token: string, new_password: string, confirm_new_password: string) => {
        return apiRequest('/password-reset/confirm/', 'POST', { uidb64, token, new_password, confirm_new_password });
    };


    return (
        <AuthContext.Provider value={{ user, accessToken, isLoading, login, signup, logout, verifyEmail, requestPasswordReset, confirmPasswordReset }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};