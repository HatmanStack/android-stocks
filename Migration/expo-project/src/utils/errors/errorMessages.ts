/**
 * User-Friendly Error Messages
 * Maps error types to actionable messages for end users
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
} from './APIError';

/**
 * Error message configuration
 */
export interface ErrorMessage {
  title: string;
  message: string;
  action?: string; // Suggested action for user
}

/**
 * Get user-friendly error message for any error type
 * @param error - Error object (can be any type)
 * @returns ErrorMessage with title, message, and action
 */
export function getUserFriendlyErrorMessage(error: any): ErrorMessage {
  // Custom error classes
  if (error instanceof TickerNotFoundError) {
    return {
      title: 'Ticker Not Found',
      message: `The ticker symbol '${error.ticker}' was not found.`,
      action: 'Please check the symbol and try again. Examples: AAPL, GOOGL, MSFT.',
    };
  }

  if (error instanceof RateLimitError) {
    const retryMessage = error.retryAfter
      ? `Please wait ${error.retryAfter} seconds before trying again.`
      : 'Please wait a moment and try again.';
    return {
      title: 'Too Many Requests',
      message: 'You have made too many requests in a short time.',
      action: retryMessage,
    };
  }

  if (error instanceof AuthenticationError) {
    return {
      title: 'Authentication Failed',
      message: 'Your API key is invalid or missing.',
      action: 'Please check your API keys in settings.',
    };
  }

  if (error instanceof TimeoutError) {
    return {
      title: 'Request Timed Out',
      message: `The request took too long to complete (${Math.round(error.timeout / 1000)}s).`,
      action: 'Please check your internet connection and try again.',
    };
  }

  if (error instanceof NetworkError) {
    return {
      title: 'Connection Failed',
      message: 'Unable to connect to the internet.',
      action: 'Please check your connection and try again.',
    };
  }

  if (error instanceof DatabaseError) {
    const operation = error.operation ? ` during ${error.operation}` : '';
    return {
      title: 'Database Error',
      message: `An error occurred${operation}.`,
      action: 'Please try restarting the app. If the problem persists, contact support.',
    };
  }

  if (error instanceof ValidationError) {
    const field = error.field ? ` in field '${error.field}'` : '';
    return {
      title: 'Invalid Input',
      message: `Validation failed${field}: ${error.message}`,
      action: 'Please correct the input and try again.',
    };
  }

  if (error instanceof ServiceUnavailableError) {
    return {
      title: 'Service Unavailable',
      message: `${error.service} is currently unavailable.`,
      action: 'This is usually temporary. Please try again in a few moments.',
    };
  }

  if (error instanceof APIError) {
    if (error.statusCode === 500) {
      return {
        title: 'Server Error',
        message: 'The server encountered an error.',
        action: 'Please try again later.',
      };
    }

    if (error.statusCode === 503) {
      return {
        title: 'Service Unavailable',
        message: 'The service is temporarily unavailable.',
        action: 'Please try again in a few moments.',
      };
    }

    return {
      title: 'API Error',
      message: error.message,
      action: 'Please try again.',
    };
  }

  // Axios errors (network library)
  if (error?.isAxiosError) {
    if (error.code === 'ECONNABORTED') {
      return {
        title: 'Request Timed Out',
        message: 'The request took too long to complete.',
        action: 'Please check your internet connection and try again.',
      };
    }

    if (error.code === 'ERR_NETWORK') {
      return {
        title: 'Network Error',
        message: 'Unable to reach the server.',
        action: 'Please check your internet connection.',
      };
    }

    if (error.response?.status === 400) {
      return {
        title: 'Bad Request',
        message: 'The request was invalid.',
        action: 'Please check your input and try again.',
      };
    }

    if (error.response?.status === 403) {
      return {
        title: 'Access Denied',
        message: 'You do not have permission to access this resource.',
        action: 'Please check your API keys in settings.',
      };
    }

    if (error.response?.status === 404) {
      return {
        title: 'Not Found',
        message: 'The requested resource was not found.',
        action: 'Please check the ticker symbol and try again.',
      };
    }

    if (error.response?.status === 500) {
      return {
        title: 'Server Error',
        message: 'The server encountered an error.',
        action: 'Please try again later.',
      };
    }

    if (error.response?.status === 502 || error.response?.status === 503) {
      return {
        title: 'Service Unavailable',
        message: 'The service is temporarily unavailable.',
        action: 'Please try again in a few moments.',
      };
    }
  }

  // Generic error fallback
  return {
    title: 'Something Went Wrong',
    message: error?.message || 'An unexpected error occurred.',
    action: 'Please try again. If the problem persists, contact support.',
  };
}

/**
 * Get a short error summary (for toasts/snackbars)
 * @param error - Error object
 * @returns Short error message string
 */
export function getErrorSummary(error: any): string {
  const { title, message } = getUserFriendlyErrorMessage(error);
  return `${title}: ${message}`;
}

/**
 * Specific error messages for common scenarios
 */
export const ERROR_MESSAGES = {
  TICKER_NOT_FOUND: 'Ticker symbol not found. Please check and try again.',
  RATE_LIMIT: 'Too many requests. Please wait and try again.',
  NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
  TIMEOUT: 'Request timed out. Please try again.',
  AUTH_ERROR: 'Invalid API key. Please check your settings.',
  SERVER_ERROR: 'Server error. Please try again later.',
  DATABASE_ERROR: 'Database error. Please restart the app.',
  VALIDATION_ERROR: 'Invalid input. Please check and try again.',
  SERVICE_UNAVAILABLE: 'Service unavailable. Please try again later.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
} as const;
