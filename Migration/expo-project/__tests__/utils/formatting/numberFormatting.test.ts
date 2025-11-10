/**
 * Number Formatting Utilities Tests
 */

import {
  formatCurrency,
  formatVolume,
  formatPercentage,
  formatMarketCap,
  formatWithCommas,
  roundToDecimals,
} from '@/utils/formatting/numberFormatting';

describe('numberFormatting', () => {
  describe('formatCurrency', () => {
    it('should format positive numbers as currency', () => {
      expect(formatCurrency(1234.56)).toBe('$1234.56');
      expect(formatCurrency(100)).toBe('$100.00');
      expect(formatCurrency(0.99)).toBe('$0.99');
    });

    it('should format negative numbers as currency', () => {
      expect(formatCurrency(-1234.56)).toBe('$-1234.56');
      expect(formatCurrency(-0.50)).toBe('$-0.50');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('should handle very large numbers', () => {
      expect(formatCurrency(1000000)).toBe('$1000000.00');
    });
  });

  describe('formatVolume', () => {
    it('should format volumes under 1K', () => {
      expect(formatVolume(999)).toBe('999');
      expect(formatVolume(100)).toBe('100');
    });

    it('should format volumes in thousands (K)', () => {
      expect(formatVolume(1500)).toBe('1.5K');
      expect(formatVolume(999999)).toBe('1000.0K');
    });

    it('should format volumes in millions (M)', () => {
      expect(formatVolume(1500000)).toBe('1.5M');
      expect(formatVolume(15500000)).toBe('15.5M');
    });

    it('should format volumes in billions (B)', () => {
      expect(formatVolume(1500000000)).toBe('1.5B');
      expect(formatVolume(15500000000)).toBe('15.5B');
    });

    it('should handle zero', () => {
      expect(formatVolume(0)).toBe('0');
    });
  });

  describe('formatPercentage', () => {
    it('should format positive percentages', () => {
      expect(formatPercentage(0.0525)).toBe('+5.25%');
      expect(formatPercentage(0.15)).toBe('+15.00%');
    });

    it('should format negative percentages', () => {
      expect(formatPercentage(-0.0325)).toBe('-3.25%');
      expect(formatPercentage(-0.10)).toBe('-10.00%');
    });

    it('should format zero percentage', () => {
      expect(formatPercentage(0)).toBe('+0.00%');
    });

    it('should handle very small percentages', () => {
      expect(formatPercentage(0.0001)).toBe('+0.01%');
    });
  });

  describe('formatMarketCap', () => {
    it('should format numbers under 1M', () => {
      expect(formatMarketCap(500)).toBe('$500');
      expect(formatMarketCap(999999)).toBe('$999999');
    });

    it('should format numbers in millions', () => {
      expect(formatMarketCap(1500000)).toBe('$1.50M');
      expect(formatMarketCap(50000000)).toBe('$50.00M');
    });

    it('should format numbers in billions', () => {
      expect(formatMarketCap(1500000000)).toBe('$1.50B');
      expect(formatMarketCap(50000000000)).toBe('$50.00B');
    });

    it('should format numbers in trillions', () => {
      expect(formatMarketCap(1500000000000)).toBe('$1.50T');
      expect(formatMarketCap(5000000000000)).toBe('$5.00T');
    });

    it('should handle zero', () => {
      expect(formatMarketCap(0)).toBe('$0');
    });
  });

  describe('formatWithCommas', () => {
    it('should format numbers with thousands separators', () => {
      expect(formatWithCommas(1000)).toBe('1,000');
      expect(formatWithCommas(1234567)).toBe('1,234,567');
      expect(formatWithCommas(999999999)).toBe('999,999,999');
    });

    it('should handle numbers under 1000', () => {
      expect(formatWithCommas(500)).toBe('500');
      expect(formatWithCommas(99)).toBe('99');
    });

    it('should handle zero', () => {
      expect(formatWithCommas(0)).toBe('0');
    });
  });

  describe('roundToDecimals', () => {
    it('should round to specified decimal places', () => {
      expect(roundToDecimals(1.2345, 2)).toBe(1.23);
      expect(roundToDecimals(1.2355, 2)).toBe(1.24);
      expect(roundToDecimals(1.999, 2)).toBe(2.0);
    });

    it('should handle zero decimals', () => {
      expect(roundToDecimals(1.567, 0)).toBe(2);
      expect(roundToDecimals(1.234, 0)).toBe(1);
    });

    it('should handle negative numbers', () => {
      expect(roundToDecimals(-1.2345, 2)).toBe(-1.23);
      expect(roundToDecimals(-1.2355, 2)).toBe(-1.24);
    });
  });
});
