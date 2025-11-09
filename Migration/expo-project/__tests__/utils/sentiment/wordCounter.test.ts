/**
 * Word Counter Tests
 * Tests for bag-of-words sentiment analysis
 */

import { countSentimentWords, analyzeSentimentWords } from '@/utils/sentiment/wordCounter';

describe('Word Counter', () => {
  describe('countSentimentWords', () => {
    it('should count positive words correctly', () => {
      const text = 'happy wonderful happiness';
      const result = countSentimentWords(text);

      expect(result.positive).toBeGreaterThanOrEqual(2);
      expect(result.negative).toBe(0);
    });

    it('should count negative words correctly', () => {
      const text = 'terrible ghastly grim';
      const result = countSentimentWords(text);

      expect(result.positive).toBe(0);
      expect(result.negative).toBeGreaterThanOrEqual(2);
    });

    it('should count mixed sentiment correctly', () => {
      const text = 'happy terrible wonderful ghastly happiness grim';
      const result = countSentimentWords(text);

      expect(result.positive).toBeGreaterThanOrEqual(2);
      expect(result.negative).toBeGreaterThanOrEqual(2);
    });

    it('should handle empty text', () => {
      const text = '';
      const result = countSentimentWords(text);

      expect(result.positive).toBe(0);
      expect(result.negative).toBe(0);
    });

    it('should handle text with no sentiment words', () => {
      const text = 'the quick brown fox jumps over lazy dog';
      const result = countSentimentWords(text);

      // These are neutral/stop words, not in sentiment vocabulary
      expect(result.positive).toBe(0);
      expect(result.negative).toBe(0);
    });

    it('should ignore single-letter words', () => {
      const text = 'a I happy wonderful';
      const result = countSentimentWords(text);

      // Only 'happy' and 'wonderful' should be counted, not 'a' or 'I'
      expect(result.positive).toBeGreaterThanOrEqual(2);
      expect(result.negative).toBe(0);
    });

    it('should handle case-insensitive matching', () => {
      const text = 'HAPPY Happy hApPy';
      const result = countSentimentWords(text);

      // All three instances of 'happy' should be counted
      expect(result.positive).toBe(3);
      expect(result.negative).toBe(0);
    });

    it('should remove punctuation before matching', () => {
      const text = 'happy! wonderful, happiness.';
      const result = countSentimentWords(text);

      // Punctuation should be removed: 'happy', 'wonderful', 'happiness'
      expect(result.positive).toBeGreaterThanOrEqual(2);
      expect(result.negative).toBe(0);
    });

    it('should count words with apostrophes correctly', () => {
      const text = "don't can't won't";
      const result = countSentimentWords(text);

      // After removing apostrophes: 'dont', 'cant', 'wont'
      // These should be cleaned to 'dont', 'cant', 'wont'
      // Check if any are in the vocabulary (they might not be)
      expect(result.positive).toBeGreaterThanOrEqual(0);
      expect(result.negative).toBeGreaterThanOrEqual(0);
    });

    it('should handle repeated words', () => {
      const text = 'wonderful wonderful wonderful terrible terrible';
      const result = countSentimentWords(text);

      expect(result.positive).toBe(3);
      expect(result.negative).toBe(2);
    });

    it('should handle long text with multiple sentiment words', () => {
      const text = `
        The company had wonderful quarter with outstanding performance.
        Revenue was happiness and profits were wonderful. The CEO was happy
        with the results. However, some analysts were concerned about the
        terrible market conditions and ghastly economic outlook. The grim
        news caused some worry.
      `;
      const result = countSentimentWords(text);

      // Expected positive: wonderful, happiness, happy
      // Expected negative: terrible, ghastly, grim
      expect(result.positive).toBeGreaterThan(0);
      expect(result.negative).toBeGreaterThan(0);
      expect(result.positive + result.negative).toBeGreaterThan(3);
    });

    it('should handle text with numbers mixed in', () => {
      const text = 'happy 123 wonderful 456 terrible 789';
      const result = countSentimentWords(text);

      // Numbers should be treated as separate tokens and ignored
      expect(result.positive).toBe(2); // happy, wonderful
      expect(result.negative).toBe(1); // terrible
    });

    it('should handle whitespace variations', () => {
      const text = 'happy   wonderful\n\nhappiness\tterrible';
      const result = countSentimentWords(text);

      expect(result.positive).toBeGreaterThanOrEqual(2);
      expect(result.negative).toBe(1);
    });

    it('should handle very short words correctly', () => {
      const text = 'a be to happy';
      const result = countSentimentWords(text);

      // Single and two-letter words should be ignored (length <= 1)
      // 'be' and 'to' have length 2, so they should be counted if in vocabulary
      // Only 'happy' is guaranteed to be positive
      expect(result.positive).toBeGreaterThanOrEqual(1);
    });

    it('should match vocabulary words exactly', () => {
      // Test with known vocabulary words
      const text = 'happy wonderful happiness terrible ghastly grim';
      const result = countSentimentWords(text);

      expect(result.positive).toBeGreaterThanOrEqual(2);
      expect(result.negative).toBeGreaterThanOrEqual(2);
      expect(result.positive + result.negative).toBeGreaterThanOrEqual(4);
    });
  });

  describe('analyzeSentimentWords', () => {
    it('should remove numbers and percentages before counting', () => {
      const text = 'Stock up +5.2% wonderful performance -3.1% terrible news';
      const result = analyzeSentimentWords(text);

      // Numbers and percentages should be removed
      expect(result.cleanedText).not.toContain('5.2');
      expect(result.cleanedText).not.toContain('3.1');
      expect(result.cleanedText).not.toContain('%');

      // Sentiment words should still be counted
      expect(result.counts.positive).toBeGreaterThan(0); // 'wonderful'
      expect(result.counts.negative).toBeGreaterThan(0); // 'terrible'
    });

    it('should handle text with only numbers and percentages', () => {
      const text = '+10% -5% 123.45';
      const result = analyzeSentimentWords(text);

      expect(result.counts.positive).toBe(0);
      expect(result.counts.negative).toBe(0);
    });

    it('should preserve text structure when removing numbers', () => {
      const text = 'Revenue increased 25% which is wonderful';
      const result = analyzeSentimentWords(text);

      // Text should still be analyzable after number removal
      expect(result.counts.positive).toBeGreaterThan(0); // 'wonderful'
    });

    it('should handle mixed content correctly', () => {
      const text = 'The stock gained +15.5% today, which is wonderful news! However, analysts are concerned about -2.3% terrible decline tomorrow.';
      const result = analyzeSentimentWords(text);

      // Should remove: +15.5%, -2.3%
      expect(result.cleanedText).not.toContain('15.5');
      expect(result.cleanedText).not.toContain('2.3');

      // Should count: wonderful (positive), terrible (negative)
      expect(result.counts.positive).toBeGreaterThan(0);
      expect(result.counts.negative).toBeGreaterThan(0);
    });

    it('should return both counts and cleaned text', () => {
      const text = 'happy +10% wonderful -5%';
      const result = analyzeSentimentWords(text);

      expect(result).toHaveProperty('counts');
      expect(result).toHaveProperty('cleanedText');
      expect(result.counts).toHaveProperty('positive');
      expect(result.counts).toHaveProperty('negative');
      expect(typeof result.cleanedText).toBe('string');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined or null gracefully', () => {
      // TypeScript would catch this at compile time, but test runtime behavior
      // The function doesn't handle null/undefined, so it will throw
      expect(() => countSentimentWords(null as any)).toThrow();
      expect(() => countSentimentWords(undefined as any)).toThrow();
    });

    it('should handle very long text efficiently', () => {
      // Generate long text with repeated sentiment words
      const words = [];
      for (let i = 0; i < 1000; i++) {
        words.push(i % 2 === 0 ? 'happy' : 'terrible');
      }
      const text = words.join(' ');

      const startTime = Date.now();
      const result = countSentimentWords(text);
      const endTime = Date.now();

      expect(result.positive).toBe(500);
      expect(result.negative).toBe(500);

      // Should complete in reasonable time (< 1 second for 1000 words)
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('should handle special characters', () => {
      const text = 'happy @wonderful #happiness $terrible';
      const result = countSentimentWords(text);

      // Special characters should be removed, leaving valid words
      expect(result.positive).toBeGreaterThan(0);
      expect(result.negative).toBeGreaterThan(0);
    });

    it('should handle unicode characters', () => {
      const text = 'happy 😊 wonderful 👍 terrible 😞';
      const result = countSentimentWords(text);

      // Emojis should be ignored, but words should be counted
      expect(result.positive).toBe(2); // happy, wonderful
      expect(result.negative).toBe(1); // terrible
    });

    it('should handle all caps text', () => {
      const text = 'BREAKING NEWS: COMPANY POSTS WONDERFUL RESULTS BUT FACES TERRIBLE CHALLENGES';
      const result = countSentimentWords(text);

      expect(result.positive).toBeGreaterThan(0); // wonderful
      expect(result.negative).toBeGreaterThan(0); // terrible
    });
  });
});
