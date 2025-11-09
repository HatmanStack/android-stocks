/**
 * Stock Prediction Service
 * Calls logistic regression microservice on Google Cloud Run for stock predictions
 */

import axios from 'axios';
import { API_ENDPOINTS, API_TIMEOUTS } from '@/constants/api.constants';
import type {
  StockPredictionRequest,
  StockPredictionResponse,
} from '@/types/api.types';

/**
 * Get stock price predictions using logistic regression model
 * @param ticker - Stock ticker symbol
 * @param closePrices - Array of closing prices
 * @param volumes - Array of trading volumes
 * @param positiveCounts - Array of positive word counts from sentiment analysis
 * @param negativeCounts - Array of negative word counts from sentiment analysis
 * @param sentimentScores - Array of sentiment scores
 * @returns Prediction results for next day, 2 weeks, and 1 month
 * @throws Error if service is unavailable or request fails
 */
export async function getStockPredictions(
  ticker: string,
  closePrices: number[],
  volumes: number[],
  positiveCounts: number[],
  negativeCounts: number[],
  sentimentScores: number[]
): Promise<StockPredictionResponse> {
  const request: StockPredictionRequest = {
    ticker,
    close: closePrices,
    volume: volumes,
    positive: positiveCounts,
    negative: negativeCounts,
    sentiment: sentimentScores,
  };

  try {
    console.log(
      `[PredictionService] Getting predictions for ${ticker} (${closePrices.length} data points)`
    );

    const response = await axios.post<StockPredictionResponse>(
      API_ENDPOINTS.STOCK_PREDICTION,
      request,
      {
        timeout: API_TIMEOUTS.PREDICTION,
        headers: { 'Content-Type': 'application/json' },
      }
    );

    console.log(
      `[PredictionService] Predictions for ${ticker}: next=${response.data.next}, week=${response.data.week}, month=${response.data.month}`
    );

    return response.data;
  } catch (error) {
    console.error('[PredictionService] Error getting predictions:', error);

    // Handle timeout
    if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
      throw new Error('Prediction request timed out. Please try again.');
    }

    // Handle service unavailable
    if (axios.isAxiosError(error) && error.response?.status === 503) {
      throw new Error('Prediction service is temporarily unavailable.');
    }

    // Handle bad request (invalid data)
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      throw new Error(
        'Invalid data provided for prediction. Please check input parameters.'
      );
    }

    throw new Error(`Stock prediction failed: ${error}`);
  }
}

/**
 * Parse prediction response to numeric values
 * @param response - Raw prediction response
 * @returns Parsed prediction values as numbers
 */
export function parsePredictionResponse(response: StockPredictionResponse): {
  nextDay: number;
  twoWeeks: number;
  oneMonth: number;
  ticker: string;
} {
  return {
    nextDay: parseFloat(response.next),
    twoWeeks: parseFloat(response.week),
    oneMonth: parseFloat(response.month),
    ticker: response.ticker,
  };
}

/**
 * Get fallback predictions when service is unavailable
 * Returns default values (0.0 for all timeframes)
 * @param ticker - Stock ticker symbol
 * @returns Default prediction response
 */
export function getDefaultPredictions(ticker: string): StockPredictionResponse {
  console.warn(
    `[PredictionService] Using default predictions for ${ticker} (service unavailable)`
  );

  return {
    next: '0.0',
    week: '0.0',
    month: '0.0',
    ticker,
  };
}
