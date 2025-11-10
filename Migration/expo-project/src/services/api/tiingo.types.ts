/**
 * Tiingo API Response Types
 * Documentation: https://api.tiingo.com/documentation/general/overview
 */

export interface TiingoStockPrice {
  date: string; // ISO 8601 format "2025-01-15T00:00:00.000Z"
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjOpen: number;
  adjHigh: number;
  adjLow: number;
  adjClose: number;
  adjVolume: number;
  divCash: number;
  splitFactor: number;
}

export interface TiingoSymbolMetadata {
  ticker: string;
  name: string;
  exchangeCode: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface TiingoApiConfig {
  apiKey: string;
  baseURL?: string;
  timeout?: number;
}
