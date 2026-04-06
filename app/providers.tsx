'use client';

import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { TRPCProvider } from './trpc-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TRPCProvider>
      <SessionProvider>
        <AuthProvider>
          {children}
          <Toaster position="bottom-center" />
        </AuthProvider>
      </SessionProvider>
    </TRPCProvider>
  );
}
