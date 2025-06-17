"use client";
import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
  use,
} from "react";
import { apiRequest } from "@/lib/api";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: "student" | "company" | "admin";
  company_name?: string; // For company users
  college_name?: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  logout: () => void;
  verifyEmail: (uidb64: string, token: string) => Promise<any>;
  requestPasswordReset: (email: string) => Promise<any>;
  confirmPasswordReset: (
    uidb64: string,
    token: string,
    newPassword: string,
    confirmNewPassword: string
  ) => Promise<any>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("accessToken");

      if (storedToken) {
        setAccessToken(storedToken);
        try {
          // Verify token and get fresh user data
          const userData = await apiRequest("/auth/me/", "GET");
          setUser(userData);
        } catch (error) {
          console.error("Token verification failed:", error);
          // Clear invalid token
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          setAccessToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, []);

  const handleAuthSuccess = (data: any) => {
    const userData = {
      id: data.user.id,
      username: data.user.username,
      email: data.user.email,
      first_name: data.user.first_name,
      last_name: data.user.last_name,
      role: data.user.role,
      // Role-specific fields
      ...(data.user.role === "company" && {
        company_name: data.user.company_name,
      }),
      ...(data.user.role === "student" && {
        college_name: data.user.college_name,
      }),
    };
    setAccessToken(data.access);
    setUser(userData);
    localStorage.setItem("accessToken", data.access);
    localStorage.setItem("user", JSON.stringify(data.user));
    if (data.refresh) {
      localStorage.setItem("refreshToken", data.refresh);
    }
  };

  const login = async (usernameOrEmail: string, password: string) => {
    try {
      const data = await apiRequest("/auth/login/", "POST", {
        username_or_email: usernameOrEmail,
        password,
      });
      handleAuthSuccess(data);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const signup = async (userData: any) => {
    try {
      const data = await apiRequest("/auth/register/", "POST", userData);
      return data;
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("refreshToken");
    router.push("/login");
  };

  const verifyEmail = async (uidb64: string, token: string) => {
    try {
      return await apiRequest(`/auth/verify-email/${uidb64}/${token}/`, "GET");
    } catch (error) {
      console.error("Email verification failed:", error);
      throw error;
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      return await apiRequest("/auth/password-reset/request/", "POST", {
        email,
      });
    } catch (error) {
      console.error("Password reset request failed:", error);
      throw error;
    }
  };

  const confirmPasswordReset = async (
    uidb64: string,
    token: string,
    new_password: string,
    confirm_new_password: string
  ) => {
    try {
      return await apiRequest("/auth/password-reset/confirm/", "POST", {
        uidb64,
        token,
        new_password,
        confirm_new_password,
      });
    } catch (error) {
      console.error("Password reset confirmation failed:", error);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      if (accessToken) {
        const userData = await apiRequest("/auth/me/", "GET");
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        login,
        signup,
        logout,
        verifyEmail,
        requestPasswordReset,
        confirmPasswordReset,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
