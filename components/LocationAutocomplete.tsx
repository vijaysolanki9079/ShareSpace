'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Loader, X, CheckCircle2 } from 'lucide-react';
import { trpc } from '@/lib/trpc'; // Updated path for the project

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

  const handleSelectLocation = (location: LocationResult) => {
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
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl border border-gray-100 shadow-xl z-[9999] overflow-hidden p-2"
          >
            <div className="max-h-[220px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300/50 scrollbar-track-transparent pr-1">
              {suggestions.map((location: LocationResult, index: number) => {
                const isSelected = selectedLocation?.lat === location.lat && selectedLocation?.lon === location.lon;
                return (
                  <motion.button
                    key={`${location.lat}-${location.lon}`}
                    onClick={() => handleSelectLocation(location)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`
                      w-full relative px-4 py-3 text-left transition-colors duration-200 flex items-center gap-3 font-sans rounded-xl mb-1 last:mb-0
                      ${highlightedIndex === index ? 'bg-gray-100/80 cursor-pointer' : 'hover:bg-gray-50 cursor-pointer'}
                      ${isSelected ? 'bg-emerald-50/80 text-emerald-900 font-medium' : 'text-gray-800'}
                    `}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg shadow-sm border border-emerald-100/50 transition-colors ${highlightedIndex === index ? 'bg-white' : 'bg-emerald-50/50'}`}>
                      {getTypeIcon(location.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-center justify-between gap-3">
                        <p className={`text-base truncate transition-colors ${isSelected ? 'font-bold text-emerald-800' : 'font-medium text-gray-800'}`}>
                          {location.displayName}
                        </p>
                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 ml-auto" strokeWidth={2.5} />
                        )}
                      </div>
                      <p className={`text-[13px] mt-0.5 transition-colors uppercase tracking-wide font-semibold ${isSelected ? 'text-emerald-600/80' : 'text-gray-400'}`}>
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
