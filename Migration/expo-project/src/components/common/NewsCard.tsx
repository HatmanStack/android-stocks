/**
 * News Card Component
 * Displays a news article with title, publisher, date, and description
 */

import React from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';
import { Card } from 'react-native-paper';
import type { NewsDetails } from '@/types/database.types';
import { formatNewsDate } from '@/utils/formatting/dateFormatting';

interface NewsCardProps {
  article: NewsDetails;
}

export function NewsCard({ article }: NewsCardProps) {
  const handlePress = () => {
    if (article.articleUrl) {
      Linking.openURL(article.articleUrl).catch((error) => {
        console.error('Error opening URL:', error);
      });
    }
  };

  return (
    <Card style={styles.card} onPress={handlePress}>
      <Card.Content>
        <Text style={styles.title} numberOfLines={2}>
          {article.title}
        </Text>

        <View style={styles.metaContainer}>
          <Text style={styles.publisher}>{article.publisher}</Text>
          <Text style={styles.date}>{formatNewsDate(article.articleDate)}</Text>
        </View>

        {article.articleDescription && (
          <Text style={styles.description} numberOfLines={3}>
            {article.articleDescription}
          </Text>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 4,
    marginHorizontal: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  publisher: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '500',
  },
  date: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  description: {
    fontSize: 14,
    color: '#757575',
    lineHeight: 20,
  },
});
