'use client';

import { useState } from 'react';

interface AuthFormProps {
  type: 'login' | 'signup' | 'forgot-password' | 'reset-password';
  onSubmit: (data: any) => Promise<void>;
}

export default function AuthForm({ type, onSubmit }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Form handling logic will be implemented here
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      {/* Form fields will be added based on type */}
    </form>
  );
}
