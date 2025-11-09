/**
 * Tiingo API Service
 * Fetches stock prices and company metadata from Tiingo API
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import type { TiingoStockPrice, TiingoSymbolMetadata } from './tiingo.types';
import type { StockDetails, SymbolDetails } from '@/types/database.types';

// Tiingo API configuration
const TIINGO_BASE_URL = 'https://api.tiingo.com';
const TIINGO_TIMEOUT = 10000; // 10 seconds

// API key management - use environment variable or expo-secure-store
let tiingoApiKey: string | null = null;

/**
 * Set the Tiingo API key
 * @param apiKey - Tiingo API key from https://api.tiingo.com
 */
export function setTiingoApiKey(apiKey: string): void {
  tiingoApiKey = apiKey;
}

/**
 * Get the configured API key
 * @throws Error if API key is not set
 */
function getApiKey(): string {
  if (!tiingoApiKey) {
    throw new Error(
      'Tiingo API key not configured. Call setTiingoApiKey() first or set TIINGO_API_KEY environment variable.'
    );
  }
  return tiingoApiKey;
}

/**
 * Create axios instance for Tiingo API
 */
function createTiingoClient(): AxiosInstance {
  return axios.create({
    baseURL: TIINGO_BASE_URL,
    timeout: TIINGO_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Retry logic with exponential backoff
 * @param fn - Function to retry
 * @param retries - Number of retries (default: 3, 0 in test mode)
 * @returns Promise with result
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries: number = process.env.NODE_ENV === 'test' ? 0 : 3
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on client errors (400, 404, etc.)
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status && status >= 400 && status < 500 && status !== 429) {
          throw error;
        }
      }

      // Last attempt failed
      if (i === retries) {
        break;
      }

      // Exponential backoff: 2s, 4s, 8s
      const delay = Math.pow(2, i + 1) * 1000;
      console.log(`[TiingoService] Retry ${i + 1}/${retries} after ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Fetch stock prices from Tiingo API
 * @param ticker - Stock ticker symbol (e.g., "AAPL")
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format (optional, defaults to today)
 * @returns Array of stock price data
 * @throws Error if ticker not found or API request fails
 */
export async function fetchStockPrices(
  ticker: string,
  startDate: string,
  endDate?: string
): Promise<TiingoStockPrice[]> {
  const apiKey = getApiKey();
  const client = createTiingoClient();

  const fetchFn = async () => {
    try {
      const params: Record<string, string> = {
        startDate,
        token: apiKey,
      };

      if (endDate) {
        params.endDate = endDate;
      }

      console.log(`[TiingoService] Fetching prices for ${ticker} from ${startDate} to ${endDate || 'today'}`);

      const response = await client.get<TiingoStockPrice[]>(
        `/tiingo/daily/${ticker}/prices`,
        { params }
      );

      console.log(`[TiingoService] Fetched ${response.data.length} price records for ${ticker}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;

        if (status === 404) {
          throw new Error(`Ticker '${ticker}' not found`);
        }

        if (status === 429) {
          throw new Error('Rate limit exceeded. Please try again in a moment.');
        }

        if (status === 401) {
          throw new Error('Invalid API key. Please check your Tiingo API key.');
        }
      }

      console.error('[TiingoService] Error fetching stock prices:', error);
      throw new Error(`Failed to fetch stock prices for ${ticker}: ${error}`);
    }
  };

  return retryWithBackoff(fetchFn);
}

/**
 * Fetch company metadata from Tiingo API
 * @param ticker - Stock ticker symbol (e.g., "AAPL")
 * @returns Company metadata
 * @throws Error if ticker not found or API request fails
 */
export async function fetchSymbolMetadata(
  ticker: string
): Promise<TiingoSymbolMetadata> {
  const apiKey = getApiKey();
  const client = createTiingoClient();

  const fetchFn = async () => {
    try {
      console.log(`[TiingoService] Fetching metadata for ${ticker}`);

      const response = await client.get<TiingoSymbolMetadata>(
        `/tiingo/daily/${ticker}`,
        {
          params: { token: apiKey },
        }
      );

      console.log(`[TiingoService] Fetched metadata for ${ticker}: ${response.data.name}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;

        if (status === 404) {
          throw new Error(`Ticker '${ticker}' not found`);
        }

        if (status === 429) {
          throw new Error('Rate limit exceeded. Please try again in a moment.');
        }
      }

      console.error('[TiingoService] Error fetching symbol metadata:', error);
      throw new Error(`Failed to fetch metadata for ${ticker}: ${error}`);
    }
  };

  return retryWithBackoff(fetchFn);
}

/**
 * Transform Tiingo API response to StockDetails database format
 * @param price - Tiingo stock price data
 * @param ticker - Stock ticker symbol
 * @returns StockDetails object ready for database insertion
 */
export function transformTiingoToStockDetails(
  price: TiingoStockPrice,
  ticker: string
): StockDetails {
  // Extract date (first 10 characters: YYYY-MM-DD)
  const date = price.date.substring(0, 10);

  // Round prices to 2 decimal places (matching Android logic)
  const round = (num: number) => Math.round(num * 100) / 100;

  return {
    ticker,
    date,
    close: round(price.close),
    high: round(price.high),
    low: round(price.low),
    open: round(price.open),
    volume: price.volume,
    // Additional fields (set to default values for now)
    hash: 0,
    news_count: 0,
    next: '',
    week: '',
    month: '',
    pos: 0,
    neg: 0,
    sent_score: 0,
    label_pos: 0,
    label_neg: 0,
    change_one: 0,
    change_two: 0,
    change_month: 0,
    pbRatio: 0,
    trailingPEG1Y: 0,
  };
}

/**
 * Transform Tiingo symbol metadata to SymbolDetails database format
 * @param metadata - Tiingo symbol metadata
 * @returns SymbolDetails object ready for database insertion
 */
export function transformTiingoToSymbolDetails(
  metadata: TiingoSymbolMetadata
): SymbolDetails {
  return {
    ticker: metadata.ticker,
    name: metadata.name,
    exchangeCode: metadata.exchangeCode,
    startDate: metadata.startDate,
    endDate: metadata.endDate,
    longDescription: metadata.description,
  };
}
