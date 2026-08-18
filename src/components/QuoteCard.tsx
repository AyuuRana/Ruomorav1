/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Calendar, Clock, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Quote } from '../types';
import { StatusBadge } from './StatusBadge';
import { WhatsAppButton } from './WhatsAppButton';
import { FollowUpDatePrompt } from './FollowUpDatePrompt';
import { formatCurrency } from '../lib/whatsapp';
import { isFollowUpToday, isOverdue, getDaysOverdue } from '../lib/followUpLogic';
import { useApp } from '../lib/AppContext';

interface QuoteCardProps {
  quote: Quote;
  onSelect?: (quote: Quote) => void;
  compact?: boolean;
}

export const QuoteCard: React.FC<QuoteCardProps> = ({ quote, compact = false }) => {
  const navigate = useNavigate();
  const { markFollowedUp, updateStatus, user } = useApp();
  const [showPrompt, setShowPrompt] = useState(false);

  const dueToday = isFollowUpToday(quote);
  const overdue = isOverdue(quote);
  const daysOverdue = getDaysOverdue(quote.followUpDate);

  const handleCardClick = () => {
    navigate(`/app/quotes/${quote.id}`);
  };

  const handleFollowedUpConfirm = (nextDate: string, notes?: string) => {
    markFollowedUp(quote.id, nextDate, notes);
  };

  return (
    <>
      <div
        id={`quote-card-${quote.id}`}
        className={`group relative bg-white border rounded-xl transition-all duration-200 hover:shadow-md ${
          overdue
            ? 'border-rose-200/80 bg-rose-50/20 hover:border-rose-300'
            : dueToday
            ? 'border-indigo-200/80 bg-indigo-50/15 hover:border-indigo-300'
            : 'border-slate-200/80 hover:border-slate-300'
        } ${compact ? 'p-4' : 'p-5'}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0" onClick={handleCardClick} role="button" tabIndex={0}>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h4 className="text-base font-bold text-slate-900 truncate hover:text-indigo-600 transition-colors cursor-pointer">
                {quote.customerName}
              </h4>
              <StatusBadge status={quote.status} quote={quote} />
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {quote.phone}
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Quoted: {quote.quoteDate}
              </span>
            </div>
          </div>

          <div className="flex items-baseline sm:flex-col sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
            <span className="text-xs text-slate-400 font-medium">Amount</span>
            <span className="text-lg font-extrabold text-slate-900 tracking-tight">
              {formatCurrency(quote.amount)}
            </span>
          </div>
        </div>

        {quote.notes && !compact && (
          <p
            onClick={handleCardClick}
            className="text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-lg p-2.5 mb-3 line-clamp-2 cursor-pointer hover:bg-slate-100/70 transition-colors"
          >
            {quote.notes}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            {overdue ? (
              <span className="inline-flex items-center gap-1 text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-100">
                <Clock className="w-3.5 h-3.5" />
                {daysOverdue} {daysOverdue === 1 ? 'day' : 'days'} overdue
              </span>
            ) : dueToday ? (
              <span className="inline-flex items-center gap-1 text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                <Clock className="w-3.5 h-3.5" />
                Follow-up due Today
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-slate-500">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Next: {quote.followUpDate}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {quote.status !== 'won' && quote.status !== 'lost' && (
              <button
                id={`btn-mark-followed-${quote.id}`}
                type="button"
                onClick={() => setShowPrompt(true)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg border border-slate-200 hover:border-indigo-200 transition-colors cursor-pointer"
              >
                Mark Followed Up
              </button>
            )}

            {quote.status !== 'won' && quote.status !== 'lost' && (
              <button
                id={`btn-mark-won-${quote.id}`}
                type="button"
                onClick={() => updateStatus(quote.id, 'won')}
                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                title="Mark as Won"
                aria-label="Mark as Won"
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}

            <WhatsAppButton
              customerName={quote.customerName}
              phone={quote.phone}
              amount={quote.amount}
              quoteDate={quote.quoteDate}
              businessName={user?.businessName}
              size="sm"
            />

            <button
              id={`btn-view-detail-${quote.id}`}
              type="button"
              onClick={handleCardClick}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="View quote details"
              aria-label="View quote details"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <FollowUpDatePrompt
        isOpen={showPrompt}
        customerName={quote.customerName}
        currentFollowUpDate={quote.followUpDate}
        onClose={() => setShowPrompt(false)}
        onConfirm={handleFollowedUpConfirm}
      />
    </>
  );
};
