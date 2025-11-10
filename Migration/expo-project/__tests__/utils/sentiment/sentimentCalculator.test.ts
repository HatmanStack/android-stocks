/**
 * Sentiment Calculator Tests
 * Tests for sentiment label and score calculation
 */

import {
  calculateSentiment,
  calculateSentimentScore,
  getSentimentInfo,
  type SentimentLabel,
} from '@/utils/sentiment/sentimentCalculator';

describe('Sentiment Calculator', () => {
  describe('calculateSentiment', () => {
    it('should return POS when positive > negative', () => {
      const result = calculateSentiment(5, 2);
      expect(result).toBe('POS');
    });

    it('should return NEG when negative > positive', () => {
      const result = calculateSentiment(2, 5);
      expect(result).toBe('NEG');
    });

    it('should return NEUT when positive == negative', () => {
      const result = calculateSentiment(3, 3);
      expect(result).toBe('NEUT');
    });

    it('should return NEUT when both are zero', () => {
      const result = calculateSentiment(0, 0);
      expect(result).toBe('NEUT');
    });

    it('should handle large numbers', () => {
      const result1 = calculateSentiment(1000, 500);
      expect(result1).toBe('POS');

      const result2 = calculateSentiment(500, 1000);
      expect(result2).toBe('NEG');
    });

    it('should handle minimal difference', () => {
      const result1 = calculateSentiment(10, 9);
      expect(result1).toBe('POS');

      const result2 = calculateSentiment(9, 10);
      expect(result2).toBe('NEG');
    });
  });

  describe('calculateSentimentScore', () => {
    it('should return 1.0 for all positive words', () => {
      const score = calculateSentimentScore(10, 0);
      expect(score).toBe(1.0);
    });

    it('should return -1.0 for all negative words', () => {
      const score = calculateSentimentScore(0, 10);
      expect(score).toBe(-1.0);
    });

    it('should return 0 for equal positive and negative', () => {
      const score = calculateSentimentScore(5, 5);
      expect(score).toBe(0);
    });

    it('should return 0 when both are zero', () => {
      const score = calculateSentimentScore(0, 0);
      expect(score).toBe(0);
    });

    it('should calculate correct score for mixed sentiment', () => {
      // 6 positive, 3 negative = (6-3)/9 = 3/9 = 0.333...
      const score = calculateSentimentScore(6, 3);
      expect(score).toBeCloseTo(0.333, 2);
    });

    it('should calculate correct negative score', () => {
      // 3 positive, 6 negative = (3-6)/9 = -3/9 = -0.333...
      const score = calculateSentimentScore(3, 6);
      expect(score).toBeCloseTo(-0.333, 2);
    });

    it('should handle score near zero', () => {
      // 51 positive, 49 negative = 2/100 = 0.02
      const score = calculateSentimentScore(51, 49);
      expect(score).toBeCloseTo(0.02, 2);
    });

    it('should handle score near 1', () => {
      // 99 positive, 1 negative = 98/100 = 0.98
      const score = calculateSentimentScore(99, 1);
      expect(score).toBeCloseTo(0.98, 2);
    });

    it('should handle score near -1', () => {
      // 1 positive, 99 negative = -98/100 = -0.98
      const score = calculateSentimentScore(1, 99);
      expect(score).toBeCloseTo(-0.98, 2);
    });

    it('should always return value between -1 and 1', () => {
      const testCases = [
        [10, 5],
        [5, 10],
        [100, 50],
        [50, 100],
        [7, 3],
        [3, 7],
      ];

      testCases.forEach(([pos, neg]) => {
        const score = calculateSentimentScore(pos, neg);
        expect(score).toBeGreaterThanOrEqual(-1);
        expect(score).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('getSentimentInfo', () => {
    it('should return complete info for positive sentiment', () => {
      const info = getSentimentInfo(10, 5);

      expect(info.label).toBe('POS');
      expect(info.score).toBeCloseTo(0.333, 2);
      expect(info.positive).toBe(10);
      expect(info.negative).toBe(5);
      expect(info.total).toBe(15);
      expect(info.description).toBe('Positive sentiment');
    });

    it('should return complete info for negative sentiment', () => {
      const info = getSentimentInfo(5, 10);

      expect(info.label).toBe('NEG');
      expect(info.score).toBeCloseTo(-0.333, 2);
      expect(info.positive).toBe(5);
      expect(info.negative).toBe(10);
      expect(info.total).toBe(15);
      expect(info.description).toBe('Negative sentiment');
    });

    it('should return complete info for neutral sentiment', () => {
      const info = getSentimentInfo(5, 5);

      expect(info.label).toBe('NEUT');
      expect(info.score).toBe(0);
      expect(info.positive).toBe(5);
      expect(info.negative).toBe(5);
      expect(info.total).toBe(10);
      expect(info.description).toBe('Neutral sentiment');
    });

    it('should handle zero counts', () => {
      const info = getSentimentInfo(0, 0);

      expect(info.label).toBe('NEUT');
      expect(info.score).toBe(0);
      expect(info.positive).toBe(0);
      expect(info.negative).toBe(0);
      expect(info.total).toBe(0);
      expect(info.description).toBe('Neutral sentiment');
    });

    it('should return all required fields', () => {
      const info = getSentimentInfo(7, 3);

      expect(info).toHaveProperty('label');
      expect(info).toHaveProperty('score');
      expect(info).toHaveProperty('description');
      expect(info).toHaveProperty('positive');
      expect(info).toHaveProperty('negative');
      expect(info).toHaveProperty('total');
    });

    it('should have correct types for all fields', () => {
      const info = getSentimentInfo(7, 3);

      expect(typeof info.label).toBe('string');
      expect(typeof info.score).toBe('number');
      expect(typeof info.description).toBe('string');
      expect(typeof info.positive).toBe('number');
      expect(typeof info.negative).toBe('number');
      expect(typeof info.total).toBe('number');
    });

    it('should calculate total correctly', () => {
      const testCases = [
        [10, 5, 15],
        [0, 0, 0],
        [100, 50, 150],
        [7, 7, 14],
      ];

      testCases.forEach(([pos, neg, expectedTotal]) => {
        const info = getSentimentInfo(pos, neg);
        expect(info.total).toBe(expectedTotal);
      });
    });
  });

  describe('Integration Tests', () => {
    it('should maintain consistency between functions', () => {
      const positive = 8;
      const negative = 4;

      const label = calculateSentiment(positive, negative);
      const score = calculateSentimentScore(positive, negative);
      const info = getSentimentInfo(positive, negative);

      expect(info.label).toBe(label);
      expect(info.score).toBe(score);
      expect(info.positive).toBe(positive);
      expect(info.negative).toBe(negative);
    });

    it('should handle multiple sequential calculations', () => {
      const testData = [
        { pos: 10, neg: 2 },
        { pos: 3, neg: 7 },
        { pos: 5, neg: 5 },
        { pos: 0, neg: 0 },
      ];

      testData.forEach(({ pos, neg }) => {
        const label = calculateSentiment(pos, neg);
        const score = calculateSentimentScore(pos, neg);
        const info = getSentimentInfo(pos, neg);

        expect(info.label).toBe(label);
        expect(info.score).toBe(score);
      });
    });

    it('should produce consistent labels for same ratios', () => {
      // All these have 2:1 positive to negative ratio
      const testCases = [
        [2, 1],
        [4, 2],
        [10, 5],
        [100, 50],
      ];

      testCases.forEach(([pos, neg]) => {
        const label = calculateSentiment(pos, neg);
        const score = calculateSentimentScore(pos, neg);

        expect(label).toBe('POS');
        expect(score).toBeCloseTo(0.333, 2);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large numbers', () => {
      const info = getSentimentInfo(1000000, 500000);

      expect(info.label).toBe('POS');
      expect(info.score).toBeCloseTo(0.333, 2);
      expect(info.total).toBe(1500000);
    });

    it('should handle single word counts', () => {
      const info1 = getSentimentInfo(1, 0);
      expect(info1.label).toBe('POS');
      expect(info1.score).toBe(1);

      const info2 = getSentimentInfo(0, 1);
      expect(info2.label).toBe('NEG');
      expect(info2.score).toBe(-1);
    });

    it('should handle fractional scores correctly', () => {
      // 7 positive, 3 negative = (7-3)/10 = 0.4
      const score = calculateSentimentScore(7, 3);
      expect(score).toBe(0.4);

      // 3 positive, 7 negative = (3-7)/10 = -0.4
      const score2 = calculateSentimentScore(3, 7);
      expect(score2).toBe(-0.4);
    });
  });

  describe('Real-World Scenarios', () => {
    it('should correctly analyze strongly positive news', () => {
      // Simulating: "excellent outstanding wonderful great amazing"
      const info = getSentimentInfo(5, 0);

      expect(info.label).toBe('POS');
      expect(info.score).toBe(1.0);
      expect(info.description).toBe('Positive sentiment');
    });

    it('should correctly analyze strongly negative news', () => {
      // Simulating: "terrible horrible awful bad worst"
      const info = getSentimentInfo(0, 5);

      expect(info.label).toBe('NEG');
      expect(info.score).toBe(-1.0);
      expect(info.description).toBe('Negative sentiment');
    });

    it('should correctly analyze balanced news', () => {
      // Simulating: "great performance but concerning challenges"
      const info = getSentimentInfo(2, 2);

      expect(info.label).toBe('NEUT');
      expect(info.score).toBe(0);
      expect(info.description).toBe('Neutral sentiment');
    });

    it('should correctly analyze slightly positive news', () => {
      // Simulating: "good results despite some concerns"
      const info = getSentimentInfo(3, 2);

      expect(info.label).toBe('POS');
      expect(info.score).toBe(0.2);
      expect(info.description).toBe('Positive sentiment');
    });

    it('should correctly analyze slightly negative news', () => {
      // Simulating: "challenges overshadow some gains"
      const info = getSentimentInfo(2, 3);

      expect(info.label).toBe('NEG');
      expect(info.score).toBe(-0.2);
      expect(info.description).toBe('Negative sentiment');
    });
  });
});
