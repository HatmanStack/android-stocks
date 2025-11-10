/**
 * Date utility functions for database storage and manipulation
 * Uses date-fns for all date operations
 */

import { format, parseISO, addDays, subDays, isValid } from 'date-fns';

/**
 * Format a Date object for database storage (ISO 8601: YYYY-MM-DD)
 * @param date - Date object to format
 * @returns ISO 8601 date string
 */
export function formatDateForDB(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Parse a date string from database to Date object
 * @param dateString - ISO 8601 date string (YYYY-MM-DD)
 * @returns Date object
 */
export function parseDateFromDB(dateString: string): Date {
  return parseISO(dateString);
}

/**
 * Get a date range from today going back N days
 * @param days - Number of days to go back
 * @returns Object with startDate and endDate in ISO 8601 format
 */
export function getDateRangeFromSelection(days: number): { startDate: string; endDate: string } {
  const today = new Date();
  const startDate = subDays(today, days);

  return {
    startDate: formatDateForDB(startDate),
    endDate: formatDateForDB(today),
  };
}

/**
 * Get an array of all dates between start and end (inclusive)
 * Used in Phase 2 for sync orchestration
 * @param startDate - Start date in ISO 8601 format (YYYY-MM-DD)
 * @param endDate - End date in ISO 8601 format (YYYY-MM-DD)
 * @returns Array of date strings in ISO 8601 format
 */
export function getDatesInRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  let current = parseISO(startDate);
  const end = parseISO(endDate);

  while (current <= end) {
    dates.push(formatDateForDB(current));
    current = addDays(current, 1);
  }

  return dates;
}

/**
 * Validate if a string is in ISO 8601 format (YYYY-MM-DD)
 * @param dateString - Date string to validate
 * @returns true if valid ISO 8601 date
 */
export function isValidDateString(dateString: string): boolean {
  if (!dateString || typeof dateString !== 'string') {
    return false;
  }

  // Check format: YYYY-MM-DD
  const iso8601Regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!iso8601Regex.test(dateString)) {
    return false;
  }

  // Check if date is actually valid (e.g., not 2023-13-45)
  const date = parseISO(dateString);
  return isValid(date);
}

/**
 * Format a date for user-friendly display
 * @param date - Date object or ISO 8601 string
 * @param formatString - Optional format string (defaults to 'MMM dd, yyyy')
 * @returns Formatted date string (e.g., "Jan 15, 2025")
 */
export function formatDisplayDate(date: Date | string, formatString: string = 'MMM dd, yyyy'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatString);
}

/**
 * Get today's date in ISO 8601 format
 * @returns Today's date as YYYY-MM-DD
 */
export function getTodayISO(): string {
  return formatDateForDB(new Date());
}

/**
 * Get yesterday's date in ISO 8601 format
 * @returns Yesterday's date as YYYY-MM-DD
 */
export function getYesterdayISO(): string {
  return formatDateForDB(subDays(new Date(), 1));
}
