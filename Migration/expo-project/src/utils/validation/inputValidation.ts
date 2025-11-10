/**
 * Input validation utilities
 */

import { parseISO, isValid } from 'date-fns';

/**
 * Validate stock ticker format
 * Valid tickers are 1-5 uppercase letters
 * @param ticker - Ticker string to validate
 * @returns true if valid ticker format
 */
export function isValidTicker(ticker: string): boolean {
  if (!ticker || typeof ticker !== 'string') {
    return false;
  }

  const tickerRegex = /^[A-Z]{1,5}$/;
  return tickerRegex.test(ticker);
}

/**
 * Sanitize ticker input
 * Converts to uppercase and trims whitespace
 * @param ticker - Raw ticker input
 * @returns Sanitized ticker
 */
export function sanitizeTicker(ticker: string): string {
  if (!ticker || typeof ticker !== 'string') {
    return '';
  }

  return ticker.trim().toUpperCase();
}

/**
 * Validate date range
 * Ensures start date is before or equal to end date
 * @param startDate - Start date (ISO 8601 format)
 * @param endDate - End date (ISO 8601 format)
 * @returns true if valid date range
 */
export function isValidDateRange(startDate: string, endDate: string): boolean {
  try {
    const start = parseISO(startDate);
    const end = parseISO(endDate);

    if (!isValid(start) || !isValid(end)) {
      return false;
    }

    return start <= end;
  } catch {
    return false;
  }
}

/**
 * Validate URL format
 * @param url - URL string to validate
 * @returns true if valid URL
 */
export function validateArticleURL(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validate email format
 * @param email - Email string to validate
 * @returns true if valid email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
