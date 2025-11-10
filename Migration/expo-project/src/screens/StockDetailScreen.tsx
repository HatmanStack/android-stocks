/**
 * Stock Detail Screen
 * Container screen for the stock detail tabs (Price, Sentiment, News)
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { Appbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import type { MainTabScreenProps } from '../navigation/navigationTypes';
import { StockDetailNavigator } from '../navigation/StockDetailNavigator';
import { useSymbolDetails } from '@/hooks/useSymbolSearch';
import { usePortfolioContext } from '@/contexts/PortfolioContext';
import { useStock } from '@/contexts/StockContext';

type Props = MainTabScreenProps<'StockDetail'>;

export default function StockDetailScreen({ route, navigation }: Props) {
  const ticker = route.params?.ticker || 'AAPL'; // Default to AAPL for now
  const { data: symbolInfo, isLoading } = useSymbolDetails(ticker);
  const { isInPortfolio, addToPortfolio, removeFromPortfolio } = usePortfolioContext();
  const { setSelectedTicker } = useStock();

  const inPortfolio = isInPortfolio(ticker);

  // Update selected ticker when screen loads
  useEffect(() => {
    setSelectedTicker(ticker);
  }, [ticker, setSelectedTicker]);

  const handleTogglePortfolio = useCallback(async () => {
    try {
      if (inPortfolio) {
        Alert.alert(
          'Remove Stock',
          `Remove ${ticker} from your portfolio?`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Remove',
              style: 'destructive',
              onPress: async () => {
                await removeFromPortfolio(ticker);
              },
            },
          ]
        );
      } else {
        // Add to portfolio with basic info
        await addToPortfolio(ticker);
      }
    } catch (error) {
      console.error('[StockDetailScreen] Error toggling portfolio:', error);
      Alert.alert('Error', 'Failed to update portfolio');
    }
  }, [inPortfolio, ticker, addToPortfolio, removeFromPortfolio]);

  const companyName = symbolInfo?.name || ticker;

  return (
    <View style={styles.container}>
      <Appbar.Header elevated>
        <Appbar.Content
          title={ticker}
          subtitle={isLoading ? 'Loading...' : companyName}
        />
        <Appbar.Action
          icon={inPortfolio ? 'star' : 'star-outline'}
          onPress={handleTogglePortfolio}
          color={inPortfolio ? '#FFD700' : '#9E9E9E'}
        />
      </Appbar.Header>

      <View style={styles.content}>
        <StockDetailNavigator ticker={ticker} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
});
