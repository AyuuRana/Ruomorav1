/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Quote } from '../types';

/**
 * Returns today's date formatted as YYYY-MM-DD in local browser timezone.
 */
export function getLocalToday(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns date plus N days in YYYY-MM-DD format without UTC timezone shifting.
 */
export function addDaysToDate(dateString: string, days: number): string {
  const parts = dateString.split('-').map(Number);
  if (parts.length === 3 && !parts.some(isNaN)) {
    const [year, month, day] = parts;
    const d = new Date(year, month - 1, day);
    d.setDate(d.getDate() + days);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  }
  const d = new Date(dateString);
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Checks if a quote is due for follow-up today (active status + follow-up date matches local today).
 */
export function isFollowUpToday(quote: Quote): boolean {
  return (
    ['waiting', 'followed_up'].includes(quote.status) &&
    quote.followUpDate === getLocalToday()
  );
}

/**
 * Checks if a quote is overdue for follow-up (active status + follow-up date before local today).
 */
export function isOverdue(quote: Quote): boolean {
  return (
    ['waiting', 'followed_up'].includes(quote.status) &&
    quote.followUpDate < getLocalToday()
  );
}

/**
 * Calculates how many calendar days overdue a quote is without UTC timezone shifting.
 */
export function getDaysOverdue(followUpDate: string): number {
  const todayStr = getLocalToday();
  const todayParts = todayStr.split('-').map(Number);
  const targetParts = followUpDate.split('-').map(Number);

  if (todayParts.length === 3 && targetParts.length === 3 && !todayParts.some(isNaN) && !targetParts.some(isNaN)) {
    const todayDate = new Date(todayParts[0], todayParts[1] - 1, todayParts[2]);
    const targetDate = new Date(targetParts[0], targetParts[1] - 1, targetParts[2]);
    const diffTime = todayDate.getTime() - targetDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  const today = new Date(todayStr).getTime();
  const target = new Date(followUpDate).getTime();
  const diffTime = today - target;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Formats an ISO string or date into a relative time description (e.g. "2 hours ago", "just now").
 */
export function formatTimeAgo(dateString?: string | null): string {
  if (!dateString) return 'recently';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 30) {
    return 'just now';
  }
  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  }
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  }
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
  }
  return date.toLocaleDateString();
}
