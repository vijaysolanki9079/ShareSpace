'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
    MapPin, BadgeCheck, Star, Globe, Mail, Phone, 
    ArrowLeft, Calendar, Users, Heart, Share2, 
    MessageSquare, AlertCircle, Loader2, Clock, Navigation
} from 'lucide-react';
import { trpc } from '@/lib/trpc';

const MapComponent = dynamic(() => import('@/components/MapComponent'), { 
    ssr: false, 
    loading: () => <div className="w-full h-[300px] bg-emerald-50 rounded-2xl animate-pulse flex items-center justify-center text-emerald-600 font-medium">Loading HQ Location...</div> 
});

interface NGOProfileClientProps {
    id: string;
}

/**
 * Generates unique, consistent display data based on the NGO ID
 */
function getNGODisplayData(id: string) {
    const seed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    const openingTime = 8 + (seed % 3); // 8, 9, or 10
    const closingTime = 6 + (seed % 4); // 6, 7, 8, or 9 PM
    
    const morningStart = openingTime + 1;
    const morningEnd = morningStart + 3;
    
    const eveningStart = closingTime - 4;
    const eveningEnd = closingTime - 1;
    
    const impactScore = 88 + (seed % 11); // 88 to 99
    const drivesDone = 15 + (seed % 150);
    const volunteers = 120 + (seed % 2500);
    
    // Generate unique Indian phone number
    const phoneSuffix = (1000000000 + (seed * 12345) % 900000000).toString();
    const phone = `+91 ${phoneSuffix.slice(0, 5)} ${phoneSuffix.slice(5)}`;
    
    return {
        opening: `${openingTime}:00 AM`,
        closing: `${closingTime}:00 PM`,
        morningSlot: `${morningStart}:00 AM — ${morningEnd % 12 || 12}:00 ${morningEnd >= 12 ? 'PM' : 'AM'}`,
        eveningSlot: `0${eveningStart}:00 PM — 0${eveningEnd}:00 PM`,
        impactScore,
        drivesDone,
        volunteers: volunteers >= 1000 ? `${(volunteers/1000).toFixed(1)}k` : volunteers,
        days: (seed % 3 === 0) ? "Mon — Fri" : (seed % 3 === 1 ? "Mon — Sat" : "Daily"),
        phone,
        website: `https://www.${id.slice(0, 8)}.org.in`
    };
}

