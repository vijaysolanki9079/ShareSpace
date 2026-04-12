'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Globe } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

const bannerImg = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1974&auto=format&fit=crop';
const logoImg = '/images/logo-main.png';

const Signup = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, fullName }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Signup failed');
                return;
            }

            // Success - redirect to login
            router.push('/login?success=Account created successfully. Please log in.');
        } catch (err) {
            setError('An error occurred. Please try again.');
            console.error('Signup error:', err);
        } finally {
            setLoading(false);
        }
    };

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

            {/* Back to Home Button */}
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
                <div className="bg-white rounded-3xl p-8 shadow-2xl w-full animate-fade-in">
                    {/* Header */}
                    <div className="text-center mb-6 animate-slide-up">
                        <div className="inline-flex items-center gap-3 font-extrabold text-2xl text-gray-900 mb-4">
                            <div className="w-10 h-10 bg-black/10 rounded-xl shadow-md overflow-hidden border border-gray-300 flex items-center justify-center">
                                <img src={logoImg} alt="ShareSpace" className="w-full h-full object-cover" />
                            </div>
                            ShareSpace
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create an account</h1>
                        <p className="text-sm text-gray-500">Join the community of giving today.</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm animate-slide-up">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-900 mb-2">Full Name</label>
                            <input
                                type="text"
                                className="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                                placeholder="John Doe"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-900 mb-2">Email address</label>
                            <input
                                type="email"
                                className="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="mb-5">
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
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 bg-gray-900 text-white font-semibold text-sm rounded-lg hover:bg-gray-800 transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating account...' : 'Sign up'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center my-4 text-gray-400 text-xs font-medium animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <div className="flex-1 h-px bg-gray-200"></div>
                        <span className="px-3">OR CONTINUE WITH</span>
                        <div className="flex-1 h-px bg-gray-200"></div>
                    </div>

                    {/* Social Login */}
                    <button
                        type="button"
                        onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                        className="w-full h-11 bg-white border border-gray-200 text-gray-900 font-semibold text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 animate-slide-up disabled:opacity-50"
                        style={{ animationDelay: '0.2s' }}
                        disabled={loading}
                    >
                        <Globe className="w-5 h-5 text-gray-900" />
                        Sign up with Google
                    </button>

                    {/* Footer */}
                    <p className="text-center mt-4 text-sm text-gray-500 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                        Already have an account?{' '}
                        <Link href="/login" className="font-semibold text-gray-900 hover:text-emerald-600 transition-colors">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default Signup;

