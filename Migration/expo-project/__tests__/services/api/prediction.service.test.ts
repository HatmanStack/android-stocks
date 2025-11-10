/**
 * Prediction Service Tests
 */

import axios from 'axios';
import {
  getStockPredictions,
  parsePredictionResponse,
  getDefaultPredictions,
} from '@/services/api/prediction.service';
import type { StockPredictionResponse } from '@/types/api.types';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock console methods
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('prediction.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getStockPredictions', () => {
    const mockPredictionData: StockPredictionResponse = {
      next: '1.5',
      week: '2.3',
      month: '3.1',
      ticker: 'AAPL',
    };

    it('should successfully get stock predictions', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: mockPredictionData });

      const result = await getStockPredictions(
        'AAPL',
        [100, 101, 102],
        [1000000, 1100000, 1200000],
        [5, 6, 7],
        [2, 1, 3],
        [0.6, 0.7, 0.5]
      );

      expect(result).toEqual(mockPredictionData);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          ticker: 'AAPL',
          close: [100, 101, 102],
          volume: [1000000, 1100000, 1200000],
          positive: [5, 6, 7],
          negative: [2, 1, 3],
          sentiment: [0.6, 0.7, 0.5],
        }),
        expect.any(Object)
      );
    });

    it('should handle timeout errors', async () => {
      const timeoutError = {
        isAxiosError: true,
        code: 'ECONNABORTED',
      };
      mockedAxios.post.mockRejectedValueOnce(timeoutError);
      mockedAxios.isAxiosError = jest.fn().mockReturnValue(true) as any;

      await expect(
        getStockPredictions('AAPL', [100], [1000000], [5], [2], [0.6])
      ).rejects.toThrow('Prediction request timed out');
    });

    it('should handle 503 service unavailable errors', async () => {
      const serviceError = {
        isAxiosError: true,
        response: { status: 503 },
      };
      mockedAxios.post.mockRejectedValueOnce(serviceError);
      mockedAxios.isAxiosError = jest.fn().mockReturnValue(true) as any;

      await expect(
        getStockPredictions('AAPL', [100], [1000000], [5], [2], [0.6])
      ).rejects.toThrow('Prediction service is temporarily unavailable');
    });

    it('should handle 400 bad request errors', async () => {
      const badRequestError = {
        isAxiosError: true,
        response: { status: 400 },
      };
      mockedAxios.post.mockRejectedValueOnce(badRequestError);
      mockedAxios.isAxiosError = jest.fn().mockReturnValue(true) as any;

      await expect(
        getStockPredictions('AAPL', [100], [1000000], [5], [2], [0.6])
      ).rejects.toThrow('Invalid data provided for prediction');
    });

    it('should handle general errors', async () => {
      const generalError = new Error('Network error');
      mockedAxios.post.mockRejectedValueOnce(generalError);
      mockedAxios.isAxiosError = jest.fn().mockReturnValue(false) as any;

      await expect(
        getStockPredictions('AAPL', [100], [1000000], [5], [2], [0.6])
      ).rejects.toThrow('Stock prediction failed');
    });
  });

  describe('parsePredictionResponse', () => {
    it('should parse prediction response correctly', () => {
      const response: StockPredictionResponse = {
        next: '1.5',
        week: '2.3',
        month: '3.1',
        ticker: 'AAPL',
      };

      const result = parsePredictionResponse(response);

      expect(result).toEqual({
        nextDay: 1.5,
        twoWeeks: 2.3,
        oneMonth: 3.1,
        ticker: 'AAPL',
      });
    });

    it('should handle string numbers', () => {
      const response: StockPredictionResponse = {
        next: '10.25',
        week: '15.75',
        month: '20.50',
        ticker: 'MSFT',
      };

      const result = parsePredictionResponse(response);

      expect(result.nextDay).toBe(10.25);
      expect(result.twoWeeks).toBe(15.75);
      expect(result.oneMonth).toBe(20.5);
      expect(result.ticker).toBe('MSFT');
    });

    it('should handle zero values', () => {
      const response: StockPredictionResponse = {
        next: '0.0',
        week: '0.0',
        month: '0.0',
        ticker: 'GOOGL',
      };

      const result = parsePredictionResponse(response);

      expect(result.nextDay).toBe(0);
      expect(result.twoWeeks).toBe(0);
      expect(result.oneMonth).toBe(0);
    });
  });

  describe('getDefaultPredictions', () => {
    it('should return default predictions with zeros', () => {
      const result = getDefaultPredictions('AAPL');

      expect(result).toEqual({
        next: '0.0',
        week: '0.0',
        month: '0.0',
        ticker: 'AAPL',
      });
    });

    it('should work for different tickers', () => {
      const result = getDefaultPredictions('MSFT');
      expect(result.ticker).toBe('MSFT');
      expect(result.next).toBe('0.0');
    });
  });
});
