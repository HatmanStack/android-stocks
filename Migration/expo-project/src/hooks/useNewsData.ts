/**
 * React Query Hook for News Article Data
 * Fetches news articles from database with automatic sync triggering
 */

import { useQuery } from '@tanstack/react-query';
import * as NewsRepository from '@/database/repositories/news.repository';
import { syncNewsData } from '@/services/sync/newsDataSync';
import { formatDateForDB } from '@/utils/date/dateUtils';
import { subDays } from 'date-fns';
import type { NewsDetails } from '@/types/database.types';

export interface UseNewsDataOptions {
  /**
   * Number of days of news to fetch
   * Default: 7 days
   */
  days?: number;

  /**
   * Whether to enable the query
   * Default: true
   */
  enabled?: boolean;

  /**
   * Custom stale time in milliseconds
   * Default: uses React Query default (5 minutes)
   */
  staleTime?: number;
}

/**
 * Hook to fetch news articles for a ticker
 * Automatically triggers sync if data is missing from database
 *
 * @param ticker - Stock ticker symbol (e.g., "AAPL")
 * @param options - Optional configuration
 * @returns React Query result with news data, loading state, and error
 *
 * @example
 * ```tsx
 * function NewsList({ ticker }: { ticker: string }) {
 *   const { data: articles, isLoading, error } = useNewsData(ticker, { days: 14 });
 *
 *   if (isLoading) return <ActivityIndicator />;
 *   if (error) return <Text>Error loading news</Text>;
 *
 *   return (
 *     <FlatList
 *       data={articles}
 *       renderItem={({ item }) => <NewsCard article={item} />}
 *     />
 *   );
 * }
 * ```
 */
export function useNewsData(
  ticker: string,
  options: UseNewsDataOptions = {}
) {
  const { days = 7, enabled = true, staleTime } = options;

  return useQuery({
    queryKey: ['newsData', ticker, days],
    queryFn: async (): Promise<NewsDetails[]> => {
      const endDate = formatDateForDB(new Date());
      const startDate = formatDateForDB(subDays(new Date(), days));

      console.log(`[useNewsData] Fetching news for ${ticker} from ${startDate} to ${endDate}`);

      // Try to get from database first
      let data = await NewsRepository.findByTickerAndDateRange(
        ticker,
        startDate,
        endDate
      );

      // If missing data, trigger sync
      if (data.length === 0) {
        console.log(`[useNewsData] No news found, triggering sync for ${ticker}`);
        await syncNewsData(ticker, startDate, endDate);

        // Fetch again after sync
        data = await NewsRepository.findByTickerAndDateRange(
          ticker,
          startDate,
          endDate
        );
      }

      console.log(`[useNewsData] Retrieved ${data.length} news articles for ${ticker}`);
      return data;
    },
    enabled: enabled && !!ticker,
    staleTime,
  });
}

/**
 * Hook to fetch news for a specific date
 * Useful for detailed daily analysis
 *
 * @param ticker - Stock ticker symbol
 * @param date - Date in YYYY-MM-DD format
 * @returns React Query result with news for specific date
 *
 * @example
 * ```tsx
 * function DailyNews({ ticker, date }: { ticker: string; date: string }) {
 *   const { data: articles } = useNewsByDate(ticker, date);
 *
 *   return (
 *     <View>
 *       <Text>News for {date}: {articles?.length || 0} articles</Text>
 *       {articles?.map(article => <NewsCard key={article.id} article={article} />)}
 *     </View>
 *   );
 * }
 * ```
 */
export function useNewsByDate(ticker: string, date: string) {
  return useQuery({
    queryKey: ['newsByDate', ticker, date],
    queryFn: async (): Promise<NewsDetails[]> => {
      console.log(`[useNewsByDate] Fetching news for ${ticker} on ${date}`);

      let data = await NewsRepository.findByTickerAndDateRange(ticker, date, date);

      // If no data, sync for this date
      if (data.length === 0) {
        console.log(`[useNewsByDate] No news found for ${date}, syncing`);
        await syncNewsData(ticker, date, date);
        data = await NewsRepository.findByTickerAndDateRange(ticker, date, date);
      }

      return data;
    },
    enabled: !!ticker && !!date,
  });
}

/**
 * Hook to get news count for a ticker
 * Useful for displaying article count in UI without fetching full articles
 *
 * @param ticker - Stock ticker symbol
 * @param days - Number of days to check
 * @returns React Query result with news count
 */
export function useNewsCount(ticker: string, days: number = 7) {
  return useQuery({
    queryKey: ['newsCount', ticker, days],
    queryFn: async (): Promise<number> => {
      const endDate = formatDateForDB(new Date());
      const startDate = formatDateForDB(subDays(new Date(), days));

      const articles = await NewsRepository.findByTickerAndDateRange(
        ticker,
        startDate,
        endDate
      );

      return articles.length;
    },
    enabled: !!ticker,
  });
}
