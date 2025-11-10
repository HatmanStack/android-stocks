/**
 * Date Formatting Utilities Tests
 */

import {
  formatShortDate,
  formatLongDate,
  formatNewsDate,
  formatRelativeDate,
  formatDateTime,
} from '@/utils/formatting/dateFormatting';

describe('dateFormatting', () => {
  describe('formatShortDate', () => {
    it('should format dates in MMM dd format', () => {
      expect(formatShortDate('2024-01-15')).toBe('Jan 15');
      expect(formatShortDate('2023-12-31')).toBe('Dec 31');
    });

    it('should handle ISO date strings', () => {
      expect(formatShortDate('2024-03-05T10:30:00Z')).toBe('Mar 05');
    });
  });

  describe('formatLongDate', () => {
    it('should format dates in MMMM dd, yyyy format', () => {
      expect(formatLongDate('2024-01-15')).toBe('January 15, 2024');
      expect(formatLongDate('2023-12-31')).toBe('December 31, 2023');
    });

    it('should handle different months', () => {
      expect(formatLongDate('2024-12-25')).toBe('December 25, 2024');
      expect(formatLongDate('2024-07-04')).toBe('July 04, 2024');
    });
  });

  describe('formatNewsDate', () => {
    it('should format dates in MMM dd, yyyy format', () => {
      expect(formatNewsDate('2024-01-15')).toBe('Jan 15, 2024');
      expect(formatNewsDate('2024-03-05T10:30:00Z')).toBe('Mar 05, 2024');
    });

    it('should handle various date formats', () => {
      expect(formatNewsDate('2024-03-05')).toBe('Mar 05, 2024');
      expect(formatNewsDate('2024-12-31T00:00:00')).toBe('Dec 31, 2024');
    });
  });

  describe('formatRelativeDate', () => {
    it('should format dates as relative time', () => {
      // Test with a date in the past
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 2);
      const result = formatRelativeDate(pastDate);
      expect(result).toContain('days ago');
    });

    it('should handle ISO date strings', () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 5);
      const result = formatRelativeDate(pastDate.toISOString());
      expect(result).toContain('hours ago');
    });

    it('should handle Date objects', () => {
      const pastDate = new Date();
      pastDate.setMinutes(pastDate.getMinutes() - 30);
      const result = formatRelativeDate(pastDate);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });
  });

  describe('formatDateTime', () => {
    it('should format dates with time in MMM dd, yyyy at h:mm a format', () => {
      const date = new Date('2024-01-15T15:45:00');
      const result = formatDateTime(date);
      expect(result).toContain('Jan 15, 2024');
      expect(result).toContain('at');
      expect(result).toContain('PM');
    });

    it('should handle ISO date strings', () => {
      const result = formatDateTime('2024-12-31T09:30:00');
      expect(result).toContain('Dec 31, 2024');
      expect(result).toContain('at');
      expect(result).toContain('AM');
    });

    it('should handle different times', () => {
      const morning = formatDateTime('2024-03-15T08:00:00');
      expect(morning).toContain('8:00 AM');

      const evening = formatDateTime('2024-03-15T20:30:00');
      expect(evening).toContain('8:30 PM');
    });
  });
});
