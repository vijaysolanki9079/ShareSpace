'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Loader, AlertCircle, Check } from 'lucide-react';
import Image from 'next/image';
import FilterBar from './FilterBar';
import DonationDetailModal from './DonationDetailModal';

interface ItemRequest {
  id: string;
  title: string;
  description: string;
  category: {
    id: string;
    name: string;
  };
  images: string[];
  latitude: number;
  longitude: number;
  locationName: string | null;
  radius: number;
  distance: number;
  requester: {
    id: string;
    fullName: string;
    image: string | null;
  };
  ngo?: {
    id: string;
    organizationName: string;
    image: string | null;
    isVerified: boolean;
  };
  status: string;
  createdAt: string;
}

interface ItemCategory {
  id: string;
  name: string;
}

interface NearbyRequestsFeedProps {
  initialLat?: number;
  initialLng?: number;
  radiusKm?: number;
  category?: string;
}

export default function NearbyRequestsFeed({
  initialLat,
  initialLng,
  radiusKm: initialRadius = 5,
  category: initialCategory = '',
  refreshTrigger = 0,
}: NearbyRequestsFeedProps & { refreshTrigger?: number }) {
  const [requests, setRequests] = useState<ItemRequest[]>([]);
  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState({
    lat: initialLat || 28.6139,
    lng: initialLng || 77.209,
  });

  // Filter states
  const [radiusKm, setRadiusKm] = useState(initialRadius);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [postedBy, setPostedBy] = useState<'all' | 'user' | 'ngo'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [selectedRequest, setSelectedRequest] = useState<ItemRequest | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Get user location
  useEffect(() => {
    if (!initialLat || !initialLng) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          () => {
            console.log('Using default location');
          }
        );
      }
    }
  }, [initialLat, initialLng]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/requests/categories');
        const data = await response.json();
        if (data.categories) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };

    fetchCategories();
  }, []);

  // Fetch nearby requests
  useEffect(() => {
    fetchNearbyRequests();
  }, [userLocation, radiusKm, selectedCategory, postedBy, refreshTrigger]);

  const fetchNearbyRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        latitude: userLocation.lat.toString(),
        longitude: userLocation.lng.toString(),
        radius_km: radiusKm.toString(),
        limit: '100',
      });

      if (selectedCategory) {
        params.append('category', selectedCategory);
      }

      let response = await fetch(`/api/requests/nearby?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch nearby requests');
      }

      let data = await response.json();
      let filteredRequests = data.requests || [];

      // Apply posted by filter
      if (postedBy !== 'all') {
        filteredRequests = filteredRequests.filter((req: ItemRequest) => {
          if (postedBy === 'ngo') return !!req.ngo;
          if (postedBy === 'user') return !req.ngo;
          return true;
        });
      }

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredRequests = filteredRequests.filter((req: ItemRequest) =>
          req.title.toLowerCase().includes(query) ||
          req.description.toLowerCase().includes(query)
        );
      }

      setRequests(filteredRequests);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  if (loading && requests.length === 0) {
    return (
      <div className="space-y-6">
        <div className="h-12 w-full bg-white/50 animate-pulse rounded-2xl border border-gray-100" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white rounded-[2.5rem] p-3 shadow-sm border border-gray-100 h-[400px] animate-pulse">
               <div className="w-full h-56 rounded-[2rem] bg-gray-100 mb-4" />
               <div className="px-3 space-y-3">
                  <div className="h-6 w-3/4 bg-gray-100 rounded-lg" />
                  <div className="h-4 w-full bg-gray-50 rounded-lg" />
                  <div className="h-4 w-2/3 bg-gray-50 rounded-lg" />
                  <div className="pt-4 border-t border-gray-50 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gray-100" />
                    <div className="h-4 w-24 bg-gray-50 rounded-lg" />
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-800 flex gap-3">
        <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">Error loading requests</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <FilterBar
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        radiusKm={radiusKm}
        onRadiusChange={setRadiusKm}
        postedBy={postedBy}
        onPostedByChange={setPostedBy}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Results Count */}
      {requests.length > 0 && (
        <div className="text-sm text-gray-600">
          Found <strong>{requests.length}</strong> donation requests nearby
        </div>
      )}

      {/* Empty State */}
      {requests.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-600 mb-4">No donation requests found.</p>
          <p className="text-sm text-gray-500">Try adjusting your filters or check back later!</p>
        </div>
      )}

      {/* Request Grid - 3-4 columns */}
      {requests.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {requests.map((request, idx) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.5 }}
              onClick={() => {
                setSelectedRequest(request);
                setModalOpen(true);
              }}
              className="group bg-white rounded-[2.5rem] p-3 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_50px_-12px_rgba(16,185,129,0.15)] overflow-hidden transition-all duration-500 cursor-pointer border border-gray-100 hover:border-emerald-200"
            >
              <div className="relative w-full h-56 rounded-[2rem] overflow-hidden mb-4 bg-emerald-50">
                <Image
                  src={request.images && request.images.length > 0 ? request.images[0] : 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb8?q=80&w=2070&auto=format&fit=crop'}
                  alt={request.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />

                {/* Glass Badges */}
                <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none">
                  <div className="flex justify-between items-start">
                    <div className="px-3 py-1.5 bg-black/40 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-full border border-white/20">
                      {formatDistance(request.distance)}
                    </div>
                    <div className="px-3 py-1.5 bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-400/50 shadow-lg">
                      {request.status === 'open' ? 'Open' : 'Claimed'}
                    </div>
                  </div>
                  
                  <div className="mt-auto">
                    <div className="inline-flex px-3 py-1.5 bg-white/90 backdrop-blur-md text-emerald-800 text-[10px] font-black uppercase tracking-widest rounded-xl border border-white/50 shadow-sm">
                      {request.category.name}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Area */}
              <div className="px-3 pb-4 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-gray-900 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                    {request.title}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium line-clamp-2 leading-relaxed">
                    {request.description}
                  </p>
                </div>

                {/* Profile Link */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-2xl overflow-hidden bg-emerald-50 border border-emerald-100 relative">
                      {request.requester?.image ? (
                        <Image
                          src={request.requester.image}
                          alt={request.requester.fullName || 'User'}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-emerald-600 font-black text-sm">
                          {request.requester?.fullName?.charAt(0) || 'U'}
                        </div>
                      )}
                    </div>
                    {request.ngo && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-lg border-2 border-white flex items-center justify-center">
                        <Check size={10} className="text-white" strokeWidth={4} />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-gray-900 truncate tracking-tight leading-none mb-1">
                      {request.requester.fullName}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      {request.ngo ? 'Verified NGO' : 'Individual'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedRequest && (
        <DonationDetailModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          request={selectedRequest}
        />
      )}
    </div>
  );
}
