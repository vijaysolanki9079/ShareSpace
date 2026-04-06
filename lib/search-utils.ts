import { LocationResult } from '@/components/LocationAutocomplete';

/**
 * DEBOUNCE UTILITIES
 * Prevent excessive API calls
 */

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * LEADING DEBOUNCE
 * Executes immediately on first call, then waits
 */
export function debounceLeading<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let hasRun = false;

  return function (...args: Parameters<T>) {
    if (!hasRun) {
      func(...args);
      hasRun = true;
    }

    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      hasRun = false;
    }, delay);
  };
}

/**
 * CACHE MANAGER
 * Store and retrieve search results with TTL
 */
export class SearchCache {
  private cache: Map<string, { data: LocationResult[]; timestamp: number }> = new Map();
  private readonly ttl: number; // Time to live in milliseconds

  constructor(ttlMinutes: number = 5) {
    this.ttl = ttlMinutes * 60 * 1000;
  }

  set(key: string, data: LocationResult[]): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get(key: string): LocationResult[] | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    // Check if cache is expired
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }
}

/**
 * LOCAL STORAGE CACHE
 * Persist search history across sessions
 */
export class PersistentSearchCache {
  private readonly key: string = 'sharenest_search_cache';
  private readonly maxItems: number = 20; // Store max 20 recent searches

