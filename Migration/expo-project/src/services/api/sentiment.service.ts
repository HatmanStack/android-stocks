/**
 * Sentiment Analysis Service
 * Calls FinBERT microservice on Google Cloud Run for deep learning sentiment analysis
 */

import axios from 'axios';
import { API_TIMEOUTS } from '@/constants/api.constants';
import { env } from '@/config/env';
import type {
  SentimentAnalysisRequest,
  SentimentAnalysisResponse,
} from '@/types/api.types';

/**
 * Analyze sentiment of article text using FinBERT model
 * @param articleText - Full article text
 * @param hash - Hash of the article for deduplication
 * @returns Sentiment analysis result with counts and confidence scores
 * @throws Error if service is unavailable or request fails
 */
export async function analyzeSentiment(
  articleText: string,
  hash: string
): Promise<SentimentAnalysisResponse> {
  // Split article into sentences (matches Android logic)
  // Remove quotes, commas, and apostrophes, then split on sentence boundaries
  const sentences = articleText
    .replace(/["',]/g, '') // Remove quotes and commas
    .split(/(?<=[.?])\s+/); // Split on sentence boundaries

  const request: SentimentAnalysisRequest = {
    text: sentences,
    hash: hash,
  };

  try {
    console.log(
      `[SentimentService] Analyzing sentiment for hash ${hash} (${sentences.length} sentences)`
    );

    const response = await axios.post<SentimentAnalysisResponse>(
      env.sentimentApiUrl,
      request,
      {
        timeout: API_TIMEOUTS.SENTIMENT,
        headers: { 'Content-Type': 'application/json' },
      }
    );

    console.log(
      `[SentimentService] Analysis complete for hash ${hash}: POS=${response.data.positive[0]}, NEG=${response.data.negative[0]}, NEUT=${response.data.neutral[0]}`
    );

    return response.data;
  } catch (error) {
    console.error('[SentimentService] Error analyzing sentiment:', error);

    // Handle cold start timeouts gracefully
    if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
      throw new Error(
        'Sentiment analysis timed out (service cold start). Please try again.'
      );
    }

    // Handle service unavailable
    if (axios.isAxiosError(error) && error.response?.status === 503) {
      throw new Error('Sentiment analysis service is temporarily unavailable.');
    }

    throw new Error(`Sentiment analysis failed: ${error}`);
  }
}

/**
 * Convert sentiment response to simplified format
 * @param response - Raw sentiment analysis response from FinBERT
 * @returns Simplified sentiment result
 */
export function parseSentimentResult(response: SentimentAnalysisResponse): {
  sentiment: 'POS' | 'NEUT' | 'NEG';
  score: number;
  counts: {
    positive: number;
    neutral: number;
    negative: number;
  };
} {
  const posCount = parseInt(response.positive[0]);
  const neutCount = parseInt(response.neutral[0]);
  const negCount = parseInt(response.negative[0]);

  let sentiment: 'POS' | 'NEUT' | 'NEG';
  let score: number;

  // Determine dominant sentiment
  if (posCount > neutCount && posCount > negCount) {
    sentiment = 'POS';
    score = parseFloat(response.positive[1]);
  } else if (negCount > neutCount) {
    sentiment = 'NEG';
    score = parseFloat(response.negative[1]);
  } else {
    sentiment = 'NEUT';
    score = parseFloat(response.neutral[1]);
  }

  return {
    sentiment,
    score,
    counts: {
      positive: posCount,
      neutral: neutCount,
      negative: negCount,
    },
  };
}
