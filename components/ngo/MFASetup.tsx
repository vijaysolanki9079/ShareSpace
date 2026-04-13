'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Copy, Check, ArrowRight } from 'lucide-react';

interface MFASetupProps {
    method: 'authenticator' | 'webauthn';
    email: string;
    ngoName: string;
    onSetupComplete: () => void;
    onBack: () => void;
}

export default function MFASetup({ method, email, ngoName, onSetupComplete, onBack }: MFASetupProps) {
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);

    // Generate a mock secret for authenticator app
    const secret = 'JBSWY3DPEBLW64TMMUXAXO2I62A';  // Sample secret - in production, generate cryptographically secure secret
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/${encodeURIComponent(ngoName + ' ' + email)}?secret=${secret}&issuer=ShareSpace`;

    const handleCopySecret = () => {
        navigator.clipboard.writeText(secret);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleWebAuthnSetup = async () => {
        setLoading(true);
        try {
            // In a real implementation, this would use WebAuthn API
            // For now, simulate the setup
            await new Promise(resolve => setTimeout(resolve, 1500));
            onSetupComplete();
        } catch (error) {
            console.error('WebAuthn setup error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleContinue = async () => {
        if (method === 'webauthn') {
            await handleWebAuthnSetup();
        } else {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 500));
            setLoading(false);
            onSetupComplete();
        }
    };

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
                            <Smartphone className="w-12 h-12 text-emerald-600" strokeWidth={1.5} />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            {method === 'authenticator' ? 'Set Up Authenticator App' : 'Set Up Security Key'}
                        </h1>
                        <p className="text-sm text-gray-600">
                            {method === 'authenticator'
                                ? 'Add your organization account to your authenticator app'
                                : 'Follow the steps to register your security key'
                            }
                        </p>
                    </div>

                    {method === 'authenticator' ? (
                        // Authenticator App Setup
                        <div className="space-y-6">
                            {/* Step 1: Download App */}
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white text-sm font-bold">1</div>
                                    <h3 className="font-semibold text-gray-900">Download an Authenticator App</h3>
                                </div>
                                <p className="text-sm text-gray-600 ml-11 mb-3">Choose one of these apps:</p>
                                <div className="ml-11 space-y-2 mb-3">
                                    <div className="text-xs text-gray-700 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                        Google Authenticator
                                    </div>
                                    <div className="text-xs text-gray-700 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                        Microsoft Authenticator
                                    </div>
                                    <div className="text-xs text-gray-700 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                        Authy
                                    </div>
                                </div>
                            </div>

                            {/* Step 2: Scan QR Code */}
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white text-sm font-bold">2</div>
                                    <h3 className="font-semibold text-gray-900">Scan QR Code</h3>
                                </div>
                                <div className="ml-11 bg-gray-100 p-4 rounded-lg flex justify-center mb-3">
                                    <img src={qrCodeUrl} alt="QR Code" className="w-40 h-40" />
                                </div>
                                <p className="text-xs text-gray-600 ml-11 mb-3">Or enter this code manually:</p>
                                <div className="ml-11 flex items-center gap-2 mb-3">
                                    <code className="flex-1 text-xs font-mono bg-gray-100 p-3 rounded text-gray-900">
                                        {secret}
                                    </code>
                                    <button
                                        onClick={handleCopySecret}
                                        className="p-2 hover:bg-gray-100 rounded transition-colors"
                                    >
                                        {copied ? (
                                            <Check className="w-4 h-4 text-emerald-600" />
                                        ) : (
                                            <Copy className="w-4 h-4 text-gray-600" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Step 3: Verify */}
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white text-sm font-bold">3</div>
                                    <h3 className="font-semibold text-gray-900">Enter verification code</h3>
                                </div>
                                <p className="text-xs text-gray-600 ml-11">You&apos;ll verify this code on the next screen before completing setup.</p>
                            </div>

                            {/* Info Box */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 ml-11 -mb-4">
                                <p className="text-xs text-blue-700">
                                    <span className="font-semibold">Save your backup codes</span> in a safe place. You&apos;ll need them if you lose access to your authenticator app.
                                </p>
                            </div>
                        </div>
                    ) : (
                        // WebAuthn/Security Key Setup
                        <div className="space-y-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-900 mb-3">
                                    <span className="font-semibold">Insert your security key</span> when prompted on the next screen.
                                </p>
                                <ul className="text-xs text-blue-800 space-y-1 ml-4">
                                    <li className="list-disc">Supported: YubiKey, Google Titan, or any FIDO2 compatible device</li>
                                    <li className="list-disc">Have your device ready and connected to your computer</li>
                                </ul>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 text-center">
                                <div className="text-4xl mb-3">🔐</div>
                                <p className="text-sm text-gray-700 font-medium">Security Key Registration</p>
                                <p className="text-xs text-gray-600 mt-2">Click continue when ready to register your hardware key</p>
                            </div>

                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                                <p className="text-xs text-emerald-700">
                                    <span className="font-semibold">Why hardware keys?</span> They&apos;re immune to phishing and provide the highest level of security for your NGO account.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-8">
                        <button
                            onClick={onBack}
                            disabled={loading}
                            className="flex-1 h-11 bg-gray-100 text-gray-900 font-semibold text-sm rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleContinue}
                            disabled={loading}
                            className="flex-1 h-11 bg-emerald-600 text-white font-semibold text-sm rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? 'Setting up...' : 'Continue'}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
