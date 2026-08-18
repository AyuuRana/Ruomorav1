/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar, X, Check, Clock } from 'lucide-react';
import { getLocalToday, addDaysToDate } from '../lib/followUpLogic';

interface FollowUpDatePromptProps {
  isOpen: boolean;
  customerName: string;
  currentFollowUpDate?: string;
  onClose: () => void;
  onConfirm: (nextDate: string, notesAppend?: string) => void;
}

export const FollowUpDatePrompt: React.FC<FollowUpDatePromptProps> = ({
  isOpen,
  customerName,
  onClose,
  onConfirm,
}) => {
  const defaultNext = addDaysToDate(getLocalToday(), 3);
  const [nextDate, setNextDate] = useState(defaultNext);
  const [quickDays, setQuickDays] = useState<number | null>(3);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleQuickSelect = (days: number) => {
    setQuickDays(days);
    setNextDate(addDaysToDate(getLocalToday(), days));
  };

  const handleCustomDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuickDays(null);
    setNextDate(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nextDate) return;
    onConfirm(nextDate, notes.trim() || undefined);
    onClose();
  };

  return (
    <div
      id="modal-followup-prompt"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Schedule Next Follow-Up
              </h3>
              <p className="text-xs text-slate-500 truncate max-w-[240px]">
                {customerName}
              </p>
            </div>
          </div>
          <button
            id="btn-close-prompt"
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              When should we follow up next?
            </label>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[
                { label: '+2 Days', days: 2 },
                { label: '+3 Days', days: 3 },
                { label: '+5 Days', days: 5 },
                { label: '+1 Week', days: 7 },
              ].map((item) => (
                <button
                  key={item.days}
                  type="button"
                  onClick={() => handleQuickSelect(item.days)}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                    quickDays === item.days
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Clock className="w-4 h-4" />
              </div>
              <input
                id="input-next-followup-date"
                type="date"
                required
                min={getLocalToday()}
                value={nextDate}
                onChange={handleCustomDateChange}
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              This keeps the quote active in your Today & Overdue reminders.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              What was discussed? (Optional Note)
            </label>
            <textarea
              id="input-followup-note"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Sent WhatsApp message; client reviewing with partner"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-shadow"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              id="btn-cancel-prompt"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="btn-confirm-prompt"
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Save Follow-Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