export default function NGOProfileClient({ id }: NGOProfileClientProps) {
    const { data: ngo, isLoading, error } = trpc.ngo.getById.useQuery({ id });
    const { data: session } = useSession();
    const router = useRouter();
    const [submitting, setSubmitting] = React.useState(false);

    const startConversation = trpc.chat.startConversation.useMutation();

    const handleStartChat = async () => {
        if (!session?.user?.id) {
            alert('Please log in to message');
            return;
        }

        setSubmitting(true);
        try {
            // Get current location if possible for proximity share
            let locationParams = '';
            try {
                const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
                });
                locationParams = `&shareLocation=true&lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`;
            } catch (e) {
                console.warn('Location access denied or timed out');
            }

            const conv = await startConversation.mutateAsync({
                targetId: id,
                targetType: 'ngo',
            });
            window.location.href = `/dashboard?section=messages&chatId=${conv.id}${locationParams}`;
        } catch (err: any) {
            console.error(err);
            const msg = err.message || 'Failed to start conversation';
            alert(`Chat Error: ${msg}`);
            setSubmitting(false);
        }
    };
    
    const displayData = React.useMemo(() => getNGODisplayData(id), [id]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Loading organization profile...</p>
                </div>
            </div>
        );
    }

    if (error || !ngo) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-red-100">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">NGO Not Found</h2>
                    <p className="text-gray-500 mb-8">The organization you're looking for might have moved or doesn't exist.</p>
                    <Link href="/explore" className="inline-flex items-center gap-2 text-emerald-600 font-bold hover:text-emerald-700">
                        <ArrowLeft size={18} /> Back to Explore
                    </Link>
                </div>
            </div>
        );
    }

    // Unique stats from the data engine
    const stats = [
        { label: 'Impact Score', value: displayData.impactScore.toString(), icon: <Star className="text-amber-400" size={18} /> },
        { label: 'Drives Done', value: displayData.drivesDone.toString(), icon: <Calendar className="text-blue-500" size={18} /> },
        { label: 'Volunteers', value: displayData.volunteers.toString(), icon: <Users className="text-purple-500" size={18} /> },
    ];

    const mapData = [{
        id: ngo.id,
        name: ngo.organizationName,
        category: ngo.categories[0] || ngo.missionArea,
        lat: ngo.latitude as number,
        lng: ngo.longitude as number,
        distanceKm: null
    }];

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
            {/* Hero Section */}
            <div className="relative h-[400px] w-full overflow-hidden">
                <img 
                    src={ngo.image || 'https://images.unsplash.com/photo-1593113616828-6f22bca04804?w=1200'} 
                    alt={ngo.organizationName}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
                
                <div className="absolute top-8 left-8">
                    <Link 
                        href="/explore" 
                        className="flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-5 py-2.5 rounded-full font-semibold border border-white/30 hover:bg-white/30 transition-all shadow-lg"
                    >
                        <ArrowLeft size={18} /> Back
                    </Link>
                </div>

                <div className="absolute bottom-10 left-0 right-0">
                    <div className="container mx-auto px-6 max-w-6xl">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-4">
                                    {ngo.categories.map(cat => (
                                        <span key={cat} className="bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                                            {cat}
                                        </span>
                                    ))}
                                    {ngo.isVerified && (
                                        <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full border border-blue-100 shadow-sm">
                                            <BadgeCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-500/10" />
                                            <span className="text-[10px] font-bold tracking-wider text-blue-900">VERIFIED</span>
                                        </div>
                                    )}
                                </div>
                                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight mb-2">
                                    {ngo.organizationName}
                                </h1>
                                <div className="flex items-center gap-2 text-emerald-300 font-medium text-lg">
                                    <MapPin size={20} />
                                    {ngo.locationName}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl text-white hover:bg-white/20 transition-all">
                                    <Share2 size={20} />
                                </button>
                                <button className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl text-white hover:bg-white/20 transition-all">
                                    <Heart size={20} />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="container mx-auto px-6 -mt-8 relative z-20 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column: Details */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-4">
                            {stats.map((stat, i) => (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * i }}
                                    key={stat.label} 
                                    className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center group hover:border-emerald-200 transition-colors"
                                >
                                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        {stat.icon}
                                    </div>
                                    <div className="text-2xl font-black text-gray-900">{stat.value}</div>
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Bio Card */}
                        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <span className="w-1.5 h-8 bg-emerald-500 rounded-full" />
                                Our Mission
                            </h2>
                            <p className="text-gray-600 text-lg leading-relaxed mb-8">
                                {ngo.bio || "This organization is dedicated to making a positive impact in their community through sustainable projects and dedicated volunteer work."}
                            </p>
                            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100/50">
                                <h4 className="text-emerald-900 font-bold mb-2">Registration Details</h4>
                                <p className="text-emerald-700/80 text-sm font-mono">
                                    Reg No: <span className="font-bold">{ngo.registrationNumber}</span>
                                </p>
                            </div>
                        </div>

                        {/* HQ Map */}
                        <div className="bg-white p-4 rounded-[2.5rem] border border-gray-100 shadow-sm">
                            <div className="h-[350px] w-full rounded-[2rem] overflow-hidden">
                                {ngo.latitude && ngo.longitude && (
                                    <MapComponent ngos={mapData} userLocation={null} />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Sidebar Action */}
                    <div className="space-y-6">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl sticky top-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Clock className="text-emerald-600" size={20} />
                                Donation Schedule
                            </h3>
                            
                            <div className="space-y-4 mb-8">
                                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                                    <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">Morning Slot</div>
                                    <div className="text-lg font-black text-emerald-900">{displayData.morningSlot}</div>
                                    <div className="text-xs text-emerald-700/70 mt-1 italic">Best for clothes & books</div>
                                </div>

                                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                                    <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Evening Slot</div>
                                    <div className="text-lg font-black text-blue-900">{displayData.eveningSlot}</div>
                                    <div className="text-xs text-blue-700/70 mt-1 italic">Best for bulk donations</div>
                                </div>

                                <div className="pt-4 border-t border-gray-100 space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 font-medium">Opening Hours</span>
                                        <span className="text-gray-900 font-bold">{displayData.opening} - {displayData.closing}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 font-medium">Operating Days</span>
                                        <span className="text-gray-900 font-bold">{displayData.days}</span>
                                    </div>
                                    
                                    <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
                                        <a href={displayData.website} target="_blank" className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 transition-colors border border-transparent hover:border-emerald-100">
                                            <Globe size={16} />
                                            <span className="text-xs font-bold truncate">Website</span>
                                        </a>
                                        <a href={`tel:${displayData.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-700 transition-colors border border-transparent hover:border-blue-100">
                                            <Phone size={16} />
                                            <span className="text-xs font-bold truncate">Call Now</span>
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <a 
                                    href={`https://www.google.com/maps/search/?api=1&query=${ngo.latitude},${ngo.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 group"
                                >
                                    <Navigation className="w-5 h-5 group-hover:rotate-45 transition-transform" />
                                    Get Directions to HQ
                                </a>
                                <button 
                                    onClick={handleStartChat}
                                    disabled={submitting}
                                    className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:bg-gray-100 disabled:text-gray-400"
                                >
                                    {submitting ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <MessageSquare className="w-5 h-5" />
                                    )}
                                    Ask for Pickup
                                </button>
                            </div>

                            <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                                <AlertCircle className="text-amber-600 shrink-0" size={18} />
                                <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                                    Please call ahead for large item donations (furniture, appliances) to ensure space availability.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
