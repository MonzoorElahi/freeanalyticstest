/**
 * Custom Hook for Analytics Data Fetching
 * Provides caching, error handling, and optimized re-fetching
 */

import { useState, useEffect, useCallback, useRef } from "react";
import type { AnalyticsResponse } from "@/types/analytics";

interface UseAnalyticsOptions {
  days: number;
  compareType?: "previous" | "year";
  autoRefresh?: boolean;
  refreshInterval?: number;
  cacheTime?: number;
  onSuccess?: (data: AnalyticsResponse) => void;
  onError?: (error: Error) => void;
}

interface UseAnalyticsReturn {
  data: AnalyticsResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isRefetching: boolean;
  lastUpdated: Date | null;
}

// Simple in-memory cache
const cache = new Map<string, { data: AnalyticsResponse; timestamp: number }>();
const DEFAULT_CACHE_TIME = 5 * 60 * 1000; // 5 minutes

export function useAnalytics(options: UseAnalyticsOptions): UseAnalyticsReturn {
  const {
    days,
    compareType = "previous",
    autoRefresh = false,
    refreshInterval = 5 * 60 * 1000,
    cacheTime = DEFAULT_CACHE_TIME,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const fetchData = useCallback(
    async (isRefetch = false) => {
      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const cacheKey = `analytics-${days}-${compareType}`;

      // Check cache first
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cacheTime && !isRefetch) {
        setData(cached.data);
        setLastUpdated(new Date(cached.timestamp));
        setLoading(false);
        setError(null);
        onSuccess?.(cached.data);
        return;
      }

      if (isRefetch) {
        setIsRefetching(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const response = await fetch(
          `/api/woocommerce/analytics?days=${days}&compare=${compareType}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        // Handle both old and new standardized API response format
        const analyticsData: AnalyticsResponse = result.success ? result.data : result;

        if (!isMountedRef.current) return;

        // Update cache
        cache.set(cacheKey, { data: analyticsData, timestamp: Date.now() });

        setData(analyticsData);
        setLastUpdated(new Date());
        setError(null);
        onSuccess?.(analyticsData);
      } catch (err) {
        if (err instanceof Error) {
          // Don't set error if request was aborted
          if (err.name === "AbortError") return;

          if (!isMountedRef.current) return;

          const errorMessage = err.message || "Failed to fetch analytics";
          setError(errorMessage);
          onError?.(err);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
          setIsRefetching(false);
        }
      }
    },
    [days, compareType, cacheTime, onSuccess, onError]
  );

  const refetch = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !refreshInterval) return;

    const interval = setInterval(() => {
      fetchData(true);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    isRefetching,
    lastUpdated,
  };
}

/**
 * Hook for clearing analytics cache
 */
export function useClearAnalyticsCache() {
  return useCallback(() => {
    cache.clear();
  }, []);
}

/**
 * Hook for prefetching analytics data
 */
export function usePrefetchAnalytics() {
  return useCallback((days: number, compareType: "previous" | "year" = "previous") => {
    const cacheKey = `analytics-${days}-${compareType}`;
    const cached = cache.get(cacheKey);

    // Only prefetch if not in cache or cache is stale
    if (!cached || Date.now() - cached.timestamp >= DEFAULT_CACHE_TIME) {
      fetch(`/api/woocommerce/analytics?days=${days}&compare=${compareType}`)
        .then((res) => res.json())
        .then((result) => {
          const analyticsData = result.success ? result.data : result;
          cache.set(cacheKey, { data: analyticsData, timestamp: Date.now() });
        })
        .catch(() => {
          // Silent fail for prefetch
        });
    }
  }, []);
}
