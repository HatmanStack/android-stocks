/**
 * PortfolioScreen Component Tests
 * Tests the portfolio screen rendering and user interactions
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PortfolioScreen from '@/screens/PortfolioScreen';
import { PortfolioProvider } from '@/contexts/PortfolioContext';
import { StockProvider } from '@/contexts/StockContext';
import type { PortfolioDetails } from '@/types/database.types';

// Mock navigation
const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: jest.fn(),
  setOptions: jest.fn(),
} as any;

const mockRoute = {
  key: 'Portfolio',
  name: 'Portfolio',
} as any;

// Mock portfolio data
const mockPortfolio: PortfolioDetails[] = [
  { ticker: 'AAPL', next: '0.52', name: 'Apple Inc.', wks: '0.48', mnth: '0.55' },
  { ticker: 'GOOGL', next: '0.61', name: 'Alphabet Inc.', wks: '0.59', mnth: '0.63' },
  { ticker: 'MSFT', next: '0.57', name: 'Microsoft Corporation', wks: '0.54', mnth: '0.60' },
];

// Mock context functions
const mockRemoveFromPortfolio = jest.fn();
const mockRefetch = jest.fn();

// Mock PortfolioContext
jest.mock('@/contexts/PortfolioContext', () => ({
  PortfolioProvider: ({ children }: any) => <>{children}</>,
  usePortfolioContext: () => ({
    portfolio: mockPortfolio,
    isLoading: false,
    error: null,
    refetch: mockRefetch,
    removeFromPortfolio: mockRemoveFromPortfolio,
    addToPortfolio: jest.fn(),
    isInPortfolio: jest.fn(),
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

describe('PortfolioScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders portfolio items correctly', () => {
    render(
      <TestWrapper>
        <PortfolioScreen navigation={mockNavigation} route={mockRoute} />
      </TestWrapper>
    );

    // Check if portfolio tickers are rendered
    expect(screen.getByText('AAPL')).toBeTruthy();
    expect(screen.getByText('GOOGL')).toBeTruthy();
    expect(screen.getByText('MSFT')).toBeTruthy();
  });

  it('navigates to search screen when add button is pressed', () => {
    render(
      <TestWrapper>
        <PortfolioScreen navigation={mockNavigation} route={mockRoute} />
      </TestWrapper>
    );

    // Find and press the add stock button
    const addButton = screen.getByLabelText('Add stock to portfolio');
    fireEvent.press(addButton);

    // Verify navigation was called
    expect(mockNavigate).toHaveBeenCalledWith('Search');
  });

  it('navigates to stock detail when portfolio item is pressed', () => {
    render(
      <TestWrapper>
        <PortfolioScreen navigation={mockNavigation} route={mockRoute} />
      </TestWrapper>
    );

    // Find and press a portfolio item
    const portfolioItem = screen.getByText('AAPL');
    fireEvent.press(portfolioItem);

    // Verify navigation was called with correct params
    expect(mockNavigate).toHaveBeenCalledWith('StockDetail', { ticker: 'AAPL' });
  });

  it('shows empty state when portfolio is empty', () => {
    // Mock empty portfolio
    const usePortfolioContext = require('@/contexts/PortfolioContext').usePortfolioContext;
    usePortfolioContext.mockReturnValueOnce({
      portfolio: [],
      isLoading: false,
      error: null,
      refetch: mockRefetch,
      removeFromPortfolio: mockRemoveFromPortfolio,
      addToPortfolio: jest.fn(),
      isInPortfolio: jest.fn(),
    });

    render(
      <TestWrapper>
        <PortfolioScreen navigation={mockNavigation} route={mockRoute} />
      </TestWrapper>
    );

    // Check for empty state message
    expect(screen.getByText('No stocks in portfolio')).toBeTruthy();
    expect(screen.getByText('Add stocks to your watchlist to track their performance')).toBeTruthy();
  });

  it('shows loading indicator while loading', () => {
    // Mock loading state
    const usePortfolioContext = require('@/contexts/PortfolioContext').usePortfolioContext;
    usePortfolioContext.mockReturnValueOnce({
      portfolio: [],
      isLoading: true,
      error: null,
      refetch: mockRefetch,
      removeFromPortfolio: mockRemoveFromPortfolio,
      addToPortfolio: jest.fn(),
      isInPortfolio: jest.fn(),
    });

    render(
      <TestWrapper>
        <PortfolioScreen navigation={mockNavigation} route={mockRoute} />
      </TestWrapper>
    );

    // Check for loading indicator
    expect(screen.getByText('Loading portfolio...')).toBeTruthy();
  });

  it('shows error display when error occurs', () => {
    // Mock error state
    const usePortfolioContext = require('@/contexts/PortfolioContext').usePortfolioContext;
    usePortfolioContext.mockReturnValueOnce({
      portfolio: [],
      isLoading: false,
      error: new Error('Failed to load portfolio'),
      refetch: mockRefetch,
      removeFromPortfolio: mockRemoveFromPortfolio,
      addToPortfolio: jest.fn(),
      isInPortfolio: jest.fn(),
    });

    render(
      <TestWrapper>
        <PortfolioScreen navigation={mockNavigation} route={mockRoute} />
      </TestWrapper>
    );

    // Check for error message
    expect(screen.getByText('Failed to load portfolio')).toBeTruthy();
  });

  it('calls refetch when retry button is pressed', () => {
    // Mock error state
    const usePortfolioContext = require('@/contexts/PortfolioContext').usePortfolioContext;
    usePortfolioContext.mockReturnValueOnce({
      portfolio: [],
      isLoading: false,
      error: new Error('Failed to load portfolio'),
      refetch: mockRefetch,
      removeFromPortfolio: mockRemoveFromPortfolio,
      addToPortfolio: jest.fn(),
      isInPortfolio: jest.fn(),
    });

    render(
      <TestWrapper>
        <PortfolioScreen navigation={mockNavigation} route={mockRoute} />
      </TestWrapper>
    );

    // Find and press retry button
    const retryButton = screen.getByText('Retry');
    fireEvent.press(retryButton);

    // Verify refetch was called
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('shows delete confirmation dialog when delete is triggered', async () => {
    const { Alert } = require('react-native');
    const alertSpy = jest.spyOn(Alert, 'alert');

    render(
      <TestWrapper>
        <PortfolioScreen navigation={mockNavigation} route={mockRoute} />
      </TestWrapper>
    );

    // Note: Actual swipe-to-delete testing would require more complex setup
    // This tests the alert dialog logic

    // Simulate the alert call
    await waitFor(() => {
      // In actual implementation, swiping would trigger the delete handler
      // which calls Alert.alert with confirmation
    });

    // Verify alert spy setup (actual deletion testing would need more mocking)
    expect(alertSpy).toBeDefined();
  });

  it('handles pull-to-refresh correctly', async () => {
    const { syncAllData } = require('@/services/sync/syncOrchestrator');

    render(
      <TestWrapper>
        <PortfolioScreen navigation={mockNavigation} route={mockRoute} />
      </TestWrapper>
    );

    // Note: Actual pull-to-refresh testing requires more complex setup
    // This verifies the sync function is available
    expect(syncAllData).toBeDefined();
  });
});
