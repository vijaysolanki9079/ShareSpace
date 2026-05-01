'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
    MapPin, LayoutGrid, Utensils, Home, BookOpen,
    HeartPulse, TreePine, BadgeCheck, Star, Loader2, MessageCircle
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useSession } from 'next-auth/react';
import type { NGOSuggestion } from '@/components/NGONameAutocomplete';
import type { MapNGO } from '@/components/MapComponent';
import SearchHero from '@/components/SearchHero';
import { LocationResult } from '@/components/LocationAutocomplete';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[400px] bg-emerald-50 rounded-3xl animate-pulse flex items-center justify-center text-emerald-600 font-medium tracking-wide">
            Loading Map Layer...
        </div>
    ),
});

export default function ExploreClient() {
    const [activeCategory, setActiveCategory] = useState('All Causes');
    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [sortBy, setSortBy] = useState('Recommended');
    const [visibleCount, setVisibleCount] = useState(6);
    const { data: session } = useSession();
    const startConversation = trpc.chat.startConversation.useMutation();
    const mapContainerRef = useRef<HTMLDivElement>(null);

    // Debounce the text input so we don't hammer the DB on every keystroke
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchInput), 400);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const categories = [
        { name: 'All Causes', icon: <LayoutGrid size={16} /> },
        { name: 'Food',        icon: <Utensils   size={16} /> },
        { name: 'Education',   icon: <BookOpen    size={16} /> },
        { name: 'Health',      icon: <HeartPulse  size={16} /> },
        { name: 'Environment', icon: <TreePine    size={16} /> },
        { name: 'Poverty',     icon: <Home        size={16} /> },
        { name: 'Other',       icon: <Star        size={16} /> },
    ];

    // ─── Live tRPC query ──────────────────────────────────────────────────────
    // Re-fetches automatically whenever category, search or location changes.
    const { data: ngoData, isLoading: isLoadingNGOs } = trpc.ngo.search.useQuery({
        lat:         userLocation?.[0] ?? null,
        lng:         userLocation?.[1] ?? null,
        radiusKm:    50,
        category:    activeCategory,
        searchQuery: debouncedSearch,
    });

    // ─── Search handler (called by SearchHero submit / "Near Me") ────────────
    const handleSearch = async (query: { ngoName: string; location: LocationResult | null }) => {
        setIsSearching(true);
        setSearchInput(query.ngoName);
        setDebouncedSearch(query.ngoName); // bypass debounce on explicit submit

        if (query.location) {
            setUserLocation([query.location.lat, query.location.lon]);
        } else if (query.ngoName) {
            // Clear location lock if searching by name so map can fly to the NGO
            setUserLocation(null);
        }

        await new Promise(resolve => setTimeout(resolve, 400));
        setIsSearching(false);

        setTimeout(() => {
            mapContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    // ─── Map tRPC results → card display shape ────────────────────────────────
    const ngos = useMemo(() => {
        if (!ngoData) return [];
        return ngoData.map(ngo => ({
            id:          ngo.id,
            name:        ngo.organizationName,
            description: ngo.bio ?? '',
            category:    ngo.categories?.[0] ?? ngo.missionArea ?? 'Other',
            categories:  ngo.categories ?? [],
            location:    ngo.locationName ?? '',
            distanceKm:  ngo.distanceKm,
            distance:    ngo.distanceKm != null ? `${ngo.distanceKm.toFixed(1)} km away` : 'Nearby',
            lat:         ngo.latitude,
            lng:         ngo.longitude,
            verified:    ngo.isVerified,
            image:       ngo.image ?? 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400',
            rating:      '4.8',
        }));
    }, [ngoData]);

    // ─── Client-side sort (API handles filter; we handle sort order) ──────────
    const sortedNgos = useMemo(() => {
        const arr = [...ngos];
        if (sortBy === 'Distance: Nearest First') {
            arr.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
        }
        return arr;
    }, [ngos, sortBy]);

    // ─── Only NGOs with coordinates go on the map ─────────────────────────────
    const mapNGOs: MapNGO[] = useMemo(
        () =>
            sortedNgos
                .filter(n => n.lat != null && n.lng != null)
                .map(n => ({
                    id:          n.id,
                    name:        n.name,
                    category:    n.category,
                    lat:         n.lat as number,
                    lng:         n.lng as number,
                    distanceKm:  n.distanceKm,
                })),
        [sortedNgos]
    );

    // ─── Autocomplete suggestions derived from live query ────────────────────
    const autocompleteSuggestions: NGOSuggestion[] = useMemo(
        () =>
            (ngoData ?? []).map(n => ({
                id:          n.id,
                name:        n.organizationName,
                description: n.bio ?? '',
                category:    n.categories?.[0] ?? n.missionArea ?? 'Other',
            })),
        [ngoData]
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="min-h-screen bg-gray-50 font-sans text-gray-900"
        >
            {/* Search Hero — receives live suggestions for the autocomplete */}
            <SearchHero
                onSearch={handleSearch}
                isSearching={isSearching}
                autocompleteSuggestions={autocompleteSuggestions}
                onNgoNameChange={setSearchInput}
            />

            {/* Main Content */}
            <main className="container mx-auto px-6 py-12 pb-24">

                {/* Map */}
                <div
                    ref={mapContainerRef}
                    className="scroll-mt-32 mb-12 -mt-20 relative z-10 w-full max-w-5xl mx-auto shadow-2xl rounded-3xl bg-white p-2"
                >
                    <MapComponent ngos={mapNGOs} userLocation={userLocation} />
                </div>

                {/* Category Filters */}
                <div className="mb-10 overflow-x-auto pb-4 scrollbar-hide">
                    <div className="flex gap-3 md:justify-center px-2">
                        {categories.map(cat => (
                            <button
                                key={cat.name}
                                onClick={() => { setActiveCategory(cat.name); setVisibleCount(6); }}
                                className={`
                                    flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all border
                                    ${activeCategory === cat.name
                                        ? 'bg-emerald-900 text-white border-emerald-900 shadow-md'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-900 hover:shadow-sm'
                                    }
                                `}
                            >
                                {cat.icon}
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results Header */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 max-w-5xl mx-auto">
                    <p className="font-semibold text-gray-900 flex items-center gap-2">
                        {isLoadingNGOs
                            ? <><Loader2 className="w-4 h-4 animate-spin text-emerald-600" /> Searching...</>
                            : <>Showing <span className="text-emerald-700">{sortedNgos.length} organizations</span></>
                        }
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 hidden sm:inline">Sort by:</span>
                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                            className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg p-2.5 focus:ring-emerald-500 focus:border-emerald-500 outline-none cursor-pointer hover:border-gray-300"
                        >
                            <option>Recommended</option>
                            {userLocation && <option>Distance: Nearest First</option>}
                            <option>Rating: Highest</option>
                        </select>
                    </div>
                </div>

                {/* NGO Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {isLoadingNGOs ? (
                        // Loading skeletons
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                                <div className="h-48 bg-gray-100" />
                                <div className="p-6 space-y-3">
                                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                                    <div className="h-5 bg-gray-100 rounded w-2/3" />
                                    <div className="h-3 bg-gray-100 rounded w-full" />
                                    <div className="h-3 bg-gray-100 rounded w-5/6" />
                                </div>
                            </div>
                        ))
                    ) : sortedNgos.length > 0 ? (
                        sortedNgos.slice(0, visibleCount).map(ngo => (
                            <div
                                key={ngo.id}
                                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group"
                            >
                                {/* Card Image */}
                                <div className="h-48 relative overflow-hidden bg-gray-100">
                                    <img
                                        src={ngo.image}
                                        alt={ngo.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    {ngo.verified && (
                                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
                                            <BadgeCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-500/10" />
                                            <span className="text-[10px] font-bold tracking-wider text-blue-900">VERIFIED</span>
                                        </div>
                                    )}
                                </div>

                                {/* Card Content */}
                                <div className="p-6 flex-1 flex flex-col">
                                    {/* Categories badges */}
                                    <div className="flex flex-wrap gap-1 mb-2">
                                        {(ngo.categories.length > 0 ? ngo.categories : [ngo.category])
                                            .slice(0, 2)
                                            .map(cat => (
                                                <span
                                                    key={cat}
                                                    className="text-xs font-bold text-emerald-600 uppercase tracking-wide bg-emerald-50 rounded-full px-2 py-0.5"
                                                >
                                                    {cat}
                                                </span>
                                            ))}
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                                        {ngo.name}
                                    </h3>
                                    <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">
                                        {ngo.description || 'No description available.'}
                                    </p>

                                    <div className="flex items-center gap-4 text-xs font-medium text-gray-500 mb-5 pb-4 border-b border-gray-100">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-3.5 h-3.5" />
                                            {ngo.distance}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                            {ngo.rating}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <div className="flex gap-2">
                                            <Link
                                                href={`/ngo/${ngo.id}`}
                                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors text-center inline-block"
                                            >
                                                Donate
                                            </Link>
                                            <Link
                                                href={`/ngo/${ngo.id}`}
                                                className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold py-2.5 rounded-lg transition-colors text-center inline-block"
                                            >
                                                Details
                                            </Link>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                if (!session?.user?.id) return alert('Please log in to message');
                                                try {
                                                    const conv = await startConversation.mutateAsync({
                                                        targetId: ngo.id,
                                                        targetType: 'ngo',
                                                    });
                                                    window.location.href = `/dashboard?section=messages&chatId=${conv.id}`;
                                                } catch (err) {
                                                    alert('Failed to start conversation');
                                                }
                                            }}
                                            className="w-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            <MessageCircle size={14} />
                                            Ask for Pickup
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-16 text-gray-500 bg-white rounded-3xl border border-gray-100">
                            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No organizations found</h3>
                            <p className="text-gray-500">
                                Try adjusting your search term, category filter, or location.
                            </p>
                        </div>
                    )}
                </div>

                {/* Load More */}
                {!isLoadingNGOs && sortedNgos.length > visibleCount && (
                    <div className="mt-16 text-center">
                        <button
                            onClick={() => setVisibleCount(prev => prev + 6)}
                            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold py-3 px-8 rounded-xl transition-all hover:px-10 shadow-sm"
                        >
                            Load More Organizations
                        </button>
                    </div>
                )}
            </main>
        </motion.div>
    );
}
