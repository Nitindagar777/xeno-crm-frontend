import { useQuery } from '@tanstack/react-query';

/**
 * Custom polling hook built on top of TanStack React Query.
 * @param {Object} options Hook configuration options
 * @param {Array} options.queryKey React Query query key
 * @param {Function} options.queryFn Fetcher function returning a promise
 * @param {number} options.interval Polling frequency in milliseconds (default 3000ms)
 * @param {boolean} options.enabled If false, polling is paused
 */
export default function usePolling({ queryKey, queryFn, interval = 3000, enabled = true }) {
  return useQuery({
    queryKey,
    queryFn,
    refetchInterval: enabled ? interval : false,
    refetchIntervalInBackground: true,
    enabled,
    refetchOnWindowFocus: true
  });
}
