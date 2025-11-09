/**
 * React Query Hook for Portfolio Management
 * Fetches user's portfolio (watchlist) with add/remove mutations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as PortfolioRepository from '@/database/repositories/portfolio.repository';
import type { PortfolioDetails } from '@/types/database.types';

/**
 * Hook to manage user's portfolio (watchlist)
 * Provides portfolio data and add/remove functions
 *
 * @returns Portfolio data, loading state, and mutation functions
 *
 * @example
 * ```tsx
 * function WatchlistScreen() {
 *   const {
 *     portfolio,
 *     isLoading,
 *     error,
 *     addToPortfolio,
 *     removeFromPortfolio,
 *     updatePortfolio,
 *   } = usePortfolio();
 *
 *   const handleAddStock = async () => {
 *     await addToPortfolio.mutateAsync({
 *       ticker: 'AAPL',
 *       name: 'Apple Inc.',
 *       next: '+2.5%',
 *       wks: '+5.0%',
 *       mnth: '+10.0%',
 *     });
 *   };
 *
 *   const handleRemoveStock = async (ticker: string) => {
 *     await removeFromPortfolio.mutateAsync(ticker);
 *   };
 *
 *   if (isLoading) return <ActivityIndicator />;
 *
 *   return (
 *     <FlatList
 *       data={portfolio}
 *       renderItem={({ item }) => (
 *         <StockCard
 *           stock={item}
 *           onRemove={() => handleRemoveStock(item.ticker)}
 *         />
 *       )}
 *     />
 *   );
 * }
 * ```
 */
export function usePortfolio() {
  const queryClient = useQueryClient();

  // Query to fetch all portfolio items
  const {
    data: portfolio,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['portfolio'],
    queryFn: async (): Promise<PortfolioDetails[]> => {
      console.log('[usePortfolio] Fetching portfolio');
      const data = await PortfolioRepository.findAll();
      console.log(`[usePortfolio] Retrieved ${data.length} portfolio items`);
      return data;
    },
  });

  // Mutation to add stock to portfolio
  const addToPortfolio = useMutation({
    mutationFn: async (stock: PortfolioDetails) => {
      console.log(`[usePortfolio] Adding ${stock.ticker} to portfolio`);
      return await PortfolioRepository.upsert(stock);
    },
    onSuccess: (_, variables) => {
      console.log(`[usePortfolio] Successfully added ${variables.ticker}`);
      // Invalidate and refetch portfolio
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
    onError: (error, variables) => {
      console.error(`[usePortfolio] Error adding ${variables.ticker}:`, error);
    },
  });

  // Mutation to remove stock from portfolio
  const removeFromPortfolio = useMutation({
    mutationFn: async (ticker: string) => {
      console.log(`[usePortfolio] Removing ${ticker} from portfolio`);
      return await PortfolioRepository.deleteByTicker(ticker);
    },
    onSuccess: (_, ticker) => {
      console.log(`[usePortfolio] Successfully removed ${ticker}`);
      // Invalidate and refetch portfolio
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
    onError: (error, ticker) => {
      console.error(`[usePortfolio] Error removing ${ticker}:`, error);
    },
  });

  // Mutation to update portfolio item (e.g., update predictions)
  const updatePortfolio = useMutation({
    mutationFn: async (stock: PortfolioDetails) => {
      console.log(`[usePortfolio] Updating ${stock.ticker} in portfolio`);
      return await PortfolioRepository.upsert(stock);
    },
    onSuccess: (_, variables) => {
      console.log(`[usePortfolio] Successfully updated ${variables.ticker}`);
      // Invalidate and refetch portfolio
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
    onError: (error, variables) => {
      console.error(`[usePortfolio] Error updating ${variables.ticker}:`, error);
    },
  });

  return {
    portfolio: portfolio || [],
    isLoading,
    error,
    refetch,
    addToPortfolio,
    removeFromPortfolio,
    updatePortfolio,
  };
}

/**
 * Hook to check if a ticker is in the portfolio
 * Useful for toggle buttons and conditional UI
 *
 * @param ticker - Stock ticker symbol
 * @returns React Query result with boolean indicating if ticker is in portfolio
 *
 * @example
 * ```tsx
 * function AddToWatchlistButton({ ticker }: { ticker: string }) {
 *   const { data: isInPortfolio, isLoading } = useIsInPortfolio(ticker);
 *   const { addToPortfolio, removeFromPortfolio } = usePortfolio();
 *
 *   const handleToggle = () => {
 *     if (isInPortfolio) {
 *       removeFromPortfolio.mutate(ticker);
 *     } else {
 *       addToPortfolio.mutate({ ticker, name: 'Stock Name', ... });
 *     }
 *   };
 *
 *   return (
 *     <Button onPress={handleToggle}>
 *       {isInPortfolio ? 'Remove from Watchlist' : 'Add to Watchlist'}
 *     </Button>
 *   );
 * }
 * ```
 */
export function useIsInPortfolio(ticker: string) {
  return useQuery({
    queryKey: ['isInPortfolio', ticker],
    queryFn: async (): Promise<boolean> => {
      const stock = await PortfolioRepository.findByTicker(ticker);
      return !!stock;
    },
    enabled: !!ticker,
  });
}

/**
 * Hook to get portfolio count
 * Useful for displaying badge count in navigation
 *
 * @returns React Query result with portfolio count
 *
 * @example
 * ```tsx
 * function PortfolioTab() {
 *   const { data: count } = usePortfolioCount();
 *
 *   return (
 *     <Tab.Screen
 *       name="Portfolio"
 *       component={PortfolioScreen}
 *       options={{
 *         tabBarBadge: count > 0 ? count : undefined,
 *       }}
 *     />
 *   );
 * }
 * ```
 */
export function usePortfolioCount() {
  return useQuery({
    queryKey: ['portfolioCount'],
    queryFn: async (): Promise<number> => {
      const portfolio = await PortfolioRepository.findAll();
      return portfolio.length;
    },
  });
}
