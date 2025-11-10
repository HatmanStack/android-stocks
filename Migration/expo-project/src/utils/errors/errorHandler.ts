/**
 * Centralized Error Handler
 * Logs errors and provides user-friendly messages
 */

import axios from 'axios';
import {
  APIError,
  NetworkError,
  RateLimitError,
  TickerNotFoundError,
  AuthenticationError,
  TimeoutError,
  DatabaseError,
  ServiceUnavailableError,
} from './APIError';
import { getUserFriendlyErrorMessage, ErrorMessage } from './errorMessages';

/**
 * Error context for logging
 */
export interface ErrorContext {
  ticker?: string;
  endpoint?: string;
  dateRange?: { start: string; end: string };
  operation?: string;
  userId?: string;
  [key: string]: any;
}

/**
 * Logged error details
 */
interface LoggedError {
  timestamp: string;
  error: Error;
  context?: ErrorContext;
  stack?: string;
  userMessage: ErrorMessage;
}

/**
 * Check if running in production
 */
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Check if running in test environment
 */
const isTest = process.env.NODE_ENV === 'test';

/**
 * Log error to console (development) or external service (production)
 * @param error - Error object
 * @param context - Additional context about the error
 */
export function logError(error: Error, context?: ErrorContext): void {
  const loggedError: LoggedError = {
    timestamp: new Date().toISOString(),
    error,
    context,
    stack: error.stack,
    userMessage: getUserFriendlyErrorMessage(error),
  };

  // Don't log in test environment
  if (isTest) {
    return;
  }

  if (isProduction) {
    // In production, send to error tracking service (e.g., Sentry)
    // For now, just log to console as we don't have Sentry set up yet
    console.error('[ERROR]', {
      name: error.name,
      message: error.message,
      context,
      timestamp: loggedError.timestamp,
    });

    // TODO: Integrate with Sentry or similar service
    // Sentry.captureException(error, { contexts: { custom: context } });
  } else {
    // Development: detailed console logging
    console.group(`🔴 Error: ${error.name}`);
    console.error('Message:', error.message);
    if (context) {
      console.error('Context:', context);
    }
    console.error('Stack:', error.stack);
    console.error('User Message:', loggedError.userMessage);
    console.groupEnd();
  }
}

/**
 * Handle API errors and convert to custom error types
 * @param error - Error from API call
 * @param context - Additional context
 * @returns Custom error instance
 */
export function handleAPIError(error: any, context?: ErrorContext): Error {
  let handledError: Error;

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const endpoint = context?.endpoint || error.config?.url || 'unknown';

    // Network/connection errors
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        handledError = new TimeoutError(endpoint, 30000);
      } else {
        handledError = new NetworkError('Unable to reach the server');
      }
    }
    // HTTP error responses
    else if (status === 401 || status === 403) {
      handledError = new AuthenticationError(
        'Invalid or missing API key',
        endpoint
      );
    } else if (status === 404) {
      const ticker = context?.ticker;
      if (ticker) {
        handledError = new TickerNotFoundError(ticker);
      } else {
        handledError = new APIError('Resource not found', 404, endpoint);
      }
    } else if (status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      handledError = new RateLimitError(
        endpoint,
        retryAfter ? parseInt(retryAfter, 10) : undefined
      );
    } else if (status === 503) {
      handledError = new ServiceUnavailableError(
        endpoint,
        'Service is temporarily unavailable'
      );
    } else if (status && status >= 500) {
      handledError = new APIError('Server error', status, endpoint);
    } else {
      handledError = new APIError(
        error.message || 'API request failed',
        status,
        endpoint
      );
    }
  } else if (error instanceof Error) {
    handledError = error;
  } else {
    handledError = new Error(String(error));
  }

  // Log the error with context
  logError(handledError, context);

  return handledError;
}

/**
 * Handle database errors
 * @param error - Database error
 * @param operation - Operation that failed (e.g., 'insert', 'query')
 * @param table - Table name
 * @returns DatabaseError instance
 */
export function handleDatabaseError(
  error: any,
  operation?: string,
  table?: string
): DatabaseError {
  const dbError = new DatabaseError(
    error.message || 'Database operation failed',
    operation,
    table
  );

  logError(dbError, { operation, table });

  return dbError;
}

/**
 * Determine if an error is retryable
 * Transient errors (network, timeout, 429, 500) should be retried
 * Permanent errors (400, 404) should not be retried
 *
 * @param error - Error to check
 * @returns true if error should be retried
 */
export function isRetryableError(error: any): boolean {
  // Network errors are retryable
  if (error instanceof NetworkError || error instanceof TimeoutError) {
    return true;
  }

  // Rate limit errors are retryable after delay
  if (error instanceof RateLimitError) {
    return true;
  }

  // Service unavailable is retryable
  if (error instanceof ServiceUnavailableError) {
    return true;
  }

  // Server errors (5xx) are retryable
  if (error instanceof APIError && error.statusCode && error.statusCode >= 500) {
    return true;
  }

  // Axios network errors
  if (axios.isAxiosError(error)) {
    // No response = network issue = retryable
    if (!error.response) {
      return true;
    }

    const status = error.response.status;

    // 429 rate limit = retryable
    if (status === 429) {
      return true;
    }

    // 5xx server errors = retryable
    if (status >= 500) {
      return true;
    }
  }

  // All other errors are not retryable
  return false;
}

/**
 * Get user-friendly message from any error
 * @param error - Error object
 * @returns User-friendly message string
 */
export function getErrorMessage(error: any): string {
  const { message, action } = getUserFriendlyErrorMessage(error);
  return action ? `${message} ${action}` : message;
}

/**
 * Export all for convenience
 */
export {
  getUserFriendlyErrorMessage,
  ErrorMessage,
} from './errorMessages';

export {
  APIError,
  NetworkError,
  RateLimitError,
  TickerNotFoundError,
  AuthenticationError,
  TimeoutError,
  DatabaseError,
  ValidationError,
  ServiceUnavailableError,
} from './APIError';
