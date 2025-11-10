/**
 * Search Screen
 * Main search interface for looking up stock symbols
 */

import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { MainTabScreenProps } from '../navigation/navigationTypes';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchResultItem } from '@/components/search/SearchResultItem';
import { DateRangePicker } from '@/components/common/DateRangePicker';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { EmptyState } from '@/components/common/EmptyState';
import { useSymbolSearch } from '@/hooks/useSymbolSearch';
import { useStock } from '@/contexts/StockContext';
import { syncAllData } from '@/services/sync/syncOrchestrator';
import type { SymbolDetails } from '@/types/database.types';
import { getDatesInRange } from '@/utils/date/dateUtils';
import { differenceInDays } from 'date-fns';

type Props = MainTabScreenProps<'Search'>;

export default function SearchScreen({ navigation }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const { setSelectedTicker, setDateRange, startDate, endDate } = useStock();

  // Search for symbols
  const {
    data: searchResults = [],
    isLoading,
    error,
    refetch,
  } = useSymbolSearch(searchQuery, {
    minLength: 1,
    enabled: searchQuery.length > 0,
  });

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleDateRangeChange = useCallback((start: string, end: string) => {
    setDateRange(start, end);
  }, [setDateRange]);

  const handleSelectStock = useCallback(async (symbol: SymbolDetails) => {
    try {
      // Update selected ticker in context
      setSelectedTicker(symbol.ticker);

      // Calculate number of days to sync
      const days = Math.abs(differenceInDays(new Date(endDate), new Date(startDate))) + 1;

      // Navigate to Stock Detail screen
      navigation.navigate('StockDetail', { ticker: symbol.ticker });

      // Trigger data sync in background
      setIsSyncing(true);
      setSyncMessage(`Syncing data for ${symbol.ticker}...`);

      console.log(`[SearchScreen] Starting sync for ${symbol.ticker} (${days} days)`);

      await syncAllData(symbol.ticker, days, (progress) => {
        setSyncMessage(`${progress.message} (${progress.progress}/${progress.total})`);
      });

      console.log(`[SearchScreen] Sync complete for ${symbol.ticker}`);
      setIsSyncing(false);
      setSyncMessage('');
    } catch (error) {
      console.error('[SearchScreen] Error syncing data:', error);
      setIsSyncing(false);
      setSyncMessage('');
      // Don't show error - sync failures are handled in individual screens
    }
  }, [setSelectedTicker, startDate, endDate, navigation]);

  const renderSearchResult = useCallback(({ item }: { item: SymbolDetails }) => (
    <SearchResultItem
      symbol={item}
      onPress={() => handleSelectStock(item)}
    />
  ), [handleSelectStock]);

  const renderListHeader = () => (
    <View style={styles.headerContainer}>
      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onDateRangeChange={handleDateRangeChange}
      />
      <View style={styles.divider} />
    </View>
  );

  const renderEmptyState = () => {
    if (searchQuery.length === 0) {
      return (
        <EmptyState
          message="Search for stocks"
          description="Enter a ticker symbol or company name to get started"
          icon="search-outline"
        />
      );
    }

    if (isLoading) {
      return <LoadingIndicator message="Searching..." />;
    }

    if (error) {
      return (
        <ErrorDisplay
          error={error as Error}
          onRetry={refetch}
          title="Search failed"
        />
      );
    }

    return (
      <EmptyState
        message="No results found"
        description={`No stocks found matching "${searchQuery}"`}
        icon="alert-circle-outline"
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <SearchBar onSearchChange={handleSearchChange} />

      <FlatList
        data={searchResults}
        renderItem={renderSearchResult}
        keyExtractor={(item) => item.ticker}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={searchResults.length === 0 ? styles.emptyContent : undefined}
      />

      {isSyncing && (
        <View style={styles.syncOverlay}>
          <LoadingIndicator message={syncMessage} size="small" />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    backgroundColor: '#fff',
  },
  divider: {
    height: 8,
    backgroundColor: '#F5F5F5',
  },
  emptyContent: {
    flex: 1,
  },
  syncOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
