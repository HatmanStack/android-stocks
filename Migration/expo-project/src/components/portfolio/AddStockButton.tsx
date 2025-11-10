/**
 * Add Stock Button Component
 * Floating action button to add stocks to portfolio
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { FAB } from 'react-native-paper';

interface AddStockButtonProps {
  onPress: () => void;
}

export function AddStockButton({ onPress }: AddStockButtonProps) {
  return (
    <FAB
      icon="plus"
      style={styles.fab}
      onPress={onPress}
      label="Add Stock"
      accessibilityLabel="Add stock to portfolio"
      accessibilityHint="Opens search screen to select a stock to add to your portfolio"
      accessibilityRole="button"
    />
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#1976D2',
  },
});
