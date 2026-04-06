'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, CheckCircle2, Zap } from 'lucide-react';
import { MOCK_NGOS } from '@/lib/mock-data';

interface NGONameAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onNGOSelect?: (ngoId: string, ngoName: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export default function NGONameAutocomplete({
  value,
  onChange,
  onNGOSelect,
  placeholder = 'Search by NGO name...',
  onFocus,
  onBlur,
  onKeyDown,
}: NGONameAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selectedNGO, setSelectedNGO] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(() => {
    if (!value || value.length < 1) return [];
    const lowercaseQuery = value.toLowerCase();
    return MOCK_NGOS.filter(
      (ngo) =>
        ngo.name.toLowerCase().includes(lowercaseQuery) ||
        ngo.description.toLowerCase().includes(lowercaseQuery)
    ).slice(0, 8);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setHighlightedIndex(-1);

    if (newValue.length >= 1) setIsOpen(true);
    else setIsOpen(false);
  };

  const handleSelectNGO = (ngoId: string, ngoName: string) => {
    setSelectedNGO(ngoId);
    onChange(ngoName);
    onNGOSelect?.(ngoId, ngoName);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (onKeyDown) onKeyDown(e);

    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'Enter') e.preventDefault();
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          const ngo = suggestions[highlightedIndex];
          handleSelectNGO(ngo.id, ngo.name);
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

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Food: 'bg-orange-50 text-orange-700',
      Education: 'bg-blue-50 text-blue-700',
      Health: 'bg-red-50 text-red-700',
      Environment: 'bg-green-50 text-green-700',
      Poverty: 'bg-purple-50 text-purple-700',
      Other: 'bg-gray-50 text-gray-700',
    };
    return colors[category] || 'bg-gray-50 text-gray-700';
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <div className="relative flex items-center h-12 md:h-auto z-[60]">
          <Search className="absolute left-4 text-gray-400 w-5 h-5 flex-shrink-0 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              onFocus?.();
              if (value.length >= 1) setIsOpen(true);
            }}
            onBlur={() => {
              onBlur?.();
              setTimeout(() => setIsOpen(false), 200);
            }}
            className="w-full pl-12 pr-10 py-3 text-gray-900 placeholder-gray-400 outline-none text-base bg-white rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans"
          />
          <AnimatePresence>
            {value && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => {
                  onChange('');
                  setSelectedNGO(null);
                  setIsOpen(false);
                  inputRef.current?.focus();
                }}
                className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors z-[70]"
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
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
              {suggestions.map((ngo, index) => {
                const isSelected = selectedNGO === ngo.id;
                return (
                  <motion.button
                    key={ngo.id}
                    onClick={() => handleSelectNGO(ngo.id, ngo.name)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`
                      w-full relative px-4 py-3 text-left transition-colors duration-200 flex items-center gap-3 font-sans rounded-xl mb-1 last:mb-0
                      ${highlightedIndex === index ? 'bg-gray-100/80 cursor-pointer' : 'hover:bg-gray-50 cursor-pointer'}
                      ${isSelected ? 'bg-emerald-50/80 text-emerald-900 font-medium' : 'text-gray-800'}
                    `}
                  >
                    <div className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-widest flex-shrink-0 border uppercase shadow-sm ${getCategoryColor(ngo.category)}`}>
                      {ngo.category.slice(0, 3)}
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-center pl-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className={`text-base truncate transition-colors ${isSelected ? 'font-bold text-emerald-800' : 'font-semibold text-gray-800'}`}>
                          {ngo.name}
                        </p>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 ml-auto" strokeWidth={2.5} />}
                      </div>
                      <p className={`text-sm mt-0.5 line-clamp-1 transition-colors leading-relaxed ${isSelected ? 'text-emerald-700/80 font-medium' : 'text-gray-500'}`}>
                        {ngo.description}
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
        {isOpen && value.length >= 1 && suggestions.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl border border-gray-100 shadow-xl z-[9999] px-4 py-8 text-center font-sans"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Zap className="w-6 h-6 text-emerald-600/50" />
            </div>
            <p className="text-gray-700 font-medium mb-1">No NGOs found</p>
            <p className="text-gray-500 text-sm">Try searching for a different organization</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
