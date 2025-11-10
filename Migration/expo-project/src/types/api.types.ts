/**
 * API Request/Response Types for External Services
 * Used for Python microservices (FinBERT sentiment & logistic regression predictions)
 */

/**
 * Sentiment Analysis Service (FinBERT on Google Cloud Run)
 */
export interface SentimentAnalysisRequest {
  text: string[]; // Array of sentences from article
  hash: string; // Hash of the article body
}

export interface SentimentAnalysisResponse {
  positive: [string, string]; // [count, confidence_score]
  neutral: [string, string]; // [count, confidence_score]
  negative: [string, string]; // [count, confidence_score]
  hash: string;
}

/**
 * Stock Prediction Service (Logistic Regression on Google Cloud Run)
 */
export interface StockPredictionRequest {
  ticker: string;
  close: number[]; // Closing prices
  volume: number[]; // Trading volumes
  positive: number[]; // Positive word counts
  negative: number[]; // Negative word counts
  sentiment: number[]; // Sentiment scores
}

export interface StockPredictionResponse {
  next: string; // 1-day prediction
  week: string; // 2-week prediction
  month: string; // 1-month prediction
  ticker: string;
}
