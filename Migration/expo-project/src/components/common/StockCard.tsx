/**
 * Stock Card Component
 * Displays OHLCV (Open, High, Low, Close, Volume) data for a single stock price entry
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import type { StockDetails } from '@/types/database.types';
import { formatCurrency, formatVolume } from '@/utils/formatting/numberFormatting';
import { formatShortDate } from '@/utils/formatting/dateFormatting';

interface StockCardProps {
  stock: StockDetails;
  onPress?: () => void;
}

export function StockCard({ stock, onPress }: StockCardProps) {
  // Determine if stock went up or down
  const isPositive = stock.close >= stock.open;
  const changeColor = isPositive ? '#4CAF50' : '#F44336';

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <View style={styles.header}>
          <Text style={styles.date}>{formatShortDate(stock.date)}</Text>
          <Text style={[styles.change, { color: changeColor }]}>
            {isPositive ? '▲' : '▼'}
          </Text>
        </View>

        <View style={styles.priceContainer}>
          <View style={styles.priceRow}>
            <Text style={styles.label}>Open:</Text>
            <Text style={styles.value}>{formatCurrency(stock.open)}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.label}>Close:</Text>
            <Text style={[styles.value, { color: changeColor }]}>
              {formatCurrency(stock.close)}
            </Text>
          </View>
        </View>

        <View style={styles.priceContainer}>
          <View style={styles.priceRow}>
            <Text style={styles.label}>High:</Text>
            <Text style={styles.value}>{formatCurrency(stock.high)}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.label}>Low:</Text>
            <Text style={styles.value}>{formatCurrency(stock.low)}</Text>
          </View>
        </View>

        <View style={styles.volumeContainer}>
          <Text style={styles.label}>Volume:</Text>
          <Text style={styles.value}>{formatVolume(stock.volume)}</Text>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 4,
    marginHorizontal: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  change: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  label: {
    fontSize: 14,
    color: '#757575',
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212121',
  },
  volumeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
});
