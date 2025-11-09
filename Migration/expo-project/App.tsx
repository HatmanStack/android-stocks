/**
 * Main App Entry Point
 * Sets up providers, navigation, and app initialization
 */

import React, { useEffect, useState, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import type { NavigationState } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Navigation
import { RootNavigator } from './src/navigation/RootNavigator';

// Contexts
import { StockProvider } from './src/contexts/StockContext';
import { PortfolioProvider } from './src/contexts/PortfolioContext';

// Theme
import { theme } from './src/theme/theme';

// Database
import { initializeDatabase } from './src/database/database';

// Constants
const NAVIGATION_STATE_KEY = '@navigation_state';

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [initialNavigationState, setInitialNavigationState] = useState<NavigationState | undefined>();
  const routeNameRef = useRef<string | undefined>(undefined);
  const navigationRef = useRef<any>(null);

  useEffect(() => {
    async function initialize() {
      try {
        // Initialize database
        await initializeDatabase();
        console.log('[App] Database initialized successfully');

        // Restore navigation state
        const savedStateString = await AsyncStorage.getItem(NAVIGATION_STATE_KEY);
        const savedState = savedStateString ? JSON.parse(savedStateString) : undefined;

        if (savedState !== undefined) {
          setInitialNavigationState(savedState);
          console.log('[App] Navigation state restored');
        }

        // Add any other initialization here (e.g., load fonts, check auth)

        setIsReady(true);
      } catch (error) {
        console.error('[App] Initialization error:', error);
        // For now, continue even if initialization fails
        setIsReady(true);
      }
    }

    initialize();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976D2" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <QueryClientProvider client={queryClient}>
            <StockProvider>
              <PortfolioProvider>
                <NavigationContainer
                  ref={navigationRef as any}
                  initialState={initialNavigationState}
                  onStateChange={(state) => {
                    // Save navigation state to AsyncStorage
                    if (state) {
                      AsyncStorage.setItem(NAVIGATION_STATE_KEY, JSON.stringify(state)).catch(
                        (error) => {
                          console.error('[App] Error saving navigation state:', error);
                        }
                      );
                    }
                  }}
                  onReady={() => {
                    routeNameRef.current = (navigationRef.current as any)?.getCurrentRoute?.()?.name;
                  }}
                  linking={{
                    prefixes: ['stockapp://', 'https://stocks.app'],
                    config: {
                      screens: {
                        MainTabs: {
                          path: '',
                          screens: {
                            Search: 'search',
                            StockDetail: {
                              path: 'stock/:ticker',
                              parse: {
                                ticker: (ticker: string) => ticker.toUpperCase(),
                              },
                            },
                            Portfolio: 'portfolio',
                          },
                        },
                      },
                    },
                  } as any}
                >
                  <RootNavigator />
                  <StatusBar style="auto" />
                </NavigationContainer>
              </PortfolioProvider>
            </StockProvider>
          </QueryClientProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
