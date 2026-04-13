'use client';

import React, { Suspense, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Smartphone, Key, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import MFASetup from '@/components/ngo/MFASetup';
import MFAVerification from '@/components/ngo/MFAVerification';

const bannerImg = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1974&auto=format&fit=crop';
const logoImg = '/images/-logo-main.png';

type Stage = 'login' | 'mfa-method' | 'mfa-setup' | 'mfa-verify';

function NGOLoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [stage, setStage] = useState<Stage>('login');
    const [mfaMethod, setMfaMethod] = useState<'authenticator' | 'webauthn' | null>(null);
    const [ngoData, setNgoData] = useState<{ id: string; name: string } | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const success = searchParams.get('success');

    const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // In a real app, this would verify against the NGO database
            // For now, we'll proceed to MFA method selection
            if (!email.includes('@')) {
                setError('Please enter a valid email');
                setLoading(false);
                return;
            }

            // Simulate API call to verify NGO credentials
            await new Promise(resolve => setTimeout(resolve, 800));

            // Mock NGO data - in production, verify credentials first
            if (email && password) {
                setNgoData({
                    id: 'ngo-001',
                    name: email.split('@')[0]
                });
                setStage('mfa-method');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (stage === 'mfa-method') {
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

                <div className="relative z-10 w-full max-w-[440px] px-6">
                    <div className="bg-white rounded-3xl p-10 shadow-2xl w-full">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="flex justify-center mb-4">
                                <Shield className="w-12 h-12 text-emerald-600" strokeWidth={1.5} />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Set Up Security</h1>
                            <p className="text-sm text-gray-600">Protect your NGO account with two-step verification</p>
                            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-200">
                                <CheckCircle className="w-4 h-4 text-emerald-600" />
                                <span className="text-xs font-medium text-emerald-700">Verified NGO Badge</span>
                            </div>
                        </div>

                        {/* MFA Options */}
                        <div className="space-y-4">
                            <button
                                onClick={() => {
                                    setMfaMethod('authenticator');
                                    setStage('mfa-setup');
                                }}
                                className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group cursor-pointer"
                            >
                                <div className="flex items-start gap-3">
                                    <Smartphone className="w-6 h-6 text-emerald-600 mt-0.5 group-hover:scale-110 transition-transform" />
                                    <div className="text-left">
                                        <h3 className="font-semibold text-gray-900">Authenticator App</h3>
                                        <p className="text-xs text-gray-600 mt-1">Use Google Authenticator, Microsoft Authenticator, or Authy</p>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => {
                                    setMfaMethod('webauthn');
                                    setStage('mfa-setup');
                                }}
                                className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group cursor-pointer"
                            >
                                <div className="flex items-start gap-3">
                                    <Key className="w-6 h-6 text-emerald-600 mt-0.5 group-hover:scale-110 transition-transform" />
                                    <div className="text-left">
                                        <h3 className="font-semibold text-gray-900">Security Key (YubiKey)</h3>
                                        <p className="text-xs text-gray-600 mt-1">Hardware security key via WebAuthn</p>
                                    </div>
                                </div>
                            </button>
                        </div>

                        {/* Info Box */}
                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-700">You can set up multiple authentication methods for better security and flexibility.</p>
                        </div>

                        {/* Back Button */}
                        <button
                            onClick={() => {
                                setStage('login');
                                setError('');
                            }}
                            className="w-full mt-6 h-11 bg-gray-100 text-gray-900 font-semibold text-sm rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    }

    if (stage === 'mfa-setup' && mfaMethod) {
        return (
            <MFASetup
                method={mfaMethod}
                email={email}
                ngoName={ngoData?.name || 'ShareSpace NGO'}
                onSetupComplete={() => {
                    setStage('mfa-verify');
                }}
                onBack={() => {
                    setStage('mfa-method');
                    setMfaMethod(null);
                }}
            />
        );
    }

    if (stage === 'mfa-verify') {
        return (
            <MFAVerification
                method={mfaMethod!}
                email={email}
                onVerificationComplete={() => {
                    // In a real app, this would authenticate the user
                    router.push('/ngo-dashboard');
                }}
                onBack={() => {
                    setStage('mfa-method');
                    setMfaMethod(null);
                }}
            />
        );
    }

    // Main Login Form
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
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm animate-slide-up">
                            {error}
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
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-900 mb-2">Password</label>
                            <input
                                type="password"
                                className="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                            <div className="flex justify-end mt-2">
                                <a href="#" className="text-xs font-medium text-gray-500 hover:text-gray-900">Forgot password?</a>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 bg-gray-900 text-white font-semibold text-sm rounded-lg hover:bg-gray-800 transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Verifying...' : 'Sign In to Portal'}
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
