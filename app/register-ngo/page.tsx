'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    ChevronDown, UploadCloud, ShieldCheck,
    CheckCircle2, Star
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const RegisterNGO = () => {
    const [organizationName, setOrganizationName] = useState('');
    const [registrationNumber, setRegistrationNumber] = useState('');
    const [website, setWebsite] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [missionArea, setMissionArea] = useState('');
    const [verificationDocument, setVerificationDocument] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth',
        });
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('File must be less than 5MB');
                return;
            }
            setVerificationDocument(file);
            setError('');
        }
    };

    const handleDragDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('File must be less than 5MB');
                return;
            }
            setVerificationDocument(file);
            setError('');
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('email', email);
            formData.append('password', password);
            formData.append('organizationName', organizationName);
            formData.append('registrationNumber', registrationNumber);
            formData.append('website', website);
            formData.append('missionArea', missionArea);
            if (verificationDocument) {
                formData.append('verificationDocument', verificationDocument);
            }

            const response = await fetch('/api/auth/ngo-signup', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Registration failed');
                return;
            }

            setSuccess(true);
            // Redirect to login after 2 seconds
            setTimeout(() => {
                router.push('/login?success=NGO registered successfully. Awaiting verification. Please log in.');
            }, 2000);
        } catch (err) {
            setError('An error occurred. Please try again.');
            console.error('NGO registration error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-h-screen bg-white flex items-center justify-center font-sans"
            >
                <div className="text-center max-w-md px-6">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-3">Registration Submitted!</h1>
                    <p className="text-gray-600 mb-6">
                        Your NGO registration has been submitted. Our team will verify your credentials within 24-48 hours.
                    </p>
                    <p className="text-sm text-gray-500">Redirecting to login...</p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="min-h-screen bg-white font-sans text-gray-900"
        >
            <div className="flex min-h-screen flex-col lg:flex-row">
                {/* Left Side: Form */}
                <div className="w-full lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center bg-white">
                    <div className="max-w-xl mx-auto w-full">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                        >
                            <h1 className="text-3xl lg:text-4xl font-bold mb-3 tracking-tight text-gray-900">
                                Partner with ShareSpace
                            </h1>
                            <p className="text-gray-500 mb-8 text-lg">
                                Join 1,200+ verified NGOs connecting with donors in your area.
                                Start receiving items today.
                            </p>
                        </motion.div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Organization Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. City Food Bank"
                                    value={organizationName}
                                    onChange={(e) => setOrganizationName(e.target.value)}
                                    className="w-full h-12 px-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Registration Number</label>
                                    <input
                                        type="text"
                                        placeholder="Official Reg/License #"
                                        value={registrationNumber}
                                        onChange={(e) => setRegistrationNumber(e.target.value)}
                                        className="w-full h-12 px-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Website (Optional)</label>
                                    <input
                                        type="url"
                                        placeholder="https://"
                                        value={website}
                                        onChange={(e) => setWebsite(e.target.value)}
                                        className="w-full h-12 px-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Work Email</label>
                                <input
                                    type="email"
                                    placeholder="contact@organization.org"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-12 px-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Create Password</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-12 px-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Mission Area</label>
                                <div className="relative">
                                    <select
                                        value={missionArea}
                                        onChange={(e) => setMissionArea(e.target.value)}
                                        className="w-full h-12 pl-4 pr-10 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all appearance-none cursor-pointer"
                                        required
                                        disabled={loading}
                                    >
                                        <option value="">Select primary cause...</option>
                                        <option value="Food Insecurity">Food Insecurity</option>
                                        <option value="Education">Education</option>
                                        <option value="Homelessness">Homelessness</option>
                                        <option value="Animal Welfare">Animal Welfare</option>
                                        <option value="Disaster Relief">Disaster Relief</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Verification Document</label>
                                <div
                                    className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors group"
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={handleDragDrop}
                                    onClick={() => document.getElementById('file-input')?.click()}
                                >
                                    <input
                                        id="file-input"
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,.jpg,.jpeg"
                                        onChange={handleFileChange}
                                        disabled={loading}
                                    />
                                    <UploadCloud className="mx-auto text-gray-400 group-hover:text-emerald-500 mb-2 transition-colors" size={24} />
                                    <p className="text-sm font-medium text-emerald-600">
                                        {verificationDocument ? verificationDocument.name : 'Click to upload'}{' '}
                                        {!verificationDocument && <span className="text-gray-500 font-normal">or drag and drop</span>}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">PDF or JPG (Max 5MB)</p>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Creating Account...' : 'Create Partner Account'}
                                </button>
                                <p className="text-xs text-center text-gray-400 mt-4 leading-relaxed">
                                    By registering, you agree to our <a href="#" className="text-emerald-600 hover:underline">Partner Terms</a> and <a href="#" className="text-emerald-600 hover:underline">Privacy Policy</a>.
                                </p>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Side: Visual & Benefits */}
                <div className="w-full lg:w-1/2 bg-[#022c22] relative overflow-hidden flex items-center justify-center">
                    {/* Background with Overlay */}
                    <div className="absolute inset-0 opacity-40">
                        <img
                            src="https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=1000&auto=format&fit=crop"
                            alt="Volunteer Support"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#022c22] via-[#022c22]/80 to-transparent"></div>

                    <div className="relative p-8 lg:p-16 max-w-xl text-white">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                        >
                            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-8 border border-white/10">
                                <ShieldCheck className="text-emerald-400" size={28} />
                            </div>

                            <h2 className="text-3xl lg:text-4xl font-bold mb-8 leading-tight">
                                Why verify your NGO?
                            </h2>

                            <div className="space-y-6 mb-12">
                                <div className="flex gap-4">
                                    <div className="mt-1 text-emerald-400">
                                        <CheckCircle2 size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-1">Priority Visibility</h4>
                                        <p className="text-gray-300 text-sm">Appear at the top of local donor searches and maps.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="mt-1 text-emerald-400">
                                        <CheckCircle2 size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-1">Bulk Requests</h4>
                                        <p className="text-gray-300 text-sm">Request multiple items at once for shelters or drives.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="mt-1 text-emerald-400">
                                        <CheckCircle2 size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-1">Campaign Tools</h4>
                                        <p className="text-gray-300 text-sm">Launch seasonal drives with dedicated landing pages.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                                <div className="flex gap-1 text-amber-400 mb-4">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                                </div>
                                <p className="italic text-gray-300 mb-6 leading-relaxed">
                                    &quot;ShareSpace has completely transformed how we source clothes for our shelter. The local community is incredibly generous when they know exactly what&apos;s needed.&quot;
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden ring-2 ring-emerald-500/20">
                                        <img src="https://i.pravatar.cc/150?u=sarah" alt="Sarah J." />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white">Vijay Solanki</div>
                                        <div className="text-xs text-gray-400">Director, City Haven Shelter</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default RegisterNGO;
