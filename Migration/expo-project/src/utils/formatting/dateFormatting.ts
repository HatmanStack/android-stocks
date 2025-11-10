/**
 * Date formatting utilities for user-friendly display
 */

import { format, parseISO, formatDistanceToNow } from 'date-fns';

/**
 * Format date as short format
 * @param date - Date object or ISO 8601 string
 * @returns Short date string (e.g., "Jan 15")
 */
export function formatShortDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM dd');
}

/**
 * Format date as long format
 * @param date - Date object or ISO 8601 string
 * @returns Long date string (e.g., "January 15, 2025")
 */
export function formatLongDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMMM dd, yyyy');
}

/**
 * Format date as relative time
 * @param date - Date object or ISO 8601 string
 * @returns Relative time string (e.g., "2 days ago", "Yesterday")
 */
export function formatRelativeDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

/**
 * Format date for news articles
 * Consistent format across the app
 * @param date - Date object or ISO 8601 string
 * @returns News date string (e.g., "Jan 15, 2025")
 */
export function formatNewsDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM dd, yyyy');
}

/**
 * Format date and time
 * @param date - Date object or ISO 8601 string
 * @returns Date and time string (e.g., "Jan 15, 2025 at 3:45 PM")
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, "MMM dd, yyyy 'at' h:mm a");
}
