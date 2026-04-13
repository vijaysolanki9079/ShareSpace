'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, ArrowRight, Lock, Smartphone as PhoneIcon } from 'lucide-react';

interface MFASetupProps {
    method: 'authenticator' | 'webauthn';
    email: string;
    organizationName: string;
    secret?: string;
    qrCodeUrl?: string;
    backupCodes?: string[];
    onSetupComplete: (verificationCode: string) => void;
    onBack: () => void;
}

export default function MFASetup({ method, email, organizationName, secret, qrCodeUrl, backupCodes: _backupCodes, onSetupComplete, onBack }: MFASetupProps) {
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [error, setError] = useState<string | null>(null);

    const displaySecret = secret || '';
    const displayQrUrl = qrCodeUrl || '';

    const handleCopySecret = () => {
        navigator.clipboard.writeText(displaySecret);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!verificationCode || verificationCode.length !== 6) {
            setError('Please enter a valid 6-digit code');
            return;
        }

        if (!/^\d{6}$/.test(verificationCode)) {
            setError('Code must contain only digits');
            return;
        }

        setLoading(true);
        onSetupComplete(verificationCode);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative min-h-screen flex items-center justify-center font-sans overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 py-4"
        >
            <div className="relative z-10 w-full flex flex-col md:flex-row items-center gap-6 max-w-5xl mx-auto px-4">
                {/* Left Side - Instructions & Code Input */}
                <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex-1 flex flex-col justify-center w-full md:order-1 min-w-0"
                >
                    {/* Header */}
                    <div className="mb-4">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                <Lock className="w-5 h-5 text-emerald-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Secure Your Account
                            </h1>
                        </div>
                        <p className="text-gray-600 text-xs leading-relaxed">
                            Set up two-factor authentication to protect your NGO account.
                        </p>
                    </div>

                    {method === 'authenticator' ? (
                        <div className="space-y-4">
                            {/* Step 1 */}
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs">1</div>
                                    <h3 className="font-semibold text-gray-900 text-sm">Download an Authenticator App</h3>
                                </div>
                                <p className="text-xs text-gray-600 pl-8">Choose from Google Authenticator, Microsoft Authenticator, or Authy</p>
                            </div>

                            {/* Step 2 */}
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs">2</div>
                                    <h3 className="font-semibold text-gray-900 text-sm">Scan QR Code or Enter Key</h3>
                                </div>
                                
                                <p className="text-xs text-gray-600 pl-8">Your secret key (save in a safe place):</p>
                                <div className="ml-8 flex items-center gap-2 bg-white border border-gray-200 rounded p-2">
                                    <code className="flex-1 text-xs font-mono text-gray-900 break-all">
                                        {displaySecret}
                                    </code>
                                    <button
                                        type="button"
                                        onClick={handleCopySecret}
                                        className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
                                    >
                                        {copied ? (
                                            <Check className="w-3 h-3 text-emerald-600" />
                                        ) : (
                                            <Copy className="w-3 h-3 text-gray-600" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <form onSubmit={handleVerify} className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs">3</div>
                                    <h3 className="font-semibold text-gray-900 text-sm">Enter Verification Code</h3>
                                </div>
                                <div className="ml-8">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        value={verificationCode}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                            setVerificationCode(val);
                                        }}
                                        placeholder="000000"
                                        className="w-full text-center text-xl font-mono tracking-widest px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-600 focus:outline-none transition-colors bg-white max-w-xs"
                                    />
                                </div>
                                {error && (
                                    <div className="ml-8 p-2 mt-2 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-center gap-2 max-w-xs">
                                        <span>⚠️</span>
                                        {error}
                                    </div>
                                )}
                            </form>

                            {/* Info Box */}
                            <div className="bg-blue-50 border-l-4 border-blue-500 rounded p-2 ml-8 text-xs max-w-xs">
                                <p className="text-blue-900 font-semibold">💾 Save Your Backup Codes</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="bg-blue-50 border border-blue-200 rounded p-3">
                                <p className="text-xs text-blue-900 mb-2">
                                    <span className="font-semibold">🔐 Insert Your Security Key</span>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 ml-8 mt-4 max-w-xs">
                        <button
                            type="button"
                            onClick={onBack}
                            disabled={loading}
                            className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-900 font-semibold text-sm rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleVerify}
                            disabled={loading || verificationCode.length !== 6}
                            className="flex-1 px-4 py-2 bg-emerald-600 text-white font-semibold text-sm rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    Verify 
                                    <ArrowRight className="w-3 h-3" />
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>

                {/* Right Side - Setup Guidance & QR */}
                <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex-1 flex flex-col items-center justify-center w-full md:order-2 min-w-0"
                >
                    <div className="relative w-full max-w-sm">
                        {/* Decorative background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-2xl blur-2xl" />
                        
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3, type: 'spring' }}
                            className="relative bg-white p-5 rounded-2xl shadow-lg border border-gray-100"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                                    <PhoneIcon className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">Authenticator setup</p>
                                    <p className="text-xs text-gray-600">
                                        Scan the QR code to configure your app.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-gray-200 shadow-sm">
                                {displayQrUrl ? (
                                    <img 
                                        src={displayQrUrl} 
                                        alt="MFA QR Code" 
                                        className="w-48 h-48 object-contain"
                                    />
                                ) : (
                                    <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs text-center p-4">
                                        QR Code not available
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3 flex flex-col gap-1 items-center">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Account</p>
                                <p className="text-sm text-gray-900 font-medium text-center">{organizationName}</p>
                                <p className="text-xs text-gray-500 text-center">{email}</p>
                            </div>
                        </motion.div>

                        {/* Security Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="mt-6 text-center"
                        >
                            <div className="inline-flex items-center gap-1 text-emerald-600">
                                <Lock className="w-3 h-3" />
                                <span className="text-xs font-semibold">Enterprise Grade Security</span>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
