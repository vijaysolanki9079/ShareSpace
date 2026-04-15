'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Loader, AlertCircle } from 'lucide-react';
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
}: NearbyRequestsFeedProps) {
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
  }, [userLocation, radiusKm, selectedCategory, postedBy]);

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
      <div className="flex items-center justify-center py-12">
        <Loader className="animate-spin text-blue-500" size={32} />
        <span className="ml-3 text-gray-600">Finding nearby requests...</span>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {requests.map((request, idx) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => {
                setSelectedRequest(request);
                setModalOpen(true);
              }}
              className="bg-white rounded-lg shadow-md hover:shadow-xl overflow-hidden transition-all cursor-pointer group"
            >
              {/* Image */}
              <div className="relative w-full h-48 bg-gray-200 overflow-hidden">
                {request.images && request.images.length > 0 ? (
                  <Image
                    src={request.images[0]}
                    alt={request.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                    <span className="text-white text-sm">No image</span>
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-3 right-3 px-2 py-1 bg-white/90 backdrop-blur text-xs font-semibold rounded-full">
                  {request.status === 'open' ? '🟢 Available' : '✓ Claimed'}
                </div>

                {/* Distance Badge */}
                <div className="absolute top-3 left-3 px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                  {formatDistance(request.distance)}
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                {/* Category */}
                <div className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                  {request.category.name}
                </div>

                {/* Title */}
                <h3 className="font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {request.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 line-clamp-2">
                  {request.description}
                </p>

                {/* Requester */}
                <div className="flex items-center gap-2 pt-2 border-t">
                  {request.requester.image && (
                    <Image
                      src={request.requester.image}
                      alt={request.requester.fullName}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {request.requester.fullName}
                    </p>
                    {request.ngo && (
                      <p className="text-xs text-gray-500">NGO</p>
                    )}
                  </div>
                </div>

                {/* CTA */}
                <button className="w-full mt-3 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:shadow-md transition-shadow">
                  View Details
                </button>
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
