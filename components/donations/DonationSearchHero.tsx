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
            const locationResultData: any = { 
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
    <div className="relative bg-emerald-900 text-white pt-32 pb-24 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?q=80&w=2070&auto=format&fit=crop')",
        }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-900 via-emerald-900/80 to-transparent"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center md:text-left"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 leading-tight">
              Give Items, <br />
              <span className="text-emerald-400">Change Lives</span>
            </h1>
            <p className="text-lg md:text-xl text-emerald-100/80 max-w-xl">
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
            className="w-full max-w-md mx-auto md:mx-0"
          >
            <div className="bg-white/10 border border-white/20 backdrop-blur-lg p-6 rounded-2xl shadow-2xl space-y-4">
                <ItemAutocomplete
                  value={itemQuery}
                  onChange={setItemQuery}
                  placeholder="What are you donating? (e.g., clothes)"
                  inputClassName="w-full bg-white/10 border border-white/20 text-white placeholder-emerald-100/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded-lg pl-12 pr-4 py-3 transition-all"
                />
              <div className="relative">
                <MapPin
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-300"
                  size={20}
                />
                <LocationAutocomplete
                  value={locationQuery}
                  onChange={setLocationQuery}
                  onLocationSelect={setLocationResult}
                  inputClassName="w-full bg-white/10 border border-white/20 text-white placeholder-emerald-100/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded-lg pl-12 pr-4 py-3 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching || isLocating}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-700 disabled:cursor-not-allowed text-white font-bold py-3.5 px-6 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-emerald-500/30 transform hover:scale-105"
              >
                <Search size={18} />
                <span>{isSearching ? 'Searching...' : 'Find NGOs'}</span>
              </button>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isLocating || isSearching}
                className="w-full bg-emerald-50 hover:bg-emerald-100 disabled:opacity-60 disabled:hover:bg-emerald-50 text-emerald-700 font-semibold py-3.5 px-6 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md border border-emerald-200/50"
              >
                <Navigation size={18} className={isLocating ? 'animate-pulse' : ''} />
                <span>{isLocating ? 'Locating...' : 'Near Me'}</span>
              </button>
            </div>
          </motion.form>
        </div>
      </div>
    </div>
  );
}
