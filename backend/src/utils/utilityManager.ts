/**
 * Utility functions.
 */

import { VALIDATION_REGEX } from '../constants/appConsts';

/**
 * Sanitizes input string.
 */
export function sanitizeInput(input: any): string {
  if (input === null || input === undefined) return '';
  return String(input)
    .replace(/<script\b[\s\S]*?<\/script>|javascript:|onerror=|onload=|eval\(|<iframe|<object|<embed/gi, '')
    .replace(/[<>'"&]/g, (char) => {
      switch (char) {
        case '<':
          return '&lt;';
        case '>':
          return '&gt;';
        case "'":
          return '&#39;';
        case '"':
          return '&quot;';
        case '&':
          return '&amp;';
        default:
          return char;
      }
    })
    .trim();
}

/**
 * Generates booking reference code.
 */
export function generateBookingReference(): string {
  return `HTL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

/**
 * Generates booking ID.
 */
export function generateBookingId(): string {
  return `CONF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

/**
 * Generates workflow ID.
 */
export function generateWorkflowId(city: string = 'global'): string {
  const sanitized = city.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `hotel-search-${sanitized || 'rate'}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

/**
 * Validates check-in and check-out dates.
 */
export function validateDateRange(checkIn: string, checkOut: string): boolean {
  if (!VALIDATION_REGEX.date.test(checkIn) || !VALIDATION_REGEX.date.test(checkOut)) {
    return false;
  }
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  return !isNaN(inDate.getTime()) && !isNaN(outDate.getTime()) && outDate > inDate;
}

/**
 * Checks if error is a connection failure.
 */
export function isTemporalConnectionError(error: any): boolean {
  if (!error) return false;
  const msg = String(error.message || '');
  return (
    msg.includes('connect') ||
    msg.includes('deadline') ||
    msg.includes('UNAVAILABLE') ||
    error.code === 14
  );
}

/**
 * Calculates tax and total.
 */
export function calculateTaxAndTotal(basePrice: number, taxRate: number = 0.12): {
  tax: number;
  total: number;
} {
  const tax = Math.round(basePrice * taxRate);
  const total = basePrice + tax;
  return { tax, total };
}
