/**
 * Text Processing Utilities for Sentiment Analysis
 * Ported from Android SetWordCountData.java
 */

/**
 * Remove numbers and percentages from text
 * Matches Android logic: replaceAll("-*\\+*\\d*.\\d*%", "")
 * @param text - Input text
 * @returns Text with numbers and percentages removed
 */
export function removeNumbersAndPercents(text: string): string {
  // Remove patterns like: 25%, +3.5%, -10.2%
  return text.replace(/-*\+*\d*\.?\d*%/g, '');
}

/**
 * Split text into sentences
 * Matches Android logic: split("(?<!\\w\\.\\w.)(?<!([A-Z][a-z])\\{30,\\}\\.)(?<=[.?])\\s")
 * Simplified version for TypeScript
 * @param text - Input text
 * @returns Array of sentences
 */
export function splitIntoSentences(text: string): string[] {
  // Remove quotes, commas, apostrophes
  const cleaned = text.replace(/["',]/g, '');

  // Split on sentence boundaries (. or ? followed by space)
  const sentences = cleaned.split(/(?<=[.?])\s+/);

  return sentences.filter((s) => s.trim().length > 0);
}

/**
 * Tokenize text into words
 * @param text - Input text
 * @returns Array of words
 */
export function tokenizeText(text: string): string[] {
  // Split on whitespace
  const words = text.split(/\s+/);

  return words.filter((w) => w.length > 0);
}

/**
 * Clean a word by removing non-alphabetic characters and converting to lowercase
 * Matches Android logic: toLowerCase().replaceAll("[^a-zA-Z]", "")
 * @param word - Input word
 * @returns Cleaned word (lowercase, only letters)
 */
export function cleanWord(word: string): string {
  return word.toLowerCase().replace(/[^a-zA-Z]/g, '');
}

/**
 * Get the first letter of a word (for vocabulary lookup)
 * @param word - Input word
 * @returns First letter (lowercase) or empty string if invalid
 */
export function getFirstLetter(word: string): string {
  const cleaned = cleanWord(word);
  return cleaned.length > 0 ? cleaned[0] : '';
}
