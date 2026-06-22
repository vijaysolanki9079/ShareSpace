'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Check } from 'lucide-react';
import Image from 'next/image';
import FilterBar from './FilterBar';
import DonationDetailModal from './DonationDetailModal';
import { useSession } from 'next-auth/react';
import NoImageFallback from './NoImageFallback';
import { trpc } from '@/lib/trpc';
import { getRenderableImages, isRenderableImageSrc } from '@/lib/image-src';
import { formatShortDate, getRandomDate, getRandomInt } from '@/lib/random-display';

interface ItemRequest {
  id: string;
  title: string;
  description: string;
  category: {
    id: string;
    name: string;
  };
  images: string[];
  latitude: number;
  longitude: number;
  locationName: string | null;
  radius: number;
  distance?: number;
  requester: {
    id: string;
    fullName: string;
    image: string | null;
  };
  ngo?: {
    id: string;
    organizationName: string;
    image: string | null;
    isVerified: boolean;
  };
  status: string;
  createdAt: string;
}

interface ItemCategory {
  id: string;
  name: string;
}

const GRID_PAGE_SIZE = 16;
const SEED_FIXTURE_START = Date.parse('2026-05-01T07:52:19.000Z');
const SEED_FIXTURE_END = Date.parse('2026-05-01T07:52:20.000Z');
const REQUEST_DISPLAY_START = new Date('2026-06-21T00:00:00');
const REQUEST_DISPLAY_END = new Date('2026-07-30T23:59:59');
const REQUEST_AREAS = [
  'Downtown',
  'Westside',
  'North Hills',
  'Green Park',
  'Central Market',
  'Model Town',
  'Civil Lines',
  'South Extension',
  'Lake View',
  'Old City',
  'Urban Estate',
  'Sector 62',
];

function isSeedFixtureRequest(request: ItemRequest) {
  const createdAt = new Date(request.createdAt).getTime();
  return createdAt >= SEED_FIXTURE_START && createdAt < SEED_FIXTURE_END;
}

function getRequestDisplayData(request: ItemRequest) {
  const seed = request.id || `${request.title}:${request.requester?.id}`;
  const radiusKm = getRandomInt(1, 8, `${seed}:radius`);

  return {
    area: REQUEST_AREAS[getRandomInt(0, REQUEST_AREAS.length - 1, `${seed}:area`)],
    radiusKm,
    date: getRandomDate(REQUEST_DISPLAY_START, REQUEST_DISPLAY_END, `${seed}:date`),
  };
}

