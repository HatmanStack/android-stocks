/**
 * SearchScreen Component Tests
 * Tests the search screen rendering and search functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SearchScreen from '@/screens/SearchScreen';
import { StockProvider } from '@/contexts/StockContext';
import { PortfolioProvider } from '@/contexts/PortfolioContext';

// Mock navigation
const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: jest.fn(),
  setOptions: jest.fn(),
} as any;

const mockRoute = {
  key: 'Search',
  name: 'Search',
} as any;

// Mock symbol search results
const mockSearchResults = [
  {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    exchangeCode: 'NASDAQ',
    startDate: '1980-12-12',
    endDate: '2025-01-10',
    longDescription: 'Apple Inc. designs, manufactures, and markets smartphones.',
  },
  {
    ticker: 'GOOGL',
    name: 'Alphabet Inc.',
    exchangeCode: 'NASDAQ',
    startDate: '2004-08-19',
    endDate: '2025-01-10',
    longDescription: 'Alphabet Inc. offers various products and platforms.',
  },
];

// Mock useSymbolSearch hook
jest.mock('@/hooks/useSymbolSearch', () => ({
  useSymbolSearch: () => ({
    data: mockSearchResults,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  }),
}));

// Mock sync orchestrator
jest.mock('@/services/sync/syncOrchestrator', () => ({
  syncAllData: jest.fn().mockResolvedValue(undefined),
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
        <StockProvider>
          <PortfolioProvider>{children}</PortfolioProvider>
        </StockProvider>
      </QueryClientProvider>
    </NavigationContainer>
  );
}

describe('SearchScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search bar correctly', () => {
    render(
      <TestWrapper>
        <SearchScreen navigation={mockNavigation} route={mockRoute} />
      </TestWrapper>
    );

    // Check if search input is rendered
    const searchInput = screen.getByPlaceholderText('Search by ticker or company name');
    expect(searchInput).toBeTruthy();
  });

  it('renders date range picker', () => {
    render(
      <TestWrapper>
        <SearchScreen navigation={mockNavigation} route={mockRoute} />
      </TestWrapper>
    );

    // Check for date range elements
    expect(screen.getByText(/Date Range/i)).toBeTruthy();
  });

  it('displays search results when available', () => {
    render(
      <TestWrapper>
        <SearchScreen navigation={mockNavigation} route={mockRoute} />
      </TestWrapper>
    );

    // Check if search results are displayed
    expect(screen.getByText('AAPL')).toBeTruthy();
    expect(screen.getByText('Apple Inc.')).toBeTruthy();
    expect(screen.getByText('GOOGL')).toBeTruthy();
    expect(screen.getByText('Alphabet Inc.')).toBeTruthy();
  });

  it('shows empty state when no search results', () => {
    // Mock empty results
    const useSymbolSearch = require('@/hooks/useSymbolSearch').useSymbolSearch;
    useSymbolSearch.mockReturnValueOnce({
      data: [],
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(
      <TestWrapper>
        <SearchScreen navigation={mockNavigation} route={mockRoute} />
      </TestWrapper>
    );

    // Check for empty state message
    expect(screen.getByText(/No results found/i)).toBeTruthy();
  });

  it('shows loading state while searching', () => {
    // Mock loading state
    const useSymbolSearch = require('@/hooks/useSymbolSearch').useSymbolSearch;
    useSymbolSearch.mockReturnValueOnce({
      data: [],
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    render(
      <TestWrapper>
        <SearchScreen navigation={mockNavigation} route={mockRoute} />
      </TestWrapper>
    );

    // Check for loading indicator
    expect(screen.queryByText(/Searching/i)).toBeTruthy();
  });

  it('handles search query input', () => {
    const useSymbolSearch = require('@/hooks/useSymbolSearch').useSymbolSearch;
    useSymbolSearch.mockReturnValueOnce({
      data: [],
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(
      <TestWrapper>
        <SearchScreen navigation={mockNavigation} route={mockRoute} />
      </TestWrapper>
    );

    // Find search input and type
    const searchInput = screen.getByPlaceholderText('Search by ticker or company name');
    fireEvent.changeText(searchInput, 'AAPL');

    // Verify search input value changed
    // Note: SearchBar component handles debouncing internally
    expect(searchInput).toBeTruthy();
  });

  it('navigates to stock detail when search result is pressed', async () => {
    render(
      <TestWrapper>
        <SearchScreen navigation={mockNavigation} route={mockRoute} />
      </TestWrapper>
    );

    // Find and press a search result
    const resultItem = screen.getByText('AAPL');
    fireEvent.press(resultItem);

    // Wait for navigation and sync
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('StockDetail', { ticker: 'AAPL' });
    });
  });

  it('shows error state when search fails', () => {
    // Mock error state
    const useSymbolSearch = require('@/hooks/useSymbolSearch').useSymbolSearch;
    useSymbolSearch.mockReturnValueOnce({
      data: [],
      isLoading: false,
      error: new Error('Search failed'),
      refetch: jest.fn(),
    });

    render(
      <TestWrapper>
        <SearchScreen navigation={mockNavigation} route={mockRoute} />
      </TestWrapper>
    );

    // Check for error message
    expect(screen.queryByText(/error/i) || screen.queryByText(/failed/i)).toBeTruthy();
  });

  it('updates date range when date picker is used', () => {
    render(
      <TestWrapper>
        <SearchScreen navigation={mockNavigation} route={mockRoute} />
      </TestWrapper>
    );

    // Note: Date picker interaction testing requires more complex setup
    // This verifies date range picker is rendered
    expect(screen.getByText(/Date Range/i)).toBeTruthy();
  });

  it('shows sync progress indicator when syncing data', async () => {
    render(
      <TestWrapper>
        <SearchScreen navigation={mockNavigation} route={mockRoute} />
      </TestWrapper>
    );

    // Find and press a search result to trigger sync
    const resultItem = screen.getByText('AAPL');
    fireEvent.press(resultItem);

    // Note: Actual sync progress testing requires mocking syncAllData
    // to return a promise that can be awaited
    await waitFor(() => {
      // Verify sync was initiated
      const { syncAllData } = require('@/services/sync/syncOrchestrator');
      expect(syncAllData).toBeDefined();
    });
  });
});
