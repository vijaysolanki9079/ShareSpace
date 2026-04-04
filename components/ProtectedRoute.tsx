'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredType?: 'user' | 'ngo';
}

export function ProtectedRoute({ children, requiredType }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, userType } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (requiredType && userType !== requiredType) {
        router.push('/');
      }
    }
  }, [isAuthenticated, isLoading, userType, requiredType, router]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredType && userType !== requiredType) {
    return null;
  }

  return <>{children}</>;
}
