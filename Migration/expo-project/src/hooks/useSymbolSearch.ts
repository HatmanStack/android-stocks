/**
 * React Query Hook for Symbol Search
 * Searches for stock symbols/companies in local database and via API
 */

import { useQuery } from '@tanstack/react-query';
import * as SymbolRepository from '@/database/repositories/symbol.repository';
import { fetchSymbolMetadata } from '@/services/api/tiingo.service';
import type { SymbolDetails } from '@/types/database.types';

export interface UseSymbolSearchOptions {
  /**
   * Minimum search query length before triggering search
   * Default: 1 character
   */
  minLength?: number;

  /**
   * Whether to enable the query
   * Default: true
   */
  enabled?: boolean;

  /**
   * Custom stale time in milliseconds
   * Default: 1 hour (search results change infrequently)
   */
  staleTime?: number;
}

/**
 * Hook to search for stock symbols by ticker or company name
 * Searches local database first, falls back to API if needed
 *
 * @param query - Search query (ticker or company name)
 * @param options - Optional configuration
 * @returns React Query result with matching symbols
 *
 * @example
 * ```tsx
 * function StockSearchScreen() {
 *   const [searchQuery, setSearchQuery] = useState('');
 *   const { data: results, isLoading } = useSymbolSearch(searchQuery);
 *
 *   return (
 *     <View>
 *       <TextInput
 *         placeholder="Search stocks..."
 *         value={searchQuery}
 *         onChangeText={setSearchQuery}
 *       />
 *       {isLoading && <ActivityIndicator />}
 *       <FlatList
 *         data={results}
 *         renderItem={({ item }) => (
 *           <TouchableOpacity onPress={() => navigateToStock(item.ticker)}>
 *             <Text>{item.ticker} - {item.name}</Text>
 *           </TouchableOpacity>
 *         )}
 *       />
 *     </View>
 *   );
 * }
 * ```
 */
export function useSymbolSearch(
  query: string,
  options: UseSymbolSearchOptions = {}
) {
  const { minLength = 1, enabled = true, staleTime = 1000 * 60 * 60 } = options;

  const normalizedQuery = query.trim().toUpperCase();

  return useQuery({
    queryKey: ['symbolSearch', normalizedQuery],
    queryFn: async (): Promise<SymbolDetails[]> => {
      console.log(`[useSymbolSearch] Searching for: ${normalizedQuery}`);

      // Search local database first
      // Get all symbols and filter by ticker or name
      const allSymbols = await SymbolRepository.findAll();
      const localResults = allSymbols.filter(
        (symbol) =>
          symbol.ticker.toUpperCase().includes(normalizedQuery) ||
          symbol.name.toUpperCase().includes(normalizedQuery)
      );

      if (localResults.length > 0) {
        console.log(`[useSymbolSearch] Found ${localResults.length} local results`);
        return localResults;
      }

      // No local results - assume it's a ticker and try fetching from API
      // This will also store it in database for future searches
      console.log(`[useSymbolSearch] No local results, trying API for ${normalizedQuery}`);

      try {
        const metadata = await fetchSymbolMetadata(normalizedQuery);

        // Store in database
        const symbolDetails: Omit<SymbolDetails, 'id'> = {
          ticker: metadata.ticker,
          name: metadata.name,
          exchangeCode: metadata.exchangeCode,
          startDate: metadata.startDate,
          endDate: metadata.endDate,
          longDescription: metadata.description,
        };

        await SymbolRepository.insert(symbolDetails);

        // Return as array
        return [symbolDetails as SymbolDetails];
      } catch (error) {
        console.warn(`[useSymbolSearch] Ticker ${normalizedQuery} not found:`, error);
        return [];
      }
    },
    enabled: enabled && normalizedQuery.length >= minLength,
    staleTime,
  });
}

/**
 * Hook to get symbol details for a specific ticker
 * Fetches from local database or API if not cached
 *
 * @param ticker - Stock ticker symbol
 * @returns React Query result with symbol details
 *
 * @example
 * ```tsx
 * function StockHeader({ ticker }: { ticker: string }) {
 *   const { data: symbol, isLoading } = useSymbolDetails(ticker);
 *
 *   if (isLoading) return <Text>Loading...</Text>;
 *
 *   return (
 *     <View>
 *       <Text>{symbol?.ticker}</Text>
 *       <Text>{symbol?.name}</Text>
 *       <Text>{symbol?.exchangeCode}</Text>
 *     </View>
 *   );
 * }
 * ```
 */
export function useSymbolDetails(ticker: string) {
  return useQuery({
    queryKey: ['symbolDetails', ticker],
    queryFn: async (): Promise<SymbolDetails | null> => {
      console.log(`[useSymbolDetails] Fetching details for ${ticker}`);

      // Try local database first
      let symbol = await SymbolRepository.findByTicker(ticker);

      if (symbol) {
        return symbol;
      }

      // Not in database - fetch from API
      console.log(`[useSymbolDetails] ${ticker} not in database, fetching from API`);

      try {
        const metadata = await fetchSymbolMetadata(ticker);

        // Store in database for future use
        const symbolDetails: Omit<SymbolDetails, 'id'> = {
          ticker: metadata.ticker,
          name: metadata.name,
          exchangeCode: metadata.exchangeCode,
          startDate: metadata.startDate,
          endDate: metadata.endDate,
          longDescription: metadata.description,
        };

        await SymbolRepository.insert(symbolDetails);

        return symbolDetails as SymbolDetails;
      } catch (error) {
        console.error(`[useSymbolDetails] Error fetching ${ticker}:`, error);
        return null;
      }
    },
    enabled: !!ticker,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours - symbol details rarely change
  });
}

/**
 * Hook to get all cached symbols
 * Useful for displaying autocomplete suggestions
 *
 * @returns React Query result with all cached symbols
 *
 * @example
 * ```tsx
 * function PopularStocksSection() {
 *   const { data: symbols } = useAllSymbols();
 *
 *   return (
 *     <ScrollView horizontal>
 *       {symbols?.slice(0, 10).map(symbol => (
 *         <Chip key={symbol.ticker} onPress={() => navigate(symbol.ticker)}>
 *           {symbol.ticker}
 *         </Chip>
 *       ))}
 *     </ScrollView>
 *   );
 * }
 * ```
 */
export function useAllSymbols() {
  return useQuery({
    queryKey: ['allSymbols'],
    queryFn: async (): Promise<SymbolDetails[]> => {
      console.log('[useAllSymbols] Fetching all cached symbols');
      return await SymbolRepository.findAll();
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}
