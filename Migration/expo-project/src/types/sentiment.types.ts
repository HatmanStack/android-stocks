/**
 * Sentiment types for vocabulary data and sentiment analysis
 */

export type SentimentType = 'positive' | 'negative';

export type SentimentWords = Record<string, string[]>;

export interface VocabularyData {
  positive: SentimentWords;
  negative: SentimentWords;
}

export type SentimentLabel = 'POS' | 'NEUT' | 'NEG';

export interface SentimentResult {
  positiveCount: number;
  negativeCount: number;
  sentiment: SentimentLabel;
  score: number;
}
