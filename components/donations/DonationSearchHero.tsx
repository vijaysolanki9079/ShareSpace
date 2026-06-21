'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, MapPin, Search, Navigation } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { showIndiaOnlyToast } from '@/lib/toast-utils';
import ItemAutocomplete from '@/components/ItemAutocomplete';
import LocationAutocomplete, {
  LocationResult,
} from '@/components/LocationAutocomplete';

type SearchQuery = {
  item: string;
  location: LocationResult | null;
};

type DonationSearchHeroProps = {
  onSearch: (query: SearchQuery) => void;
  isSearching: boolean;
};

export default function DonationSearchHero({
  onSearch,
  isSearching,
}: DonationSearchHeroProps) {
  const [itemQuery, setItemQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [locationResult, setLocationResult] = useState<LocationResult | null>(
    null
  );
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
            { headers: { 'User-Agent': 'ShareSpace-Donation-Platform' } }
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
            const locationResultData: LocationResult = {
              name: locationName,
              displayName: locationName,
              lat: latitude,
              lon: longitude,
              type: 'city',
              countryCode: countryCode
            };
            setLocationResult(locationResultData);
            setLocationQuery(locationName);
            toast.success('Location found successfully!');
            // Trigger search automatically
            onSearch({ item: itemQuery, location: locationResultData });
          }
        } catch (error) {
          console.error('Reverse geocoding failed:', error);
          const locationResultData: LocationResult = { name: 'Current Location', displayName: 'Current Location', lat: latitude, lon: longitude, type: 'city' };
          setLocationResult(locationResultData);
          setLocationQuery('Current Location');
          toast.success('Location found successfully (Name unknown)');
          // Trigger search automatically
          onSearch({ item: itemQuery, location: locationResultData });
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ item: itemQuery, location: locationResult });
  };

  return (
    <div className="relative bg-emerald-900 text-white pt-20 pb-16 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?q=80&w=2070&auto=format&fit=crop')",
        }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-900 via-emerald-900/80 to-transparent"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center md:text-left"
          >
            <h1 className="text-4xl md:text-5xl lg:text-[3.4rem] font-extrabold tracking-tight mb-3 leading-tight">
              Give Items, <br />
              <span className="text-emerald-400">Change Lives</span>
            </h1>
            <p className="text-base md:text-lg text-emerald-100/80 max-w-xl">
              Find the perfect NGO to receive your donations. From clothes to
              electronics, your items can make a real difference.
            </p>
          </motion.div>

          {/* Right: Search Form */}
          <motion.form
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 1, 0.5, 1] }}
            onSubmit={handleSearch}
            className="w-full max-w-md mx-auto md:ml-auto md:mr-0"
          >
            <div className="rounded-3xl border border-white/15 bg-white/[0.13] p-4 shadow-2xl shadow-emerald-950/30 backdrop-blur-xl sm:p-5">
              <div className="grid grid-cols-2 gap-1 rounded-2xl bg-emerald-950/35 p-1">
                <div className="flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-3 text-sm font-bold text-emerald-950 shadow-sm">
                  <Package size={16} />
                  Donation Items
                </div>
                <div className="flex h-10 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold text-emerald-50/75">
                  NGOs
                </div>
              </div>
              <div className="mt-3 space-y-2.5">
                <ItemAutocomplete
                  value={itemQuery}
                  onChange={setItemQuery}
                  placeholder="Search donation items"
                  inputClassName="h-11 w-full rounded-2xl border border-white/60 bg-white/95 pl-12 pr-4 text-sm font-medium text-slate-950 placeholder-slate-500 shadow-sm outline-none transition-all focus:border-emerald-300 focus:ring-2 focus:ring-emerald-300"
                />
              <div className="relative">
                <MapPin
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600"
                  size={18}
                />
                <LocationAutocomplete
                  value={locationQuery}
                  onChange={setLocationQuery}
                  onLocationSelect={setLocationResult}
                  inputClassName="h-11 w-full rounded-2xl border border-white/60 bg-white/95 pl-12 pr-4 text-sm font-medium text-slate-950 placeholder-slate-500 shadow-sm outline-none transition-all focus:border-emerald-300 focus:ring-2 focus:ring-emerald-300"
                />
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
              <button
                type="submit"
                disabled={isSearching || isLocating}
                className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 text-sm font-extrabold text-emerald-950 shadow-lg shadow-emerald-950/20 transition-all hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-emerald-700 disabled:text-white/70"
              >
                <Search size={17} />
                <span>{isSearching ? 'Searching...' : 'Find NGOs'}</span>
              </button>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isLocating || isSearching}
                className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-5 text-sm font-bold text-white shadow-sm transition-all hover:bg-white/18 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Navigation size={17} className={isLocating ? 'animate-pulse' : ''} />
                <span>{isLocating ? 'Locating...' : 'Near Me'}</span>
              </button>
              </div>
              </div>
            </div>
          </motion.form>
        </div>
      </div>
    </div>
  );
}
