/**
 * Mock data generator for portfolio
 */

import { PortfolioDetails } from '@/types/database.types';

/**
 * Generate mock portfolio entries for given tickers
 * @param tickers - Array of stock tickers
 * @returns Array of mock portfolio details
 */
export function generateMockPortfolio(tickers: string[]): PortfolioDetails[] {
  const companyNames: Record<string, string> = {
    AAPL: 'Apple Inc.',
    GOOGL: 'Alphabet Inc.',
    MSFT: 'Microsoft Corporation',
    TSLA: 'Tesla, Inc.',
    AMZN: 'Amazon.com, Inc.',
  };

  return tickers.map(ticker => ({
    ticker,
    name: companyNames[ticker] || `${ticker} Corporation`,
    next: `${(Math.random() * 10 - 5).toFixed(2)}%`, // -5% to +5%
    wks: `${(Math.random() * 20 - 10).toFixed(2)}%`, // -10% to +10%
    mnth: `${(Math.random() * 30 - 15).toFixed(2)}%`, // -15% to +15%
  }));
}
