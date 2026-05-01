'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Users, Navigation, Search } from 'lucide-react';
import LocationAutocomplete, { LocationResult } from './LocationAutocomplete';
import NGONameAutocomplete, { type NGOSuggestion } from './NGONameAutocomplete';
import { toast } from 'react-hot-toast';
import { showIndiaOnlyToast } from '@/lib/toast-utils';

interface SearchHeroProps {
  onSearch: (query: { ngoName: string; location: LocationResult | null }) => void;
  isSearching?: boolean;
  /** Live autocomplete suggestions from the parent tRPC query */
  autocompleteSuggestions?: NGOSuggestion[];
  /** Called on every keystroke so parent can debounce-fetch suggestions */
  onNgoNameChange?: (value: string) => void;
}

export default function SearchHero({
  onSearch,
  isSearching = false,
  autocompleteSuggestions = [],
  onNgoNameChange,
}: SearchHeroProps) {
  const [ngoSearchQuery, setNgoSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
            { headers: { 'User-Agent': 'ShareNest-Donation-Platform' } }
          );
          if (response.ok) {
            const data = await response.json();
            const countryCode = data.address?.country_code;

            if (countryCode && countryCode.toLowerCase() !== 'in') {
              showIndiaOnlyToast();
              setIsLocating(false);
              return;
            }

            const locationName = data.address?.city || data.address?.town || data.address?.village || 'Current Location';
            const locationResult: any = { 
              name: locationName, 
              displayName: locationName, 
              lat: latitude, 
              lon: longitude, 
              type: 'city',
              countryCode: countryCode
            };
            setSelectedLocation(locationResult);
            setLocationQuery(locationName);
            toast.success('Location found successfully!');

            // Trigger search automatically
            onSearch({
              ngoName: ngoSearchQuery,
              location: locationResult
            });
          }
        } catch (error) {
          console.error('Reverse geocoding failed:', error);
          toast.error('Unable to get location name. Please try again.');
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        toast.error('Unable to retrieve your location. Please check browser permissions.');
        setIsLocating(false);
      }
    );
  };

  const handleSearch = () => {
    onSearch({ ngoName: ngoSearchQuery, location: selectedLocation });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <section className="relative bg-emerald-900 px-6 pb-40 md:pb-48 pt-24 text-white overflow-hidden z-10">
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-600/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Content & NGO Link */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight leading-tight">Find Organizations <span className="text-emerald-300">Near You</span></h1>
            <p className="text-emerald-100/80 mb-10 text-lg md:text-xl max-w-lg">Connect with verified NGOs and support causes that matter to you. Search or share your location to discover local giving opportunities.</p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="flex items-center gap-4 relative z-10">
              <span className="text-sm font-medium text-emerald-200/60 uppercase tracking-widest hidden sm:inline">Are you an NGO?</span>
              <Link href="/register-ngo" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full border border-white/30 transition-all font-semibold backdrop-blur-sm group shadow-lg">
                <Users size={18} className="text-emerald-300 group-hover:scale-110 transition-transform" />
                Register as NGO
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Column: Search Interface */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="relative z-50">
            <div className="bg-white p-4 md:p-6 rounded-[2rem] shadow-2xl flex flex-col gap-4 max-w-xl mx-auto lg:ml-auto w-full border border-emerald-500/10">
              
              <div className="w-full">
                <NGONameAutocomplete
                  value={ngoSearchQuery}
                  onChange={v => {
                    setNgoSearchQuery(v);
                    onNgoNameChange?.(v);
                  }}
                  suggestions={autocompleteSuggestions}
                  onNGOSelect={(id, name) => {
                    setNgoSearchQuery(name);
                    onSearch({ ngoName: name, location: selectedLocation });
                  }}
                  placeholder="Search by NGO name..."
                  onKeyDown={handleKeyDown}
                />
              </div>

              <div className="w-full">
                <LocationAutocomplete 
                  value={locationQuery} 
                  onChange={setLocationQuery} 
                  onLocationSelect={(loc) => {
                    setSelectedLocation(loc);
                    onSearch({ ngoName: ngoSearchQuery, location: loc });
                  }}
                  placeholder="Search area..." 
                  onKeyDown={handleKeyDown} 
                />
              </div>

              <div className="flex items-center gap-3 mt-2">
                <button onClick={handleGetLocation} disabled={isLocating || isSearching} className="flex-1 flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-60 disabled:hover:bg-emerald-50 font-medium py-3 px-4 rounded-xl transition-all whitespace-nowrap border border-emerald-100/50 hover:shadow-md">
                  <Navigation className={`w-4 h-4 ${isLocating ? 'animate-pulse' : ''}`} />
                  <span>{isLocating ? 'Locating...' : 'Near Me'}</span>
                </button>

                <button onClick={handleSearch} disabled={isLocating || isSearching} title="Search" className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60 text-white font-medium py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-emerald-500/30 hover:-translate-y-0.5 active:translate-y-0 text-base">
                  <Search className={`w-4 h-4 ${isSearching ? 'animate-pulse' : ''}`} strokeWidth={2.5} />
                  <span>Search</span>
                </button>
              </div>

            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
