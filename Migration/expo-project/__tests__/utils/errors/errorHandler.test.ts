/**
 * Error Handler Tests
 */

import axios, { AxiosError } from 'axios';
import {
  handleAPIError,
  handleDatabaseError,
  isRetryableError,
  getErrorMessage,
  logError,
} from '@/utils/errors/errorHandler';
import {
  APIError,
  NetworkError,
  RateLimitError,
  TickerNotFoundError,
  AuthenticationError,
  TimeoutError,
  DatabaseError,
  ServiceUnavailableError,
} from '@/utils/errors/APIError';

// Mock console methods to prevent cluttering test output
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'group').mockImplementation(() => {});
  jest.spyOn(console, 'groupEnd').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('errorHandler', () => {
  describe('handleAPIError', () => {
    it('should convert network errors to NetworkError', () => {
      const axiosError = {
        isAxiosError: true,
        response: undefined,
        code: 'ERR_NETWORK',
        config: { url: '/api/stocks' },
      } as any;

      const result = handleAPIError(axiosError);
      expect(result).toBeInstanceOf(NetworkError);
      expect(result.message).toBe('Unable to reach the server');
    });

    it('should convert timeout errors to TimeoutError', () => {
      const axiosError = {
        isAxiosError: true,
        response: undefined,
        code: 'ECONNABORTED',
        config: { url: '/api/stocks' },
      } as any;

      const result = handleAPIError(axiosError);
      expect(result).toBeInstanceOf(TimeoutError);
    });

    it('should convert 401/403 errors to AuthenticationError', () => {
      const axiosError401 = {
        isAxiosError: true,
        response: { status: 401 },
        config: { url: '/api/protected' },
      } as any;

      const result401 = handleAPIError(axiosError401);
      expect(result401).toBeInstanceOf(AuthenticationError);
      expect((result401 as AuthenticationError).statusCode).toBe(401);

      const axiosError403 = {
        isAxiosError: true,
        response: { status: 403 },
        config: { url: '/api/protected' },
      } as any;

      const result403 = handleAPIError(axiosError403);
      expect(result403).toBeInstanceOf(AuthenticationError);
    });

    it('should convert 404 errors with ticker to TickerNotFoundError', () => {
      const axiosError = {
        isAxiosError: true,
        response: { status: 404 },
        config: { url: '/api/stocks' },
      } as any;

      const result = handleAPIError(axiosError, { ticker: 'AAPL' });
      expect(result).toBeInstanceOf(TickerNotFoundError);
      expect((result as TickerNotFoundError).ticker).toBe('AAPL');
    });

    it('should convert 404 errors without ticker to generic APIError', () => {
      const axiosError = {
        isAxiosError: true,
        response: { status: 404 },
        config: { url: '/api/resource' },
      } as any;

      const result = handleAPIError(axiosError);
      expect(result).toBeInstanceOf(APIError);
      expect((result as APIError).statusCode).toBe(404);
    });

    it('should convert 429 errors to RateLimitError', () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 429,
          headers: { 'retry-after': '60' },
        },
        config: { url: '/api/stocks' },
      } as any;

      const result = handleAPIError(axiosError);
      expect(result).toBeInstanceOf(RateLimitError);
      expect((result as RateLimitError).retryAfter).toBe(60);
    });

    it('should convert 503 errors to ServiceUnavailableError', () => {
      const axiosError = {
        isAxiosError: true,
        response: { status: 503 },
        config: { url: '/api/stocks' },
      } as any;

      const result = handleAPIError(axiosError);
      expect(result).toBeInstanceOf(ServiceUnavailableError);
      expect((result as ServiceUnavailableError).statusCode).toBe(503);
    });

    it('should convert 5xx errors to APIError', () => {
      const axiosError = {
        isAxiosError: true,
        response: { status: 500 },
        config: { url: '/api/stocks' },
      } as any;

      const result = handleAPIError(axiosError);
      expect(result).toBeInstanceOf(APIError);
      expect((result as APIError).statusCode).toBe(500);
    });

    it('should handle non-Axios Error instances', () => {
      const error = new Error('Custom error');
      const result = handleAPIError(error);
      expect(result).toBe(error);
    });

    it('should convert non-Error values to Error', () => {
      const result = handleAPIError('string error');
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('string error');
    });
  });

  describe('handleDatabaseError', () => {
    it('should create DatabaseError with full context', () => {
      const originalError = new Error('SQLITE_CONSTRAINT');
      const result = handleDatabaseError(originalError, 'INSERT', 'stocks');

      expect(result).toBeInstanceOf(DatabaseError);
      expect(result.message).toBe('SQLITE_CONSTRAINT');
      expect(result.operation).toBe('INSERT');
      expect(result.table).toBe('stocks');
    });

    it('should handle errors without operation/table', () => {
      const originalError = new Error('Database locked');
      const result = handleDatabaseError(originalError);

      expect(result).toBeInstanceOf(DatabaseError);
      expect(result.message).toBe('Database locked');
      expect(result.operation).toBeUndefined();
      expect(result.table).toBeUndefined();
    });

    it('should handle non-Error objects', () => {
      const result = handleDatabaseError({ message: 'DB error' });
      expect(result).toBeInstanceOf(DatabaseError);
    });
  });

  describe('isRetryableError', () => {
    it('should return true for NetworkError', () => {
      expect(isRetryableError(new NetworkError())).toBe(true);
    });

    it('should return true for TimeoutError', () => {
      expect(isRetryableError(new TimeoutError('/api/stocks', 30000))).toBe(true);
    });

    it('should return true for RateLimitError', () => {
      expect(isRetryableError(new RateLimitError('/api/stocks'))).toBe(true);
    });

    it('should return true for ServiceUnavailableError', () => {
      expect(isRetryableError(new ServiceUnavailableError('service'))).toBe(true);
    });

    it('should return true for 5xx APIError', () => {
      expect(isRetryableError(new APIError('Server error', 500))).toBe(true);
      expect(isRetryableError(new APIError('Bad gateway', 502))).toBe(true);
    });

    it('should return false for 4xx APIError', () => {
      expect(isRetryableError(new APIError('Bad request', 400))).toBe(false);
      expect(isRetryableError(new APIError('Not found', 404))).toBe(false);
    });

    it('should return true for Axios network errors', () => {
      const axiosError = {
        isAxiosError: true,
        response: undefined,
      } as any;
      expect(isRetryableError(axiosError)).toBe(true);
    });

    it('should return true for Axios 429 errors', () => {
      const axiosError = {
        isAxiosError: true,
        response: { status: 429 },
      } as any;
      expect(isRetryableError(axiosError)).toBe(true);
    });

    it('should return true for Axios 5xx errors', () => {
      const axiosError500 = {
        isAxiosError: true,
        response: { status: 500 },
      } as any;
      expect(isRetryableError(axiosError500)).toBe(true);

      const axiosError503 = {
        isAxiosError: true,
        response: { status: 503 },
      } as any;
      expect(isRetryableError(axiosError503)).toBe(true);
    });

    it('should return false for Axios 4xx errors', () => {
      const axiosError400 = {
        isAxiosError: true,
        response: { status: 400 },
      } as any;
      expect(isRetryableError(axiosError400)).toBe(false);

      const axiosError404 = {
        isAxiosError: true,
        response: { status: 404 },
      } as any;
      expect(isRetryableError(axiosError404)).toBe(false);
    });

    it('should return false for non-retryable errors', () => {
      expect(isRetryableError(new Error('Generic error'))).toBe(false);
      expect(isRetryableError(new TickerNotFoundError('AAPL'))).toBe(false);
      expect(isRetryableError(new AuthenticationError())).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    it('should return combined message and action for errors', () => {
      const error = new TickerNotFoundError('AAPL');
      const message = getErrorMessage(error);
      expect(message).toContain('AAPL');
      expect(message).toContain('not found');
    });

    it('should handle errors without action', () => {
      const error = new Error('Simple error');
      const message = getErrorMessage(error);
      expect(message).toBeTruthy();
      expect(typeof message).toBe('string');
    });
  });

  describe('logError', () => {
    it('should log errors without throwing', () => {
      // logError should not throw, just log
      expect(() => {
        logError(new Error('Test error'));
      }).not.toThrow();
    });

    it('should accept context', () => {
      expect(() => {
        logError(new Error('Test error'), { ticker: 'AAPL', operation: 'fetch' });
      }).not.toThrow();
    });
  });
});
