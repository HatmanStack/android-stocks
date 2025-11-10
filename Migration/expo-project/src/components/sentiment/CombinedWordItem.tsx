/**
 * Combined Word Item
 * Displays daily aggregated sentiment analysis
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, useTheme, Chip } from 'react-native-paper';
import type { CombinedWordDetails } from '@/types/database.types';
import { formatShortDate } from '@/utils/formatting/dateFormatting';
import { formatPercentage } from '@/utils/formatting/numberFormatting';

interface CombinedWordItemProps {
  item: CombinedWordDetails;
}

export const CombinedWordItem: React.FC<CombinedWordItemProps> = React.memo(({ item }) => {
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

  // Get prediction color
  const getPredictionColor = (value: number): string => {
    return value >= 0 ? '#4CAF50' : '#F44336';
  };

  const sentimentColor = getSentimentColor(item.sentiment);

  return (
    <Card style={styles.card}>
      <Card.Content>
        {/* Date and Sentiment */}
        <View style={styles.header}>
          <Text variant="titleMedium" style={styles.date}>
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

        {/* Word Counts */}
        <View style={styles.wordCounts}>
          <View style={styles.wordCount}>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Positive Words
            </Text>
            <Text variant="titleLarge" style={{ color: '#4CAF50' }}>
              {item.positive}
            </Text>
          </View>

          <View style={styles.wordCount}>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Negative Words
            </Text>
            <Text variant="titleLarge" style={{ color: '#F44336' }}>
              {item.negative}
            </Text>
          </View>

          <View style={styles.wordCount}>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Sentiment Score
            </Text>
            <Text variant="titleLarge" style={{ color: sentimentColor }}>
              {item.sentimentNumber.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Predictions */}
        <View style={styles.predictions}>
          <Text variant="labelMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Predictions
          </Text>
          <View style={styles.predictionRow}>
            <View style={styles.prediction}>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                1-Day
              </Text>
              <Text
                variant="bodyLarge"
                style={{ color: getPredictionColor(item.nextDay), fontWeight: 'bold' }}
              >
                {formatPercentage(item.nextDay)}
              </Text>
            </View>

            <View style={styles.prediction}>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                2-Weeks
              </Text>
              <Text
                variant="bodyLarge"
                style={{ color: getPredictionColor(item.twoWks), fontWeight: 'bold' }}
              >
                {formatPercentage(item.twoWks)}
              </Text>
            </View>

            <View style={styles.prediction}>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                1-Month
              </Text>
              <Text
                variant="bodyLarge"
                style={{ color: getPredictionColor(item.oneMnth), fontWeight: 'bold' }}
              >
                {formatPercentage(item.oneMnth)}
              </Text>
            </View>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
});

CombinedWordItem.displayName = 'CombinedWordItem';

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 12,
    marginVertical: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  date: {
    fontWeight: 'bold',
  },
  sentimentChip: {
    height: 28,
  },
  sentimentText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  wordCounts: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  wordCount: {
    alignItems: 'center',
  },
  predictions: {
    marginTop: 8,
  },
  sectionTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  predictionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  prediction: {
    alignItems: 'center',
  },
});
