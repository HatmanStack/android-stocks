/**
 * Date Utilities Tests
 */

import {
  formatDateForDB,
  parseDateFromDB,
  getDateRangeFromSelection,
  getDatesInRange,
  isValidDateString,
  formatDisplayDate,
  getTodayISO,
  getYesterdayISO,
} from '@/utils/date/dateUtils';

describe('dateUtils', () => {
  describe('formatDateForDB', () => {
    it('should format Date objects in ISO 8601 format', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      expect(formatDateForDB(date)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should handle different dates', () => {
      expect(formatDateForDB(new Date('2024-12-31'))).toBe('2024-12-31');
      expect(formatDateForDB(new Date('2024-01-01'))).toBe('2024-01-01');
    });
  });

  describe('parseDateFromDB', () => {
    it('should parse ISO 8601 date strings to Date objects', () => {
      const result = parseDateFromDB('2024-01-15');
      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(0); // January is 0
      expect(result.getDate()).toBe(15);
    });

    it('should handle different date strings', () => {
      const result1 = parseDateFromDB('2024-12-31');
      expect(result1.getFullYear()).toBe(2024);
      expect(result1.getMonth()).toBe(11); // December is 11
      expect(result1.getDate()).toBe(31);

      const result2 = parseDateFromDB('2023-07-04');
      expect(result2.getFullYear()).toBe(2023);
      expect(result2.getMonth()).toBe(6); // July is 6
      expect(result2.getDate()).toBe(4);
    });
  });

  describe('getDateRangeFromSelection', () => {
    it('should return correct date range', () => {
      const result = getDateRangeFromSelection(7);

      // Should return ISO 8601 format
      expect(result.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(result.endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      // End date should be today
      expect(result.endDate).toBe(formatDateForDB(new Date()));

      // Start date should be 7 days ago
      const daysDiff = Math.floor(
        (parseDateFromDB(result.endDate).getTime() - parseDateFromDB(result.startDate).getTime())
        / (1000 * 60 * 60 * 24)
      );
      expect(daysDiff).toBe(7);
    });

    it('should handle different day ranges', () => {
      const result30 = getDateRangeFromSelection(30);
      const daysDiff = Math.floor(
        (parseDateFromDB(result30.endDate).getTime() - parseDateFromDB(result30.startDate).getTime())
        / (1000 * 60 * 60 * 24)
      );
      expect(daysDiff).toBe(30);
    });
  });

  describe('getDatesInRange', () => {
    it('should return all dates in range (inclusive)', () => {
      const result = getDatesInRange('2024-01-01', '2024-01-05');
      expect(result).toEqual([
        '2024-01-01',
        '2024-01-02',
        '2024-01-03',
        '2024-01-04',
        '2024-01-05',
      ]);
    });

    it('should handle single day range', () => {
      const result = getDatesInRange('2024-01-15', '2024-01-15');
      expect(result).toEqual(['2024-01-15']);
    });

    it('should handle month boundaries', () => {
      const result = getDatesInRange('2024-01-30', '2024-02-02');
      expect(result).toEqual([
        '2024-01-30',
        '2024-01-31',
        '2024-02-01',
        '2024-02-02',
      ]);
    });

    it('should handle leap years', () => {
      const result = getDatesInRange('2024-02-28', '2024-03-01');
      expect(result).toEqual([
        '2024-02-28',
        '2024-02-29', // 2024 is a leap year
        '2024-03-01',
      ]);
    });
  });

  describe('isValidDateString', () => {
    it('should validate correct ISO 8601 date strings', () => {
      expect(isValidDateString('2024-01-15')).toBe(true);
      expect(isValidDateString('2024-12-31')).toBe(true);
      expect(isValidDateString('2023-07-04')).toBe(true);
    });

    it('should reject invalid date formats', () => {
      expect(isValidDateString('2024/01/15')).toBe(false); // wrong separator
      expect(isValidDateString('01-15-2024')).toBe(false); // wrong order
      expect(isValidDateString('2024-1-15')).toBe(false); // missing leading zero
      expect(isValidDateString('2024-01-15T10:30:00')).toBe(false); // includes time
    });

    it('should reject invalid dates', () => {
      expect(isValidDateString('2024-13-01')).toBe(false); // invalid month
      expect(isValidDateString('2024-01-32')).toBe(false); // invalid day
      expect(isValidDateString('2023-02-29')).toBe(false); // not a leap year
      expect(isValidDateString('2024-04-31')).toBe(false); // April has 30 days
    });

    it('should handle null/undefined/empty inputs', () => {
      expect(isValidDateString('')).toBe(false);
      expect(isValidDateString(null as any)).toBe(false);
      expect(isValidDateString(undefined as any)).toBe(false);
      expect(isValidDateString(123 as any)).toBe(false);
    });
  });

  describe('formatDisplayDate', () => {
    it('should format dates for display with default format', () => {
      expect(formatDisplayDate('2024-01-15')).toBe('Jan 15, 2024');
      expect(formatDisplayDate('2024-12-31')).toBe('Dec 31, 2024');
    });

    it('should accept Date objects', () => {
      const date = new Date('2024-01-15');
      expect(formatDisplayDate(date)).toBe('Jan 15, 2024');
    });

    it('should accept custom format strings', () => {
      expect(formatDisplayDate('2024-01-15', 'yyyy-MM-dd')).toBe('2024-01-15');
      expect(formatDisplayDate('2024-01-15', 'MMMM dd, yyyy')).toBe('January 15, 2024');
      expect(formatDisplayDate('2024-01-15', 'MMM dd')).toBe('Jan 15');
    });
  });

  describe('getTodayISO', () => {
    it('should return today\'s date in ISO 8601 format', () => {
      const result = getTodayISO();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      // Should match formatDateForDB(new Date())
      expect(result).toBe(formatDateForDB(new Date()));
    });
  });

  describe('getYesterdayISO', () => {
    it('should return yesterday\'s date in ISO 8601 format', () => {
      const result = getYesterdayISO();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      // Should be one day before today
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      expect(result).toBe(formatDateForDB(yesterday));
    });
  });
});
