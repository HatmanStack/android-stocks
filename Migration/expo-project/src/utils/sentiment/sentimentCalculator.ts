/**
 * Sentiment Calculator
 * Calculates sentiment labels and scores from word counts
 */

export type SentimentLabel = 'POS' | 'NEUT' | 'NEG';

/**
 * Calculate sentiment label from positive and negative word counts
 * @param positive - Count of positive words
 * @param negative - Count of negative words
 * @returns Sentiment label: 'POS', 'NEUT', or 'NEG'
 */
export function calculateSentiment(
  positive: number,
  negative: number
): SentimentLabel {
  if (positive > negative) {
    return 'POS';
  } else if (negative > positive) {
    return 'NEG';
  } else {
    return 'NEUT';
  }
}

/**
 * Calculate sentiment score (normalized between -1 and +1)
 * @param positive - Count of positive words
 * @param negative - Count of negative words
 * @returns Sentiment score in range [-1, 1]
 *          +1 = all positive, -1 = all negative, 0 = neutral
 */
export function calculateSentimentScore(
  positive: number,
  negative: number
): number {
  const total = positive + negative;

  if (total === 0) {
    return 0; // No sentiment words found
  }

  // Score = (positive - negative) / total
  // Range: -1 (all negative) to +1 (all positive)
  return (positive - negative) / total;
}

/**
 * Get descriptive sentiment information
 * @param positive - Count of positive words
 * @param negative - Count of negative words
 * @returns Object with label, score, and description
 */
export function getSentimentInfo(positive: number, negative: number): {
  label: SentimentLabel;
  score: number;
  description: string;
  positive: number;
  negative: number;
  total: number;
} {
  const label = calculateSentiment(positive, negative);
  const score = calculateSentimentScore(positive, negative);
  const total = positive + negative;

  let description: string;
  if (label === 'POS') {
    description = 'Positive sentiment';
  } else if (label === 'NEG') {
    description = 'Negative sentiment';
  } else {
    description = 'Neutral sentiment';
  }

  return {
    label,
    score,
    description,
    positive,
    negative,
    total,
  };
}
