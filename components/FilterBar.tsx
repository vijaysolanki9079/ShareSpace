'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Search, Sliders, X } from 'lucide-react';

interface FilterBarProps {
  categories: Array<{ id: string; name: string }>;
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  radiusKm: number;
  onRadiusChange: (radius: number) => void;
  postedBy: 'all' | 'user' | 'ngo';
  onPostedByChange: (postedBy: 'all' | 'user' | 'ngo') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function FilterBar({
  categories,
  selectedCategory,
  onCategoryChange,
  radiusKm,
  onRadiusChange,
  postedBy,
  onPostedByChange,
  searchQuery,
  onSearchChange,
}: FilterBarProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 p-6 bg-white rounded-lg shadow-md border border-gray-200 sticky top-4 z-30"
    >
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search for items..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Desktop Filters */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Distance Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Distance
          </label>
          <select
            value={radiusKm}
            onChange={(e) => onRadiusChange(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value={1}>1 km</option>
            <option value={5}>5 km</option>
            <option value={10}>10 km</option>
            <option value={15}>15 km</option>
            <option value={25}>25 km</option>
          </select>
        </div>

        {/* Posted By Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Posted By
          </label>
          <select
            value={postedBy}
            onChange={(e) =>
              onPostedByChange(e.target.value as 'all' | 'user' | 'ngo')
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="all">All Users</option>
            <option value="user">Individual Users</option>
            <option value="ngo">NGOs</option>
          </select>
        </div>
      </div>

      {/* Mobile Filter Toggle */}
      <div className="md:hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 font-medium text-sm hover:bg-blue-100 transition-colors"
        >
          <Sliders size={18} />
          {isExpanded ? 'Hide Filters' : 'Show Filters'}
        </button>

        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-4 pt-4 border-t"
          >
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Distance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Distance
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="25"
                  value={radiusKm}
                  onChange={(e) => onRadiusChange(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-medium text-gray-700 min-w-fit">
                  {radiusKm} km
                </span>
              </div>
            </div>

            {/* Posted By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Posted By
              </label>
              <select
                value={postedBy}
                onChange={(e) =>
                  onPostedByChange(e.target.value as 'all' | 'user' | 'ngo')
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All Users</option>
                <option value="user">Individual Users</option>
                <option value="ngo">NGOs</option>
              </select>
            </div>
          </motion.div>
        )}
      </div>

      {/* Active Filters Display */}
      {(selectedCategory || postedBy !== 'all') && (
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          {selectedCategory && (
            <button
              onClick={() => onCategoryChange('')}
              className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full hover:bg-blue-200 transition-colors"
            >
              Category filter
              <X size={16} />
            </button>
          )}
          {postedBy !== 'all' && (
            <button
              onClick={() => onPostedByChange('all')}
              className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full hover:bg-blue-200 transition-colors"
            >
              Posted by: {postedBy}
              <X size={16} />
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
