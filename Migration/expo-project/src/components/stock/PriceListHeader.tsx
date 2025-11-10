/**
 * Price List Header
 * Fixed header row showing column labels for price data
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

export const PriceListHeader: React.FC = () => {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.elevation.level2 }]}>
      <View style={styles.row}>
        <View style={styles.dateColumn}>
          <Text variant="labelSmall" style={[styles.headerText, { color: theme.colors.onSurface }]}>
            Date
          </Text>
        </View>

        <View style={styles.priceColumn}>
          <Text variant="labelSmall" style={[styles.headerText, { color: theme.colors.onSurface }]}>
            Open
          </Text>
        </View>

        <View style={styles.priceColumn}>
          <Text variant="labelSmall" style={[styles.headerText, { color: theme.colors.onSurface }]}>
            Close
          </Text>
        </View>

        <View style={styles.priceColumn}>
          <Text variant="labelSmall" style={[styles.headerText, { color: theme.colors.onSurface }]}>
            High
          </Text>
        </View>

        <View style={styles.priceColumn}>
          <Text variant="labelSmall" style={[styles.headerText, { color: theme.colors.onSurface }]}>
            Low
          </Text>
        </View>

        <View style={styles.volumeColumn}>
          <Text variant="labelSmall" style={[styles.headerText, { color: theme.colors.onSurface }]}>
            Volume
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#BDBDBD',
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
  headerText: {
    fontWeight: 'bold',
    fontSize: 11,
    textTransform: 'uppercase',
  },
});
