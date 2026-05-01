'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Search, Sliders, X, MapPin, Filter } from 'lucide-react';

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-2 md:p-3 sticky top-6 z-30 backdrop-blur-xl bg-white/90"
    >
      <div className="flex flex-col md:flex-row gap-2 items-stretch">
        {/* Main Search Input */}
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search for items you can donate..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-gray-400"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${
              isExpanded 
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
              : 'bg-white border border-gray-100 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter size={18} />
            Filters
            {isExpanded ? (
               <X size={16} className="ml-1" />
            ) : (
               <span className="ml-1 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px]">
                 { (selectedCategory ? 1 : 0) + (radiusKm !== 5 ? 1 : 0) + (postedBy !== 'all' ? 1 : 0) }
               </span>
            )}
          </button>
        </div>
      </div>

      {/* Expanded Filters Panel */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 p-4 md:p-6 bg-gray-50 rounded-2xl border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Category */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Category
            </label>
            <div className="flex flex-wrap gap-2">
               <button
                 onClick={() => onCategoryChange('')}
                 className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${!selectedCategory ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
               >
                 All
               </button>
               {categories.slice(0, 5).map(cat => (
                 <button
                   key={cat.id}
                   onClick={() => onCategoryChange(cat.id)}
                   className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedCategory === cat.id ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                 >
                   {cat.name}
                 </button>
               ))}
               {categories.length > 5 && (
                 <select 
                   className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-gray-600 border border-gray-200 outline-none"
                   onChange={(e) => onCategoryChange(e.target.value)}
                   value={selectedCategory}
                 >
                   <option value="">More...</option>
                   {categories.slice(5).map(cat => (
                     <option key={cat.id} value={cat.id}>{cat.name}</option>
                   ))}
                 </select>
               )}
            </div>
          </div>

          {/* Distance */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Search Radius
            </label>
            <div className="space-y-4">
              <input
                type="range"
                min="1"
                max="50"
                value={radiusKm}
                onChange={(e) => onRadiusChange(parseInt(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                <span className="flex items-center gap-1"><MapPin size={12} /> 1km</span>
                <span className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{radiusKm} km</span>
                <span>50km</span>
              </div>
            </div>
          </div>

          {/* Source */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              Posted By
            </label>
            <div className="flex gap-2 p-1 bg-white border border-gray-200 rounded-2xl">
               {(['all', 'user', 'ngo'] as const).map((type) => (
                 <button
                   key={type}
                   onClick={() => onPostedByChange(type)}
                   className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                     postedBy === type 
                     ? 'bg-gray-900 text-white shadow-lg' 
                     : 'text-gray-500 hover:bg-gray-50'
                   }`}
                 >
                   {type}
                 </button>
               ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Active Chips Display */}
      { (selectedCategory || radiusKm !== 5 || postedBy !== 'all' || searchQuery) && (
        <div className="flex flex-wrap gap-2 px-4 py-2 items-center">
           <span className="text-[10px] font-black uppercase text-gray-400 tracking-tighter mr-2">Applied:</span>
           {searchQuery && (
             <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100">
               "{searchQuery}"
               <X size={12} className="cursor-pointer" onClick={() => onSearchChange('')} />
             </div>
           )}
           {selectedCategory && (
             <div className="flex items-center gap-2 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
               {categories.find(c => c.id === selectedCategory)?.name || 'Filtered'}
               <X size={12} className="cursor-pointer" onClick={() => onCategoryChange('')} />
             </div>
           )}
           {radiusKm !== 5 && (
             <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
               Within {radiusKm}km
               <X size={12} className="cursor-pointer" onClick={() => onRadiusChange(5)} />
             </div>
           )}
           {postedBy !== 'all' && (
             <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-bold border border-purple-100 capitalize">
               {postedBy}s only
               <X size={12} className="cursor-pointer" onClick={() => onPostedByChange('all')} />
             </div>
           )}
           <button 
             onClick={() => {
               onSearchChange('');
               onCategoryChange('');
               onRadiusChange(5);
               onPostedByChange('all');
             }}
             className="text-[10px] font-bold text-red-500 hover:underline ml-auto"
           >
             Clear All
           </button>
        </div>
      )}
    </motion.div>
  );
}