  /**
   * Get recent searches from localStorage
   */
  getRecentSearches(): LocationResult[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(this.key);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  /**
   * Add a search to the recent list
   */
  addSearch(location: LocationResult): void {
    if (typeof window === 'undefined') return;
    try {
      const current = this.getRecentSearches();
      
      // Remove duplicate if it exists
      const filtered = current.filter(
        (item) => !(item.lat === location.lat && item.lon === location.lon)
      );

      // Add new search at the beginning
      const updated = [location, ...filtered].slice(0, this.maxItems);
      localStorage.setItem(this.key, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save search:', error);
    }
  }

  /**
   * Clear all recent searches
   */
  clear(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(this.key);
    } catch {
      // Silently fail if localStorage unavailable
    }
  }
}

/**
 * RESULT DEDUPLICATION & RANKING
 * Remove duplicates and rank by relevance
 */
export function deduplicateResults(results: LocationResult[]): LocationResult[] {
  const seen = new Set<string>();
  const deduplicated: LocationResult[] = [];

  for (const result of results) {
    const key = `${result.lat}-${result.lon}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduplicated.push(result);
    }
  }

  return deduplicated;
}

export function rankResults(
  results: LocationResult[],
  query: string
): LocationResult[] {
  const lowerQuery = query.toLowerCase();

  // Score each result based on relevance
  const scored = results.map((result) => {
    let score = 0;

    // Exact match at start = highest score
    if (result.displayName.toLowerCase().startsWith(lowerQuery)) {
      score += 100;
    }
    // Contains the query = medium score
    else if (result.displayName.toLowerCase().includes(lowerQuery)) {
      score += 50;
    }

    // Cities rank higher than streets
    if (result.type === 'city') score += 30;
    if (result.type === 'area') score += 20;
    if (result.type === 'street') score += 10;

    return { result, score };
  });

  // Sort by score descending
  return scored.sort((a, b) => b.score - a.score).map((item) => item.result);
}

/**
 * ADDRESS PARSING
 * Clean up and shorten addresses
 */
export function parseAddress(fullAddress: string): string {
  // Split by comma and get the first meaningful part
  const parts = fullAddress.split(',').map((part) => part.trim());

  // Remove country (usually last)
  if (parts[parts.length - 1]?.toLowerCase() === 'india') {
    parts.pop();
  }

  // Return first 2 parts (e.g., "New Delhi, Delhi")
  return parts.slice(0, 2).join(', ');
}

/**
 * GEOLOCATION CACHE
 * Cache user's current location
 */
export class GeolocationCache {
  private readonly key: string = 'sharenest_user_location';
  private readonly ttl: number = 60 * 60 * 1000; // 1 hour

  /**
   * Get cached user location
   */
  getCachedLocation(): [number, number] | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(this.key);
      if (!data) return null;

      const parsed = JSON.parse(data);
      const age = Date.now() - parsed.timestamp;

      if (age > this.ttl) {
        this.clear();
        return null;
      }

      return [parsed.lat, parsed.lon];
    } catch {
      return null;
    }
  }

  /**
   * Save user location to cache
   */
  setLocation(lat: number, lon: number): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(
        this.key,
        JSON.stringify({ lat, lon, timestamp: Date.now() })
      );
    } catch {
      // Silently fail
    }
  }

  /**
   * Clear cached location
   */
  clear(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(this.key);
    } catch {
      // Silently fail
    }
  }
}

/**
 * REQUEST DEDUPLICATION
 * Prevent duplicate API calls for same query
 */
export class RequestDeduplicator {
  private pending: Map<string, Promise<LocationResult[]>> = new Map();

  /**
   * Execute a request, deduplicating identical concurrent requests
   */
  async execute(
    key: string,
    executor: () => Promise<LocationResult[]>
  ): Promise<LocationResult[]> {
    // If request already in progress, return the same promise
    if (this.pending.has(key)) {
      return this.pending.get(key)!;
    }

    // Execute the request
    const promise = executor().finally(() => {
      this.pending.delete(key);
    });

    this.pending.set(key, promise);
    return promise;
  }

  /**
   * Clear all pending requests
   */
  clear(): void {
    this.pending.clear();
  }
}

/**
 * ERROR HANDLING & FALLBACK
 */
export const ERROR_MESSAGES = {
  NO_RESULTS: 'No locations found. Try a different search.',
  API_ERROR: 'Unable to search locations. Please try again.',
  PERMISSION_DENIED: 'Location permission denied. Enter location manually.',
  LOCATION_UNAVAILABLE: 'Location unavailable. Please try again.',
  TIMEOUT: 'Search timed out. Please try again.',
} as const;

/**
 * ANALYTICS TRACKING
 * Track search events for insights
 */
export interface SearchAnalytics {
  query: string;
  resultCount: number;
  selectedIndex?: number;
  type: 'location' | 'ngo';
  timestamp: number;
  duration: number; // milliseconds
  success: boolean;
  error?: string;
}

export class SearchAnalyticsTracker {
  private events: SearchAnalytics[] = [];
  private readonly maxEvents: number = 100;

  /**
   * Track a search event
   */
  trackSearch(event: SearchAnalytics): void {
    this.events.push(event);

    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Send to analytics service (optional)
    this.sendToAnalytics(event);
  }

  /**
   * Send event to your analytics service
   * Replace with your actual analytics implementation
   */
  private sendToAnalytics(event: SearchAnalytics): void {
    // Example: Send to Mixpanel, Segment, or custom endpoint
    if (process.env.NODE_ENV === 'development') {
      // console.log('📊 Search Analytics:', event);
    }

    // In production, send to your analytics service:
    // await fetch('/api/analytics', { method: 'POST', body: JSON.stringify(event) })
  }

  /**
   * Get all tracked events
   */
  getEvents(): SearchAnalytics[] {
    return this.events;
  }

  /**
   * Clear events
   */
  clear(): void {
    this.events = [];
  }
}

/**
 * PERFORMANCE MONITORING
 */
export class SearchPerformanceMonitor {
  /**
   * Measure API response time
   */
  static async measureApiCall<T>(
    fn: () => Promise<T>
  ): Promise<{ result: T; duration: number }> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    return { result, duration };
  }

  /**
   * Log slow queries
   */
  static logSlowQuery(
    query: string,
    duration: number,
    threshold: number = 1000
  ): void {
    if (duration > threshold) {
      console.warn(`⚠️ Slow search query: "${query}" took ${duration.toFixed(0)}ms`);
    }
  }
}
