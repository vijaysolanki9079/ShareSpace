'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertCircle, CheckCircle, Lock } from 'lucide-react';

interface MFAReAuthProps {
    email: string;
    ngoName: string;
    onVerificationComplete: (verified: boolean) => void;
}

export default function MFAReAuth({ email, ngoName, onVerificationComplete }: MFAReAuthProps) {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!code || code.length !== 6) {
            setError('Please enter a valid 6-digit code');
            return;
        }

        // Mock verification
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));

        // Accept any 6-digit code for demo (in production, verify against TOTP)
        if (/^\d{6}$/.test(code)) {
            setSuccess(true);
            setTimeout(() => {
                onVerificationComplete(true);
            }, 1200);
        } else {
            setError('Invalid code. Please try again.');
            setCode('');
            setLoading(false);
        }
    };

    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative min-h-screen flex items-center justify-center font-sans overflow-hidden bg-gray-900"
            >
                {/* Background */}
                <div className="absolute inset-0 bg-cover bg-center opacity-50 z-0 blur-sm scale-110"
                    style={{
                        backgroundImage: 'url(https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1974)',
                    }}
                />
                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
                    style={{
                        backgroundImage:
                            'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000),' +
                            'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)',
                        backgroundSize: '60px 60px',
                        backgroundPosition: '0 0, 30px 30px'
                    }}
                />

                <div className="relative z-10 w-full max-w-[440px] px-6">
                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="bg-white rounded-3xl p-10 shadow-2xl w-full text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
                        >
                            <CheckCircle className="w-8 h-8 text-emerald-600" />
                        </motion.div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Successful!</h1>
                        <p className="text-sm text-gray-600 mb-4">Welcome back to ShareSpace NGO Portal</p>
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
                            <p className="text-xs text-emerald-700">
                                <span className="font-semibold">Your account is secure</span> with two-factor authentication
                            </p>
                        </div>
                        <p className="text-xs text-gray-500">Redirecting to dashboard...</p>
                    </motion.div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative min-h-screen flex items-center justify-center font-sans overflow-hidden bg-gray-900"
        >
            {/* Background */}
            <div className="absolute inset-0 bg-cover bg-center opacity-50 z-0 blur-sm scale-110"
                style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1974)',
                }}
            />
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage:
                        'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000),' +
                        'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)',
                    backgroundSize: '60px 60px',
                    backgroundPosition: '0 0, 30px 30px'
                }}
            />

            <div className="relative z-10 w-full max-w-[440px] px-6">
                <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="bg-white rounded-3xl p-10 shadow-2xl w-full"
                >
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-center mb-8"
                    >
                        <div className="flex justify-center mb-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-lg" />
                                <div className="relative p-3 bg-emerald-100 rounded-full border-2 border-emerald-200">
                                    <Lock className="w-6 h-6 text-emerald-600" strokeWidth={2} />
                                </div>
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Enter Security Code</h1>
                        <p className="text-sm text-gray-600">Verify your identity to access your account</p>
                    </motion.div>

                    {/* NGO Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="bg-emerald-50 rounded-lg p-4 border border-emerald-200/50 mb-6"
                    >
                        <p className="text-xs text-emerald-700 font-semibold mb-1">ACCOUNT:</p>
                        <p className="text-sm font-semibold text-gray-900">{ngoName}</p>
                        <p className="text-xs text-gray-600 mt-1">{email}</p>
                    </motion.div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2"
                        >
                            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">{error}</p>
                        </motion.div>
                    )}

                    {/* Code Input */}
                    <motion.form
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        onSubmit={handleVerify}
                    >
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <Shield className="w-4 h-4 text-emerald-600" />
                                6-Digit Code
                            </label>
                            <input
                                ref={inputRef}
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                value={code}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                    setCode(value);
                                    setError('');
                                }}
                                placeholder="000000"
                                className="w-full h-14 px-4 border-2 border-gray-300 rounded-xl text-3xl text-center font-mono font-bold text-gray-900 bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all"
                                disabled={loading}
                                autoFocus
                            />
                            <p className="text-xs text-gray-500 mt-2 text-center">Code refreshes every 30 seconds</p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || code.length !== 6}
                            className="w-full h-11 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-sm rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-emerald-600/30 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    <Lock className="w-4 h-4" strokeWidth={2} />
                                    Verify & Sign In
                                </>
                            )}
                        </button>
                    </motion.form>

                    {/* Info Box */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-6 pt-6 border-t border-gray-200"
                    >
                        <p className="text-xs text-gray-600 text-center">
                            <span className="font-semibold text-gray-900">Where do I find my code?</span><br />
                            Open your authenticator app (Google Authenticator, Microsoft Authenticator, or Authy)
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </motion.div>
    );
}
