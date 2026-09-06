/**
 * Validation regular expressions and rules.
 */

export const VALIDATION_REGEX = {
  // Destination city
  city: /^[a-zA-Z\u00C0-\u024F\s,.'-]{2,60}$/,

  // Full name
  name: /^[a-zA-Z\u00C0-\u024F\s.'-]{2,60}$/,

  // Email
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,

  // Phone number
  phone: /^(\+?\d{1,4}[\s-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}$/,

  // XSS pattern matching
  xssBlacklist: /<script\b[\s\S]*?<\/script>|javascript:|onerror=|onload=|eval\(|<iframe|<object|<embed/gi,
};

export const VALIDATION_MESSAGES = {
  cityRequired: 'Please enter a destination city before searching',
  cityInvalid: 'Please enter a valid city name (letters and spaces only)',
  nameRequired: 'Guest name is required',
  nameInvalid: 'Name must be at least 2 characters (letters only, no special symbols)',
  emailRequired: 'Email address is required',
  emailInvalid: 'Please enter a valid email address (e.g. name@example.com)',
  phoneRequired: 'Phone number is required',
  phoneInvalid: 'Please enter a valid 10-digit phone number',
  datesRequired: 'Valid check-in and check-out dates are required',
};

export { sanitizeInput } from '../utils/utilityManager';
