/**
 * Sentiment Chip Component
 * Small chip displaying sentiment label (POS/NEG/NEUT) with color coding
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type SentimentLabel = 'POS' | 'NEG' | 'NEUT';

interface SentimentChipProps {
  sentiment: SentimentLabel;
  score?: number;
  size?: 'small' | 'medium' | 'large';
}

export function SentimentChip({ sentiment, score, size = 'medium' }: SentimentChipProps) {
  const getColorForSentiment = (label: SentimentLabel) => {
    switch (label) {
      case 'POS':
        return { bg: '#E8F5E9', text: '#2E7D32' };
      case 'NEG':
        return { bg: '#FFEBEE', text: '#C62828' };
      case 'NEUT':
        return { bg: '#F5F5F5', text: '#616161' };
      default:
        return { bg: '#F5F5F5', text: '#616161' };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { paddingH: 8, paddingV: 4, fontSize: 11 };
      case 'large':
        return { paddingH: 16, paddingV: 8, fontSize: 16 };
      default:
        return { paddingH: 12, paddingV: 6, fontSize: 14 };
    }
  };

  const colors = getColorForSentiment(sentiment);
  const sizeStyles = getSizeStyles();

  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: colors.bg,
          paddingHorizontal: sizeStyles.paddingH,
          paddingVertical: sizeStyles.paddingV,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: colors.text,
            fontSize: sizeStyles.fontSize,
          },
        ]}
      >
        {sentiment}
        {score !== undefined && ` (${score.toFixed(2)})`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
  },
});
