import { VocabularyData, SentimentType } from '@/types/sentiment.types';
import sentimentWordsData from '@/data/sentiment-words.json';

/**
 * Load and access sentiment vocabulary words
 */

// Cast the imported JSON to the correct type
const vocabularyData = sentimentWordsData as VocabularyData;

/**
 * Get the vocabulary data
 * @returns The complete vocabulary data with positive and negative words
 */
export function loadVocabulary(): VocabularyData {
  return vocabularyData;
}

/**
 * Check if a word is in the positive vocabulary
 * @param word - The word to check (will be converted to lowercase)
 * @returns true if the word is in the positive vocabulary
 */
export function isPositiveWord(word: string): boolean {
  if (!word || typeof word !== 'string') {
    return false;
  }

  const normalized = word.toLowerCase().trim();
  if (normalized.length === 0) {
    return false;
  }

  const firstLetter = normalized[0];
  if (!firstLetter.match(/[a-z]/)) {
    return false;
  }

  const words = vocabularyData.positive[firstLetter];
  return words ? words.includes(normalized) : false;
}

/**
 * Check if a word is in the negative vocabulary
 * @param word - The word to check (will be converted to lowercase)
 * @returns true if the word is in the negative vocabulary
 */
export function isNegativeWord(word: string): boolean {
  if (!word || typeof word !== 'string') {
    return false;
  }

  const normalized = word.toLowerCase().trim();
  if (normalized.length === 0) {
    return false;
  }

  const firstLetter = normalized[0];
  if (!firstLetter.match(/[a-z]/)) {
    return false;
  }

  const words = vocabularyData.negative[firstLetter];
  return words ? words.includes(normalized) : false;
}

/**
 * Check if a word is in a specific sentiment vocabulary
 * @param word - The word to check
 * @param sentimentType - The sentiment type ('positive' or 'negative')
 * @returns true if the word is in the specified vocabulary
 */
export function isSentimentWord(word: string, sentimentType: SentimentType): boolean {
  return sentimentType === 'positive' ? isPositiveWord(word) : isNegativeWord(word);
}

/**
 * Get all words for a specific letter and sentiment type
 * @param letter - The first letter of words to retrieve
 * @param sentimentType - The sentiment type
 * @returns Array of words starting with the letter, or empty array if none found
 */
export function getWordsByLetter(letter: string, sentimentType: SentimentType): string[] {
  if (!letter || typeof letter !== 'string' || letter.length === 0) {
    return [];
  }

  const normalized = letter.toLowerCase()[0];
  if (!normalized.match(/[a-z]/)) {
    return [];
  }

  return vocabularyData[sentimentType][normalized] || [];
}

/**
 * Get statistics about the vocabulary
 * @returns Object with counts of positive and negative words
 */
export function getVocabularyStats() {
  const positiveCount = Object.values(vocabularyData.positive).reduce(
    (sum, words) => sum + words.length,
    0
  );
  const negativeCount = Object.values(vocabularyData.negative).reduce(
    (sum, words) => sum + words.length,
    0
  );

  return {
    positiveCount,
    negativeCount,
    totalCount: positiveCount + negativeCount,
  };
}
