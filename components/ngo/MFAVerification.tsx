'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertCircle, CheckCircle } from 'lucide-react';

interface MFAVerificationProps {
    ngoId: string;
    method: 'authenticator' | 'webauthn';
    email: string;
    onVerificationComplete: (code: string) => void;
    onBack: () => void;
}

export default function MFAVerification({ ngoId, method, email: _email, onVerificationComplete, onBack }: MFAVerificationProps) {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (method === 'authenticator') {
            if (!code || code.length < 6) {
                setError('Please enter your verification code (6 digits or backup code)');
                return;
            }

            setLoading(true);

            try {
                // ✅ Call verify-login API with ngoId and code
                const response = await fetch('/api/auth/mfa/verify-login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ngoId,
                        code
                    })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    // ✅ Verification successful
                    setSuccess(true);
                    setTimeout(() => {
                        onVerificationComplete(code);
                    }, 1500);
                } else {
                    // ❌ Verification failed
                    if (data.attemptsRemaining !== undefined) {
                        setAttemptsRemaining(data.attemptsRemaining);
                    }
                    setError(data.error || 'Verification failed. Please try again.');
                    setCode('');
                    setLoading(false);
                }
            } catch (err) {
                console.error('[MFA Verification] Error:', err);
                setError('Network error. Please try again.');
                setLoading(false);
            }
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
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Setup Complete!</h1>
                        <p className="text-sm text-gray-600 mb-4">Your two-factor authentication is now enabled</p>
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
                            <p className="text-xs text-emerald-700">
                                <span className="font-semibold">✓ Secured with two-step verification</span>
                            </p>
                        </div>
                        <p className="text-xs text-gray-500">Redirecting to your dashboard...</p>
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
                <div className="bg-white rounded-3xl p-10 shadow-2xl w-full">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <Shield className="w-12 h-12 text-emerald-600" strokeWidth={1.5} />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Verify Your {method === 'authenticator' ? 'Authenticator' : 'Security Key'}
                        </h1>
                        <p className="text-sm text-gray-600">
                            {method === 'authenticator'
                                ? 'Enter the 6-digit code from your authenticator app'
                                : 'Touch your security key when ready'
                            }
                        </p>
                    </div>

                    {method === 'authenticator' ? (
                        // Authenticator Verification
                        <form onSubmit={handleVerify}>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2"
                                >
                                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-red-700">{error}</p>
                                        {attemptsRemaining !== null && (
                                            <p className="text-xs text-red-600 mt-1">
                                                {attemptsRemaining > 0
                                                    ? `${attemptsRemaining} attempt(s) remaining`
                                                    : 'Account locked. Try again later.'}
                                            </p>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Verification Code
                                </label>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={12}
                                    value={code}
                                    onChange={(e) => {
                                        const value = e.target.value.toUpperCase().replace(/[^0-9A-Z-]/g, '');
                                        setCode(value);
                                        setError('');
                                    }}
                                    placeholder="000000 or XXXX-XXXX-XXXX"
                                    className="w-full h-12 px-4 border-2 border-gray-200 rounded-lg text-lg text-center font-mono text-gray-900 bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-colors"
                                    disabled={loading}
                                    autoFocus
                                />
                                <p className="text-xs text-gray-500 mt-2 text-center">Enter your 6-digit code or backup code</p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || (code.length !== 6 && code.length !== 12)}
                                className="w-full h-11 bg-emerald-600 text-white font-semibold text-sm rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Verifying...' : 'Verify Code'}
                            </button>

                            <button
                                type="button"
                                onClick={onBack}
                                disabled={loading}
                                className="w-full mt-3 h-11 bg-gray-100 text-gray-900 font-semibold text-sm rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                                Back
                            </button>
                        </form>
                    ) : (
                        // WebAuthn Verification
                        <div className="space-y-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center py-8">
                                <div className="text-5xl mb-3">🔐</div>
                                <p className="text-sm text-blue-900 font-medium">Insert your security key</p>
                                <p className="text-xs text-blue-800 mt-2">Your browser is waiting for your device</p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={onBack}
                                    className="flex-1 h-11 bg-gray-100 text-gray-900 font-semibold text-sm rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Info Box */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-600">
                            <span className="font-semibold text-gray-900">Trouble with verification?</span><br />
                            Contact support or use your backup codes to regain access.
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
