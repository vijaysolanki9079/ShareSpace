'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { useSession } from 'next-auth/react';

interface User {
  id: string;
  email: string;
  name: string;
  type: 'user' | 'ngo';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  userType: 'user' | 'ngo' | null;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  const value = useMemo((): AuthContextType => {
    const isLoading = status === 'loading';
    const user: User | null = session?.user
      ? {
          id: session.user.id || '',
          email: session.user.email || '',
          name: session.user.name || '',
          type: session.user.type ?? 'user',
        }
      : null;

    return {
      user,
      isLoading,
      userType: user?.type ?? null,
      isAuthenticated: !!user,
    };
  }, [session, status]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
