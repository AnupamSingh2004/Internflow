"use client"
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, CheckCircle, AlertCircle, Loader2, Lock } from 'lucide-react';

export default function PasswordResetConfirmPage() {
  const [passwords, setPasswords] = useState({
    new_password: '',
    confirm_password: '' // Changed from confirm_new_password to match Django serializer
  });
  const [showPasswords, setShowPasswords] = useState({
    new_password: false,
    confirm_password: false // Changed from confirm_new_password
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Extract uidb64 and token from URL params
  const [urlParams, setUrlParams] = useState({ uidb64: '', token: '' });

  useEffect(() => {
    // Extract from URL path (e.g., /reset-password/uid/token/)
    const path = window.location.pathname;
    const pathParts = path.split('/');
    
    // Assuming URL structure: /reset-password/{uidb64}/{token}
    // Adjust indices based on your actual URL structure
    let uidb64 = '';
    let token = '';
    
    if (pathParts.length >= 4) {
      uidb64 = pathParts[pathParts.length - 2]; // Second to last part
      token = pathParts[pathParts.length - 1]; // Last part
    }
    
    // Alternative: if using query parameters
    const urlSearchParams = new URLSearchParams(window.location.search);
    const queryUidb64 = urlSearchParams.get('uidb64');
    const queryToken = urlSearchParams.get('token');
    
    setUrlParams({
      uidb64: uidb64 || queryUidb64 || '',
      token: token || queryToken || ''
    });
    
    // Debug logging
    console.log('URL Path:', path);
    console.log('Path Parts:', pathParts);
    console.log('Extracted uidb64:', uidb64 || queryUidb64);
    console.log('Extracted token:', token || queryToken);
  }, []);

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    return errors;
  };

  const handleInputChange = (field, value) => {
    setPasswords(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific errors
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // Clear general error
    if (error) setError('');
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    setValidationErrors({});

    // Check if URL params are available
    if (!urlParams.uidb64 || !urlParams.token) {
      setError('Invalid reset link. Please check the URL and try again.');
      setIsLoading(false);
      return;
    }

    // Validate passwords
    const passwordErrors = validatePassword(passwords.new_password);
    if (passwordErrors.length > 0) {
      setValidationErrors({ new_password: passwordErrors });
      setIsLoading(false);
      return;
    }

    if (passwords.new_password !== passwords.confirm_password) {
      setValidationErrors({ confirm_password: ['Passwords do not match'] });
      setIsLoading(false);
      return;
    }

    try {
      const requestBody = {
        uidb64: urlParams.uidb64,
        token: urlParams.token,
        new_password: passwords.new_password,
        confirm_password: passwords.confirm_password
      };
      
      console.log('Request body:', requestBody); // Debug logging
      
      const response = await fetch('http://127.0.0.1:8000/api/auth/password-reset/confirm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();
      console.log('Response status:', response.status);
      console.log('Response data:', responseData);

      if (response.ok) {
        setIsSuccess(true);
      } else {
        // Handle different types of errors
        if (responseData.error) {
          setError(responseData.error);
        } else if (responseData.non_field_errors) {
          setError(Array.isArray(responseData.non_field_errors) 
            ? responseData.non_field_errors[0] 
            : responseData.non_field_errors);
        } else if (typeof responseData === 'object') {
          // Handle field-specific errors
          const fieldErrors = {};
          Object.keys(responseData).forEach(key => {
            if (Array.isArray(responseData[key])) {
              fieldErrors[key] = responseData[key];
            } else {
              fieldErrors[key] = [responseData[key]];
            }
          });
          setValidationErrors(fieldErrors);
        } else {
          setError('Password reset failed. Please try again.');
        }
      }
    } catch (err) {
      console.error('Network error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Password Reset Successful!
            </h2>
            <p className="text-gray-600 mb-6">
              Your password has been successfully updated. You can now log in with your new password.
            </p>
            <button
              onClick={() => window.location.href = '/login'}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Set New Password
          </h2>
          <p className="text-gray-600">
            Please enter your new password below.
          </p>
        </div>

        {/* Debug info - remove in production */}
        <div className="bg-gray-100 p-3 rounded text-xs">
          <p><strong>Debug Info:</strong></p>
          <p>uidb64: {urlParams.uidb64 || 'Not found'}</p>
          <p>token: {urlParams.token || 'Not found'}</p>
          <p>URL: {window.location.pathname}</p>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                id="new_password"
                type={showPasswords.new_password ? 'text' : 'password'}
                value={passwords.new_password}
                onChange={(e) => handleInputChange('new_password', e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                placeholder="Enter new password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new_password')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.new_password ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {validationErrors.new_password && (
              <div className="mt-2 space-y-1">
                {validationErrors.new_password.map((error, index) => (
                  <p key={index} className="text-red-600 text-sm flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {error}
                  </p>
                ))}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirm_password"
                type={showPasswords.confirm_password ? 'text' : 'password'}
                value={passwords.confirm_password}
                onChange={(e) => handleInputChange('confirm_password', e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                placeholder="Confirm new password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm_password')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.confirm_password ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {validationErrors.confirm_password && (
              <div className="mt-2 space-y-1">
                {validationErrors.confirm_password.map((error, index) => (
                  <p key={index} className="text-red-600 text-sm flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {error}
                  </p>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• At least 8 characters long</li>
              <li>• Contains uppercase and lowercase letters</li>
              <li>• Contains at least one number</li>
            </ul>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading || !passwords.new_password || !passwords.confirm_password || !urlParams.uidb64 || !urlParams.token}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating Password...
              </>
            ) : (
              'Update Password'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}