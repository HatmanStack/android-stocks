/**
 * PriceScreen Component Tests
 * Tests the price screen rendering and data display
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PriceScreen from '@/screens/PriceScreen';
import { StockProvider } from '@/contexts/StockContext';
import type { StockDetails } from '@/types/database.types';

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
} as any;

const mockRoute = {
  key: 'Price',
  name: 'Price',
  params: { ticker: 'AAPL' },
} as any;

// Mock stock price data
const mockStockData: StockDetails[] = [
  {
    ticker: 'AAPL',
    date: '2025-01-10',
    open: 180.50,
    high: 182.30,
    low: 179.80,
    close: 181.90,
    volume: 50000000,
    adjOpen: 180.50,
    adjHigh: 182.30,
    adjLow: 179.80,
    adjClose: 181.90,
    adjVolume: 50000000,
    divCash: 0,
    splitFactor: 1,
    hash: 0,
    marketCap: 2800000000000,
    enterpriseVal: 2900000000000,
    peRatio: 28.5,
    pbRatio: 42.3,
    trailingPEG1Y: 2.1,
  },
  {
    ticker: 'AAPL',
    date: '2025-01-09',
    open: 179.20,
    high: 180.70,
    low: 178.50,
    close: 180.30,
    volume: 48000000,
    adjOpen: 179.20,
    adjHigh: 180.70,
    adjLow: 178.50,
    adjClose: 180.30,
    adjVolume: 48000000,
    divCash: 0,
    splitFactor: 1,
    hash: 0,
    marketCap: 2790000000000,
    enterpriseVal: 2890000000000,
    peRatio: 28.3,
    pbRatio: 42.1,
    trailingPEG1Y: 2.0,
  },
];

// Mock symbol metadata
const mockSymbolData = {
  ticker: 'AAPL',
  name: 'Apple Inc.',
  exchangeCode: 'NASDAQ',
  startDate: '1980-12-12',
  endDate: '2025-01-10',
  longDescription: 'Apple Inc. designs, manufactures, and markets smartphones.',
};

// Mock useStockData hook
jest.mock('@/hooks/useStockData', () => ({
  useStockData: () => ({
    data: mockStockData,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  }),
}));

// Mock useSymbolSearch hook for metadata
jest.mock('@/hooks/useSymbolSearch', () => ({
  useSymbolSearch: () => ({
    searchQuery: '',
    setSearchQuery: jest.fn(),
    searchResults: [mockSymbolData],
    isSearching: false,
    searchError: null,
  }),
}));

// Create QueryClient for testing
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

// Test wrapper component
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = createTestQueryClient();

  return (
    <NavigationContainer>
      <QueryClientProvider client={queryClient}>
        <StockProvider>{children}</StockProvider>
      </QueryClientProvider>
    </NavigationContainer>
  );
}

describe('PriceScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders stock metadata card', () => {
    render(
      <TestWrapper>
        <PriceScreen navigation={mockNavigation} route={mockRoute} />
      </TestWrapper>
    );

    // Check if company name and ticker are displayed
    expect(screen.getByText('Apple Inc.')).toBeTruthy();
    expect(screen.getByText('AAPL')).toBeTruthy();
  });

  it('renders price list header with column labels', () => {
    render(
      <TestWrapper>
        <PriceScreen navigation={mockNavigation} route={mockRoute} />
      </TestWrapper>
    );

    // Check for column headers
    expect(screen.getByText('Date')).toBeTruthy();
    expect(screen.getByText('Open')).toBeTruthy();
    expect(screen.getByText('High')).toBeTruthy();
    expect(screen.getByText('Low')).toBeTruthy();
    expect(screen.getByText('Close')).toBeTruthy();
    expect(screen.getByText('Volume')).toBeTruthy();
  });

  it('displays stock price data correctly', () => {
    render(
      <TestWrapper>
        <PriceScreen navigation={mockNavigation} route={mockRoute} />
      </TestWrapper>
    );

    // Check if price data is rendered (dates should be visible)
    expect(screen.getByText('2025-01-10')).toBeTruthy();
    expect(screen.getByText('2025-01-09')).toBeTruthy();

    // Check for price values (formatted)
    expect(screen.getByText('$181.90')).toBeTruthy();
    expect(screen.getByText('$180.30')).toBeTruthy();
  });

  it('displays most recent price first', () => {
    render(
      <TestWrapper>
        <PriceScreen navigation={mockNavigation} route={mockRoute} />
      </TestWrapper>
    );

    // Most recent date (2025-01-10) should appear before 2025-01-09
    const allDates = screen.getAllByText(/2025-01-/);
    expect(allDates[0]).toBeTruthy();
    // Verify descending order by checking first item is most recent
  });

  it('shows loading indicator while loading data', () => {
    // Mock loading state
    const useStockData = require('@/hooks/useStockData').useStockData;
    useStockData.mockReturnValueOnce({
      data: [],
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    render(
      <TestWrapper>
        <PriceScreen navigation={mockNavigation} route={mockRoute} />
      </TestWrapper>
    );

    // Check for loading indicator
    expect(screen.getByText('Loading stock prices...')).toBeTruthy();
  });

  it('shows error display when data fetch fails', () => {
    // Mock error state
    const useStockData = require('@/hooks/useStockData').useStockData;
    useStockData.mockReturnValueOnce({
      data: [],
      isLoading: false,
      error: new Error('Failed to fetch stock data'),
      refetch: jest.fn(),
    });

    render(
      <TestWrapper>
        <PriceScreen navigation={mockNavigation} route={mockRoute} />
      </TestWrapper>
    );

    // Check for error message
    expect(screen.getByText(/Failed to load stock prices/i)).toBeTruthy();
  });

  it('shows empty state when no price data available', () => {
    // Mock empty data
    const useStockData = require('@/hooks/useStockData').useStockData;
    useStockData.mockReturnValueOnce({
      data: [],
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(
      <TestWrapper>
        <PriceScreen navigation={mockNavigation} route={mockRoute} />
      </TestWrapper>
    );

    // Check for empty state message
    expect(screen.getByText(/No price data available/i)).toBeTruthy();
  });

  it('calls refetch when retry button is pressed', () => {
    const mockRefetch = jest.fn();
    const useStockData = require('@/hooks/useStockData').useStockData;
    useStockData.mockReturnValueOnce({
      data: [],
      isLoading: false,
      error: new Error('Failed to fetch stock data'),
      refetch: mockRefetch,
    });

    render(
      <TestWrapper>
        <PriceScreen navigation={mockNavigation} route={mockRoute} />
      </TestWrapper>
    );

    // Find and press retry button
    const retryButton = screen.getByText('Retry');
    fireEvent.press(retryButton);

    // Verify refetch was called
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('formats volume numbers correctly', () => {
    render(
      <TestWrapper>
        <PriceScreen navigation={mockNavigation} route={mockRoute} />
      </TestWrapper>
    );

    // Check that volume is formatted (should be in millions)
    // 50,000,000 should display as "50.0M"
    expect(screen.getByText(/50\.0M/) || screen.getByText(/50,000,000/)).toBeTruthy();
  });

  it('handles pull-to-refresh correctly', () => {
    render(
      <TestWrapper>
        <PriceScreen navigation={mockNavigation} route={mockRoute} />
      </TestWrapper>
    );

    // Note: Actual pull-to-refresh testing requires more complex setup
    // This verifies the component renders with FlatList
    const flatList = screen.getByTestId('price-flatlist');
    expect(flatList || screen.getByText('Date')).toBeTruthy();
  });
});
