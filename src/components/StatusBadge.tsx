/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Status } from '../types';
import { isOverdue } from '../lib/followUpLogic';
import { Quote } from '../types';

interface StatusBadgeProps {
  status: Status;
  quote?: Quote;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, quote, className = '' }) => {
  const isQuoteOverdue = quote && isOverdue(quote);

  const getStatusBadge = () => {
    switch (status) {
      case 'waiting':
        return (
          <span
            id={`status-badge-waiting-${quote?.id || 'gen'}`}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 ${className}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            Waiting
          </span>
        );
      case 'followed_up':
        return (
          <span
            id={`status-badge-followed-${quote?.id || 'gen'}`}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 ${className}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            Followed Up
          </span>
        );
      case 'won':
        return (
          <span
            id={`status-badge-won-${quote?.id || 'gen'}`}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            Won
          </span>
        );
      case 'lost':
        return (
          <span
            id={`status-badge-lost-${quote?.id || 'gen'}`}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200 ${className}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            Lost
          </span>
        );
      default:
        return null;
    }
  };

  if (isQuoteOverdue) {
    return (
      <div className="inline-flex items-center gap-1.5 flex-wrap">
        {getStatusBadge()}
        <span
          id={`status-badge-overdue-${quote?.id || 'gen'}`}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300/80 shadow-2xs"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
          Overdue
        </span>
      </div>
    );
  }

  return getStatusBadge();
};
