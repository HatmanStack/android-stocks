/**
 * Unit tests for Tiingo API Service
 */

import axios from 'axios';
import {
  fetchStockPrices,
  fetchSymbolMetadata,
  setTiingoApiKey,
  transformTiingoToStockDetails,
  transformTiingoToSymbolDetails,
} from '@/services/api/tiingo.service';
import type { TiingoStockPrice, TiingoSymbolMetadata } from '@/services/api/tiingo.types';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Tiingo Service', () => {
  let mockAxiosInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock axios instance
    mockAxiosInstance = {
      get: jest.fn(),
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance);

    // Mock axios.isAxiosError to always return true for our test errors
    mockedAxios.isAxiosError = jest.fn((error: any) => {
      return error && error.isAxiosError === true;
    });

    // Set API key for tests
    setTiingoApiKey('test-api-key');
  });

  describe('fetchStockPrices', () => {
    it('should fetch stock prices for valid ticker', async () => {
      const mockResponse: TiingoStockPrice[] = [
        {
          date: '2025-01-15T00:00:00.000Z',
          open: 150.0,
          high: 152.5,
          low: 149.0,
          close: 151.5,
          volume: 1000000,
          adjOpen: 150.0,
          adjHigh: 152.5,
          adjLow: 149.0,
          adjClose: 151.5,
          adjVolume: 1000000,
          divCash: 0,
          splitFactor: 1,
        },
      ];

      mockAxiosInstance.get.mockResolvedValue({ data: mockResponse });

      const result = await fetchStockPrices('AAPL', '2025-01-15', '2025-01-15');

      expect(result).toEqual(mockResponse);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/tiingo/daily/AAPL/prices',
        {
          params: {
            startDate: '2025-01-15',
            endDate: '2025-01-15',
            token: 'test-api-key',
          },
        }
      );
    });

    it('should handle ticker not found (404)', async () => {
      const axiosError = new Error("Ticker 'INVALID' not found");
      Object.assign(axiosError, {
        isAxiosError: true,
        response: { status: 404 },
      });

      mockAxiosInstance.get.mockRejectedValue(axiosError);

      await expect(fetchStockPrices('INVALID', '2025-01-15')).rejects.toThrow(
        "Ticker 'INVALID' not found"
      );
    });

    it('should handle rate limiting (429)', async () => {
      const axiosError = new Error('Rate limit exceeded');
      Object.assign(axiosError, {
        isAxiosError: true,
        response: { status: 429 },
      });

      mockAxiosInstance.get.mockRejectedValue(axiosError);

      await expect(fetchStockPrices('AAPL', '2025-01-15')).rejects.toThrow(
        'Rate limit exceeded'
      );
    });

    it('should handle invalid API key (401)', async () => {
      const axiosError = new Error('Invalid API key');
      Object.assign(axiosError, {
        isAxiosError: true,
        response: { status: 401 },
      });

      mockAxiosInstance.get.mockRejectedValue(axiosError);

      await expect(fetchStockPrices('AAPL', '2025-01-15')).rejects.toThrow(
        'Invalid API key'
      );
    });

    it('should not include endDate param when not provided', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: [] });

      await fetchStockPrices('AAPL', '2025-01-15');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/tiingo/daily/AAPL/prices',
        {
          params: {
            startDate: '2025-01-15',
            token: 'test-api-key',
          },
        }
      );
    });
  });

  describe('fetchSymbolMetadata', () => {
    it('should fetch symbol metadata for valid ticker', async () => {
      const mockMetadata: TiingoSymbolMetadata = {
        ticker: 'AAPL',
        name: 'Apple Inc.',
        exchangeCode: 'NASDAQ',
        startDate: '1980-12-12',
        endDate: '2025-12-31',
        description: 'Apple Inc. designs and manufactures consumer electronics.',
      };

      mockAxiosInstance.get.mockResolvedValue({ data: mockMetadata });

      const result = await fetchSymbolMetadata('AAPL');

      expect(result).toEqual(mockMetadata);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/tiingo/daily/AAPL', {
        params: { token: 'test-api-key' },
      });
    });

    it('should handle ticker not found (404)', async () => {
      const axiosError = new Error("Ticker 'INVALID' not found");
      Object.assign(axiosError, {
        isAxiosError: true,
        response: { status: 404 },
      });

      mockAxiosInstance.get.mockRejectedValue(axiosError);

      await expect(fetchSymbolMetadata('INVALID')).rejects.toThrow(
        "Ticker 'INVALID' not found"
      );
    });
  });

  describe('transformTiingoToStockDetails', () => {
    it('should transform Tiingo response to StockDetails format', () => {
      const tiingoPrice: TiingoStockPrice = {
        date: '2025-01-15T00:00:00.000Z',
        open: 150.123,
        high: 152.789,
        low: 149.456,
        close: 151.555,
        volume: 1234567,
        adjOpen: 150.123,
        adjHigh: 152.789,
        adjLow: 149.456,
        adjClose: 151.555,
        adjVolume: 1234567,
        divCash: 0,
        splitFactor: 1,
      };

      const result = transformTiingoToStockDetails(tiingoPrice, 'AAPL');

      expect(result.ticker).toBe('AAPL');
      expect(result.date).toBe('2025-01-15');
      expect(result.open).toBe(150.12);
      expect(result.high).toBe(152.79);
      expect(result.low).toBe(149.46);
      expect(result.close).toBe(151.56);
      expect(result.volume).toBe(1234567);
    });

    it('should extract date correctly (first 10 characters)', () => {
      const tiingoPrice: TiingoStockPrice = {
        date: '2025-01-15T14:30:00.000Z',
        open: 100,
        high: 105,
        low: 95,
        close: 102,
        volume: 1000,
        adjOpen: 100,
        adjHigh: 105,
        adjLow: 95,
        adjClose: 102,
        adjVolume: 1000,
        divCash: 0,
        splitFactor: 1,
      };

      const result = transformTiingoToStockDetails(tiingoPrice, 'TEST');

      expect(result.date).toBe('2025-01-15');
    });

    it('should round prices to 2 decimal places', () => {
      const tiingoPrice: TiingoStockPrice = {
        date: '2025-01-15T00:00:00.000Z',
        open: 100.999,
        high: 101.001,
        low: 99.004,
        close: 100.505,
        volume: 1000,
        adjOpen: 100.999,
        adjHigh: 101.001,
        adjLow: 99.004,
        adjClose: 100.505,
        adjVolume: 1000,
        divCash: 0,
        splitFactor: 1,
      };

      const result = transformTiingoToStockDetails(tiingoPrice, 'TEST');

      expect(result.open).toBe(101.0);
      expect(result.high).toBe(101.0);
      expect(result.low).toBe(99.0);
      expect(result.close).toBe(100.51);
    });
  });

  describe('transformTiingoToSymbolDetails', () => {
    it('should transform Tiingo metadata to SymbolDetails format', () => {
      const tiingoMetadata: TiingoSymbolMetadata = {
        ticker: 'AAPL',
        name: 'Apple Inc.',
        exchangeCode: 'NASDAQ',
        startDate: '1980-12-12',
        endDate: '2025-12-31',
        description: 'Apple Inc. designs and manufactures consumer electronics.',
      };

      const result = transformTiingoToSymbolDetails(tiingoMetadata);

      expect(result.ticker).toBe('AAPL');
      expect(result.name).toBe('Apple Inc.');
      expect(result.exchange).toBe('NASDAQ');
      expect(result.startDate).toBe('1980-12-12');
      expect(result.endDate).toBe('2025-12-31');
      expect(result.description).toBe(
        'Apple Inc. designs and manufactures consumer electronics.'
      );
    });
  });
});
