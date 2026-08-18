/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, ArrowUpDown, FileText, X, Loader2 } from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { MobileBottomNav } from '../../components/MobileBottomNav';
import { QuoteCard } from '../../components/QuoteCard';
import { EmptyState } from '../../components/EmptyState';
import { useApp } from '../../lib/AppContext';
import { isFollowUpToday, isOverdue } from '../../lib/followUpLogic';
import { Status } from '../../types';

type FilterType = 'all' | 'active' | 'today' | 'overdue' | 'waiting' | 'followed_up' | 'won' | 'lost';
type SortType = 'followUpDate' | 'newest' | 'oldest';

export const QuoteList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { quotes, quotesLoading } = useApp();

  const currentFilter = (searchParams.get('filter') as FilterType) || 'all';
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortType>('followUpDate');

  const handleFilterChange = (filter: FilterType) => {
    if (filter === 'all') {
      searchParams.delete('filter');
    } else {
      searchParams.set('filter', filter);
    }
    setSearchParams(searchParams);
  };

  const filteredQuotes = useMemo(() => {
    return quotes.filter((quote) => {
      // 1. Search term match (customer name or phone)
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchName = quote.customerName.toLowerCase().includes(term);
        const matchPhone = quote.phone.includes(term);
        if (!matchName && !matchPhone) return false;
      }

      // 2. Filter logic
      if (currentFilter === 'active') {
        return ['waiting', 'followed_up'].includes(quote.status);
      }
      if (currentFilter === 'today') {
        return isFollowUpToday(quote);
      }
      if (currentFilter === 'overdue') {
        return isOverdue(quote);
      }
      if (currentFilter === 'waiting') {
        return quote.status === 'waiting';
      }
      if (currentFilter === 'followed_up') {
        return quote.status === 'followed_up';
      }
      if (currentFilter === 'won') {
        return quote.status === 'won';
      }
      if (currentFilter === 'lost') {
        return quote.status === 'lost';
      }

      return true;
    });
  }, [quotes, searchTerm, currentFilter]);

  const sortedQuotes = useMemo(() => {
    return [...filteredQuotes].sort((a, b) => {
      if (sortBy === 'followUpDate') {
        return new Date(a.followUpDate).getTime() - new Date(b.followUpDate).getTime();
      }
      if (sortBy === 'newest') {
        return new Date(b.quoteDate).getTime() - new Date(a.quoteDate).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.quoteDate).getTime() - new Date(b.quoteDate).getTime();
      }
      return 0;
    });
  }, [filteredQuotes, sortBy]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 pb-20 md:pb-8">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              All Quotes
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Manage your complete quotation pipeline and follow-up timeline
            </p>
          </div>

          <Link
            to="/app/quotes/new"
            id="btn-list-add-quote"
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Quote</span>
          </Link>
        </div>

        {/* Search & Sort Controls */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 mb-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                id="input-quote-search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by customer name or phone number..."
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
                <select
                  id="select-quote-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortType)}
                  aria-label="Sort quotes by"
                  className="pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="followUpDate">Follow-up date</option>
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                </select>
              </div>
            </div>
          </div>

          {/* Filter Chips Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] mr-1 hidden sm:inline">
              Filter:
            </span>
            {[
              { id: 'all', label: 'All', count: quotes.length },
              {
                id: 'active',
                label: 'Active',
                count: quotes.filter((q) => ['waiting', 'followed_up'].includes(q.status)).length,
              },
              { id: 'today', label: 'Today', count: quotes.filter(isFollowUpToday).length },
              { id: 'overdue', label: 'Overdue', count: quotes.filter(isOverdue).length },
              { id: 'waiting', label: 'Waiting', count: quotes.filter((q) => q.status === 'waiting').length },
              { id: 'followed_up', label: 'Followed Up', count: quotes.filter((q) => q.status === 'followed_up').length },
              { id: 'won', label: 'Won', count: quotes.filter((q) => q.status === 'won').length },
              { id: 'lost', label: 'Lost', count: quotes.filter((q) => q.status === 'lost').length },
            ].map((chip) => (
              <button
                key={chip.id}
                id={`filter-chip-${chip.id}`}
                type="button"
                onClick={() => handleFilterChange(chip.id as FilterType)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  currentFilter === chip.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{chip.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    currentFilter === chip.id
                      ? 'bg-indigo-700 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {chip.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Results List */}
        {quotesLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-sm font-semibold text-slate-500">Loading your quotes...</p>
          </div>
        ) : sortedQuotes.length > 0 ? (
          <div className="space-y-3">
            {sortedQuotes.map((quote) => (
              <QuoteCard key={quote.id} quote={quote} />
            ))}
          </div>
        ) : quotes.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="You haven't added any quotes yet"
            description="Add your first quote to start tracking follow-ups and closing deals faster."
            actionLabel="Add Your First Quote"
            onAction={() => {
              navigate('/quotes/new');
            }}
          />
        ) : (
          <EmptyState
            icon={FileText}
            title="No quotes match your search"
            description={
              searchTerm
                ? `No quotes matched "${searchTerm}". Try clearing your search or checking another filter.`
                : 'No quotes match the selected filter. Try clearing your filter.'
            }
            actionLabel="Clear Search & Filters"
            onAction={() => {
              setSearchTerm('');
              handleFilterChange('all');
            }}
          />
        )}
      </main>

      <MobileBottomNav />
    </div>
  );
};
