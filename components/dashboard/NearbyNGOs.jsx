'use client';

import React, { useState } from 'react';
import { MapPin, BadgeCheck, Star, Search } from 'lucide-react';
import Link from 'next/link';

const NearbyNGOs = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['All', 'Food & Hunger', 'Education', 'Homelessness', 'Animal Welfare', 'Health', 'Environment'];

  const ngos = [
    {
      id: 1,
      name: 'Annapoorna Food Relief',
      category: 'Food & Hunger',
      description: 'Providing nutritious meals to daily wage workers and families in need across Delhi NCR.',
      distance: '2.5 km',
      location: 'Delhi',
      rating: 4.9,
      reviews: 156,
      image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=1000&auto=format&fit=crop',
      verified: true,
    },
    {
      id: 2,
      name: 'Jivdaya Charitable Trust',
      category: 'Animal Welfare',
      description: 'Dedicated to helping stray animals in Ahmedabad. We provide medical aid, shelter, and rehabilitation.',
      distance: '5.0 km',
      location: 'Ahmedabad',
      rating: 4.8,
      reviews: 342,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000&auto=format&fit=crop',
      verified: true,
    },
    {
      id: 3,
      name: 'Vidya Arogaya Sansthan',
      category: 'Education',
      description: 'Empowering underprivileged children in rural Maharashtra with quality education and digital literacy.',
      distance: '12 km',
      location: 'Pune',
      rating: 5.0,
      reviews: 89,
      image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1000&auto=format&fit=crop',
      verified: true,
    },
    {
      id: 4,
      name: 'Rain Basera Foundation',
      category: 'Homelessness',
      description: 'Providing night shelters and warm clothing to the homeless population in North India during winters.',
      distance: '8 km',
      location: 'Lucknow',
      rating: 4.7,
      reviews: 210,
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1000&auto=format&fit=crop',
      verified: true,
    },
  ];

  const filteredNgos = ngos.filter(ngo => {
    const matchesSearch = ngo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ngo.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || ngo.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Nearby NGOs</h1>
        <p className="text-gray-600">Connect with verified organizations in your area.</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search NGOs by name or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category === 'All' ? 'all' : category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                (category === 'All' && selectedCategory === 'all') || selectedCategory === category
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-gray-50 border border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* NGOs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNgos.map((ngo) => (
          <div
            key={ngo.id}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
          >
            {/* Image */}
            <div className="relative h-48 bg-gray-100 overflow-hidden">
              <img
                src={ngo.image}
                alt={ngo.name}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              {ngo.verified && (
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
                  <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-[10px] font-bold tracking-wider text-blue-900">VERIFIED</span>
                </div>
              )}
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1.5">
                <MapPin className="w-3 h-3" />
                {ngo.distance}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-2">
                {ngo.category}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                {ngo.name}
              </h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {ngo.description}
              </p>

              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-semibold text-gray-900">{ngo.rating}</span>
                  <span className="text-xs text-gray-500">({ngo.reviews})</span>
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {ngo.location}
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors">
                  Donate
                </button>
                <Link
                  href={`/explore?ngo=${ngo.id}`}
                  className="flex-1 py-2.5 bg-white border-2 border-gray-200 hover:border-emerald-500 hover:text-emerald-600 text-gray-700 text-sm font-semibold rounded-xl transition-all text-center"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredNgos.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No NGOs found</h3>
          <p className="text-gray-600">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};

export default NearbyNGOs;
