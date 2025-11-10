/**
 * News Screen
 * Displays news articles for a stock
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StockDetailTabScreenProps } from '../navigation/navigationTypes';
import { useNewsData } from '@/hooks/useNewsData';
import { useStock } from '@/contexts/StockContext';
import { NewsListItem } from '@/components/news/NewsListItem';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { EmptyState } from '@/components/common/EmptyState';
import type { NewsDetails } from '@/types/database.types';
import { differenceInDays } from 'date-fns';

type Props = StockDetailTabScreenProps<'News'>;

export default function NewsScreen({ route }: Props) {
  const { ticker } = route.params;
  const { startDate, endDate } = useStock();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate number of days for the date range
  const days = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.abs(differenceInDays(end, start)) + 1;
  }, [startDate, endDate]);

  // Fetch news data
  const {
    data: newsData,
    isLoading,
    error,
    refetch,
  } = useNewsData(ticker, { days });

  // Sort news by date descending (most recent first)
  const sortedNewsData = useMemo(() => {
    if (!newsData) return [];
    return [...newsData].sort((a, b) => b.articleDate.localeCompare(a.articleDate));
  }, [newsData]);

  // Handle pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  // Render loading state
  if (isLoading && !isRefreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingIndicator message="Loading news..." />
      </SafeAreaView>
    );
  }

  // Render error state
  if (error && !isRefreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorDisplay
          error={error || 'Failed to load news articles'}
          onRetry={refetch}
        />
      </SafeAreaView>
    );
  }

  // Render empty state
  if (!sortedNewsData || sortedNewsData.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <EmptyState
            message="No news articles available for the selected date range"
            icon="newspaper-outline"
            description="Try expanding your date range to see more articles"
          />
        </View>
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }: { item: NewsDetails }) => (
    <NewsListItem item={item} />
  );

  const keyExtractor = (item: NewsDetails) => `${item.ticker}-${item.id || item.articleUrl}`;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={sortedNewsData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
          />
        }
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={21}
      />
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
