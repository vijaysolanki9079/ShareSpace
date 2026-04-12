"use client";

import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight, ShieldCheck, Filter } from 'lucide-react';
import Link from 'next/link';
import DonationSearchHero from './DonationSearchHero';
import { LocationResult } from '@/components/LocationAutocomplete';

// Dummy data for donations
const dummyDonations = [
  { id: 1, name: 'Amit Singh', amount: 500, cause: 'Education for Underprivileged Children', date: '2026-04-08', ngo: 'Bright Future Foundation' },
  { id: 2, name: 'Priya Sharma', amount: 1200, cause: 'Mid-day Meal Program', date: '2026-04-08', ngo: 'Annapurna Trust' },
  { id: 3, name: 'Rajesh Kumar', amount: 750, cause: 'Clean Water Project', date: '2026-04-07', ngo: 'Jal Seva Initiative' },
  { id: 4, name: 'Sunita Devi', amount: 300, cause: 'Women Empowerment Workshop', date: '2026-04-07', ngo: 'Nari Shakti' },
  { id: 5, name: 'Vikram Rathod', amount: 2500, cause: 'Disaster Relief Fund', date: '2026-04-06', ngo: 'Aapda Sahayak' },
  { id: 6, name: 'Anjali Mehta', amount: 100, cause: 'Animal Shelter Support', date: '2026-04-06', ngo: 'Paws & Claws' },
  { id: 7, name: 'Sanjay Verma', amount: 1500, cause: 'Healthcare for the Elderly', date: '2026-04-05', ngo: 'SeniorCare Trust' },
  { id: 8, name: 'Meena Kumari', amount: 800, cause: 'Tree Plantation Drive', date: '2026-04-05', ngo: 'Green Earth Foundation' },
  { id: 9, name: 'Rohan Gupta', amount: 5000, cause: 'Building a Community Hall', date: '2026-04-04', ngo: 'Gram Vikas Sanstha' },
  { id: 10, name: 'Kavita Joshi', amount: 200, cause: 'Skill Development for Youth', date: '2026-04-04', ngo: 'Yuva Pragati' },
];

export default function DonationsClient() {
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('date-desc');
  const [isSearching, setIsSearching] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleSearch = async (query: { item: string; location: LocationResult | null; }) => {
    setIsSearching(true);
    setFilter(query.item); // Use the item from the hero as our main filter
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsSearching(false);
    
    // Auto-scroll down to results only if user actually entered search criteria
    if (query.item.trim() || query.location) {
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }, 100);
    }
  };

  const filteredAndSortedDonations = useMemo(() => {
    let result = [...dummyDonations];

    if (filter) {
      result = result.filter(d =>
        d.name.toLowerCase().includes(filter.toLowerCase()) ||
        d.cause.toLowerCase().includes(filter.toLowerCase()) ||
        d.ngo.toLowerCase().includes(filter.toLowerCase())
      );
    }

    const [key, order] = sort.split('-');
    result.sort((a, b) => {
      if (key === 'amount') {
        return order === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
      if (key === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return order === 'asc' ? dateA - dateB : dateB - dateA;
      }
      return 0;
    });

    return result;
  }, [filter, sort]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <DonationSearchHero onSearch={handleSearch} isSearching={isSearching} />

      <div ref={resultsRef} className="container mx-auto px-6 py-12 -mt-10 relative z-20 scroll-mt-24">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5, delay: 0.3 }}
           className="bg-white rounded-2xl shadow-xl p-4 md:p-6 mb-12 border border-emerald-100 flex flex-col sm:flex-row gap-4 justify-between items-center"
        >
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, cause, NGO..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Filter className="text-gray-400 shrink-0" size={20} />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full sm:w-auto px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-sm font-medium text-gray-700 cursor-pointer appearance-none"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Amount (High to Low)</option>
              <option value="amount-asc">Amount (Low to High)</option>
            </select>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <AnimatePresence>
            {filteredAndSortedDonations.map((donation, idx) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                key={donation.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col group"
              >
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xl shadow-sm border border-emerald-200">
                        {donation.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">{donation.name}</h3>
                        <p className="text-xs text-gray-500 font-medium">{new Date(donation.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100 flexitems-center gap-1 font-bold shadow-sm">
                      ₹{donation.amount.toLocaleString('en-IN')}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">Supported Cause</p>
                    <p className="text-gray-800 font-medium leading-snug">{donation.cause}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                    <ShieldCheck className="text-emerald-600 shrink-0" size={16} />
                    <p className="text-sm text-gray-600 truncate">
                      Via <span className="font-semibold text-gray-900">{donation.ngo}</span>
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 group-hover:bg-emerald-50 transition-colors mt-auto">
                   <Link href="/explore" className="flex items-center justify-between text-sm font-semibold text-emerald-600 group-hover:text-emerald-800">
                    <span>Support similar causes</span>
                    <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredAndSortedDonations.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-gray-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No donations found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              We couldn&apos;t find any donations matching your search criteria. Try adjusting your filters.
            </p>
            <button
               onClick={() => { setFilter(''); setSort('date-desc'); }}
               className="mt-6 text-emerald-600 font-semibold hover:text-emerald-700 underline underline-offset-4"
            >
              Clear all filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
