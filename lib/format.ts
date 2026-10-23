/**
 * Number formatting utilities for Indonesian locale
 * Uses dot (.) as thousand separator
 */

/**
 * Format a number with dot thousand separators
 * Returns empty string for 0, null, or undefined
 * 
 * @param value - The number to format
 * @returns Formatted string with dots as thousand separators, or empty string
 * 
 * @example
 * formatNumber(1234567) // "1.234.567"
 * formatNumber(1000) // "1.000"
 * formatNumber(0) // ""
 * formatNumber(null) // ""
 * formatNumber(undefined) // ""
 */
export function formatNumber(value: number | null | undefined): string {
  // Return empty string for 0, null, or undefined
  if (value === null || value === undefined || value === 0) {
    return '';
  }

  // Convert to string and add thousand separators
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Parse a formatted number string by removing dot separators
 * Returns 0 for invalid input
 * 
 * @param value - The formatted string to parse
 * @returns Parsed integer value, or 0 for invalid input
 * 
 * @example
 * parseNumber("1.234.567") // 1234567
 * parseNumber("1000") // 1000
 * parseNumber("") // 0
 * parseNumber("invalid") // 0
 */
export function parseNumber(value: string): number {
  // Handle empty string
  if (!value || value.trim() === '') {
    return 0;
  }

  // Remove all dots (thousand separators)
  const cleaned = value.replace(/\./g, '');
  
  // Parse to integer
  const parsed = parseInt(cleaned, 10);
  
  // Return 0 for invalid input (NaN)
  if (isNaN(parsed)) {
    return 0;
  }

  // Return 0 for negative numbers (as per validation requirements)
  if (parsed < 0) {
    return 0;
  }

  return parsed;
}

/**
 * Format input value as user types, handling partial input gracefully
 * Strips non-digit characters, then applies thousand separators
 * 
 * @param value - The input string to format
 * @returns Formatted string with dots as thousand separators
 * 
 * @example
 * formatInputValue("1234") // "1.234"
 * formatInputValue("1234567") // "1.234.567"
 * formatInputValue("12a34") // "1.234"
 * formatInputValue("") // ""
 */
export function formatInputValue(value: string): string {
  // Handle empty string
  if (!value || value.trim() === '') {
    return '';
  }

  // Remove all non-digit characters
  const digitsOnly = value.replace(/\D/g, '');
  
  // Handle empty result after cleaning
  if (digitsOnly === '') {
    return '';
  }

  // Parse to number to remove leading zeros
  const parsed = parseInt(digitsOnly, 10);
  
  // Return empty for 0 or invalid
  if (isNaN(parsed) || parsed === 0) {
    return '';
  }

  // Format with thousand separators
  return parsed.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
