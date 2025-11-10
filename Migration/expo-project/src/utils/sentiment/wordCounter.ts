/**
 * Word Counter for Bag-of-Words Sentiment Analysis
 * Ported from Android SetWordCountData.java recordWordCounts() method
 */

import { loadVocabulary } from './vocabularyLoader';
import { cleanWord, getFirstLetter } from './textProcessor';

export interface WordCounts {
  positive: number;
  negative: number;
}

/**
 * Count positive and negative sentiment words in text
 * Matches Android bag-of-words logic exactly
 * @param text - Article text to analyze
 * @returns Object with positive and negative word counts
 */
export function countSentimentWords(text: string): WordCounts {
  const vocabulary = loadVocabulary();

  let positive = 0;
  let negative = 0;

  // Split into words
  const words = text.split(/\s+/);

  // Sort alphabetically (matches Android logic for optimization)
  const sortedWords = words.sort();

  // Track current letter to avoid re-loading word lists
  let currentLetter = '';
  let positiveWords: string[] = [];
  let negativeWords: string[] = [];

  for (const word of sortedWords) {
    // Clean word: lowercase and remove non-alphabetic chars
    const cleanedWord = cleanWord(word);

    // Skip words that are too short (matches Android check: length > 1)
    if (cleanedWord.length <= 1) {
      continue;
    }

    // Get first letter
    const firstLetter = cleanedWord[0];

    // Only reload word lists when letter changes (optimization)
    if (firstLetter !== currentLetter) {
      currentLetter = firstLetter;
      positiveWords = vocabulary.positive[firstLetter] || [];
      negativeWords = vocabulary.negative[firstLetter] || [];
    }

    // Check if word is in positive or negative lists
    if (positiveWords.includes(cleanedWord)) {
      positive++;
    }

    if (negativeWords.includes(cleanedWord)) {
      negative++;
    }
  }

  return {
    positive,
    negative,
  };
}

/**
 * Analyze text and return word counts with cleaned text
 * @param text - Raw article text
 * @returns Word counts and processed text
 */
export function analyzeSentimentWords(text: string): {
  counts: WordCounts;
  cleanedText: string;
} {
  // Remove numbers and percentages (matches Android preprocessing)
  const cleanedText = text.replace(/-*\+*\d*\.?\d*%/g, '');

  // Count words
  const counts = countSentimentWords(cleanedText);

  return {
    counts,
    cleanedText,
  };
}
