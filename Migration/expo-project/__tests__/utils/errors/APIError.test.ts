/**
 * API Error Classes Tests
 */

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

describe('APIError Classes', () => {
  describe('APIError', () => {
    it('should create error with message and status code', () => {
      const error = new APIError('Something went wrong', 500, '/api/stocks');
      expect(error.message).toBe('Something went wrong');
      expect(error.statusCode).toBe(500);
      expect(error.endpoint).toBe('/api/stocks');
      expect(error.name).toBe('APIError');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(APIError);
    });

    it('should work with minimal parameters', () => {
      const error = new APIError('Error message');
      expect(error.message).toBe('Error message');
      expect(error.statusCode).toBeUndefined();
      expect(error.endpoint).toBeUndefined();
    });
  });

  describe('NetworkError', () => {
    it('should create network error with default message', () => {
      const error = new NetworkError();
      expect(error.message).toBe('Network connection failed');
      expect(error.name).toBe('NetworkError');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(NetworkError);
    });

    it('should accept custom message', () => {
      const error = new NetworkError('Custom network error');
      expect(error.message).toBe('Custom network error');
    });
  });

  describe('RateLimitError', () => {
    it('should create rate limit error with endpoint', () => {
      const error = new RateLimitError('/api/stocks', 60);
      expect(error.message).toBe('Rate limit exceeded for /api/stocks');
      expect(error.statusCode).toBe(429);
      expect(error.endpoint).toBe('/api/stocks');
      expect(error.retryAfter).toBe(60);
      expect(error.name).toBe('RateLimitError');
      expect(error).toBeInstanceOf(APIError);
      expect(error).toBeInstanceOf(RateLimitError);
    });

    it('should work without retryAfter', () => {
      const error = new RateLimitError('/api/news');
      expect(error.retryAfter).toBeUndefined();
    });
  });

  describe('TickerNotFoundError', () => {
    it('should create ticker not found error', () => {
      const error = new TickerNotFoundError('AAPL');
      expect(error.message).toBe("Ticker 'AAPL' not found");
      expect(error.statusCode).toBe(404);
      expect(error.ticker).toBe('AAPL');
      expect(error.name).toBe('TickerNotFoundError');
      expect(error).toBeInstanceOf(APIError);
      expect(error).toBeInstanceOf(TickerNotFoundError);
    });
  });

  describe('AuthenticationError', () => {
    it('should create auth error with default message', () => {
      const error = new AuthenticationError();
      expect(error.message).toBe('Invalid or missing API key');
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe('AuthenticationError');
      expect(error).toBeInstanceOf(APIError);
      expect(error).toBeInstanceOf(AuthenticationError);
    });

    it('should accept custom message and endpoint', () => {
      const error = new AuthenticationError('Custom auth error', '/api/protected');
      expect(error.message).toBe('Custom auth error');
      expect(error.endpoint).toBe('/api/protected');
    });
  });

  describe('TimeoutError', () => {
    it('should create timeout error', () => {
      const error = new TimeoutError('/api/stocks', 30000);
      expect(error.message).toBe('Request to /api/stocks timed out after 30000ms');
      expect(error.endpoint).toBe('/api/stocks');
      expect(error.timeout).toBe(30000);
      expect(error.name).toBe('TimeoutError');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(TimeoutError);
    });
  });

  describe('DatabaseError', () => {
    it('should create database error with full context', () => {
      const error = new DatabaseError('Query failed', 'SELECT', 'stocks');
      expect(error.message).toBe('Query failed');
      expect(error.operation).toBe('SELECT');
      expect(error.table).toBe('stocks');
      expect(error.name).toBe('DatabaseError');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(DatabaseError);
    });

    it('should work with minimal parameters', () => {
      const error = new DatabaseError('Error message');
      expect(error.message).toBe('Error message');
      expect(error.operation).toBeUndefined();
      expect(error.table).toBeUndefined();
    });
  });

  describe('ValidationError', () => {
    it('should create validation error with field', () => {
      const error = new ValidationError('Invalid ticker format', 'ticker');
      expect(error.message).toBe('Invalid ticker format');
      expect(error.field).toBe('ticker');
      expect(error.name).toBe('ValidationError');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ValidationError);
    });

    it('should work without field', () => {
      const error = new ValidationError('Validation failed');
      expect(error.message).toBe('Validation failed');
      expect(error.field).toBeUndefined();
    });
  });

  describe('ServiceUnavailableError', () => {
    it('should create service unavailable error with default message', () => {
      const error = new ServiceUnavailableError('prediction-service');
      expect(error.message).toBe('Service prediction-service is currently unavailable');
      expect(error.statusCode).toBe(503);
      expect(error.service).toBe('prediction-service');
      expect(error.name).toBe('ServiceUnavailableError');
      expect(error).toBeInstanceOf(APIError);
      expect(error).toBeInstanceOf(ServiceUnavailableError);
    });

    it('should accept custom message', () => {
      const error = new ServiceUnavailableError('news-service', 'Custom unavailable message');
      expect(error.message).toBe('Custom unavailable message');
      expect(error.service).toBe('news-service');
    });
  });
});
