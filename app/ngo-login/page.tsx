'use client';

import React, { Suspense, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield } from 'lucide-react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import MFAFlowCoordinator from '@/components/ngo/MFAFlowCoordinator';

const bannerImg = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1974&auto=format&fit=crop';
const logoImg = '/images/-logo-main.png';

interface NGOLoginFormState {
  email: string;
  password: string;
  error: string;
  loading: boolean;
  ngoId?: string;
  organizationName?: string;
  isFirstLogin?: boolean;
  showMFAFlow: boolean;
}

function NGOLoginForm() {
  const [formState, setFormState] = useState<NGOLoginFormState>({
    email: '',
    password: '',
    error: '',
    loading: false,
    showMFAFlow: false
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const success = searchParams.get('success');

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState(prev => ({ ...prev, error: '', loading: true }));

    try {
      if (!formState.email.includes('@')) {
        setFormState(prev => ({ ...prev, error: 'Please enter a valid email', loading: false }));
        return;
      }

      if (!formState.password || formState.password.length < 6) {
        setFormState(prev => ({ ...prev, error: 'Please enter a valid password', loading: false }));
        return;
      }

      // Call API to verify NGO credentials
      const response = await fetch('/api/auth/ngo-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formState.email.toLowerCase().trim(),
          password: formState.password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setFormState(prev => ({ ...prev, error: data.error || 'Login failed', loading: false }));
        return;
      }

      const ngoData = await response.json();

      // Successfully verified credentials - now show MFA flow
      setFormState(prev => ({
        ...prev,
        ngoId: ngoData.id,
        organizationName: ngoData.name,
        isFirstLogin: !ngoData.hasMFAEnrolled,
        showMFAFlow: true,
        loading: false
      }));

    } catch (err) {
      setFormState(prev => ({ ...prev, error: 'An error occurred. Please try again.', loading: false }));
      console.error('Login error:', err);
    }
  };

  // Handle MFA flow completion
  const handleMFAComplete = async () => {
    try {
      // Create session via NextAuth
      const result = await signIn('credentials', {
        email: formState.email.toLowerCase().trim(),
        password: formState.password,
        type: 'ngo',
        mfaVerified: 'true',
        redirect: false,
      });

      if (result?.ok) {
        // Session created, redirect to dashboard
        router.push('/ngo-dashboard');
      } else {
        setFormState(prev => ({
          ...prev,
          error: 'Failed to create session. Please try again.',
          showMFAFlow: false
        }));
      }
    } catch (err) {
      setFormState(prev => ({
        ...prev,
        error: 'An error occurred during sign in.',
        showMFAFlow: false
      }));
      console.error('Sign in error:', err);
    }
  };

  // If MFA flow is active, show MFA coordinator
  if (formState.showMFAFlow && formState.ngoId && formState.organizationName !== undefined) {
    return (
      <MFAFlowCoordinator
        ngoId={formState.ngoId}
        email={formState.email}
        organizationName={formState.organizationName}
        isFirstLogin={formState.isFirstLogin ?? true}
        onFlowComplete={handleMFAComplete}
      />
    );
  }

  // Login form
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative min-h-screen flex items-center justify-center font-sans overflow-hidden bg-gray-900"
        >
            {/* Background Image from Assets */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50 z-0 blur-sm scale-110"
                style={{
                    backgroundImage: `url(${bannerImg})`
                }}
            />
            {/* Overlay Pattern */}
            <div
                className="absolute inset-0 z-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage:
                        'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000),' +
                        'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)',
                    backgroundSize: '60px 60px',
                    backgroundPosition: '0 0, 30px 30px'
                }}
            />
            <Link
                href="/"
                className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white font-medium hover:opacity-80 transition-opacity"
            >
                <div className="w-8 h-8 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-full">
                    <ArrowLeft className="w-4 h-4 text-white" />
                </div>
                Back to Home
            </Link>

            <div className="relative z-10 w-full max-w-[440px] px-6">
                <div className="bg-white rounded-3xl p-10 shadow-2xl w-full animate-fade-in">
                    {/* Header */}
                    <div className="text-center mb-8 animate-slide-up">
                        <div className="inline-flex items-center gap-3 font-extrabold text-2xl text-gray-900 mb-2">
                            <div className="w-10 h-10 bg-black/10 rounded-xl shadow-md overflow-hidden border border-gray-300 flex items-center justify-center">
                                <img src={logoImg} alt="ShareSpace" className="w-full h-full object-cover" />
                            </div>
                            ShareSpace
                        </div>
                        <div className="flex justify-center items-center gap-2 mb-6">
                            <Shield className="w-5 h-5 text-emerald-600" />
                            <span className="text-sm font-semibold text-emerald-600">NGO Portal</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">NGO Secure Login</h1>
                        <p className="text-sm text-gray-500">Enter your organizational credentials</p>
                    </div>

                    {/* Success Message */}
                    {success && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm animate-slide-up">
                            {success}
                        </div>
                    )}

                    {/* Error Message */}
                    {formState.error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm animate-slide-up">
                            {formState.error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleLoginSubmit} className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <div className="mb-5">
                            <label className="block text-sm font-medium text-gray-900 mb-2">Organization Email</label>
                            <input
                                type="email"
                                className="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                                placeholder="admin@organization.org"
                                value={formState.email}
                                onChange={(e) => setFormState(prev => ({ ...prev, email: e.target.value }))}
                                required
                                disabled={formState.loading}
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-900 mb-2">Password</label>
                            <input
                                type="password"
                                className="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                                placeholder="••••••••"
                                value={formState.password}
                                onChange={(e) => setFormState(prev => ({ ...prev, password: e.target.value }))}
                                required
                                disabled={formState.loading}
                            />
                            <div className="flex justify-end mt-2">
                                <a href="#" className="text-xs font-medium text-gray-500 hover:text-gray-900">Forgot password?</a>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={formState.loading}
                            className="w-full h-11 bg-gray-900 text-white font-semibold text-sm rounded-lg hover:bg-gray-800 transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {formState.loading ? 'Verifying...' : 'Sign In to Portal'}
                        </button>
                    </form>

                    {/* Info Box */}
                    <div className="mt-6 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex gap-2">
                        <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-emerald-700"><span className="font-semibold">Secured with two-step verification.</span> Your account will require MFA on next login.</p>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center my-6 text-gray-400 text-xs font-medium animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <div className="flex-1 h-px bg-gray-200"></div>
                        <span className="px-3">OR</span>
                        <div className="flex-1 h-px bg-gray-200"></div>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-sm text-gray-500 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                        Individual user?{' '}
                        <Link href="/login" className="font-semibold text-gray-900 hover:text-emerald-600 transition-colors">
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

export default function NGOLoginPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white text-sm">
                    Loading…
                </div>
            }
        >
            <NGOLoginForm />
        </Suspense>
    );
}
