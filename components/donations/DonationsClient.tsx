"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Building2, Package, ArrowRight, Navigation, Heart, Loader2, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/context/AuthContext';
import ItemAutocomplete from '@/components/ItemAutocomplete';
import LocationAutocomplete, { LocationResult } from '@/components/LocationAutocomplete';
import { showIndiaOnlyToast } from '@/lib/toast-utils';
import DonationModal, { DonationContactTarget } from './DonationModal';
import { formatShortDate, getRandomDate, getRandomInt } from '@/lib/random-display';

// --- Types matching the API response structure ---

interface DonorInfo {
  id: string;
  fullName: string;
  email: string;
  image: string | null;
}

interface NGOInfo {
  id: string;
  organizationName: string;
  image: string | null;
}

interface DonationFromApi {
  id: string;
  title: string;
  description: string | null;
  category: string;
  image: string | null;
  status: string;
  donorId: string;
  donor: DonorInfo;
  ngoId: string | null;
  ngo: NGOInfo | null;
  createdAt: string;
}

interface DonationsApiResponse {
  donations: DonationFromApi[];
  total: number;
  page: number;
  totalPages: number;
}

// --- Category Mapping ---

const CATEGORY_ICONS: Record<string, string> = {
  'Food': '🍲',
  'Clothes': '👕',
  'Education': '📚',
  'Health': '💊',
  'Electronics': '💻',
  'Furniture': '🪑',
  'Toys': '🧸',
  'Tools': '🔧',
  'Books': '📖',
  'Other': '📦',
};

const categoryOptions = [
  'All Categories',
  'Food',
  'Clothes',
  'Education',
  'Health',
  'Electronics',
  'Furniture',
  'Toys',
  'Tools',
  'Books',
  'Other',
];

const GRID_PAGE_SIZE = 16;
const DONATION_TYPES = ['Home pickup', 'Ready to collect', 'Gently used', 'Bulk donation', 'Single item', 'Urgent offer'];
const ITEM_CONDITIONS = ['Like new', 'Good condition', 'Working well', 'Clean and packed', 'Minor wear', 'Recently checked'];
const DONOR_NAMES = [
  'Aarav Mehta',
  'Nisha Kapoor',
  'Rohan Singh',
  'Priya Sharma',
  'Kabir Malhotra',
  'Ananya Rao',
  'Vikram Joshi',
  'Meera Iyer',
  'Arjun Gill',
  'Tanya Sethi',
];

// --- Component ---

