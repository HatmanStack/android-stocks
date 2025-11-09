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
  const {
    portfolio,
    isLoading,
    error,
    refetch,
  } = usePortfolio();

  const isInPortfolio = (ticker: string): boolean => {
    return portfolio.some((item: PortfolioDetails) => item.ticker === ticker);
  };

  const addToPortfolio = async (ticker: string): Promise<void> => {
    // This will be implemented when we wire up mutations
    // For now, just log
    console.log('[PortfolioContext] Adding to portfolio:', ticker);
  };

  const removeFromPortfolio = async (ticker: string): Promise<void> => {
    // This will be implemented when we wire up mutations
    // For now, just log
    console.log('[PortfolioContext] Removing from portfolio:', ticker);
  };

  const value: PortfolioContextType = {
    portfolio,
    isLoading,
    error: error as Error | null,
    isInPortfolio,
    addToPortfolio,
    removeFromPortfolio,
    refetch,
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
