'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, X, CheckCircle2 } from 'lucide-react';

const ITEM_SUGGESTIONS = [
  { name: 'Clothes', icon: '👕', category: 'Wearables' },
  { name: 'Electronics', icon: '💻', category: 'Devices' },
  { name: 'Furniture', icon: '🪑', category: 'Home' },
  { name: 'Table', icon: '🍽️', category: 'Furniture' },
  { name: 'Chair', icon: '🪑', category: 'Furniture' },
  { name: 'Sofa', icon: '🛋️', category: 'Furniture' },
  { name: 'Books', icon: '📚', category: 'Education' },
  { name: 'Toys', icon: '🧸', category: 'Kids' },
  { name: 'Food', icon: '🥫', category: 'Essentials' },
  { name: 'Medicine', icon: '💊', category: 'Health' },
  { name: 'Stationery', icon: '✏️', category: 'Education' },
  { name: 'Blankets', icon: '🛏️', category: 'Essentials' },
  { name: 'Utensils', icon: '🍽️', category: 'Home' },
  { name: 'Shoes', icon: '👞', category: 'Wearables' },
];

interface ItemAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inputClassName?: string;
}

export default function ItemAutocomplete({
  value,
  onChange,
  placeholder = 'What are you donating? (e.g., clothes)',
  onFocus,
  onBlur,
  onKeyDown,
  inputClassName,
}: ItemAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [filteredSuggestions, setFilteredSuggestions] = useState(ITEM_SUGGESTIONS);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value.trim() === '') {
      setFilteredSuggestions(ITEM_SUGGESTIONS);
    } else {
      const lowerValue = value.toLowerCase();
      setFilteredSuggestions(
        ITEM_SUGGESTIONS.filter((item) =>
          item.name.toLowerCase().includes(lowerValue) || item.category.toLowerCase().includes(lowerValue)
        )
      );
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setHighlightedIndex(-1);
    setIsOpen(true);
  };

  const handleSelectItem = (itemName: string) => {
    onChange(itemName);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (onKeyDown) {
      onKeyDown(e);
    }

    if (!isOpen || filteredSuggestions.length === 0) {
      if (e.key === 'Enter') {
        // Let the parent handle form submission
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredSuggestions[highlightedIndex]) {
          handleSelectItem(filteredSuggestions[highlightedIndex].name);
        } else {
          // If no suggestion is highlighted, we can just close and let parent handle
          setIsOpen(false);
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

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <div className="relative flex items-center h-12 md:h-auto z-[60]">
          <Package className="absolute left-4 text-emerald-300 w-5 h-5 flex-shrink-0 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              onFocus?.();
              setIsOpen(true);
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
                type="button"
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                  inputRef.current?.focus();
                }}
                className="absolute right-3 text-emerald-100/80 hover:text-white transition-colors z-[70]"
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && filteredSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl border border-gray-100 shadow-xl z-[9999] overflow-hidden p-2"
          >
            <div className="max-h-[220px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300/50 scrollbar-track-transparent pr-1">
              {filteredSuggestions.map((item, index: number) => {
                const isSelected = value.toLowerCase() === item.name.toLowerCase();
                return (
                  <motion.button
                    key={item.name}
                    type="button"
                    onClick={() => handleSelectItem(item.name)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`
                      w-full relative px-4 py-3 text-left transition-colors duration-200 flex items-center gap-3 font-sans rounded-xl mb-1 last:mb-0
                      ${highlightedIndex === index ? 'bg-gray-100/80 cursor-pointer' : 'hover:bg-gray-50 cursor-pointer'}
                      ${isSelected ? 'bg-emerald-50/80 text-emerald-900 font-medium' : 'text-gray-800'}
                    `}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg shadow-sm border border-emerald-100/50 transition-colors ${highlightedIndex === index ? 'bg-white' : 'bg-emerald-50/50'}`}>
                      {item.icon}
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-center justify-between gap-3">
                         <p className={`text-base truncate transition-colors ${isSelected ? 'font-bold text-emerald-800' : 'font-medium text-gray-800'}`}>
                          {item.name}
                        </p>
                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 ml-auto" strokeWidth={2.5} />
                        )}
                      </div>
                      <p className={`text-[13px] mt-0.5 transition-colors uppercase tracking-wide font-semibold ${isSelected ? 'text-emerald-600/80' : 'text-gray-400'}`}>
                        {item.category}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
