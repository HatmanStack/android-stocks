/**
 * API Configuration Constants
 * Central configuration for all external API endpoints and timeouts
 */

/**
 * API Endpoint URLs
 */
export const API_ENDPOINTS = {
  // Python Microservices (Google Cloud Run)
  SENTIMENT_ANALYSIS: 'https://stocks-backend-sentiment-f3jmjyxrpq-uc.a.run.app',
  STOCK_PREDICTION: 'https://stocks-f3jmjyxrpq-uc.a.run.app',

  // Stock Data APIs
  TIINGO_BASE: 'https://api.tiingo.com',
  POLYGON_BASE: 'https://api.polygon.io',
} as const;

/**
 * API Timeout Values (in milliseconds)
 */
export const API_TIMEOUTS = {
  SENTIMENT: 30000, // 30s (FinBERT can be slow on cold start)
  PREDICTION: 15000, // 15s
  TIINGO: 10000, // 10s
  POLYGON: 10000, // 10s
} as const;

/**
 * API Rate Limits
 */
export const API_RATE_LIMITS = {
  POLYGON_FREE_TIER: 5, // 5 requests per minute
  TIINGO_FREE_TIER: 500, // 500 requests per hour
} as const;
