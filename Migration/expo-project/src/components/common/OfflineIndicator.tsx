/**
 * Offline Indicator Component
 * Shows a banner when the app is offline
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export function OfflineIndicator() {
  const { isConnected } = useNetworkStatus();

  if (isConnected) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Ionicons name="cloud-offline" size={16} color="#fff" />
      <Text style={styles.text}>You are offline. Showing cached data.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9800',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});
