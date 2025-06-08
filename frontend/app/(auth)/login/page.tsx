'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Zap, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useAuth } from '../../../contexts/AuthContext'; // Adjust path if necessary
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login, user } = useAuth(); // Get the login function and user state from context
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle messages from query parameters (e.g., after email verification)
  useEffect(() => {
    const message = searchParams.get('message');
    if (message === 'verify_email_success') {
      setSuccessMessage('Email verified successfully! You can now log in.');
      // Optionally remove the query parameter from the URL
      router.replace('/login', undefined); // Cleans up the URL without a full page reload
    }
  }, [searchParams, router]);


  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/'); // Or wherever your authenticated home page is
    }
  }, [user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
    // Clear error for the current field as user types
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors[id];
      // Clear non-field errors if the user starts typing again
      if (id === 'emailOrUsername' || id === 'password') {
        delete newErrors.non_field_errors;
      }
      return newErrors;
    });
  };

  const validateForm = () => {
    let newErrors: Record<string, string> = {};

    if (!formData.emailOrUsername.trim()) {
      newErrors.emailOrUsername = 'Email or Username is required.';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors
    setSuccessMessage(null); // Clear previous success messages

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await login(formData.emailOrUsername, formData.password);
      // Login successful, AuthContext will handle setting user and token
      // and the useEffect above will redirect
      router.push('/dashboard'); // Redirect to dashboard or appropriate page
    } catch (err: any) {
      console.error('Login error:', err);
      if (err) {
        if (typeof err === 'string') {
          setErrors({ non_field_errors: err });
        } else if (err.detail) { // Common for DRF authentication errors
          setErrors({ non_field_errors: err.detail });
        } else if (err.message) {
          setErrors({ non_field_errors: err.message });
        } else if (err.username || err.email || err.password) { // Field-specific errors
            const fieldErrors: Record<string, string> = {};
            if (err.username) fieldErrors.emailOrUsername = err.username.join(' ');
            if (err.email) fieldErrors.emailOrUsername = err.email.join(' '); // If backend returns email error for username/email field
            if (err.password) fieldErrors.password = err.password.join(' ');
            setErrors(fieldErrors);
        } else {
          setErrors({ non_field_errors: 'An unexpected error occurred. Please try again.' });
        }
      } else {
        setErrors({ non_field_errors: 'An unknown error occurred.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // If user is already logged in, you might want to show a loader or redirect immediately
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <Loader2 className="mr-2 h-8 w-8 animate-spin text-emerald-600" />
        <span className="text-xl text-gray-700">Redirecting...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <motion.div
          className="hidden lg:block space-y-8"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="space-y-6">
            <Link
              href="/"
              className="inline-flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>

            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                InternFlow
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-gray-900">Welcome Back!</h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Continue your journey to find amazing opportunities and connect with top companies.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-gray-700">Access to 10,000+ job opportunities</span>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border">
              <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
              <span className="text-gray-700">Connect with 500+ top companies</span>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-gray-700">Participate in exciting competitions</span>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-2 text-center pb-8">
              <div className="lg:hidden flex items-center justify-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  InternFlow
                </span>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Sign In</CardTitle>
              <CardDescription className="text-gray-600">Enter your credentials to access your account</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <form className="space-y-4" onSubmit={handleSubmit}>
                {/* Global Error/Success Messages */}
                {errors.non_field_errors && (
                  <p className="text-red-500 text-sm text-center">{errors.non_field_errors}</p>
                )}
                {successMessage && (
                  <p className="text-emerald-600 text-sm text-center font-medium">{successMessage}</p>
                )}

                <div className="space-y-2">
                  <Label htmlFor="emailOrUsername" className="text-gray-700 font-medium">
                    Email or Username
                  </Label>
                  <Input
                    id="emailOrUsername"
                    type="text" // Can be text as it accepts both email and username
                    placeholder="Enter your email or username"
                    className={`h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 ${errors.emailOrUsername ? 'border-red-500' : ''}`}
                    value={formData.emailOrUsername}
                    onChange={handleChange}
                  />
                  {errors.emailOrUsername && <p className="text-red-500 text-sm">{errors.emailOrUsername}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className={`h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 pr-12 ${errors.password ? 'border-red-500' : ''}`}
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="remember"
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <Label htmlFor="remember" className="text-sm text-gray-600">
                      Remember me
                    </Label>
                  </div>
                  <Link href="/forgot-password" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                    Forgot password?
                  </Link>
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold shadow-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </motion.div>
              </form>

              <div className="relative">
                <Separator />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-white px-4 text-sm text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="outline" className="h-12 border-gray-200 hover:bg-gray-50">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="outline" className="h-12 border-gray-200 hover:bg-gray-50">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook
                  </Button>
                </motion.div>
              </div>

              <div className="text-center">
                <span className="text-gray-600">Don't have an account? </span>
                <Link href="/signup" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                  Sign up
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}