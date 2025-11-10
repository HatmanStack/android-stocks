/**
 * Price List Item
 * Displays a single day's OHLCV price data with color coding
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import type { StockDetails } from '@/types/database.types';
import { formatCurrency, formatVolume } from '@/utils/formatting/numberFormatting';
import { formatShortDate } from '@/utils/formatting/dateFormatting';

interface PriceListItemProps {
  item: StockDetails;
}

export const PriceListItem = React.memo<PriceListItemProps>(({ item }) => {
  const theme = useTheme();

  // Determine row color based on close vs open
  const getRowColor = (): string => {
    if (item.close > item.open) {
      return '#E8F5E9'; // Light green (bullish)
    } else if (item.close < item.open) {
      return '#FFEBEE'; // Light red (bearish)
    }
    return '#F5F5F5'; // Light gray (neutral)
  };

  const getTextColor = (): string => {
    if (item.close > item.open) {
      return '#2E7D32'; // Dark green
    } else if (item.close < item.open) {
      return '#C62828'; // Dark red
    }
    return theme.colors.onSurface;
  };

  const textColor = getTextColor();

  return (
    <View style={[styles.container, { backgroundColor: getRowColor() }]}>
      <View style={styles.row}>
        {/* Date */}
        <View style={styles.dateColumn}>
          <Text variant="bodyMedium" style={[styles.text, { color: textColor }]}>
            {formatShortDate(item.date)}
          </Text>
        </View>

        {/* OHLC Prices */}
        <View style={styles.priceColumn}>
          <Text variant="bodySmall" style={[styles.text, { color: textColor }]}>
            {formatCurrency(item.open)}
          </Text>
        </View>

        <View style={styles.priceColumn}>
          <Text variant="bodySmall" style={[styles.text, { color: textColor, fontWeight: 'bold' }]}>
            {formatCurrency(item.close)}
          </Text>
        </View>

        <View style={styles.priceColumn}>
          <Text variant="bodySmall" style={[styles.text, { color: textColor }]}>
            {formatCurrency(item.high)}
          </Text>
        </View>

        <View style={styles.priceColumn}>
          <Text variant="bodySmall" style={[styles.text, { color: textColor }]}>
            {formatCurrency(item.low)}
          </Text>
        </View>

        {/* Volume */}
        <View style={styles.volumeColumn}>
          <Text variant="bodySmall" style={[styles.text, { color: textColor }]}>
            {formatVolume(item.volume)}
          </Text>
        </View>
      </View>
    </View>
  );
});

PriceListItem.displayName = 'PriceListItem';

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateColumn: {
    flex: 1.5,
    minWidth: 55,
  },
  priceColumn: {
    flex: 1,
    alignItems: 'flex-end',
    minWidth: 55,
  },
  volumeColumn: {
    flex: 1,
    alignItems: 'flex-end',
    minWidth: 50,
  },
  text: {
    fontSize: 12,
  },
});