export default function DonationsClient() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'items' | 'ngos'>('items');
  const [visibleDonationCount, setVisibleDonationCount] = useState(GRID_PAGE_SIZE);
  const [visibleNgoCount, setVisibleNgoCount] = useState(GRID_PAGE_SIZE);

  // Search state
  const [itemQuery, setItemQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [locationResult, setLocationResult] = useState<LocationResult | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('All Categories');

  // Items data
  const [donationItems, setDonationItems] = useState<DonationFromApi[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [selectedContact, setSelectedContact] = useState<DonationContactTarget | null>(null);

  // NGOs data via tRPC
  const ngoSearchQuery = trpc.ngo.search.useQuery(
    {
      lat: locationResult?.lat ?? null,
      lng: locationResult?.lon ?? null,
      category: categoryFilter === 'All Categories' ? 'All Causes' : categoryFilter,
      searchQuery: itemQuery,
    },
    { enabled: activeTab === 'ngos' && isAuthenticated }
  );

  const [isLocating, setIsLocating] = useState(false);

  const resultsRef = useRef<HTMLDivElement>(null);

  // --- Fetch Donations ---

  const fetchDonations = useCallback(async () => {
    setLoadingItems(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== 'All Categories') params.set('category', categoryFilter);
      params.set('status', 'pending');
      params.set('limit', '50');

      const res = await fetch(`/api/donations?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch donations');
      const result: DonationsApiResponse = await res.json();
      let items = result.donations || [];

      // Client-side search filter
      if (itemQuery.trim()) {
        const q = itemQuery.toLowerCase();
        items = items.filter((d) =>
          d.title.toLowerCase().includes(q) ||
          (d.description && d.description.toLowerCase().includes(q)) ||
          d.category.toLowerCase().includes(q) ||
          d.donor.fullName.toLowerCase().includes(q)
        );
      }

      setDonationItems(items);
    } catch (err) {
      console.error('Failed to load donations:', err);
      toast.error('Could not load donation items');
    } finally {
      setLoadingItems(false);
    }
  }, [categoryFilter, itemQuery]);

  useEffect(() => {
    if (activeTab === 'items') {
      fetchDonations();
    }
  }, [activeTab, fetchDonations]);

  // --- Handlers ---

  const handleItemQueryChange = (value: string) => {
    setItemQuery(value);
    setVisibleDonationCount(GRID_PAGE_SIZE);
    setVisibleNgoCount(GRID_PAGE_SIZE);
  };

  const handleLocationQueryChange = (value: string) => {
    setLocationQuery(value);
    setVisibleNgoCount(GRID_PAGE_SIZE);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'items') {
      fetchDonations();
    }
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

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
            const locResult: LocationResult = {
              name: locationName,
              displayName: locationName,
              lat: latitude,
              lon: longitude,
              type: 'city',
              countryCode,
            };
            setLocationResult(locResult);
            setLocationQuery(locationName);
            setVisibleNgoCount(GRID_PAGE_SIZE);
            toast.success('Location found!');
          }
        } catch {
          const locResult: LocationResult = {
            name: 'Current Location',
            displayName: 'Current Location',
            lat: latitude,
            lon: longitude,
            type: 'city',
          };
          setLocationResult(locResult);
          setLocationQuery('Current Location');
          setVisibleNgoCount(GRID_PAGE_SIZE);
          toast.success('Location found!');
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        toast.error('Unable to retrieve your location.');
        setIsLocating(false);
      }
    );
  };

  const isLoadingNgos = ngoSearchQuery.isLoading;
  const ngos = ngoSearchQuery.data || [];
  const contactModalOpen = selectedContact !== null;
  const requireSignIn = (action: string) => {
    if (isAuthenticated) return false;
    toast.error(`Please sign in to ${action}.`);
    return true;
  };
  const displayDonationItems = useMemo(() => {
    const listedEnd = new Date();
    const listedStart = new Date(listedEnd);
    listedStart.setDate(listedEnd.getDate() - 30);
    const neededStart = new Date(listedEnd);
    neededStart.setDate(listedEnd.getDate() + 3);
    const neededEnd = new Date(listedEnd);
    neededEnd.setDate(listedEnd.getDate() + 45);

    return donationItems.map((item) => {
      const seed = item.id || `${item.title}:${item.donorId}`;
      return {
        ...item,
        displayDonorName: DONOR_NAMES[getRandomInt(0, DONOR_NAMES.length - 1, `${seed}:donor`)],
        displayDonationType: DONATION_TYPES[getRandomInt(0, DONATION_TYPES.length - 1, `${seed}:type`)],
        displayCondition: ITEM_CONDITIONS[getRandomInt(0, ITEM_CONDITIONS.length - 1, `${seed}:condition`)],
        listedOn: getRandomDate(listedStart, listedEnd, `${seed}:listed`),
        neededBy: getRandomDate(neededStart, neededEnd, `${seed}:needed`),
      };
    });
  }, [donationItems]);

  // --- Render ---

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Hero Section */}
      <div className="relative bg-emerald-900 text-white pt-10 pb-10 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?q=80&w=2070&auto=format&fit=crop')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900 via-emerald-900/80 to-transparent" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            {/* Left: Text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="text-center md:text-left"
            >
              <h1 className="text-4xl md:text-5xl lg:text-[3rem] font-extrabold tracking-tight mb-3 leading-tight">
                Give Items, <br />
                <span className="text-emerald-400">Change Lives</span>
              </h1>
              <p className="text-base md:text-lg text-emerald-100/80 max-w-xl">
                Browse items people are donating and discover NGOs near you
                that need your support.
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
              <div className="rounded-3xl border border-white/15 bg-white/[0.13] p-3 shadow-xl shadow-emerald-950/25 backdrop-blur-xl sm:p-4">
                {/* Tab Switcher */}
                <div className="grid grid-cols-2 gap-1 rounded-2xl bg-emerald-950/35 p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('items');
                      setVisibleDonationCount(GRID_PAGE_SIZE);
                    }}
                    className={`flex h-9 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold transition-all ${
                      activeTab === 'items'
                        ? 'bg-white text-emerald-950 shadow-sm'
                        : 'text-emerald-50/75 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Package size={16} />
                    Donation Items
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (requireSignIn('view organizations')) return;
                      setActiveTab('ngos');
                      setVisibleNgoCount(GRID_PAGE_SIZE);
                    }}
                    className={`flex h-9 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold transition-all ${
                      activeTab === 'ngos'
                        ? 'bg-white text-emerald-950 shadow-sm'
                        : 'text-emerald-50/75 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Building2 size={16} />
                    NGOs
                  </button>
                </div>

                <div className="mt-2.5 space-y-2">
                  <ItemAutocomplete
                    value={itemQuery}
                    onChange={handleItemQueryChange}
                    placeholder={activeTab === 'items' ? 'Search donation items' : 'Search NGO name or cause'}
                    inputClassName="h-10 w-full rounded-2xl border border-white/60 bg-white/95 pl-12 pr-4 text-sm font-medium text-slate-950 placeholder-slate-500 shadow-sm outline-none transition-all focus:border-emerald-300 focus:ring-2 focus:ring-emerald-300"
                  />

                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600" size={18} />
                    <LocationAutocomplete
                      value={locationQuery}
                      onChange={handleLocationQueryChange}
                      onLocationSelect={(location) => {
                        setLocationResult(location);
                        setVisibleNgoCount(GRID_PAGE_SIZE);
                      }}
                      inputClassName="h-10 w-full rounded-2xl border border-white/60 bg-white/95 pl-12 pr-4 text-sm font-medium text-slate-950 placeholder-slate-500 shadow-sm outline-none transition-all focus:border-emerald-300 focus:ring-2 focus:ring-emerald-300"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
                    <button
                      type="submit"
                      disabled={loadingItems || isLoadingNgos || isLocating}
                      className="flex h-10 items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 text-sm font-extrabold text-emerald-950 shadow-lg shadow-emerald-950/20 transition-all hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-emerald-700 disabled:text-white/70"
                    >
                      <Search size={17} />
                      <span>{loadingItems || isLoadingNgos ? 'Searching...' : 'Search'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleGetLocation}
                      disabled={isLocating || loadingItems || isLoadingNgos}
                      className="flex h-10 items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-5 text-sm font-bold text-white shadow-sm transition-all hover:bg-white/18 disabled:cursor-not-allowed disabled:opacity-60"
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

      {/* Results Section */}
      <div ref={resultsRef} className="container mx-auto px-6 pt-8 pb-12 relative z-20 scroll-mt-28">
        {/* Category Filter (only for items tab) */}
        {activeTab === 'items' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-2xl shadow-xl p-4 mb-8 border border-emerald-100 flex flex-wrap gap-2 justify-center"
          >
            {categoryOptions.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setCategoryFilter(cat);
                  setVisibleDonationCount(GRID_PAGE_SIZE);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  categoryFilter === cat
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
              >
                {cat === 'All Categories' ? '📋 All' : `${CATEGORY_ICONS[cat] || '📦'} ${cat}`}
              </button>
            ))}
          </motion.div>
        )}

        {/* Loading State */}
        {((loadingItems && activeTab === 'items') || (isLoadingNgos && activeTab === 'ngos')) && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-emerald-600" size={40} />
            <span className="ml-3 text-lg text-gray-600 font-medium">
              Loading {activeTab === 'items' ? 'donation items' : 'NGOs'}...
            </span>
          </div>
        )}

        {/* Donation Items Grid */}
        {!loadingItems && activeTab === 'items' && (
          <>
            <div className="relative mb-10 overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 p-6 md:p-8 shadow-lg">
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-400/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-300/10 rounded-full translate-y-1/3 -translate-x-1/4 blur-2xl" />
              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3 tracking-tight">
                    <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm">
                      <Package className="text-white" size={22} />
                    </span>
                    Items People Are Donating
                  </h2>
                  <p className="text-emerald-100/80 text-sm mt-1.5 ml-[52px]">
                    Browse items people are offering — available now, ready to give
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-900 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {donationItems.length} {donationItems.length === 1 ? 'item' : 'items'} available
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              <AnimatePresence>
                {displayDonationItems.length > 0 ? (
                  displayDonationItems.slice(0, visibleDonationCount).map((item, idx) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: idx * 0.03 }}
                      key={item.id}
                      onClick={() => {
                        if (requireSignIn('contact the donor')) return;
                        setSelectedContact({ type: 'item', ...item, donor: { ...item.donor, fullName: item.displayDonorName } });
                      }}
                      className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col group hover:border-emerald-200 hover:scale-[1.015] cursor-pointer"
                    >
                      {/* Image Header */}
                      <div className="relative h-32 bg-gradient-to-br from-emerald-100 to-blue-100 overflow-hidden">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={48} className="text-emerald-400/60" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-emerald-700 shadow-sm">
                          {CATEGORY_ICONS[item.category] || '📦'} {item.category}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 flex-1">
                        <h3 className="font-bold text-gray-900 text-base mb-2 line-clamp-1">{item.title}</h3>
                        {item.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-1">{item.description}</p>
                        )}
                        <p className="mb-3 line-clamp-1 text-xs font-semibold text-emerald-700">
                          {item.displayCondition} • {item.displayDonationType} • Needed by {formatShortDate(item.neededBy)}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Heart size={14} className="text-red-400" />
                          <span>Donated by <span className="font-semibold text-gray-700">{item.displayDonorName}</span></span>
                        </div>
                        {item.ngo && (
                          <div className="mt-2 flex items-center gap-2 text-sm text-emerald-600">
                            <Building2 size={14} />
                            <span>via <span className="font-semibold">{item.ngo.organizationName}</span></span>
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          Listed {formatShortDate(item.listedOn)}
                        </span>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            if (requireSignIn('contact the donor')) return;
                            setSelectedContact({ type: 'item', ...item, donor: { ...item.donor, fullName: item.displayDonorName } });
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full hover:bg-emerald-100"
                        >
                          Contact donor
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm"
                    >
                      <Package className="text-gray-300 mx-auto mb-4" size={48} />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">No donation items found</h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        No one is currently donating items matching your search.
                        Check back soon or browse NGOs to find ways to help.
                      </p>
                      <button
                        onClick={() => {
                          setItemQuery('');
                          setCategoryFilter('All Categories');
                          setVisibleDonationCount(GRID_PAGE_SIZE);
                        }}
                        className="mt-6 text-emerald-600 font-semibold hover:text-emerald-700 underline underline-offset-4"
                      >
                        Clear filters
                      </button>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {displayDonationItems.length > visibleDonationCount && (
              <div className="mt-14 text-center">
                <button
                  onClick={() => setVisibleDonationCount((prev) => prev + GRID_PAGE_SIZE)}
                  className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold py-3 px-8 rounded-xl transition-all hover:px-10 shadow-sm"
                >
                  Load More Items
                </button>
              </div>
            )}
          </>
        )}

        {/* NGOs Grid */}
        {!isLoadingNgos && activeTab === 'ngos' && isAuthenticated && (
          <>
            <div className="relative mb-10 overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 p-6 md:p-8 shadow-lg">
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-400/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-300/10 rounded-full translate-y-1/3 -translate-x-1/4 blur-2xl" />
              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3 tracking-tight">
                    <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm">
                      <Building2 className="text-white" size={22} />
                    </span>
                    NGOs in Your Community
                  </h2>
                  <p className="text-emerald-100/80 text-sm mt-1.5 ml-[52px]">
                    Discover verified NGOs near you making a real impact
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-900 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {ngos.length} {ngos.length === 1 ? 'NGO' : 'NGOs'} nearby
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              <AnimatePresence>
                {ngos.length > 0 ? (
                  ngos.slice(0, visibleNgoCount).map((ngo, idx: number) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: idx * 0.03 }}
                      key={ngo.id}
                      className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:scale-[1.01] hover:border-emerald-200 hover:shadow-lg"
                    >
                      {/* Cover Image Area */}
                      <div className="relative h-40 bg-gradient-to-br from-emerald-100 to-blue-100">
                        {ngo.image ? (
                          <img
                            src={ngo.image}
                            alt={ngo.organizationName}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building2 size={56} className="text-emerald-400/60" />
                          </div>
                        )}
                        {ngo.locationName && (
                          <div className="absolute right-3 top-3 flex max-w-[calc(100%-1.5rem)] items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-emerald-800 shadow-sm ring-1 ring-emerald-100 backdrop-blur-sm">
                            <MapPin size={12} className="shrink-0" />
                            <span className="truncate">{ngo.locationName}</span>
                          </div>
                        )}
                        {/* NGO Avatar overlay */}
                        <div className="absolute bottom-3 left-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-emerald-400 to-emerald-600 text-xl font-bold text-white shadow-lg">
                            {(ngo.organizationName || 'N').charAt(0)}
                          </div>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="flex-1 bg-white p-5">
                        <div className="mb-3 flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <h3 className="line-clamp-2 text-lg font-extrabold leading-snug text-slate-950">{ngo.organizationName}</h3>
                            <div className="mt-1.5 flex items-center gap-2">
                              {ngo.isVerified && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                                  ✓ Verified
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <p className="mb-4 text-sm leading-relaxed text-slate-700">
                          <span className="font-bold text-slate-900">Focus:</span> {ngo.missionArea || 'Community support'}
                        </p>
                        {ngo.categories && ngo.categories.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {ngo.categories.slice(0, 4).map((cat: string, i: number) => (
                              <span
                                key={i}
                                className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-100"
                              >
                                {CATEGORY_ICONS[cat] || '📋'} {cat}
                              </span>
                            ))}
                            {ngo.categories.length > 4 && (
                              <span className="text-xs font-semibold text-slate-500">+{ngo.categories.length - 4} more</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="space-y-2 border-t border-slate-100 bg-slate-50/80 px-5 py-4">
                        <button
                          type="button"
                          onClick={() => setSelectedContact({ type: 'ngo', ...ngo })}
                          className="flex w-full items-center justify-between rounded-xl bg-emerald-600 px-3 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700"
                        >
                          <span>Contact NGO</span>
                          <MessageCircle size={15} />
                        </button>
                        <Link
                          href={`/ngo/${ngo.id}`}
                          className="flex items-center justify-between rounded-xl bg-white px-3 py-2.5 text-sm font-bold text-slate-800 ring-1 ring-slate-200 transition-all hover:text-emerald-800 hover:ring-emerald-200"
                        >
                          <span>View Profile</span>
                          <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm"
                    >
                      <Building2 className="text-gray-300 mx-auto mb-4" size={48} />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">No NGOs found</h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        No NGOs matched your search. Try different keywords or browse all causes.
                      </p>
                      <button
                        onClick={() => {
                          setItemQuery('');
                          setVisibleNgoCount(GRID_PAGE_SIZE);
                        }}
                        className="mt-6 text-emerald-600 font-semibold hover:text-emerald-700 underline underline-offset-4"
                      >
                        Clear search
                      </button>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {ngos.length > visibleNgoCount && (
              <div className="mt-14 text-center">
                <button
                  onClick={() => setVisibleNgoCount((prev) => prev + GRID_PAGE_SIZE)}
                  className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold py-3 px-8 rounded-xl transition-all hover:px-10 shadow-sm"
                >
                  Load More Organizations
                </button>
              </div>
            )}
          </>
        )}
        {activeTab === 'ngos' && !isAuthenticated && (
          <div className="rounded-3xl border border-amber-100 bg-amber-50 p-8 text-center shadow-sm">
            <Building2 className="mx-auto mb-4 text-amber-500" size={44} />
            <h3 className="text-xl font-bold text-gray-900">Sign in to view organizations</h3>
            <p className="mx-auto mt-2 max-w-md text-sm font-medium text-gray-600">
              Organization listings are available after sign-in.
            </p>
          </div>
        )}
      </div>
      <DonationModal
        target={selectedContact}
        isOpen={contactModalOpen}
        onClose={() => setSelectedContact(null)}
      />
    </div>
  );
}