function requestMatchesQuery(request: ItemRequest, rawQuery: string) {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return true;

  const haystack = [
    request.id,
    request.title,
    request.description,
    request.category?.name,
    request.locationName,
    request.requester?.fullName,
    request.ngo?.organizationName,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (haystack.includes(query)) return true;

  const tokens = query
    .split(/[\s,()/_-]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3 && !/^\d+$/.test(token));

  return tokens.some((token) => haystack.includes(token));
}

function getRequestImageOverride(request: ItemRequest) {
  const text = `${request.title} ${request.description} ${request.category?.name ?? ''}`.toLowerCase();

  if (text.includes('winter') && (text.includes('jacket') || text.includes('children'))) {
    return '/assets/winter jackets for children copy.png';
  }

  if (text.includes('shelter')) {
    return '/assets/sheltered-co-breathable.png';
  }

  return null;
}

function getRequestImages(request: ItemRequest) {
  const override = getRequestImageOverride(request);
  if (override) return [override];
  return getRenderableImages(request.images);
}

interface NearbyRequestsFeedProps {
  initialLat?: number;
  initialLng?: number;
  radiusKm?: number;
  category?: string;
  initialSearchQuery?: string;
  highlightQuery?: string;
}

export default function NearbyRequestsFeed({
  initialLat,
  initialLng,
  radiusKm: initialRadius = 5,
  category: initialCategory = '',
  initialSearchQuery = '',
  highlightQuery = '',
  refreshTrigger = 0,
}: NearbyRequestsFeedProps & { refreshTrigger?: number }) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const {
    data: myRequestData,
    isLoading: myRequestsLoading,
    refetch: refetchMyRequests,
  } = trpc.item.getMyRequestFeed.useQuery(undefined, {
    enabled: !!currentUserId,
  });
  const [requests, setRequests] = useState<ItemRequest[]>([]);
  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation] = useState(
    initialLat !== undefined && initialLng !== undefined
      ? { lat: initialLat, lng: initialLng }
      : null
  );

  // Filter states
  const [radiusKm, setRadiusKm] = useState(initialRadius);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [postedBy, setPostedBy] = useState<'all' | 'user' | 'ngo'>('all');
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [visibleMyCount, setVisibleMyCount] = useState(GRID_PAGE_SIZE);
  const [visibleCommunityCount, setVisibleCommunityCount] = useState(GRID_PAGE_SIZE);
  const [pendingScrollRequestId, setPendingScrollRequestId] = useState<string | null>(null);
  const requestCardRefs = useRef(new Map<string, HTMLDivElement>());

  // Modal state
  const [selectedRequest, setSelectedRequest] = useState<ItemRequest | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const resetVisibleCounts = () => {
    setVisibleMyCount(GRID_PAGE_SIZE);
    setVisibleCommunityCount(GRID_PAGE_SIZE);
  };

  useEffect(() => {
    setSearchQuery(initialSearchQuery);
    resetVisibleCounts();
  }, [initialSearchQuery]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/requests/categories');
        const data = await response.json();
        if (data.categories) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      refetchMyRequests();
    }
  }, [refreshTrigger, currentUserId, refetchMyRequests]);

  const fetchNearbyRequests = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        limit: '100',
      });

      if (userLocation) {
        params.set('latitude', userLocation.lat.toString());
        params.set('longitude', userLocation.lng.toString());
        params.set('radius_km', radiusKm.toString());
      }

      if (selectedCategory) {
        params.append('category', selectedCategory);
      }

      const response = await fetch(`/api/requests/nearby?${params}`, { signal });

      if (!response.ok) {
        throw new Error('Failed to fetch nearby requests');
      }

      const data = await response.json();
      const fetchedRequests = ((data.requests || []) as ItemRequest[])
        .filter((req) => !isSeedFixtureRequest(req))
        .map((req) => ({
          ...req,
          images: getRenderableImages(req.images),
        }));

      setRequests(
        fetchedRequests.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching requests:', err);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [radiusKm, selectedCategory, userLocation]);

  // Fetch requests. Without coordinates this returns all open requests.
  useEffect(() => {
    const controller = new AbortController();
    fetchNearbyRequests(controller.signal);
    return () => controller.abort();
  }, [fetchNearbyRequests, refreshTrigger]);

  const formatDistance = (meters?: number) => {
    if (meters === undefined) {
      return 'Latest';
    }

    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const filterRequestList = useCallback((items: ItemRequest[]) => {
    let filtered = items;

    if (selectedCategory) {
      filtered = filtered.filter((request) => request.category.id === selectedCategory);
    }

    if (postedBy !== 'all') {
      filtered = filtered.filter((request) => {
        if (postedBy === 'ngo') return !!request.ngo;
        if (postedBy === 'user') return !request.ngo;
        return true;
      });
    }

    if (searchQuery) {
      filtered = filtered.filter((request) => requestMatchesQuery(request, searchQuery));
    }

    return filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [postedBy, searchQuery, selectedCategory]);

  const { myRequests, communityRequests } = useMemo(() => {
    const filteredCommunitySource = filterRequestList(
      currentUserId
        ? requests.filter((request) => request.requester.id !== currentUserId)
        : requests
    );

    if (!currentUserId) {
      return {
        myRequests: [] as ItemRequest[],
        communityRequests: filteredCommunitySource,
      };
    }

    const ownRequestsFromFeed = requests.filter((request) => request.requester.id === currentUserId);
    const mergedMyRequests = Array.from(
      new Map(
        ([...((myRequestData || []) as ItemRequest[]), ...ownRequestsFromFeed]).map((request) => [
          request.id,
          request,
        ])
      ).values()
    )
      .filter((request) => !isSeedFixtureRequest(request))
      .map((request) => ({
        ...request,
        images: getRenderableImages(request.images),
      }));

    return {
      myRequests: filterRequestList(mergedMyRequests),
      communityRequests: filteredCommunitySource,
    };
  }, [currentUserId, filterRequestList, myRequestData, requests]);

  const visibleMyRequests = myRequests.slice(0, visibleMyCount);
  const visibleCommunityRequests = communityRequests.slice(0, visibleCommunityCount);
  const totalMatchingRequests = myRequests.length + communityRequests.length;
  const totalVisibleRequests = visibleMyRequests.length + visibleCommunityRequests.length;
  const showInitialSkeleton = loading && totalMatchingRequests === 0 && (!currentUserId || myRequestsLoading);
  const showEmptyState = !loading && !myRequestsLoading && totalMatchingRequests === 0;
  const activeHighlightQuery = highlightQuery || initialSearchQuery;

  useEffect(() => {
    if (!activeHighlightQuery || totalMatchingRequests === 0) return;

    const scrollTimer = window.setTimeout(() => {
      document
        .querySelector('[data-request-highlight="true"]')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 250);

    return () => window.clearTimeout(scrollTimer);
  }, [activeHighlightQuery, totalMatchingRequests]);

  useEffect(() => {
    if (!pendingScrollRequestId) return;

    const frame = window.requestAnimationFrame(() => {
      requestCardRefs.current
        .get(pendingScrollRequestId)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setPendingScrollRequestId(null);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pendingScrollRequestId, totalVisibleRequests]);

  const handleLoadMoreRequests = (
    items: ItemRequest[],
    visibleCount: number,
    setVisibleCount: React.Dispatch<React.SetStateAction<number>>
  ) => {
    const nextRequest = items[visibleCount];
    if (nextRequest) {
      setPendingScrollRequestId(nextRequest.id);
    }
    setVisibleCount((prev) => Math.min(prev + GRID_PAGE_SIZE, items.length));
  };

  const RequestGrid = ({ items }: { items: ItemRequest[] }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
      {items.map((request, idx) => {
        const requestImages = getRequestImages(request);
        const displayData = getRequestDisplayData(request);
        const displayRequest = {
          ...request,
          images: requestImages,
          locationName: displayData.area,
          radius: displayData.radiusKm * 1000,
          createdAt: displayData.date.toISOString(),
        };
        const isHighlighted = Boolean(activeHighlightQuery && requestMatchesQuery(request, activeHighlightQuery));

        return (
          <motion.div
            key={request.id}
            ref={(node) => {
              if (node) {
                requestCardRefs.current.set(request.id, node);
              } else {
                requestCardRefs.current.delete(request.id);
              }
            }}
            data-request-highlight={isHighlighted ? 'true' : undefined}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04, duration: 0.5 }}
            onClick={() => {
              setSelectedRequest(displayRequest);
              setModalOpen(true);
            }}
            className={`group bg-white rounded-[1.75rem] p-2.5 shadow-[0_8px_28px_-18px_rgba(15,23,42,0.25)] hover:shadow-[0_16px_36px_-22px_rgba(16,185,129,0.32)] overflow-hidden transition-all duration-300 cursor-pointer border hover:border-emerald-200 ${
              isHighlighted
                ? 'border-emerald-300 ring-4 ring-emerald-300/35 shadow-[0_20px_46px_-24px_rgba(16,185,129,0.6)]'
                : 'border-gray-100'
            }`}
          >
            <div className="relative w-full h-40 rounded-[1.35rem] overflow-hidden mb-3 bg-emerald-50">
              {requestImages.length > 0 ? (
                <img
                  src={requestImages[0]}
                  alt={request.title}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
              ) : (
                <NoImageFallback />
              )}

              <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none">
                <div className="flex justify-between items-start">
                  <div className="px-3 py-1.5 bg-black/40 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-full border border-white/20">
                    {formatDistance(request.distance)}
                  </div>
                  <div className="px-3 py-1.5 bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-400/50 shadow-lg">
                    {request.status === 'open' ? 'Open' : 'Claimed'}
                  </div>
                </div>

                <div className="mt-auto">
                  <div className="inline-flex px-3 py-1.5 bg-white/90 backdrop-blur-md text-emerald-800 text-[10px] font-black uppercase tracking-widest rounded-xl border border-white/50 shadow-sm">
                    {request.category.name}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-3 pb-3 space-y-3">
              <div className="space-y-2">
                <h3 className="text-base font-black text-gray-900 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                  {request.title}
                </h3>
                <p className="text-xs text-gray-500 font-medium line-clamp-2 leading-relaxed">
                  {request.description}
                </p>
                <div className="grid grid-cols-3 gap-2 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                  <span className="truncate rounded-lg bg-gray-50 px-2 py-1">{formatShortDate(displayData.date)}</span>
                  <span className="truncate rounded-lg bg-gray-50 px-2 py-1">{displayData.area}</span>
                  <span className="truncate rounded-lg bg-gray-50 px-2 py-1">Within {displayData.radiusKm} km</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-gray-50">
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl overflow-hidden bg-emerald-50 border border-emerald-100 relative">
                    {isRenderableImageSrc(request.requester?.image) ? (
                      <Image
                        src={request.requester.image}
                        alt={request.requester.fullName || 'User'}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-emerald-600 font-black text-sm">
                        {request.requester?.fullName?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  {request.ngo && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-lg border-2 border-white flex items-center justify-center">
                      <Check size={10} className="text-white" strokeWidth={4} />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-gray-900 truncate tracking-tight leading-none mb-1">
                    {request.requester.fullName}
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    {request.ngo ? 'Verified NGO' : 'Individual'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  if (showInitialSkeleton) {
    return (
      <div className="space-y-6">
        <div className="h-12 w-full bg-white/50 animate-pulse rounded-2xl border border-gray-100" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {Array.from({ length: GRID_PAGE_SIZE }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 h-[360px] animate-pulse overflow-hidden">
               <div className="w-full h-48 bg-gray-100 mb-4" />
               <div className="px-5 space-y-3">
                  <div className="h-6 w-3/4 bg-gray-100 rounded-lg" />
                  <div className="h-4 w-full bg-gray-50 rounded-lg" />
                  <div className="h-4 w-2/3 bg-gray-50 rounded-lg" />
                  <div className="pt-4 border-t border-gray-50 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gray-100" />
                    <div className="h-4 w-24 bg-gray-50 rounded-lg" />
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-800 flex gap-3">
        <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">Error loading requests</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <FilterBar
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={(categoryId) => {
          setSelectedCategory(categoryId);
          resetVisibleCounts();
        }}
        radiusKm={radiusKm}
        onRadiusChange={(radius) => {
          setRadiusKm(radius);
          resetVisibleCounts();
        }}
        postedBy={postedBy}
        onPostedByChange={(value) => {
          setPostedBy(value);
          resetVisibleCounts();
        }}
        searchQuery={searchQuery}
        onSearchChange={(query) => {
          setSearchQuery(query);
          resetVisibleCounts();
        }}
      />

      {/* Results Count */}
      {totalMatchingRequests > 0 && (
        <div className="text-sm text-gray-600">
          Showing <strong>{totalVisibleRequests}</strong> of <strong>{totalMatchingRequests}</strong> matching donation {totalMatchingRequests === 1 ? 'request' : 'requests'}
          {loading && <span className="ml-2 text-gray-400">Refreshing...</span>}
        </div>
      )}

      {/* Empty State */}
      {showEmptyState && (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-600 mb-4">No donation requests found.</p>
          <p className="text-sm text-gray-500">Try adjusting your filters or check back later!</p>
        </div>
      )}

      {totalMatchingRequests > 0 && (
        <div className="space-y-10">
          {currentUserId && (
            <section className="space-y-4">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-gray-950">Requests You Posted</h2>
                <p className="mt-1 text-sm font-medium text-gray-500">Track your own needs and see who is ready to help.</p>
              </div>
              {myRequests.length > 0 ? (
                <RequestGrid items={visibleMyRequests} />
              ) : (
                <div className="rounded-3xl border border-dashed border-emerald-200 bg-white/80 p-8 text-center text-sm font-medium text-gray-500">
                  You have not posted any matching requests yet.
                </div>
              )}
              {myRequests.length > visibleMyCount && (
                <div className="text-center">
                  <button
                    onClick={() => handleLoadMoreRequests(myRequests, visibleMyCount, setVisibleMyCount)}
                    className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold py-3 px-8 rounded-xl transition-all hover:px-10 shadow-sm"
                  >
                    Load More Requests
                  </button>
                </div>
              )}
            </section>
          )}

          <section className="space-y-4">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-gray-950">Requests From Neighbors</h2>
              <p className="mt-1 text-sm font-medium text-gray-500">Browse nearby requests from other people and organizations.</p>
            </div>
            {communityRequests.length > 0 ? (
              <RequestGrid items={visibleCommunityRequests} />
            ) : (
              <div className="rounded-3xl border border-dashed border-gray-200 bg-white/80 p-8 text-center text-sm font-medium text-gray-500">
                No matching requests from others right now.
              </div>
            )}
            {communityRequests.length > visibleCommunityCount && (
              <div className="text-center">
                <button
                  onClick={() => handleLoadMoreRequests(communityRequests, visibleCommunityCount, setVisibleCommunityCount)}
                  className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold py-3 px-8 rounded-xl transition-all hover:px-10 shadow-sm"
                >
                  Load More Requests
                </button>
              </div>
            )}
          </section>
        </div>
      )}

      {/* Detail Modal */}
      {selectedRequest && (
        <DonationDetailModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          request={selectedRequest}
        />
      )}
    </div>
  );
}
