/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CountryCodeOption {
  code: string;
  country: string;
  flag: string;
}

export const COUNTRY_CODES: CountryCodeOption[] = [
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+1', country: 'United States / Canada', flag: '🇺🇸' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+971', country: 'United Arab Emirates', flag: '🇦🇪' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+62', country: 'Indonesia', flag: '🇮🇩' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
  { code: '+63', country: 'Philippines', flag: '🇵🇭' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
  { code: '+34', country: 'Spain', flag: '🇪🇸' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷' },
  { code: '+52', country: 'Mexico', flag: '🇲🇽' },
  { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
  { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
  { code: '+94', country: 'Sri Lanka', flag: '🇱🇰' },
  { code: '+977', country: 'Nepal', flag: '🇳🇵' },
];

/**
 * Splits an existing full phone number string into a country code and national number.
 * Defaults country code to '+91' if none matched or if phone is plain digits.
 */
export function splitPhoneAndCountryCode(phone?: string | null): {
  countryCode: string;
  nationalNumber: string;
} {
  if (!phone) {
    return { countryCode: '+91', nationalNumber: '' };
  }

  const trimmed = phone.trim();

  // If starts with +, match against known country codes sorted by code length descending
  if (trimmed.startsWith('+')) {
    const sortedCodes = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);
    for (const c of sortedCodes) {
      if (trimmed.startsWith(c.code)) {
        return {
          countryCode: c.code,
          nationalNumber: trimmed.slice(c.code.length).trim(),
        };
      }
    }
    // Generic match for other +codes like +123
    const genericMatch = trimmed.match(/^(\+\d{1,4})(.*)$/);
    if (genericMatch) {
      return {
        countryCode: genericMatch[1],
        nationalNumber: genericMatch[2].trim(),
      };
    }
  }

  // If starts with 91 and is 12 digits (e.g. 919876543210)
  const cleanDigits = trimmed.replace(/\D/g, '');
  if (cleanDigits.startsWith('91') && cleanDigits.length === 12) {
    return {
      countryCode: '+91',
      nationalNumber: cleanDigits.slice(2),
    };
  }

  // Otherwise return default +91 with the input as national number
  return {
    countryCode: '+91',
    nationalNumber: trimmed,
  };
}

/**
 * Strips non-digit characters from phone number for wa.me links.
 * Ensures the phone number contains full international digits.
 */
export function sanitizePhoneNumber(phone: string): string {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
}

/**
 * Builds a WhatsApp follow-up link with pre-filled message.
 */
export function buildWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = sanitizePhoneNumber(phone);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

/**
 * Formats a currency amount for quotes.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Generates the standard follow-up message template.
 */
export function buildFollowUpMessage(
  customerName: string,
  amount: number,
  quoteDate: string,
  businessName?: string | null
): string {
  const sign = businessName ? `\n\n— ${businessName}` : '';
  const formattedAmount = formatCurrency(amount);
  return `Hi ${customerName}, just following up on the quotation of ${formattedAmount} we sent on ${quoteDate}. Let us know if you have any questions or would like to proceed. Thanks!${sign}`;
}

