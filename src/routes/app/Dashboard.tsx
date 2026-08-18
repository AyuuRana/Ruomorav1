/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Clock,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { MobileBottomNav } from '../../components/MobileBottomNav';
import { QuoteCard } from '../../components/QuoteCard';
import { EmptyState } from '../../components/EmptyState';
import { useApp } from '../../lib/AppContext';
import { isFollowUpToday, isOverdue, getLocalToday } from '../../lib/followUpLogic';
import { formatCurrency } from '../../lib/whatsapp';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { quotes, quotesLoading, user } = useApp();

  const todayQuotes = quotes.filter(isFollowUpToday);
  const overdueQuotes = quotes.filter(isOverdue);
  const activeQuotes = quotes.filter((q) => ['waiting', 'followed_up'].includes(q.status));
  const wonQuotes = quotes.filter((q) => q.status === 'won');

  // Combined urgent quotes for today's priority list: Overdue first, then Today
  const urgentQuotes = [...overdueQuotes, ...todayQuotes];

  const totalActivePipelineValue = activeQuotes.reduce((acc, q) => acc + q.amount, 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 pb-20 md:pb-8">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Dashboard
              </h1>
              <span className="text-xs font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Welcome back, <strong className="text-slate-700">{user?.name || 'Freelancer'}</strong>. Here is your daily follow-up priority.
            </p>
          </div>

          <Link
            to="/app/quotes/new"
            id="btn-dashboard-add-quote"
            className="hidden sm:inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Quote</span>
          </Link>
        </div>

        {/* Loading state */}
        {quotesLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-sm font-semibold text-slate-500">Loading your follow-ups...</p>
          </div>
        ) : (
          <>
            {/* 4 Summary Metric Counters */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Due Today */}
              <div
                onClick={() => navigate('/app/quotes?filter=today')}
                role="button"
                tabIndex={0}
                id="metric-card-today"
                className="p-5 bg-white border border-indigo-100 rounded-2xl shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Today</span>
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {todayQuotes.length}
                  </span>
                  <span className="text-xs text-slate-500">due</span>
                </div>
              </div>

              {/* Overdue */}
              <div
                onClick={() => navigate('/app/quotes?filter=overdue')}
                role="button"
                tabIndex={0}
                id="metric-card-overdue"
                className={`p-5 bg-white border rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer group ${
                  overdueQuotes.length > 0
                    ? 'border-rose-200 bg-rose-50/10 hover:border-rose-300'
                    : 'border-slate-100 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Overdue</span>
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-rose-600 tracking-tight">
                    {overdueQuotes.length}
                  </span>
                  <span className="text-xs text-slate-500">attention</span>
                </div>
              </div>

              {/* Active Quotes */}
              <div
                onClick={() => navigate('/app/quotes?filter=active')}
                role="button"
                tabIndex={0}
                id="metric-card-active"
                className="p-5 bg-white border border-slate-100 rounded-2xl shadow-xs hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Active</span>
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                      {activeQuotes.length}
                    </span>
                    <span className="text-xs text-slate-500">pipeline</span>
                  </div>
                  <span className="text-xs font-bold text-slate-700">
                    {formatCurrency(totalActivePipelineValue)}
                  </span>
                </div>
              </div>

              {/* Won Quotes */}
              <div
                onClick={() => navigate('/app/quotes?filter=won')}
                role="button"
                tabIndex={0}
                id="metric-card-won"
                className="p-5 bg-white border border-emerald-100 rounded-2xl shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Won</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-emerald-600 tracking-tight">
                    {wonQuotes.length}
                  </span>
                  <span className="text-xs text-slate-500">deals</span>
                </div>
              </div>
            </div>

            {/* Follow Up Today & Overdue Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-indigo-600 animate-pulse"></div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                    Follow Up Today
                  </h2>
                  <span className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                    {urgentQuotes.length}
                  </span>
                </div>

                <Link
                  to="/app/quotes"
                  id="link-view-all-quotes"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <span>View all quotes</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {urgentQuotes.length > 0 ? (
                <div className="space-y-3">
                  {urgentQuotes.map((quote) => (
                    <QuoteCard key={quote.id} quote={quote} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={CheckCircle2}
                  title="You're all caught up."
                  description="No follow-ups due today or overdue. You're completely up to date with your quote pipeline!"
                  actionLabel="+ Add A Quote"
                  onAction={() => navigate('/app/quotes/new')}
                />
              )}

              {/* Quick list of upcoming active quotes if no urgent ones */}
              {urgentQuotes.length === 0 && activeQuotes.length > 0 && (
                <div className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Upcoming Follow-Ups
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {activeQuotes.slice(0, 3).map((quote) => (
                      <QuoteCard key={quote.id} quote={quote} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Floating Add Quote Button (Mobile) */}
        <div className="md:hidden fixed bottom-18 right-4 z-30">
          <Link
            to="/app/quotes/new"
            id="fab-add-quote"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-full shadow-lg shadow-indigo-300 font-bold text-xs active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Quote</span>
          </Link>
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
};
