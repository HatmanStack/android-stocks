/**
 * Sentiment Analysis Service Tests
 */

import axios from 'axios';
import {
  analyzeSentiment,
  parseSentimentResult,
} from '@/services/api/sentiment.service';
import type { SentimentAnalysisResponse } from '@/types/api.types';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock console methods
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('sentiment.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzeSentiment', () => {
    const mockSentimentData: SentimentAnalysisResponse = {
      positive: ['5', '0.85'],
      neutral: ['2', '0.10'],
      negative: ['1', '0.05'],
      hash: 'abc123',
    };

    it('should successfully analyze sentiment', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: mockSentimentData });

      const articleText = 'This is great news. Stock prices are rising. Markets are optimistic.';
      const hash = 'abc123';

      const result = await analyzeSentiment(articleText, hash);

      expect(result).toEqual(mockSentimentData);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          hash: 'abc123',
          text: expect.any(Array),
        }),
        expect.any(Object)
      );
    });

    it('should split article text into sentences', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: mockSentimentData });

      const articleText = 'First sentence. Second sentence? Third sentence!';
      await analyzeSentiment(articleText, 'hash123');

      const callArgs = mockedAxios.post.mock.calls[0][1] as any;
      expect(callArgs.text).toBeInstanceOf(Array);
      expect(callArgs.text.length).toBeGreaterThan(0);
    });

    it('should remove quotes and commas from text', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: mockSentimentData });

      const articleText = 'The CEO said, "We\'re doing great." This is good news.';
      await analyzeSentiment(articleText, 'hash123');

      const callArgs = mockedAxios.post.mock.calls[0][1] as any;
      const sentencesText = callArgs.text.join(' ');
      expect(sentencesText).not.toContain('"');
      expect(sentencesText).not.toContain("'");
    });

    it('should handle timeout errors', async () => {
      const timeoutError = {
        isAxiosError: true,
        code: 'ECONNABORTED',
      };
      mockedAxios.post.mockRejectedValueOnce(timeoutError);
      mockedAxios.isAxiosError = jest.fn().mockReturnValue(true);

      await expect(analyzeSentiment('Some text', 'hash123')).rejects.toThrow(
        'Sentiment analysis timed out (service cold start)'
      );
    });

    it('should handle 503 service unavailable errors', async () => {
      const serviceError = {
        isAxiosError: true,
        response: { status: 503 },
      };
      mockedAxios.post.mockRejectedValueOnce(serviceError);
      mockedAxios.isAxiosError = jest.fn().mockReturnValue(true);

      await expect(analyzeSentiment('Some text', 'hash123')).rejects.toThrow(
        'Sentiment analysis service is temporarily unavailable'
      );
    });

    it('should handle general errors', async () => {
      const generalError = new Error('Network error');
      mockedAxios.post.mockRejectedValueOnce(generalError);
      mockedAxios.isAxiosError = jest.fn().mockReturnValue(false);

      await expect(analyzeSentiment('Some text', 'hash123')).rejects.toThrow(
        'Sentiment analysis failed'
      );
    });
  });

  describe('parseSentimentResult', () => {
    it('should parse positive dominant sentiment', () => {
      const response: SentimentAnalysisResponse = {
        positive: ['10', '0.85'],
        neutral: ['3', '0.10'],
        negative: ['2', '0.05'],
        hash: 'abc123',
      };

      const result = parseSentimentResult(response);

      expect(result.sentiment).toBe('POS');
      expect(result.score).toBe(0.85);
      expect(result.counts).toEqual({
        positive: 10,
        neutral: 3,
        negative: 2,
      });
    });

    it('should parse negative dominant sentiment', () => {
      const response: SentimentAnalysisResponse = {
        positive: ['2', '0.15'],
        neutral: ['3', '0.20'],
        negative: ['10', '0.75'],
        hash: 'abc123',
      };

      const result = parseSentimentResult(response);

      expect(result.sentiment).toBe('NEG');
      expect(result.score).toBe(0.75);
      expect(result.counts).toEqual({
        positive: 2,
        neutral: 3,
        negative: 10,
      });
    });

    it('should parse neutral dominant sentiment', () => {
      const response: SentimentAnalysisResponse = {
        positive: ['2', '0.15'],
        neutral: ['10', '0.70'],
        negative: ['3', '0.15'],
        hash: 'abc123',
      };

      const result = parseSentimentResult(response);

      expect(result.sentiment).toBe('NEUT');
      expect(result.score).toBe(0.70);
      expect(result.counts).toEqual({
        positive: 2,
        neutral: 10,
        negative: 3,
      });
    });

    it('should handle equal counts (neutral wins in tie)', () => {
      const response: SentimentAnalysisResponse = {
        positive: ['5', '0.33'],
        neutral: ['5', '0.33'],
        negative: ['5', '0.34'],
        hash: 'abc123',
      };

      const result = parseSentimentResult(response);

      // When all counts are equal, neutral wins by default
      expect(result.sentiment).toBe('NEUT');
      expect(result.score).toBe(0.33);
    });

    it('should handle zero counts', () => {
      const response: SentimentAnalysisResponse = {
        positive: ['0', '0.0'],
        neutral: ['0', '0.0'],
        negative: ['0', '0.0'],
        hash: 'abc123',
      };

      const result = parseSentimentResult(response);

      expect(result.counts).toEqual({
        positive: 0,
        neutral: 0,
        negative: 0,
      });
      // When all are zero, neutral should win
      expect(result.sentiment).toBe('NEUT');
    });

    it('should convert string counts to numbers', () => {
      const response: SentimentAnalysisResponse = {
        positive: ['15', '0.85'],
        neutral: ['5', '0.10'],
        negative: ['3', '0.05'],
        hash: 'abc123',
      };

      const result = parseSentimentResult(response);

      expect(typeof result.counts.positive).toBe('number');
      expect(typeof result.counts.neutral).toBe('number');
      expect(typeof result.counts.negative).toBe('number');
      expect(result.counts.positive).toBe(15);
    });
  });
});
