/**
 * News List Item
 * Displays a single news article with image, title, and description
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import type { NewsDetails } from '@/types/database.types';
import { formatNewsDate } from '@/utils/formatting/dateFormatting';

interface NewsListItemProps {
  item: NewsDetails;
}

export const NewsListItem: React.FC<NewsListItemProps> = React.memo(({ item }) => {
  const theme = useTheme();

  const handlePress = async () => {
    const url = item.articleUrl;

    if (!url) {
      Alert.alert('Error', 'No URL available for this article');
      return;
    }

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open this article URL');
      }
    } catch (error) {
      console.error('Error opening URL:', error);
      Alert.alert('Error', 'Failed to open article in browser');
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityLabel={`News article: ${item.title}. Published by ${item.publisher} on ${formatNewsDate(item.articleDate)}`}
      accessibilityHint="Double tap to open article in browser"
      accessibilityRole="button"
    >
      <Card style={styles.card}>
        <Card.Content>
          {/* Title */}
          <Text variant="titleMedium" style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>

          {/* Publisher and Date */}
          <View style={styles.metadata}>
            <Text variant="bodySmall" style={[styles.publisher, { color: theme.colors.primary }]}>
              {item.publisher}
            </Text>
            <Text
              variant="bodySmall"
              style={[styles.separator, { color: theme.colors.onSurfaceVariant }]}
              accessible={false}
            >
              •
            </Text>
            <Text variant="bodySmall" style={[styles.date, { color: theme.colors.onSurfaceVariant }]}>
              {formatNewsDate(item.articleDate)}
            </Text>
          </View>

          {/* Description */}
          {item.articleDescription && (
            <Text
              variant="bodyMedium"
              style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
              numberOfLines={3}
            >
              {item.articleDescription}
            </Text>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
});

NewsListItem.displayName = 'NewsListItem';

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 12,
    marginVertical: 6,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 22,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  publisher: {
    fontWeight: '600',
  },
  separator: {
    marginHorizontal: 6,
  },
  date: {
    fontSize: 12,
  },
  description: {
    lineHeight: 20,
  },
});
