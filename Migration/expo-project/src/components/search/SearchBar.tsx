/**
 * Search Bar Component
 * Text input for searching stock symbols with debouncing
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Searchbar } from 'react-native-paper';

interface SearchBarProps {
  onSearchChange: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({ onSearchChange, placeholder = 'Search by ticker or company name' }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, onSearchChange]);

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder={placeholder}
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        iconColor="#1976D2"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  searchbar: {
    elevation: 2,
    backgroundColor: '#fff',
  },
});
