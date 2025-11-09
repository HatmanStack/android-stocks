/**
 * Number formatting utilities for currency, percentages, and large numbers
 */

/**
 * Format a number as currency with $ symbol
 * @param value - Number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string (e.g., "$123.45")
 */
export function formatCurrency(value: number, decimals: number = 2): string {
  return `$${value.toFixed(decimals)}`;
}

/**
 * Format a number as percentage
 * @param value - Number to format (e.g., 0.1523 for 15.23%)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string (e.g., "15.23%")
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  const percentage = value * 100;
  const sign = percentage >= 0 ? '+' : '';
  return `${sign}${percentage.toFixed(decimals)}%`;
}

/**
 * Format large numbers with K, M, B suffixes
 * @param volume - Number to format
 * @returns Formatted string (e.g., "1.5M", "23.4K")
 */
export function formatVolume(volume: number): string {
  if (volume >= 1_000_000_000) {
    return `${(volume / 1_000_000_000).toFixed(1)}B`;
  } else if (volume >= 1_000_000) {
    return `${(volume / 1_000_000).toFixed(1)}M`;
  } else if (volume >= 1_000) {
    return `${(volume / 1_000).toFixed(1)}K`;
  } else {
    return volume.toString();
  }
}

/**
 * Format market cap with appropriate suffix
 * @param value - Market cap value
 * @returns Formatted string (e.g., "$1.2T", "$500B", "$50M")
 */
export function formatMarketCap(value: number): string {
  if (value >= 1_000_000_000_000) {
    return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
  } else if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  } else if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  } else {
    return `$${value.toFixed(0)}`;
  }
}

/**
 * Round a number to specified decimal places
 * @param value - Number to round
 * @param decimals - Number of decimal places
 * @returns Rounded number
 */
export function roundToDecimals(value: number, decimals: number): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

/**
 * Format a number with thousands separators
 * @param value - Number to format
 * @returns Formatted string (e.g., "1,234,567")
 */
export function formatWithCommas(value: number): string {
  return value.toLocaleString('en-US');
}
