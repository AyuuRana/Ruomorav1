/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validates a full international phone number (including country code).
 * Requires between 8 and 15 digits total (ITU-T E.164 recommendation).
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 15;
}

/**
 * Validates national phone digits entered in the number field.
 */
export function isValidNationalPhone(nationalPhone: string): boolean {
  if (!nationalPhone || typeof nationalPhone !== 'string') return false;
  const digits = nationalPhone.replace(/\D/g, '');
  return digits.length >= 6 && digits.length <= 14;
}

export function isValidAmount(amount: number | string): boolean {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return !isNaN(num) && num > 0;
}

