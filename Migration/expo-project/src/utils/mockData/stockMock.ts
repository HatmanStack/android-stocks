/**
 * Mock data generators for stock prices and symbols
 */

import { StockDetails, SymbolDetails } from '@/types/database.types';
import { formatDateForDB, getDatesInRange } from '@/utils/date/dateUtils';
import { addDays, subDays } from 'date-fns';

/**
 * Generate mock stock price data with realistic OHLCV values
 * Uses random walk algorithm for price movements
 * @param ticker - Stock ticker symbol
 * @param startDate - Start date (ISO 8601)
 * @param endDate - End date (ISO 8601)
 * @param options - Optional configuration
 * @returns Array of mock stock details
 */
export function generateMockStockPrices(
  ticker: string,
  startDate: string,
  endDate: string,
  options: {
    startingPrice?: number;
    volatility?: number;
  } = {}
): Omit<StockDetails, 'id'>[] {
  const { startingPrice = 100, volatility = 0.02 } = options;

  const dates = getDatesInRange(startDate, endDate);
  const stocks: Omit<StockDetails, 'id'>[] = [];
  let currentPrice = startingPrice;

  dates.forEach((date, index) => {
    // Random walk: price changes by +/- volatility%
    const change = (Math.random() - 0.5) * 2 * volatility * currentPrice;
    currentPrice = Math.max(currentPrice + change, 1); // Ensure price >= 1

    // Generate OHLCV
    const open = currentPrice;
    const close = currentPrice + (Math.random() - 0.5) * volatility * currentPrice;
    const high = Math.max(open, close) + Math.random() * volatility * currentPrice;
    const low = Math.min(open, close) - Math.random() * volatility * currentPrice;
    const volume = Math.floor(1_000_000 + Math.random() * 99_000_000); // 1M - 100M

    stocks.push({
      hash: index,
      date,
      ticker,
      close: parseFloat(close.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      open: parseFloat(open.toFixed(2)),
      volume,
      adjClose: parseFloat(close.toFixed(2)),
      adjHigh: parseFloat(high.toFixed(2)),
      adjLow: parseFloat(low.toFixed(2)),
      adjOpen: parseFloat(open.toFixed(2)),
      adjVolume: volume,
      divCash: 0,
      splitFactor: 1,
      marketCap: Math.floor(currentPrice * 1_000_000_000), // Approx market cap
      enterpriseVal: currentPrice * 1_100_000_000,
      peRatio: 15 + Math.random() * 20,
      pbRatio: 2 + Math.random() * 8,
      trailingPEG1Y: 0.5 + Math.random() * 2,
    });

    // Update current price for next iteration
    currentPrice = close;
  });

  return stocks;
}

/**
 * Generate mock symbol details for a ticker
 * @param ticker - Stock ticker symbol
 * @returns Mock symbol details
 */
export function generateMockSymbol(ticker: string): Omit<SymbolDetails, 'id'> {
  const companyNames: Record<string, string> = {
    AAPL: 'Apple Inc.',
    GOOGL: 'Alphabet Inc.',
    MSFT: 'Microsoft Corporation',
    TSLA: 'Tesla, Inc.',
    AMZN: 'Amazon.com, Inc.',
  };

  const exchanges = ['NASDAQ', 'NYSE', 'AMEX'];
  const today = new Date();

  return {
    longDescription: `${companyNames[ticker] || `${ticker} Corporation`} is a technology company.`,
    exchangeCode: exchanges[Math.floor(Math.random() * exchanges.length)],
    name: companyNames[ticker] || `${ticker} Corporation`,
    startDate: formatDateForDB(subDays(today, 3650)), // 10 years ago
    ticker,
    endDate: formatDateForDB(addDays(today, 365)), // 1 year from now
  };
}
