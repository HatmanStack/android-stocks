/**
 * Stock Context
 * Global state for selected ticker and date range
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { formatDateForDB } from '../utils/date/dateUtils';

interface StockContextType {
  selectedTicker: string | null;
  selectedDate: string;
  startDate: string;
  endDate: string;
  setSelectedTicker: (ticker: string | null) => void;
  setSelectedDate: (date: string) => void;
  setDateRange: (startDate: string, endDate: string) => void;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

interface StockProviderProps {
  children: ReactNode;
}

export function StockProvider({ children }: StockProviderProps) {
  const [selectedTicker, setSelectedTicker] = useState<string | null>('AAPL'); // Default to AAPL
  const [selectedDate, setSelectedDate] = useState<string>(formatDateForDB(new Date()));

  // Default date range: last 30 days
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const [startDate, setStartDate] = useState<string>(formatDateForDB(thirtyDaysAgo));
  const [endDate, setEndDate] = useState<string>(formatDateForDB(today));

  const setDateRange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  const value: StockContextType = {
    selectedTicker,
    selectedDate,
    startDate,
    endDate,
    setSelectedTicker,
    setSelectedDate,
    setDateRange,
  };

  return <StockContext.Provider value={value}>{children}</StockContext.Provider>;
}

export function useStock() {
  const context = useContext(StockContext);
  if (context === undefined) {
    throw new Error('useStock must be used within a StockProvider');
  }
  return context;
}
