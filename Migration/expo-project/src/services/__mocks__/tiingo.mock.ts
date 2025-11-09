/**
 * Mock Tiingo API Service for Development/Testing
 * Returns realistic mock data without making actual API calls
 */

import type { TiingoStockPrice, TiingoSymbolMetadata } from '../api/tiingo.types';
import { generateMockStockData } from '@/utils/mockData/stockMock';
import { getDatesInRange } from '@/utils/date/dateUtils';

/**
 * Mock implementation of fetchStockPrices
 * Generates realistic stock price data using the random walk algorithm
 */
export async function fetchStockPrices(
  ticker: string,
  startDate: string,
  endDate?: string
): Promise<TiingoStockPrice[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const end = endDate || new Date().toISOString().substring(0, 10);
  const dates = getDatesInRange(startDate, end);

  // Generate mock stock data
  const mockStockData = generateMockStockData(ticker, dates.length);

  // Transform to Tiingo format
  const tiingoData: TiingoStockPrice[] = mockStockData.map((stock, index) => ({
    date: `${dates[index]}T00:00:00.000Z`,
    open: stock.open,
    high: stock.high,
    low: stock.low,
    close: stock.close,
    volume: stock.volume,
    adjOpen: stock.open,
    adjHigh: stock.high,
    adjLow: stock.low,
    adjClose: stock.close,
    adjVolume: stock.volume,
    divCash: 0,
    splitFactor: 1,
  }));

  console.log(`[MockTiingoService] Generated ${tiingoData.length} mock prices for ${ticker}`);
  return tiingoData;
}

/**
 * Mock implementation of fetchSymbolMetadata
 * Returns predefined metadata for common tickers
 */
export async function fetchSymbolMetadata(
  ticker: string
): Promise<TiingoSymbolMetadata> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Predefined metadata for common tickers
  const metadata: Record<string, TiingoSymbolMetadata> = {
    AAPL: {
      ticker: 'AAPL',
      name: 'Apple Inc.',
      exchangeCode: 'NASDAQ',
      startDate: '1980-12-12',
      endDate: '2025-12-31',
      description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.',
    },
    GOOGL: {
      ticker: 'GOOGL',
      name: 'Alphabet Inc.',
      exchangeCode: 'NASDAQ',
      startDate: '2004-08-19',
      endDate: '2025-12-31',
      description: 'Alphabet Inc. offers various products and platforms in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America.',
    },
    MSFT: {
      ticker: 'MSFT',
      name: 'Microsoft Corporation',
      exchangeCode: 'NASDAQ',
      startDate: '1986-03-13',
      endDate: '2025-12-31',
      description: 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide.',
    },
    TSLA: {
      ticker: 'TSLA',
      name: 'Tesla, Inc.',
      exchangeCode: 'NASDAQ',
      startDate: '2010-06-29',
      endDate: '2025-12-31',
      description: 'Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems.',
    },
    AMZN: {
      ticker: 'AMZN',
      name: 'Amazon.com, Inc.',
      exchangeCode: 'NASDAQ',
      startDate: '1997-05-15',
      endDate: '2025-12-31',
      description: 'Amazon.com, Inc. engages in the retail sale of consumer products and subscriptions in North America and internationally.',
    },
  };

  // Return metadata for known ticker or generate generic one
  if (metadata[ticker]) {
    console.log(`[MockTiingoService] Returning metadata for ${ticker}`);
    return metadata[ticker];
  }

  // Generate generic metadata for unknown tickers
  const generic: TiingoSymbolMetadata = {
    ticker,
    name: `${ticker} Corporation`,
    exchangeCode: 'NASDAQ',
    startDate: '2010-01-01',
    endDate: '2025-12-31',
    description: `${ticker} is a publicly traded company.`,
  };

  console.log(`[MockTiingoService] Generating generic metadata for ${ticker}`);
  return generic;
}

/**
 * Mock implementation of setTiingoApiKey
 * No-op for mock service
 */
export function setTiingoApiKey(apiKey: string): void {
  console.log('[MockTiingoService] API key set (mock mode)');
}
