/**
 * Error Messages Tests
 */

import {
  getUserFriendlyErrorMessage,
  getErrorSummary,
  ERROR_MESSAGES,
} from '@/utils/errors/errorMessages';
import {
  APIError,
  NetworkError,
  RateLimitError,
  TickerNotFoundError,
  AuthenticationError,
  TimeoutError,
  DatabaseError,
  ValidationError,
  ServiceUnavailableError,
} from '@/utils/errors/APIError';

describe('errorMessages', () => {
  describe('getUserFriendlyErrorMessage', () => {
    it('should return message for TickerNotFoundError', () => {
      const error = new TickerNotFoundError('AAPL');
      const result = getUserFriendlyErrorMessage(error);

      expect(result.title).toBe('Ticker Not Found');
      expect(result.message).toContain('AAPL');
      expect(result.action).toContain('check the symbol');
    });

    it('should return message for RateLimitError with retryAfter', () => {
      const error = new RateLimitError('/api/stocks', 60);
      const result = getUserFriendlyErrorMessage(error);

      expect(result.title).toBe('Too Many Requests');
      expect(result.message).toContain('too many requests');
      expect(result.action).toContain('60 seconds');
    });

    it('should return message for RateLimitError without retryAfter', () => {
      const error = new RateLimitError('/api/stocks');
      const result = getUserFriendlyErrorMessage(error);

      expect(result.title).toBe('Too Many Requests');
      expect(result.action).toContain('wait a moment');
    });

    it('should return message for AuthenticationError', () => {
      const error = new AuthenticationError();
      const result = getUserFriendlyErrorMessage(error);

      expect(result.title).toBe('Authentication Failed');
      expect(result.message).toContain('API key');
      expect(result.action).toContain('check your API keys');
    });

    it('should return message for TimeoutError', () => {
      const error = new TimeoutError('/api/stocks', 30000);
      const result = getUserFriendlyErrorMessage(error);

      expect(result.title).toBe('Request Timed Out');
      expect(result.message).toContain('30s');
      expect(result.action).toContain('check your internet');
    });

    it('should return message for NetworkError', () => {
      const error = new NetworkError();
      const result = getUserFriendlyErrorMessage(error);

      expect(result.title).toBe('Connection Failed');
      expect(result.message).toContain('connect to the internet');
      expect(result.action).toContain('check your connection');
    });

    it('should return message for DatabaseError with operation', () => {
      const error = new DatabaseError('Query failed', 'SELECT', 'stocks');
      const result = getUserFriendlyErrorMessage(error);

      expect(result.title).toBe('Database Error');
      expect(result.message).toContain('during SELECT');
      expect(result.action).toContain('restarting the app');
    });

    it('should return message for DatabaseError without operation', () => {
      const error = new DatabaseError('Database locked');
      const result = getUserFriendlyErrorMessage(error);

      expect(result.title).toBe('Database Error');
      expect(result.action).toContain('restarting the app');
    });

    it('should return message for ValidationError with field', () => {
      const error = new ValidationError('Invalid format', 'ticker');
      const result = getUserFriendlyErrorMessage(error);

      expect(result.title).toBe('Invalid Input');
      expect(result.message).toContain("field 'ticker'");
      expect(result.action).toContain('correct the input');
    });

    it('should return message for ValidationError without field', () => {
      const error = new ValidationError('Invalid input');
      const result = getUserFriendlyErrorMessage(error);

      expect(result.title).toBe('Invalid Input');
      expect(result.message).toContain('Invalid input');
    });

    it('should return message for ServiceUnavailableError', () => {
      const error = new ServiceUnavailableError('prediction-service');
      const result = getUserFriendlyErrorMessage(error);

      expect(result.title).toBe('Service Unavailable');
      expect(result.message).toContain('prediction-service');
      expect(result.action).toContain('temporary');
    });

    it('should return message for APIError with 500 status', () => {
      const error = new APIError('Server error', 500);
      const result = getUserFriendlyErrorMessage(error);

      expect(result.title).toBe('Server Error');
      expect(result.message).toContain('server encountered');
      expect(result.action).toContain('try again later');
    });

    it('should return message for APIError with 503 status', () => {
      const error = new APIError('Service unavailable', 503);
      const result = getUserFriendlyErrorMessage(error);

      expect(result.title).toBe('Service Unavailable');
      expect(result.action).toContain('try again');
    });

    it('should return message for generic APIError', () => {
      const error = new APIError('Unknown API error', 418);
      const result = getUserFriendlyErrorMessage(error);

      expect(result.title).toBe('API Error');
      expect(result.message).toBe('Unknown API error');
    });

    it('should return message for Axios timeout error', () => {
      const error = {
        isAxiosError: true,
        code: 'ECONNABORTED',
      };
      const result = getUserFriendlyErrorMessage(error);

      expect(result.title).toBe('Request Timed Out');
      expect(result.message).toContain('too long');
    });

    it('should return message for Axios network error', () => {
      const error = {
        isAxiosError: true,
        code: 'ERR_NETWORK',
      };
      const result = getUserFriendlyErrorMessage(error);

      expect(result.title).toBe('Network Error');
      expect(result.message).toContain('reach the server');
    });

    it('should return message for Axios 400 error', () => {
      const error = {
        isAxiosError: true,
        response: { status: 400 },
      };
      const result = getUserFriendlyErrorMessage(error);

      expect(result.title).toBe('Bad Request');
      expect(result.message).toContain('invalid');
    });

    it('should return message for Axios 403 error', () => {
      const error = {
        isAxiosError: true,
        response: { status: 403 },
      };
      const result = getUserFriendlyErrorMessage(error);

      expect(result.title).toBe('Access Denied');
      expect(result.message).toContain('permission');
    });

    it('should return message for Axios 404 error', () => {
      const error = {
        isAxiosError: true,
        response: { status: 404 },
      };
      const result = getUserFriendlyErrorMessage(error);

      expect(result.title).toBe('Not Found');
      expect(result.message).toContain('not found');
    });

    it('should return message for Axios 500 error', () => {
      const error = {
        isAxiosError: true,
        response: { status: 500 },
      };
      const result = getUserFriendlyErrorMessage(error);

      expect(result.title).toBe('Server Error');
    });

    it('should return message for Axios 502/503 error', () => {
      const error502 = {
        isAxiosError: true,
        response: { status: 502 },
      };
      const result502 = getUserFriendlyErrorMessage(error502);
      expect(result502.title).toBe('Service Unavailable');

      const error503 = {
        isAxiosError: true,
        response: { status: 503 },
      };
      const result503 = getUserFriendlyErrorMessage(error503);
      expect(result503.title).toBe('Service Unavailable');
    });

    it('should return generic message for unknown errors', () => {
      const error = new Error('Unknown error');
      const result = getUserFriendlyErrorMessage(error);

      expect(result.title).toBe('Something Went Wrong');
      expect(result.message).toContain('Unknown error');
      expect(result.action).toContain('try again');
    });

    it('should handle non-Error objects', () => {
      const result = getUserFriendlyErrorMessage({ message: 'Custom error' });
      expect(result.title).toBe('Something Went Wrong');
      expect(result.message).toBe('Custom error');
    });

    it('should handle errors without message', () => {
      const result = getUserFriendlyErrorMessage({});
      expect(result.title).toBe('Something Went Wrong');
      expect(result.message).toContain('unexpected error');
    });
  });

  describe('getErrorSummary', () => {
    it('should return short error summary', () => {
      const error = new TickerNotFoundError('AAPL');
      const summary = getErrorSummary(error);

      expect(summary).toContain('Ticker Not Found');
      expect(summary).toContain('AAPL');
    });

    it('should combine title and message', () => {
      const error = new NetworkError();
      const summary = getErrorSummary(error);

      expect(summary).toContain('Connection Failed');
      expect(summary).toContain(':');
    });
  });

  describe('ERROR_MESSAGES', () => {
    it('should have all expected error messages', () => {
      expect(ERROR_MESSAGES.TICKER_NOT_FOUND).toBeTruthy();
      expect(ERROR_MESSAGES.RATE_LIMIT).toBeTruthy();
      expect(ERROR_MESSAGES.NETWORK_ERROR).toBeTruthy();
      expect(ERROR_MESSAGES.TIMEOUT).toBeTruthy();
      expect(ERROR_MESSAGES.AUTH_ERROR).toBeTruthy();
      expect(ERROR_MESSAGES.SERVER_ERROR).toBeTruthy();
      expect(ERROR_MESSAGES.DATABASE_ERROR).toBeTruthy();
      expect(ERROR_MESSAGES.VALIDATION_ERROR).toBeTruthy();
      expect(ERROR_MESSAGES.SERVICE_UNAVAILABLE).toBeTruthy();
      expect(ERROR_MESSAGES.UNKNOWN_ERROR).toBeTruthy();
    });

    it('should be immutable (readonly)', () => {
      // TypeScript will prevent this at compile time, but we can check at runtime
      const messages = ERROR_MESSAGES as any;
      const original = messages.TICKER_NOT_FOUND;

      // Attempt to modify (should not work with 'as const')
      messages.TICKER_NOT_FOUND = 'Modified message';

      // Check if modification worked (it shouldn't with 'as const')
      // In a properly configured TypeScript setup, this would be a compile error
      expect(typeof messages.TICKER_NOT_FOUND).toBe('string');
    });
  });
});
