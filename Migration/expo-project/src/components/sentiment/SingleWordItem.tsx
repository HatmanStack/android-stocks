/**
 * Single Word Item
 * Displays per-article sentiment analysis
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, useTheme, Chip } from 'react-native-paper';
import type { WordCountDetails } from '@/types/database.types';
import { formatShortDate } from '@/utils/formatting/dateFormatting';

interface SingleWordItemProps {
  item: WordCountDetails;
}

export const SingleWordItem: React.FC<SingleWordItemProps> = React.memo(({ item }) => {
  const theme = useTheme();

  // Get sentiment color
  const getSentimentColor = (sentiment: string): string => {
    switch (sentiment) {
      case 'POS':
        return '#4CAF50'; // Green
      case 'NEG':
        return '#F44336'; // Red
      default:
        return '#9E9E9E'; // Gray
    }
  };

  const sentimentColor = getSentimentColor(item.sentiment);

  // Truncate body text to first 100 characters for preview
  const getTruncatedBody = (body: string): string => {
    if (!body) return 'No content available';
    if (body.length <= 100) return body;
    return `${body.substring(0, 100)}...`;
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        {/* Header: Date and Sentiment */}
        <View style={styles.header}>
          <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>
            {formatShortDate(item.date)}
          </Text>
          <Chip
            mode="flat"
            style={[styles.sentimentChip, { backgroundColor: sentimentColor }]}
            textStyle={styles.sentimentText}
          >
            {item.sentiment}
          </Chip>
        </View>

        {/* Article Preview */}
        <Text
          variant="bodyMedium"
          style={[styles.body, { color: theme.colors.onSurface }]}
          numberOfLines={2}
        >
          {getTruncatedBody(item.body)}
        </Text>

        {/* Word Counts and Score */}
        <View style={styles.metrics}>
          <View style={styles.metric}>
            <Text variant="labelSmall" style={styles.metricLabel}>
              Positive
            </Text>
            <Text variant="bodyLarge" style={[styles.metricValue, { color: '#4CAF50' }]}>
              {item.positive}
            </Text>
          </View>

          <View style={styles.metric}>
            <Text variant="labelSmall" style={styles.metricLabel}>
              Negative
            </Text>
            <Text variant="bodyLarge" style={[styles.metricValue, { color: '#F44336' }]}>
              {item.negative}
            </Text>
          </View>

          <View style={styles.metric}>
            <Text variant="labelSmall" style={styles.metricLabel}>
              Score
            </Text>
            <Text variant="bodyLarge" style={[styles.metricValue, { color: sentimentColor }]}>
              {item.sentimentNumber.toFixed(2)}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
});

SingleWordItem.displayName = 'SingleWordItem';

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 12,
    marginVertical: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sentimentChip: {
    height: 28,
  },
  sentimentText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  body: {
    marginBottom: 12,
    lineHeight: 20,
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    color: '#757575',
    marginBottom: 4,
  },
  metricValue: {
    fontWeight: 'bold',
  },
});
