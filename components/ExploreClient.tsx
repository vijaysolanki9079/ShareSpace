'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Search, MapPin, LayoutGrid, Utensils, Home, BookOpen,
    HeartPulse, TreePine, BadgeCheck, Star, Users
} from 'lucide-react';
import { MOCK_NGOS } from '@/lib/mock-data';

export default function ExploreClient() {
    const [activeCategory, setActiveCategory] = useState('All Causes');
    const [searchQuery, setSearchQuery] = useState('');
    const [locationQuery, setLocationQuery] = useState('');

    const categories = [
        { name: 'All Causes', icon: <LayoutGrid size={16} /> },
        { name: 'Food', icon: <Utensils size={16} /> },
        { name: 'Education', icon: <BookOpen size={16} /> },
        { name: 'Health', icon: <HeartPulse size={16} /> },
        { name: 'Environment', icon: <TreePine size={16} /> },
        { name: 'Poverty', icon: <Home size={16} /> },
        { name: 'Other', icon: <Star size={16} /> },
    ];

    const ngos = MOCK_NGOS.map(ngo => ({
        id: ngo.id,
        name: ngo.name,
        category: ngo.category,
        description: ngo.description,
        distance: `${ngo.distanceKm} km away`,
        location: ngo.location,
        rating: "4.8 (100+)", // Mocked generic rating
        image: ngo.image,
        verified: ngo.verified
    }));

    // Filtering Logic
    const filteredNgos = ngos.filter(ngo => {
        const matchesCategory = activeCategory === 'All Causes' || ngo.category === activeCategory;
        const matchesSearch = ngo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ngo.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLocation = locationQuery === '' ||
            ngo.location.toLowerCase().includes(locationQuery.toLowerCase());

        return matchesCategory && matchesSearch && matchesLocation;
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="min-h-screen bg-gray-50 font-sans text-gray-900"
        >
            {/* Search Hero */}
            <section className="relative bg-emerald-900 px-6 pb-24 pt-24 text-center text-white">
                <div className="container mx-auto max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
                            Find Organizations Near You
                        </h1>
                        <p className="text-emerald-100/80 mb-8 max-w-2xl mx-auto">
                            Connect with verified NGOs and support causes that matter to you.
                        </p>

                        <div className="bg-white p-2 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-2 max-w-3xl mx-auto mb-10">
                            <div className="flex-1 flex items-center px-4 border-b md:border-b-0 md:border-r border-gray-100 h-12 md:h-auto">
                                <Search className="text-gray-400 w-5 h-5 mr-3" />
                                <input
                                    type="text"
                                    placeholder="Search by name or keyword..."
                                    className="w-full text-gray-900 placeholder-gray-400 outline-none text-base"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex-[0.6] flex items-center px-4 h-12 md:h-auto">
                                <MapPin className="text-gray-400 w-5 h-5 mr-3" />
                                <input
                                    type="text"
                                    placeholder="Location (e.g. Delhi)"
                                    className="w-full text-gray-900 placeholder-gray-400 outline-none text-base"
                                    value={locationQuery}
                                    onChange={(e) => setLocationQuery(e.target.value)}
                                />
                            </div>
                            <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl transition-colors h-12 md:h-auto w-full md:w-auto mt-2 md:mt-0">
                                Search
                            </button>
                        </div>

                        <div className="flex items-center justify-center gap-4">
                            <span className="text-sm font-medium text-emerald-200/60 uppercase tracking-widest">Are you an NGO?</span>
                            <Link href="/register-ngo" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-full border border-white/20 transition-all font-medium backdrop-blur-sm group">
                                <Users size={16} className="text-emerald-400" />
                                Register as NGO
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-12 pb-24">

                {/* Filters */}
                <div className="mb-10 overflow-x-auto pb-4 scrollbar-hide">
                    <div className="flex gap-3 min-w-max">
                        {categories.map((cat) => (
                            <button
                                key={cat.name}
                                onClick={() => setActiveCategory(cat.name)}
                                className={`
                                    flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all border
                                    ${activeCategory === cat.name
                                        ? 'bg-emerald-900 text-white border-emerald-900'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-900'
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
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                    <p className="font-semibold text-gray-900">
                        Showing <span className="text-emerald-700">{filteredNgos.length} organizations</span> nearby
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 hidden sm:inline">Sort by:</span>
                        <select className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg p-2.5 focus:ring-emerald-500 focus:border-emerald-500 outline-none cursor-pointer hover:border-gray-300">
                            <option>Recommended</option>
                            <option>Distance: Nearest</option>
                            <option>Rating: Highest</option>
                        </select>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredNgos.length > 0 ? (
                        filteredNgos.map((ngo) => (
                            <div key={ngo.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group">
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
                                    <div className="text-xs font-bold text-emerald-500 uppercase tracking-wide mb-2">
                                        {ngo.category}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                                        {ngo.name}
                                    </h3>
                                    <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">
                                        {ngo.description}
                                    </p>

                                    <div className="flex items-center gap-4 text-xs font-medium text-gray-400 mb-5 pb-4 border-b border-gray-100">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-3.5 h-3.5" />
                                            {ngo.distance}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                            {ngo.rating}
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors">
                                            Donate
                                        </button>
                                        <button className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold py-2.5 rounded-lg transition-colors">
                                            Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            <p className="text-lg">No organizations found matching your criteria.</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <div className="mt-16 text-center">
                    <button className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold py-3 px-8 rounded-xl transition-all hover:px-10">
                        Load More Organizations
                    </button>
                </div>

            </main>
        </motion.div>
    );
}


