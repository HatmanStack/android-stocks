/**
 * Price Screen
 * Displays OHLCV price data for a stock
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StockDetailTabScreenProps } from '../navigation/navigationTypes';

type Props = StockDetailTabScreenProps<'Price'>;

export default function PriceScreen({ route }: Props) {
  const { ticker } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Price Data</Text>
        <Text style={styles.ticker}>Ticker: {ticker}</Text>
        <Text style={styles.subtitle}>Price screen will be implemented in Phase 5</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ticker: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
