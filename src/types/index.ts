/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Status = 'waiting' | 'followed_up' | 'won' | 'lost';

export interface Quote {
  id: string;
  userId: string;
  customerName: string;
  phone: string;
  amount: number;
  quoteDate: string; // YYYY-MM-DD
  followUpDate: string; // YYYY-MM-DD
  status: Status;
  notes?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Profile {
  id: string;
  name: string;
  businessName?: string | null;
  email: string;
  createdAt?: string | Date;
}
