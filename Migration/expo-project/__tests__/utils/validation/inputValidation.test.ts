/**
 * Input Validation Utilities Tests
 */

import {
  isValidTicker,
  sanitizeTicker,
  isValidDateRange,
  validateArticleURL,
  isValidEmail,
} from '@/utils/validation/inputValidation';

describe('inputValidation', () => {
  describe('isValidTicker', () => {
    it('should validate correct ticker formats', () => {
      expect(isValidTicker('AAPL')).toBe(true);
      expect(isValidTicker('MSFT')).toBe(true);
      expect(isValidTicker('GOOGL')).toBe(true);
      expect(isValidTicker('A')).toBe(true);
      expect(isValidTicker('ABCDE')).toBe(true);
    });

    it('should reject invalid ticker formats', () => {
      expect(isValidTicker('aapl')).toBe(false); // lowercase
      expect(isValidTicker('ABCDEF')).toBe(false); // too long
      expect(isValidTicker('123')).toBe(false); // numbers
      expect(isValidTicker('A-B')).toBe(false); // special chars
      expect(isValidTicker('')).toBe(false); // empty
      expect(isValidTicker('AAPL ')).toBe(false); // trailing space
    });

    it('should handle null/undefined inputs', () => {
      expect(isValidTicker(null as any)).toBe(false);
      expect(isValidTicker(undefined as any)).toBe(false);
      expect(isValidTicker(123 as any)).toBe(false);
    });
  });

  describe('sanitizeTicker', () => {
    it('should convert to uppercase and trim whitespace', () => {
      expect(sanitizeTicker('aapl')).toBe('AAPL');
      expect(sanitizeTicker(' msft ')).toBe('MSFT');
      expect(sanitizeTicker('  GOOGL  ')).toBe('GOOGL');
      expect(sanitizeTicker('tesla')).toBe('TESLA');
    });

    it('should handle empty/invalid inputs', () => {
      expect(sanitizeTicker('')).toBe('');
      expect(sanitizeTicker('   ')).toBe('');
      expect(sanitizeTicker(null as any)).toBe('');
      expect(sanitizeTicker(undefined as any)).toBe('');
    });

    it('should preserve already valid tickers', () => {
      expect(sanitizeTicker('AAPL')).toBe('AAPL');
      expect(sanitizeTicker('MSFT')).toBe('MSFT');
    });
  });

  describe('isValidDateRange', () => {
    it('should validate correct date ranges', () => {
      expect(isValidDateRange('2024-01-01', '2024-12-31')).toBe(true);
      expect(isValidDateRange('2024-01-01', '2024-01-01')).toBe(true); // same day
      expect(isValidDateRange('2023-01-01', '2024-12-31')).toBe(true);
    });

    it('should reject invalid date ranges', () => {
      expect(isValidDateRange('2024-12-31', '2024-01-01')).toBe(false); // end before start
      expect(isValidDateRange('2025-01-01', '2024-01-01')).toBe(false);
    });

    it('should reject invalid date formats', () => {
      expect(isValidDateRange('2024-13-01', '2024-12-31')).toBe(false); // invalid month
      expect(isValidDateRange('2024-01-32', '2024-12-31')).toBe(false); // invalid day
      expect(isValidDateRange('invalid', '2024-12-31')).toBe(false);
      expect(isValidDateRange('2024-01-01', 'invalid')).toBe(false);
    });

    it('should handle empty/null inputs', () => {
      expect(isValidDateRange('', '')).toBe(false);
      expect(isValidDateRange('2024-01-01', '')).toBe(false);
      expect(isValidDateRange('', '2024-01-01')).toBe(false);
    });
  });

  describe('validateArticleURL', () => {
    it('should validate correct HTTP/HTTPS URLs', () => {
      expect(validateArticleURL('https://example.com')).toBe(true);
      expect(validateArticleURL('http://example.com')).toBe(true);
      expect(validateArticleURL('https://www.example.com/article/123')).toBe(true);
      expect(validateArticleURL('https://example.com/path?query=value')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(validateArticleURL('ftp://example.com')).toBe(false); // wrong protocol
      expect(validateArticleURL('example.com')).toBe(false); // no protocol
      expect(validateArticleURL('javascript:alert(1)')).toBe(false); // dangerous protocol
      expect(validateArticleURL('')).toBe(false); // empty
      expect(validateArticleURL('not-a-url')).toBe(false);
    });

    it('should handle null/undefined inputs', () => {
      expect(validateArticleURL(null as any)).toBe(false);
      expect(validateArticleURL(undefined as any)).toBe(false);
      expect(validateArticleURL(123 as any)).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email formats', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.user@example.com')).toBe(true);
      expect(isValidEmail('user+tag@example.co.uk')).toBe(true);
      expect(isValidEmail('user123@test-domain.com')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false); // no local part
      expect(isValidEmail('user@')).toBe(false); // no domain
      expect(isValidEmail('user @example.com')).toBe(false); // space
      expect(isValidEmail('user@example')).toBe(false); // no TLD
      expect(isValidEmail('')).toBe(false); // empty
    });

    it('should handle null/undefined inputs', () => {
      expect(isValidEmail(null as any)).toBe(false);
      expect(isValidEmail(undefined as any)).toBe(false);
      expect(isValidEmail(123 as any)).toBe(false);
    });
  });
});
