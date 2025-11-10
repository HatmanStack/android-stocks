/**
 * Portfolio Screen
 * Displays user's saved stocks
 */

import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { MainTabScreenProps } from '../navigation/navigationTypes';
import { PortfolioItem } from '@/components/portfolio/PortfolioItem';
import { AddStockButton } from '@/components/portfolio/AddStockButton';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { EmptyState } from '@/components/common/EmptyState';
import { usePortfolioContext } from '@/contexts/PortfolioContext';
import { useStock } from '@/contexts/StockContext';
import { syncAllData } from '@/services/sync/syncOrchestrator';
import type { PortfolioDetails } from '@/types/database.types';
import { differenceInDays } from 'date-fns';

type Props = MainTabScreenProps<'Portfolio'>;

export default function PortfolioScreen({ navigation }: Props) {
  const [refreshing, setRefreshing] = useState(false);
  const { portfolio, isLoading, error, refetch, removeFromPortfolio } = usePortfolioContext();
  const { setSelectedTicker, startDate, endDate } = useStock();

  const handleStockPress = useCallback((item: PortfolioDetails) => {
    setSelectedTicker(item.ticker);
    navigation.navigate('StockDetail', { ticker: item.ticker });
  }, [setSelectedTicker, navigation]);

  const handleDeleteStock = useCallback((item: PortfolioDetails) => {
    Alert.alert(
      'Remove Stock',
      `Remove ${item.ticker} from your portfolio?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFromPortfolio(item.ticker);
            } catch (error) {
              console.error('[PortfolioScreen] Error removing stock:', error);
              Alert.alert('Error', 'Failed to remove stock from portfolio');
            }
          },
        },
      ]
    );
  }, [removeFromPortfolio]);

  const handleAddStock = useCallback(() => {
    navigation.navigate('Search');
  }, [navigation]);

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);

      // Calculate number of days to sync
      const days = Math.abs(differenceInDays(new Date(endDate), new Date(startDate))) + 1;

      // Refresh all stocks in portfolio
      console.log(`[PortfolioScreen] Refreshing ${portfolio.length} stocks`);

      for (const item of portfolio) {
        try {
          await syncAllData(item.ticker, days);
          console.log(`[PortfolioScreen] Refreshed ${item.ticker}`);
        } catch (error) {
          console.error(`[PortfolioScreen] Error refreshing ${item.ticker}:`, error);
        }
      }

      // Refetch portfolio data
      await refetch();

      setRefreshing(false);
    } catch (error) {
      console.error('[PortfolioScreen] Error during refresh:', error);
      setRefreshing(false);
    }
  }, [portfolio, startDate, endDate, refetch]);

  const renderPortfolioItem = useCallback(({ item }: { item: PortfolioDetails }) => (
    <PortfolioItem
      item={item}
      onPress={() => handleStockPress(item)}
      onDelete={() => handleDeleteStock(item)}
    />
  ), [handleStockPress, handleDeleteStock]);

  const renderEmptyState = () => (
    <EmptyState
      message="No stocks in portfolio"
      description="Add stocks to your watchlist to track their performance"
      icon="briefcase-outline"
    />
  );

  if (isLoading) {
    return <LoadingIndicator message="Loading portfolio..." />;
  }

  if (error) {
    return (
      <ErrorDisplay
        error={error as Error}
        onRetry={refetch}
        title="Failed to load portfolio"
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={portfolio}
        renderItem={renderPortfolioItem}
        keyExtractor={(item) => item.ticker}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={portfolio.length === 0 ? styles.emptyContent : styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#1976D2']}
          />
        }
      />
      <AddStockButton onPress={handleAddStock} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyContent: {
    flex: 1,
  },
});
