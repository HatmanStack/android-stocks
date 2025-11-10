/**
 * Portfolio Item Component
 * Displays a stock in the portfolio with predictions and color coding
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, IconButton } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import type { PortfolioDetails } from '@/types/database.types';

interface PortfolioItemProps {
  item: PortfolioDetails;
  onPress: () => void;
  onDelete: () => void;
}

export function PortfolioItem({ item, onPress, onDelete }: PortfolioItemProps) {
  const getPredictionColor = (value: string | number): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '#9E9E9E';
    return numValue >= 0 ? '#4CAF50' : '#F44336';
  };

  const formatPrediction = (value: string | number): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return 'N/A';
    const sign = numValue >= 0 ? '+' : '';
    return `${sign}${numValue.toFixed(2)}%`;
  };

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <View style={styles.container}>
          <View style={styles.leftContent}>
            <View style={styles.headerRow}>
              <Text style={styles.ticker}>{item.ticker}</Text>
              <IconButton
                icon="close-circle"
                size={20}
                iconColor="#9E9E9E"
                onPress={onDelete}
                style={styles.deleteButton}
              />
            </View>
            {item.name && (
              <Text style={styles.name} numberOfLines={1}>
                {item.name}
              </Text>
            )}
            <View style={styles.predictionsContainer}>
              <View style={styles.predictionItem}>
                <Text style={styles.predictionLabel}>1 Day</Text>
                <Text
                  style={[
                    styles.predictionValue,
                    { color: getPredictionColor(item.next) },
                  ]}
                >
                  {formatPrediction(item.next)}
                </Text>
              </View>
              <View style={styles.predictionItem}>
                <Text style={styles.predictionLabel}>2 Weeks</Text>
                <Text
                  style={[
                    styles.predictionValue,
                    { color: getPredictionColor(item.wks) },
                  ]}
                >
                  {formatPrediction(item.wks)}
                </Text>
              </View>
              <View style={styles.predictionItem}>
                <Text style={styles.predictionLabel}>1 Month</Text>
                <Text
                  style={[
                    styles.predictionValue,
                    { color: getPredictionColor(item.mnth) },
                  ]}
                >
                  {formatPrediction(item.mnth)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 4,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftContent: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  ticker: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1976D2',
  },
  deleteButton: {
    margin: 0,
  },
  name: {
    fontSize: 14,
    color: '#212121',
    marginBottom: 8,
  },
  predictionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  predictionItem: {
    flex: 1,
  },
  predictionLabel: {
    fontSize: 11,
    color: '#757575',
    marginBottom: 2,
  },
  predictionValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});
