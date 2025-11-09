/**
 * Stock Detail Navigator
 * Material Top Tabs for Price, Sentiment, and News screens
 */

import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import PriceScreen from '../screens/PriceScreen';
import SentimentScreen from '../screens/SentimentScreen';
import NewsScreen from '../screens/NewsScreen';
import type { StockDetailTabParamList } from './navigationTypes';

const Tab = createMaterialTopTabNavigator<StockDetailTabParamList>();

interface StockDetailNavigatorProps {
  ticker: string;
}

export function StockDetailNavigator({ ticker }: StockDetailNavigatorProps) {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#1976D2',
        tabBarInactiveTintColor: '#666',
        tabBarIndicatorStyle: { backgroundColor: '#1976D2' },
        tabBarLabelStyle: { fontSize: 14, fontWeight: '600', textTransform: 'none' },
        tabBarStyle: { backgroundColor: '#fff' },
      }}
    >
      <Tab.Screen
        name="Price"
        component={PriceScreen}
        options={{ title: 'Price' }}
        initialParams={{ ticker }}
      />
      <Tab.Screen
        name="Sentiment"
        component={SentimentScreen}
        options={{ title: 'Sentiment' }}
        initialParams={{ ticker }}
      />
      <Tab.Screen
        name="News"
        component={NewsScreen}
        options={{ title: 'News' }}
        initialParams={{ ticker }}
      />
    </Tab.Navigator>
  );
}
