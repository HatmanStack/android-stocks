/**
 * Date Formatting Utilities Tests
 */

import {
  formatShortDate,
  formatLongDate,
  formatNewsDate,
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
});
