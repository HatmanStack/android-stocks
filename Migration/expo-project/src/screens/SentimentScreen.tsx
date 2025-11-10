/**
 * Sentiment Screen
 * Displays sentiment analysis data for a stock
 */

import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StockDetailTabScreenProps } from '../navigation/navigationTypes';
import { useSentimentData, useArticleSentiment } from '@/hooks/useSentimentData';
import { useStock } from '@/contexts/StockContext';
import { SentimentToggle } from '@/components/sentiment/SentimentToggle';
import { CombinedWordItem } from '@/components/sentiment/CombinedWordItem';
import { SingleWordItem } from '@/components/sentiment/SingleWordItem';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { ErrorDisplay } from '@/components/common/ErrorDisplay';
import { EmptyState } from '@/components/common/EmptyState';
import type { CombinedWordDetails, WordCountDetails } from '@/types/database.types';
import { differenceInDays } from 'date-fns';

type Props = StockDetailTabScreenProps<'Sentiment'>;

export default function SentimentScreen({ route }: Props) {
  const { ticker } = route.params;
  const { startDate, endDate } = useStock();
  const [viewMode, setViewMode] = useState<'aggregate' | 'individual'>('aggregate');

  // Calculate number of days for the date range
  const days = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.abs(differenceInDays(end, start)) + 1;
  }, [startDate, endDate]);

  // Fetch aggregated sentiment data
  const {
    data: aggregateData,
    isLoading: isAggregateLoading,
    error: aggregateError,
    refetch: refetchAggregate,
  } = useSentimentData(ticker, { days });

  // Fetch individual article sentiment
  const {
    data: articleData,
    isLoading: isArticleLoading,
    error: articleError,
    refetch: refetchArticle,
  } = useArticleSentiment(ticker, { days });

  // Sort data by date descending (most recent first)
  const sortedAggregateData = useMemo(() => {
    if (!aggregateData) return [];
    return [...aggregateData].sort((a, b) => b.date.localeCompare(a.date));
  }, [aggregateData]);

  const sortedArticleData = useMemo(() => {
    if (!articleData) return [];
    return [...articleData].sort((a, b) => b.date.localeCompare(a.date));
  }, [articleData]);

  // Determine loading and error states based on current view
  const isLoading = viewMode === 'aggregate' ? isAggregateLoading : isArticleLoading;
  const error = viewMode === 'aggregate' ? aggregateError : articleError;
  const refetch = viewMode === 'aggregate' ? refetchAggregate : refetchArticle;
  const data = viewMode === 'aggregate' ? sortedAggregateData : sortedArticleData;

  // Render loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <SentimentToggle value={viewMode} onValueChange={setViewMode} />
        <LoadingIndicator message="Loading sentiment data..." />
      </SafeAreaView>
    );
  }

  // Render error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <SentimentToggle value={viewMode} onValueChange={setViewMode} />
        <ErrorDisplay
          error={error || 'Failed to load sentiment data'}
          onRetry={refetch}
        />
      </SafeAreaView>
    );
  }

  // Render empty state
  if (!data || data.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <SentimentToggle value={viewMode} onValueChange={setViewMode} />
        <View style={styles.emptyContainer}>
          <EmptyState
            message={
              viewMode === 'aggregate'
                ? 'No aggregated sentiment data available'
                : 'No article sentiment data available'
            }
            icon="document-text-outline"
          />
        </View>
      </SafeAreaView>
    );
  }

  const renderAggregateItem = ({ item }: { item: CombinedWordDetails }) => (
    <CombinedWordItem item={item} />
  );

  const renderArticleItem = ({ item }: { item: WordCountDetails }) => (
    <SingleWordItem item={item} />
  );

  const keyExtractorAggregate = (item: CombinedWordDetails) => `${item.ticker}-${item.date}`;
  const keyExtractorArticle = (item: WordCountDetails) => `${item.ticker}-${item.hash}`;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <SentimentToggle value={viewMode} onValueChange={setViewMode} />
      {viewMode === 'aggregate' ? (
        <FlatList
          data={sortedAggregateData}
          renderItem={renderAggregateItem}
          keyExtractor={keyExtractorAggregate}
          contentContainerStyle={styles.listContent}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
          windowSize={21}
        />
      ) : (
        <FlatList
          data={sortedArticleData}
          renderItem={renderArticleItem}
          keyExtractor={keyExtractorArticle}
          contentContainerStyle={styles.listContent}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
          windowSize={21}
        />
      )}
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
