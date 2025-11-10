/**
 * Sentiment Toggle
 * Switch between Daily Aggregate and Individual Articles views
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';

interface SentimentToggleProps {
  value: 'aggregate' | 'individual';
  onValueChange: (value: 'aggregate' | 'individual') => void;
}

export const SentimentToggle: React.FC<SentimentToggleProps> = ({
  value,
  onValueChange,
}) => {
  return (
    <View style={styles.container}>
      <SegmentedButtons
        value={value}
        onValueChange={(val) => onValueChange(val as 'aggregate' | 'individual')}
        buttons={[
          {
            value: 'aggregate',
            label: 'Daily Aggregate',
            icon: 'calendar',
          },
          {
            value: 'individual',
            label: 'Individual Articles',
            icon: 'file-document-outline',
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: '#fff',
  },
});
