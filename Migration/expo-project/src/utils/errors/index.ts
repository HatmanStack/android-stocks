/**
 * Error Handling Module - Central Export
 * Provides comprehensive error handling utilities
 */

// Export all error classes
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

// Export error handler functions
export {
  logError,
  handleAPIError,
  handleDatabaseError,
  isRetryableError,
  getErrorMessage,
  getUserFriendlyErrorMessage,
  type ErrorContext,
  type ErrorMessage,
} from './errorHandler';

// Export error message utilities
export {
  getErrorSummary,
  ERROR_MESSAGES,
} from './errorMessages';
