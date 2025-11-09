import {
  loadVocabulary,
  isPositiveWord,
  isNegativeWord,
  isSentimentWord,
  getWordsByLetter,
  getVocabularyStats,
} from '@/utils/sentiment/vocabularyLoader';

describe('vocabularyLoader', () => {
  describe('loadVocabulary', () => {
    it('should load vocabulary data without throwing errors', () => {
      expect(() => loadVocabulary()).not.toThrow();
    });

    it('should return vocabulary data with positive and negative properties', () => {
      const vocab = loadVocabulary();
      expect(vocab).toHaveProperty('positive');
      expect(vocab).toHaveProperty('negative');
    });

    it('should have all 26 letters for both positive and negative', () => {
      const vocab = loadVocabulary();
      for (let i = 'a'.charCodeAt(0); i <= 'z'.charCodeAt(0); i++) {
        const letter = String.fromCharCode(i);
        expect(vocab.positive).toHaveProperty(letter);
        expect(vocab.negative).toHaveProperty(letter);
      }
    });
  });

  describe('isPositiveWord', () => {
    it('should return true for known positive words', () => {
      expect(isPositiveWord('happy')).toBe(true);
      expect(isPositiveWord('good')).toBe(true);
      expect(isPositiveWord('great')).toBe(true);
    });

    it('should return false for unknown words', () => {
      expect(isPositiveWord('xyzabc')).toBe(false);
      expect(isPositiveWord('randomword123')).toBe(false);
    });

    it('should be case-insensitive', () => {
      expect(isPositiveWord('HAPPY')).toBe(true);
      expect(isPositiveWord('Happy')).toBe(true);
      expect(isPositiveWord('happy')).toBe(true);
    });

    it('should handle edge cases', () => {
      expect(isPositiveWord('')).toBe(false);
      expect(isPositiveWord('  ')).toBe(false);
      expect(isPositiveWord('123')).toBe(false);
      expect(isPositiveWord('!@#')).toBe(false);
    });

    it('should handle null/undefined gracefully', () => {
      expect(isPositiveWord(null as any)).toBe(false);
      expect(isPositiveWord(undefined as any)).toBe(false);
    });
  });

  describe('isNegativeWord', () => {
    it('should return true for known negative words', () => {
      expect(isNegativeWord('bad')).toBe(true);
      expect(isNegativeWord('terrible')).toBe(true);
      expect(isNegativeWord('awful')).toBe(true);
    });

    it('should return false for unknown words', () => {
      expect(isNegativeWord('xyzabc')).toBe(false);
    });

    it('should be case-insensitive', () => {
      expect(isNegativeWord('BAD')).toBe(true);
      expect(isNegativeWord('Bad')).toBe(true);
      expect(isNegativeWord('bad')).toBe(true);
    });

    it('should handle edge cases', () => {
      expect(isNegativeWord('')).toBe(false);
      expect(isNegativeWord('  ')).toBe(false);
      expect(isNegativeWord('123')).toBe(false);
    });
  });

  describe('isSentimentWord', () => {
    it('should check positive sentiment type', () => {
      expect(isSentimentWord('happy', 'positive')).toBe(true);
      expect(isSentimentWord('bad', 'positive')).toBe(false);
    });

    it('should check negative sentiment type', () => {
      expect(isSentimentWord('bad', 'negative')).toBe(true);
      expect(isSentimentWord('happy', 'negative')).toBe(false);
    });
  });

  describe('getWordsByLetter', () => {
    it('should return words for a valid letter', () => {
      const wordsA = getWordsByLetter('a', 'positive');
      expect(Array.isArray(wordsA)).toBe(true);
      expect(wordsA.length).toBeGreaterThan(0);
    });

    it('should return empty array for invalid input', () => {
      expect(getWordsByLetter('', 'positive')).toEqual([]);
      expect(getWordsByLetter('1', 'positive')).toEqual([]);
      expect(getWordsByLetter('!', 'positive')).toEqual([]);
    });

    it('should be case-insensitive for letter', () => {
      const wordsLowerA = getWordsByLetter('a', 'positive');
      const wordsUpperA = getWordsByLetter('A', 'positive');
      expect(wordsLowerA).toEqual(wordsUpperA);
    });
  });

  describe('getVocabularyStats', () => {
    it('should return statistics with positive, negative, and total counts', () => {
      const stats = getVocabularyStats();
      expect(stats).toHaveProperty('positiveCount');
      expect(stats).toHaveProperty('negativeCount');
      expect(stats).toHaveProperty('totalCount');
    });

    it('should have counts greater than zero', () => {
      const stats = getVocabularyStats();
      expect(stats.positiveCount).toBeGreaterThan(0);
      expect(stats.negativeCount).toBeGreaterThan(0);
      expect(stats.totalCount).toBeGreaterThan(0);
    });

    it('should have totalCount equal to sum of positive and negative', () => {
      const stats = getVocabularyStats();
      expect(stats.totalCount).toBe(stats.positiveCount + stats.negativeCount);
    });

    it('should match expected word counts from extraction (~1200 total)', () => {
      const stats = getVocabularyStats();
      expect(stats.totalCount).toBeGreaterThan(1000);
      expect(stats.totalCount).toBeLessThan(1500);
    });
  });
});
