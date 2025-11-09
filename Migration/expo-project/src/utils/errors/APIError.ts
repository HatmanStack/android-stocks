/**
 * Custom Error Classes for API and Service Errors
 * Provides type-safe error handling with detailed context
 */

/**
 * Base API Error class
 * Extends Error with HTTP status code and endpoint information
 */
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public endpoint?: string
  ) {
    super(message);
    this.name = 'APIError';
    Object.setPrototypeOf(this, APIError.prototype);
  }
}

/**
 * Network connection error
 * Used when network requests fail due to connectivity issues
 */
export class NetworkError extends Error {
  constructor(message: string = 'Network connection failed') {
    super(message);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * Rate limit exceeded error
 * Thrown when API rate limits are hit (429 status)
 */
export class RateLimitError extends APIError {
  constructor(endpoint: string, retryAfter?: number) {
    super(
      `Rate limit exceeded for ${endpoint}`,
      429,
      endpoint
    );
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }

  public retryAfter?: number; // Seconds until retry allowed
}

/**
 * Ticker symbol not found error
 * Thrown when querying invalid or non-existent ticker
 */
export class TickerNotFoundError extends APIError {
  constructor(public ticker: string) {
    super(`Ticker '${ticker}' not found`, 404);
    this.name = 'TickerNotFoundError';
    Object.setPrototypeOf(this, TickerNotFoundError.prototype);
  }
}

/**
 * Authentication/Authorization error
 * Thrown when API key is invalid or missing
 */
export class AuthenticationError extends APIError {
  constructor(message: string = 'Invalid or missing API key', endpoint?: string) {
    super(message, 401, endpoint);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Timeout error
 * Thrown when requests take too long to complete
 */
export class TimeoutError extends Error {
  constructor(
    public endpoint: string,
    public timeout: number // milliseconds
  ) {
    super(`Request to ${endpoint} timed out after ${timeout}ms`);
    this.name = 'TimeoutError';
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

/**
 * Database error
 * Thrown when SQLite operations fail
 */
export class DatabaseError extends Error {
  constructor(
    message: string,
    public operation?: string,
    public table?: string
  ) {
    super(message);
    this.name = 'DatabaseError';
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

/**
 * Validation error
 * Thrown when input data fails validation
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Service unavailable error
 * Thrown when external services (like Python microservices) are down
 */
export class ServiceUnavailableError extends APIError {
  constructor(
    public service: string,
    message?: string
  ) {
    super(
      message || `Service ${service} is currently unavailable`,
      503
    );
    this.name = 'ServiceUnavailableError';
    Object.setPrototypeOf(this, ServiceUnavailableError.prototype);
  }
}
