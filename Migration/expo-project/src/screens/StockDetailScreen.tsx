/**
 * Stock Detail Screen
 * Container screen for the stock detail tabs (Price, Sentiment, News)
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { MainTabScreenProps } from '../navigation/navigationTypes';
import { StockDetailNavigator } from '../navigation/StockDetailNavigator';

type Props = MainTabScreenProps<'StockDetail'>;

export default function StockDetailScreen({ route }: Props) {
  const ticker = route.params?.ticker || 'AAPL'; // Default to AAPL for now

  return (
    <View style={styles.container}>
      <StockDetailNavigator ticker={ticker} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
