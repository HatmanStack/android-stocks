/**
 * Search Result Item Component
 * Displays a single search result with ticker, company name, and exchange
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import type { SymbolDetails } from '@/types/database.types';

interface SearchResultItemProps {
  symbol: SymbolDetails;
  onPress: () => void;
}

export function SearchResultItem({ symbol, onPress }: SearchResultItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityLabel={`${symbol.ticker}, ${symbol.name}`}
      accessibilityHint="Double tap to view stock details"
      accessibilityRole="button"
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.container}>
            <View style={styles.leftContent}>
              <Text style={styles.ticker} allowFontScaling={true}>
                {symbol.ticker}
              </Text>
              <Text style={styles.name} numberOfLines={1} allowFontScaling={true}>
                {symbol.name}
              </Text>
              {symbol.exchangeCode && (
                <Text style={styles.exchange} allowFontScaling={true}>
                  {symbol.exchangeCode}
                </Text>
              )}
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color="#9E9E9E"
              accessible={false}
            />
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 4,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftContent: {
    flex: 1,
  },
  ticker: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1976D2',
    marginBottom: 4,
  },
  name: {
    fontSize: 14,
    color: '#212121',
    marginBottom: 2,
  },
  exchange: {
    fontSize: 12,
    color: '#757575',
  },
});
