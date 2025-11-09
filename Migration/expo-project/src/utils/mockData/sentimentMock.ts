/**
 * Mock data generators for sentiment analysis
 */

import { WordCountDetails, CombinedWordDetails } from '@/types/database.types';
import { SentimentLabel } from '@/types/sentiment.types';

/**
 * Calculate sentiment label from word counts
 * @param positive - Positive word count
 * @param negative - Negative word count
 * @returns Sentiment label
 */
function calculateSentiment(positive: number, negative: number): SentimentLabel {
  if (positive > negative * 1.2) return 'POS';
  if (negative > positive * 1.2) return 'NEG';
  return 'NEUT';
}

/**
 * Calculate sentiment score from word counts
 * @param positive - Positive word count
 * @param negative - Negative word count
 * @returns Sentiment score between -1 and 1
 */
function calculateSentimentScore(positive: number, negative: number): number {
  const total = positive + negative;
  if (total === 0) return 0;
  return (positive - negative) / total;
}

/**
 * Generate mock word count (per-article sentiment)
 * @param ticker - Stock ticker
 * @param date - Date string
 * @param hash - Article hash
 * @returns Mock word count details
 */
export function generateMockWordCount(
  ticker: string,
  date: string,
  hash: number
): Omit<WordCountDetails, 'id'> {
  const positive = Math.floor(Math.random() * 50);
  const negative = Math.floor(Math.random() * 30);
  const sentiment = calculateSentiment(positive, negative);
  const sentimentNumber = calculateSentimentScore(positive, negative);

  return {
    date,
    hash,
    ticker,
    positive,
    negative,
    nextDay: (Math.random() - 0.5) * 0.1, // -5% to +5%
    twoWks: (Math.random() - 0.5) * 0.2, // -10% to +10%
    oneMnth: (Math.random() - 0.5) * 0.3, // -15% to +15%
    body: `Mock article content for ${ticker}`,
    sentiment,
    sentimentNumber,
  };
}

/**
 * Generate mock combined word count (daily aggregated sentiment)
 * @param ticker - Stock ticker
 * @param date - Date string
 * @param articleCount - Number of articles to simulate
 * @returns Mock combined word details
 */
export function generateMockCombinedWordCount(
  ticker: string,
  date: string,
  articleCount: number = 5
): CombinedWordDetails {
  // Aggregate counts from multiple articles
  let totalPositive = 0;
  let totalNegative = 0;

  for (let i = 0; i < articleCount; i++) {
    totalPositive += Math.floor(Math.random() * 50);
    totalNegative += Math.floor(Math.random() * 30);
  }

  const sentiment = calculateSentiment(totalPositive, totalNegative);
  const sentimentNumber = calculateSentimentScore(totalPositive, totalNegative);

  return {
    date,
    ticker,
    positive: totalPositive,
    negative: totalNegative,
    sentimentNumber,
    sentiment,
    nextDay: (Math.random() - 0.5) * 0.1,
    twoWks: (Math.random() - 0.5) * 0.2,
    oneMnth: (Math.random() - 0.5) * 0.3,
    updateDate: new Date().toISOString(),
  };
}
