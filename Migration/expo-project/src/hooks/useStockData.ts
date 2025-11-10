/**
 * React Query Hook for Stock Price Data
 * Fetches stock prices from database with automatic sync triggering
 */

import { useQuery } from '@tanstack/react-query';
import * as StockRepository from '@/database/repositories/stock.repository';
import { syncStockData } from '@/services/sync/stockDataSync';
import { formatDateForDB } from '@/utils/date/dateUtils';
import { subDays } from 'date-fns';
import type { StockDetails } from '@/types/database.types';

export interface UseStockDataOptions {
  /**
   * Number of days of historical data to fetch
   * Default: 30 days
   */
  days?: number;

  /**
   * Whether to enable the query
   * Default: true (query runs automatically)
   */
  enabled?: boolean;

  /**
   * Custom stale time in milliseconds
   * Default: uses React Query default (5 minutes)
   */
  staleTime?: number;
}

/**
 * Hook to fetch stock price data for a ticker
 * Automatically triggers sync if data is missing from database
 *
 * @param ticker - Stock ticker symbol (e.g., "AAPL")
 * @param options - Optional configuration
 * @returns React Query result with stock data, loading state, and error
 *
 * @example
 * ```tsx
 * function StockChart({ ticker }: { ticker: string }) {
 *   const { data, isLoading, error, refetch } = useStockData(ticker, { days: 90 });
 *
 *   if (isLoading) return <Text>Loading...</Text>;
 *   if (error) return <Text>Error: {error.message}</Text>;
 *
 *   return <LineChart data={data} />;
 * }
 * ```
 */
export function useStockData(
  ticker: string,
  options: UseStockDataOptions = {}
) {
  const { days = 30, enabled = true, staleTime } = options;

  return useQuery({
    queryKey: ['stockData', ticker, days],
    queryFn: async (): Promise<StockDetails[]> => {
      const endDate = formatDateForDB(new Date());
      const startDate = formatDateForDB(subDays(new Date(), days));

      console.log(`[useStockData] Fetching stock data for ${ticker} from ${startDate} to ${endDate}`);

      // Try to get from database first
      let data = await StockRepository.findByTickerAndDateRange(
        ticker,
        startDate,
        endDate
      );

      // If missing or insufficient data, trigger sync
      if (data.length === 0) {
        console.log(`[useStockData] No data found, triggering sync for ${ticker}`);
        await syncStockData(ticker, startDate, endDate);

        // Fetch again after sync
        data = await StockRepository.findByTickerAndDateRange(
          ticker,
          startDate,
          endDate
        );
      }

      console.log(`[useStockData] Retrieved ${data.length} stock records for ${ticker}`);
      return data;
    },
    enabled: enabled && !!ticker, // Only run if ticker is provided and enabled
    staleTime,
  });
}

/**
 * Hook to fetch latest stock price for a ticker
 * Useful for displaying current price in UI
 *
 * @param ticker - Stock ticker symbol
 * @returns React Query result with latest stock price
 *
 * @example
 * ```tsx
 * function StockPrice({ ticker }: { ticker: string }) {
 *   const { data: latestPrice, isLoading } = useLatestStockPrice(ticker);
 *
 *   if (isLoading) return <Text>--</Text>;
 *
 *   return <Text>${latestPrice?.close.toFixed(2)}</Text>;
 * }
 * ```
 */
export function useLatestStockPrice(ticker: string) {
  return useQuery({
    queryKey: ['latestStockPrice', ticker],
    queryFn: async (): Promise<StockDetails | null> => {
      const latest = await StockRepository.findLatestByTicker(ticker);

      // If no data exists, trigger sync for last 7 days
      if (!latest) {
        console.log(`[useLatestStockPrice] No data found for ${ticker}, syncing last 7 days`);
        const endDate = formatDateForDB(new Date());
        const startDate = formatDateForDB(subDays(new Date(), 7));
        await syncStockData(ticker, startDate, endDate);

        return await StockRepository.findLatestByTicker(ticker);
      }

      return latest;
    },
    enabled: !!ticker,
  });
}
