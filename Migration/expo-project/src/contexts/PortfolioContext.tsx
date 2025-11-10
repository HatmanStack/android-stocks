/**
 * Portfolio Context
 * Global state for portfolio stocks
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { usePortfolio } from '../hooks/usePortfolio';
import type { PortfolioDetails } from '../types/database.types';

interface PortfolioContextType {
  portfolio: PortfolioDetails[];
  isLoading: boolean;
  error: Error | null;
  isInPortfolio: (ticker: string) => boolean;
  addToPortfolio: (ticker: string) => Promise<void>;
  removeFromPortfolio: (ticker: string) => Promise<void>;
  refetch: () => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

interface PortfolioProviderProps {
  children: ReactNode;
}

export function PortfolioProvider({ children }: PortfolioProviderProps) {
  const portfolioHook = usePortfolio();

  const isInPortfolio = (ticker: string): boolean => {
    return portfolioHook.portfolio.some((item: PortfolioDetails) => item.ticker === ticker);
  };

  const addToPortfolio = async (ticker: string): Promise<void> => {
    try {
      console.log('[PortfolioContext] Adding to portfolio:', ticker);

      // Create portfolio entry with default prediction values
      const portfolioEntry: PortfolioDetails = {
        ticker,
        name: ticker, // Will be updated when data syncs
        next: '0',
        wks: '0',
        mnth: '0',
      };

      await portfolioHook.addToPortfolio.mutateAsync(portfolioEntry);
    } catch (error) {
      console.error('[PortfolioContext] Error adding to portfolio:', error);
      throw error;
    }
  };

  const removeFromPortfolio = async (ticker: string): Promise<void> => {
    try {
      console.log('[PortfolioContext] Removing from portfolio:', ticker);
      await portfolioHook.removeFromPortfolio.mutateAsync(ticker);
    } catch (error) {
      console.error('[PortfolioContext] Error removing from portfolio:', error);
      throw error;
    }
  };

  const value: PortfolioContextType = {
    portfolio: portfolioHook.portfolio,
    isLoading: portfolioHook.isLoading,
    error: portfolioHook.error as Error | null,
    isInPortfolio,
    addToPortfolio,
    removeFromPortfolio,
    refetch: portfolioHook.refetch,
  };

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
}

export function usePortfolioContext() {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolioContext must be used within a PortfolioProvider');
  }
  return context;
}
