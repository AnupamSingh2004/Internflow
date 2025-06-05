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
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const initializeAuth = async () => {
            const storedAccessToken = localStorage.getItem('accessToken');
            const storedRefreshToken = localStorage.getItem('refreshToken');
            
            if (storedAccessToken && storedRefreshToken) {
                try {
                    // Verify token is still valid
                    const userData = await verifyToken(storedAccessToken);
                    setUser(userData);
                    setAccessToken(storedAccessToken);
                    setRefreshToken(storedRefreshToken);
                } catch (error) {
                    // Token is invalid or expired, try to refresh
                    try {
                        const refreshed = await refreshAccessToken();
                        if (!refreshed) {
                            logout();
                        }
                    } catch (refreshError) {
                        logout();
                    }
                }
            }
            setIsLoading(false);
        };
        initializeAuth();
    }, []);

     const verifyToken = async (token: string): Promise<User> => {
        const response = await apiRequest('/auth/verify/', 'POST', { token });
        return response.user;
    };

    const refreshAccessToken = async (): Promise<boolean> => {
        const storedRefreshToken = localStorage.getItem('refreshToken');
        if (!storedRefreshToken) return false;

        try {
            const data = await apiRequest('/token/refresh/', 'POST', {
                refresh: storedRefreshToken
            });
            
            if (data.access) {
                setAccessToken(data.access);
                localStorage.setItem('accessToken', data.access);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Token refresh failed:', error);
            return false;
        }
    };

    const handleAuthSuccess = (data: any) => {
        setAccessToken(data.access);
        setRefreshToken(data.refresh);
        setUser(data.user);
        localStorage.setItem('accessToken', data.access);
        localStorage.setItem('refreshToken', data.refresh);
        localStorage.setItem('user', JSON.stringify(data.user));
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
        localStorage.removeItem('refreshToken');
        router.push('/login');
    };

    // In your AuthContext
const verifyEmail = async (uidb64: string, token: string) => {
    try {
        console.log('Starting email verification...', { uidb64, token });
        let API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'; // Ensure this is set correctly
        
        // Make sure the API endpoint matches your Django URL pattern
        const response = await fetch(`${API_BASE_URL}/verify-email/${uidb64}/${token}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        console.log('Response status:', response.status);
        
        const data = await response.json();
        console.log('Response data:', data);

        if (!response.ok) {
            // Handle different types of errors
            if (data.error) {
                throw new Error(data.error);
            } else if (data.detail) {
                throw new Error(data.detail);
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        }

        return {
            success: true,
            message: data.message || 'Email verified successfully!'
        };

    } catch (error) {
        console.error('Email verification failed:', error);
        
        // Re-throw with proper error structure
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error('Network error occurred during verification');
        }
    }
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