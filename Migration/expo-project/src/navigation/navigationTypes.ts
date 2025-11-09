/**
 * Navigation Types
 * Type-safe navigation parameters for all navigators
 */

import type { NavigatorScreenParams } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { StackScreenProps } from '@react-navigation/stack';
import type { MaterialTopTabScreenProps } from '@react-navigation/material-top-tabs';

/**
 * Root Stack Navigator
 * Top-level navigator containing the main tab navigator
 */
export type RootStackParamList = {
  MainTabs: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  StackScreenProps<RootStackParamList, T>;

/**
 * Main Tab Navigator
 * Bottom tab navigator with 3 main tabs
 */
export type MainTabParamList = {
  Search: undefined;
  StockDetail: { ticker?: string };
  Portfolio: undefined;
};

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  BottomTabScreenProps<MainTabParamList, T>;

/**
 * Stock Detail Tab Navigator
 * Material top tabs for Price, Sentiment, and News
 */
export type StockDetailTabParamList = {
  Price: { ticker: string };
  Sentiment: { ticker: string };
  News: { ticker: string };
};

export type StockDetailTabScreenProps<T extends keyof StockDetailTabParamList> =
  MaterialTopTabScreenProps<StockDetailTabParamList, T>;

/**
 * Combined navigation prop type for nested navigators
 */
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
