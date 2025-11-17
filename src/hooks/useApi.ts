"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ApiSuccessResponse, ApiErrorResponse } from "@/lib/api-response";

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: ApiErrorResponse["error"]) => void;
  retries?: number;
  retryDelay?: number;
  cache?: boolean;
  cacheTime?: number;
}

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiErrorResponse["error"] | null;
}

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

// Simple in-memory cache
const apiCache = new Map<string, { data: unknown; expiry: number }>();

function getCacheKey(url: string, options?: RequestInit): string {
  return `${options?.method || "GET"}:${url}:${JSON.stringify(options?.body || "")}`;
}

async function fetchWithRetry<T>(
  url: string,
  options?: RequestInit,
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(JSON.stringify(data));
      }

      return data;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown error");

      if (attempt < retries) {
        // Exponential backoff
        const backoffDelay = delay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, backoffDelay));
      }
    }
  }

  throw lastError;
}

export function useApi<T>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(
    async (
      url: string,
      method: HttpMethod = "GET",
      body?: unknown,
      options?: UseApiOptions<T>
    ) => {
      // Cancel previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      // Check cache for GET requests
      if (method === "GET" && options?.cache !== false) {
        const cacheKey = getCacheKey(url);
        const cached = apiCache.get(cacheKey);

        if (cached && cached.expiry > Date.now()) {
          const responseData = cached.data as ApiSuccessResponse<T>;
          setState({ data: responseData.data, loading: false, error: null });
          options?.onSuccess?.(responseData.data);
          return responseData.data;
        }
      }

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const fetchOptions: RequestInit = {
          method,
          signal: abortControllerRef.current.signal,
          headers: {
            "Content-Type": "application/json",
          },
        };

        if (body && method !== "GET") {
          fetchOptions.body = JSON.stringify(body);
        }

        const response = await fetchWithRetry<ApiSuccessResponse<T> | ApiErrorResponse>(
          url,
          fetchOptions,
          options?.retries ?? 3,
          options?.retryDelay ?? 1000
        );

        if ("success" in response && response.success) {
          // Cache GET responses
          if (method === "GET" && options?.cache !== false) {
            const cacheKey = getCacheKey(url);
            const cacheTime = options?.cacheTime ?? 60000; // 1 minute default
            apiCache.set(cacheKey, { data: response, expiry: Date.now() + cacheTime });
          }

          setState({ data: response.data, loading: false, error: null });
          options?.onSuccess?.(response.data);
          return response.data;
        } else if ("success" in response && !response.success) {
          const errorResponse = response as ApiErrorResponse;
          setState({ data: null, loading: false, error: errorResponse.error });
          options?.onError?.(errorResponse.error);
          throw new Error(errorResponse.error.message);
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return null;
        }

        let apiError: ApiErrorResponse["error"];

        try {
          const parsed = JSON.parse((error as Error).message);
          if (parsed.error) {
            apiError = parsed.error;
          } else {
            apiError = { code: "UNKNOWN_ERROR", message: (error as Error).message };
          }
        } catch {
          apiError = {
            code: "NETWORK_ERROR",
            message: error instanceof Error ? error.message : "Network request failed",
          };
        }

        setState({ data: null, loading: false, error: apiError });
        options?.onError?.(apiError);
        throw error;
      }

      return null;
    },
    []
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    execute,
    reset,
    get: (url: string, options?: UseApiOptions<T>) => execute(url, "GET", undefined, options),
    post: (url: string, body: unknown, options?: UseApiOptions<T>) =>
      execute(url, "POST", body, options),
    put: (url: string, body: unknown, options?: UseApiOptions<T>) =>
      execute(url, "PUT", body, options),
    delete: (url: string, options?: UseApiOptions<T>) => execute(url, "DELETE", undefined, options),
  };
}

// Specialized hooks for common operations
export function useAnalytics(days: number = 30) {
  const api = useApi<{
    metrics: Record<string, unknown>;
    salesData: Record<string, unknown>;
    customerData: Record<string, unknown>;
    topProducts: unknown[];
    revenueByCategory: unknown[];
    currency: string;
  }>();

  const fetch = useCallback(() => {
    return api.get(`/api/woocommerce/analytics?days=${days}`, { cacheTime: 300000 }); // 5 min cache
  }, [api, days]);

  return { ...api, fetch };
}

export function useOrders() {
  const api = useApi<{ orders: unknown[] }>();

  const fetch = useCallback(
    (params?: { status?: string; after?: string; before?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.status) searchParams.set("status", params.status);
      if (params?.after) searchParams.set("after", params.after);
      if (params?.before) searchParams.set("before", params.before);

      const query = searchParams.toString();
      return api.get(`/api/woocommerce/orders${query ? `?${query}` : ""}`);
    },
    [api]
  );

  return { ...api, fetch };
}

export function useCustomers() {
  const api = useApi<{ customers: unknown[] }>();

  const fetch = useCallback(() => {
    return api.get("/api/woocommerce/customers");
  }, [api]);

  return { ...api, fetch };
}

export function useProducts() {
  const api = useApi<{ products: unknown[] }>();

  const fetch = useCallback(() => {
    return api.get("/api/woocommerce/products");
  }, [api]);

  return { ...api, fetch };
}

// Clear cache utility
export function clearApiCache(pattern?: string) {
  if (pattern) {
    for (const key of apiCache.keys()) {
      if (key.includes(pattern)) {
        apiCache.delete(key);
      }
    }
  } else {
    apiCache.clear();
  }
}
