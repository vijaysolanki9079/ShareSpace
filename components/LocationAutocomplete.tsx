'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Loader, X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { trpc } from '@/lib/trpc'; 
import { toast } from 'react-hot-toast';
import { showIndiaOnlyToast } from '@/lib/toast-utils';

export interface LocationResult {
  name: string;
  displayName: string;
  lat: number;
  lon: number;
  type: 'city' | 'area' | 'street' | 'other';
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onLocationSelect: (location: LocationResult) => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inputClassName?: string;
}

export default function LocationAutocomplete({
  value,
  onChange,
  onLocationSelect,
  placeholder = 'Search area (e.g., Delhi, Mumbai)',
  onFocus,
  onBlur,
  onKeyDown,
  inputClassName,
}: LocationAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null);
  const [showIndiaAlert, setShowIndiaAlert] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: routeResponse, isLoading: isSuggestionsLoading } = trpc.search.getLocationSuggestions.useQuery(
    { query: value },
    {
      enabled: value.length >= 2,
      staleTime: 1000 * 60 * 5,
    }
  );

  const suggestions = routeResponse?.suggestions || [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setHighlightedIndex(-1);

    if (newValue !== selectedLocation?.name) {
      setSelectedLocation(null);
    }

    if (newValue.length >= 2) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleSelectLocation = (location: any) => {
    // Check if location is in India
    if (location.countryCode && location.countryCode.toLowerCase() !== 'in') {
      setShowIndiaAlert(true);
      // Auto-hide after 5 seconds
      setTimeout(() => setShowIndiaAlert(false), 5000);
      return;
    }

    setSelectedLocation(location);
    onChange(location.displayName);
    onLocationSelect(location);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (onKeyDown) {
      onKeyDown(e);
    }

    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          handleSelectLocation(suggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = { city: '🏙️', area: '📍', street: '🛣️', other: '📌' };
    return icons[type] || '📌';
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = { city: 'City', area: 'Area', street: 'Street', other: 'Location' };
    return labels[type] || 'Location';
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <AnimatePresence>
        {showIndiaAlert && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full left-0 right-0 mb-4 z-[10001]"
          >
            <div className="bg-white border-2 border-emerald-500 shadow-[0_20px_50px_rgba(6,78,59,0.2)] rounded-2xl p-4 relative">
              {/* Arrow pointing down */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r-2 border-b-2 border-emerald-500 rotate-45" />
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 text-xl">🇮🇳</div>
                <div className="flex-1">
                  <p className="text-emerald-900 font-bold text-sm leading-tight">
                    📍 ShareSpace currently only operates within India.
                  </p>
                  <p className="text-emerald-600/60 text-[10px] mt-1 font-medium italic">
                    Focusing on local impact for now.
                  </p>
                </div>
                <button 
                  onClick={() => setShowIndiaAlert(false)}
                  className="flex-shrink-0 text-gray-300 hover:text-gray-500 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="relative">
        <div className="relative flex items-center h-12 md:h-auto z-[60]">
          <MapPin className="absolute left-4 text-gray-400 w-5 h-5 flex-shrink-0 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              onFocus?.();
              if (value.length >= 2) setIsOpen(true);
            }}
            onBlur={() => {
              onBlur?.();
              setTimeout(() => setIsOpen(false), 200);
            }}
            className={inputClassName || "w-full pl-12 pr-10 py-3 text-gray-900 placeholder-gray-400 outline-none text-base bg-white rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans"}
          />
          <AnimatePresence>
            {value && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => {
                  onChange('');
                  setSelectedLocation(null);
                  setIsOpen(false);
                  inputRef.current?.focus();
                }}
                className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors z-[70]"
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
          {isSuggestionsLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute right-3 text-emerald-600 z-[70]"
            >
              <Loader className="w-4 h-4 animate-spin" />
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-emerald-100 shadow-2xl z-[100] overflow-hidden p-1.5"
          >
            <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-200 scrollbar-track-transparent pr-1">
              {suggestions.map((location: LocationResult, index: number) => {
                const isSelected = selectedLocation?.lat === location.lat && selectedLocation?.lon === location.lon;
                const isHighlighted = highlightedIndex === index;
                return (
                  <motion.button
                    key={`${location.lat}-${location.lon}`}
                    onClick={() => handleSelectLocation(location)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`
                      w-full relative px-4 py-3.5 text-left transition-all duration-200 flex items-center gap-4 font-sans rounded-xl mb-1 last:mb-0
                      ${isHighlighted ? 'bg-emerald-50/80 border-emerald-100 shadow-sm' : 'bg-transparent border-transparent'}
                      border
                      ${isSelected ? 'bg-emerald-600 text-white shadow-emerald-200' : ''}
                    `}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg shadow-sm border transition-colors ${isSelected ? 'bg-white/20 border-white/30' : (isHighlighted ? 'bg-white border-emerald-100' : 'bg-emerald-50/50 border-emerald-100/50')}`}>
                      {getTypeIcon(location.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-center justify-between gap-3">
                        <p className={`text-sm truncate transition-colors ${isSelected ? 'font-bold text-white' : (isHighlighted ? 'font-bold text-emerald-900' : 'font-semibold text-gray-800')}`}>
                          {location.displayName}
                        </p>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-white flex-shrink-0 ml-auto" strokeWidth={3} />
                        )}
                      </div>
                      <p className={`text-[11px] mt-0.5 transition-colors uppercase tracking-widest font-bold ${isSelected ? 'text-emerald-50/80' : (isHighlighted ? 'text-emerald-600' : 'text-gray-400')}`}>
                        {getTypeLabel(location.type)}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && value.length >= 2 && !isSuggestionsLoading && suggestions.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl border border-gray-100 shadow-xl z-[9999] px-4 py-8 text-center font-sans"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-500/30 shadow-md">
              <MapPin className="w-6 h-6 text-emerald-600/50" />
            </div>
            <p className="text-slate-700 font-semibold mb-1">No locations found for &quot;{value}&quot;</p>
            <p className="text-slate-500 text-sm">Please try a different area or city name</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
