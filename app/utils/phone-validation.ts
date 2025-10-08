/**
 * Phone number validation utilities
 */

/**
 * Validates if a phone number is a valid 10-digit mobile number
 * @param phone - The phone number to validate
 * @returns boolean - true if valid, false otherwise
 */
export function isValidMobileNumber(phone: string): boolean {
  // Remove any spaces, dashes, or other non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Check if it's exactly 10 digits
  if (cleanPhone.length !== 10) {
    return false;
  }
  
  // Check if it starts with 6, 7, 8, or 9 (valid Indian mobile number prefixes)
  const firstDigit = cleanPhone.charAt(0);
  if (!['6', '7', '8', '9'].includes(firstDigit)) {
    return false;
  }
  
  // Check if all digits are numbers
  return /^\d{10}$/.test(cleanPhone);
}

/**
 * Sanitizes phone number input to only allow digits and limit to 10 digits
 * @param input - The input string to sanitize
 * @returns string - Sanitized phone number (max 10 digits)
 */
export function sanitizePhoneInput(input: string): string {
  // Remove all non-digit characters
  const digitsOnly = input.replace(/\D/g, '');
  
  // Limit to maximum 10 digits
  return digitsOnly.slice(0, 10);
}

/**
 * Formats a phone number for display
 * @param phone - The phone number to format
 * @returns string - Formatted phone number
 */
export function formatPhoneNumber(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length === 10) {
    return `${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`;
  }
  return phone;
}

/**
 * Gets validation error message for phone number
 * @param phone - The phone number to validate
 * @returns string - Error message or empty string if valid
 */
export function getPhoneValidationError(phone: string): string {
  if (!phone) {
    return 'Phone number is required';
  }
  
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.length === 0) {
    return 'Phone number is required';
  }
  
  if (cleanPhone.length < 10) {
    return 'Phone number must be 10 digits';
  }
  
  if (cleanPhone.length > 10) {
    return 'Phone number must be exactly 10 digits';
  }
  
  const firstDigit = cleanPhone.charAt(0);
  if (!['6', '7', '8', '9'].includes(firstDigit)) {
    return 'Phone number must start with 6, 7, 8, or 9';
  }
  
  return '';
}
