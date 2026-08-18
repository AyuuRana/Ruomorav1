/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Phone,
  DollarSign,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Check,
  AlertTriangle,
  Loader2,
  FileText,
  History,
} from 'lucide-react';
import { db, auth } from '../../lib/firebase';
import { Navbar } from '../../components/Navbar';
import { MobileBottomNav } from '../../components/MobileBottomNav';
import { StatusBadge } from '../../components/StatusBadge';
import { WhatsAppButton } from '../../components/WhatsAppButton';
import { FollowUpDatePrompt } from '../../components/FollowUpDatePrompt';
import { useApp } from '../../lib/AppContext';
import { formatCurrency } from '../../lib/whatsapp';
import {
  isFollowUpToday,
  isOverdue,
  getDaysOverdue,
  formatTimeAgo,
  getLocalToday,
  addDaysToDate,
} from '../../lib/followUpLogic';
import { isValidPhone, isValidNationalPhone, isValidAmount } from '../../lib/validation';
import { COUNTRY_CODES, splitPhoneAndCountryCode } from '../../lib/whatsapp';
import { Quote, Status } from '../../types';

export const QuoteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { quotes, updateQuote, deleteQuote, markFollowedUp, updateStatus, user, quotesLoading } = useApp();

  // Local state for direct single doc fetch if not found in context yet
  const [directQuote, setDirectQuote] = useState<Quote | null>(null);
  const [fetchingDirect, setFetchingDirect] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Sync with context or directly fetched doc
  const quoteFromContext = quotes.find((q) => q.id === id);
  const quote = quoteFromContext || directQuote;

  const [isEditing, setIsEditing] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editCountryCode, setEditCountryCode] = useState('+91');
  const [editPhoneNumber, setEditPhoneNumber] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editQuoteDate, setEditQuoteDate] = useState('');
  const [editFollowUpDate, setEditFollowUpDate] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editErrors, setEditErrors] = useState<{
    name?: string;
    phone?: string;
    amount?: string;
    quoteDate?: string;
    followUpDate?: string;
  }>({});

  // Direct fetch by ID if not in context
  useEffect(() => {
    if (!id) return;
    if (quoteFromContext) return;

    let isMounted = true;
    const fetchSingleQuote = async () => {
      setFetchingDirect(true);
      setFetchError(null);
      try {
        const currentUid = auth.currentUser?.uid;
        if (!currentUid) {
          setFetchError('You must be signed in to view this quotation.');
          setFetchingDirect(false);
          return;
        }

        const docRef = doc(db, 'quotes', id);
        const docSnap = await getDoc(docRef);

        if (!isMounted) return;

        if (!docSnap.exists()) {
          setFetchError('Quotation not found.');
          setFetchingDirect(false);
          return;
        }

        const data = docSnap.data();
        // Strict ownership verification
        if (data.userId !== currentUid) {
          setFetchError('You do not have permission to view this quotation.');
          setFetchingDirect(false);
          return;
        }

        setDirectQuote({
          id: docSnap.id,
          userId: data.userId,
          customerName: data.customerName || '',
          phone: data.phone || '',
          amount: typeof data.amount === 'number' ? data.amount : parseFloat(data.amount) || 0,
          quoteDate: data.quoteDate || getLocalToday(),
          followUpDate: data.followUpDate || getLocalToday(),
          status: (data.status as Status) || 'waiting',
          notes: data.notes || null,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.quoteDate,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.quoteDate,
        });
      } catch (err: any) {
        console.error('Error fetching quote by ID:', err);
        if (isMounted) {
          setFetchError('Failed to load quotation details.');
        }
      } finally {
        if (isMounted) {
          setFetchingDirect(false);
        }
      }
    };

    fetchSingleQuote();

    return () => {
      isMounted = false;
    };
  }, [id, quoteFromContext]);

  if (quotesLoading || fetchingDirect) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50/60 pb-20 md:pb-8">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-8 gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading quotation details...</p>
        </main>
        <MobileBottomNav />
      </div>
    );
  }

  if (!quote || fetchError) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50/60 pb-20 md:pb-8">
        <Navbar />
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Quote Not Found</h2>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
            {fetchError || 'The quote you are looking for does not exist or may have been deleted.'}
          </p>
          <Link
            to="/app/dashboard"
            id="btn-error-back-dashboard"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </main>
        <MobileBottomNav />
      </div>
    );
  }

  const overdue = isOverdue(quote);
  const dueToday = isFollowUpToday(quote);
  const daysOverdue = getDaysOverdue(quote.followUpDate);

  const handleStartEdit = () => {
    const parsed = splitPhoneAndCountryCode(quote.phone);
    setEditName(quote.customerName);
    setEditCountryCode(parsed.countryCode);
    setEditPhoneNumber(parsed.nationalNumber);
    setEditAmount(quote.amount.toString());
    setEditQuoteDate(quote.quoteDate);
    setEditFollowUpDate(quote.followUpDate);
    setEditNotes(quote.notes || '');
    setEditErrors({});
    setActionError(null);
    setIsEditing(true);
  };

  const handleEditPhoneChange = (rawInput: string) => {
    if (rawInput.trim().startsWith('+')) {
      const parsed = splitPhoneAndCountryCode(rawInput);
      setEditCountryCode(parsed.countryCode);
      setEditPhoneNumber(parsed.nationalNumber.replace(/[^\d\s-]/g, ''));
    } else {
      setEditPhoneNumber(rawInput);
    }
    if (editErrors.phone) {
      setEditErrors((prev) => ({ ...prev, phone: undefined }));
    }
  };

  const getFullEditPhone = (): string => {
    const cleanDigits = editPhoneNumber.replace(/\D/g, '');
    return `${editCountryCode}${cleanDigits}`;
  };

  const validateEdit = (): boolean => {
    const errors: {
      name?: string;
      phone?: string;
      amount?: string;
      quoteDate?: string;
      followUpDate?: string;
    } = {};

    if (!editName.trim()) {
      errors.name = 'Customer name is required';
    }

    const cleanNational = editPhoneNumber.replace(/\D/g, '');
    const fullPhone = `${editCountryCode}${cleanNational}`;

    if (!cleanNational) {
      errors.phone = 'Phone number is required';
    } else if (!isValidNationalPhone(cleanNational) || !isValidPhone(fullPhone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    if (!editAmount.trim()) {
      errors.amount = 'Amount is required';
    } else if (!isValidAmount(editAmount)) {
      errors.amount = 'Please enter a valid amount';
    }

    if (!editQuoteDate) {
      errors.quoteDate = 'Quote date is required';
    }

    if (!editFollowUpDate) {
      errors.followUpDate = 'Follow-up date is required';
    }

    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);

    if (!validateEdit()) return;

    setActionLoading(true);
    try {
      const fullPhone = getFullEditPhone();
      await updateQuote(quote.id, {
        customerName: editName.trim(),
        phone: fullPhone,
        amount: parseFloat(editAmount) || quote.amount,
        quoteDate: editQuoteDate,
        followUpDate: editFollowUpDate,
        notes: editNotes.trim() || null,
      });

      // Update local state if direct
      if (directQuote) {
        setDirectQuote((prev) =>
          prev
            ? {
                ...prev,
                customerName: editName.trim(),
                phone: fullPhone,
                amount: parseFloat(editAmount) || quote.amount,
                quoteDate: editQuoteDate,
                followUpDate: editFollowUpDate,
                notes: editNotes.trim() || null,
                updatedAt: new Date().toISOString(),
              }
            : null
        );
      }

      setIsEditing(false);
    } catch (err: any) {
      console.error('Update quote error:', err);
      setActionError(err?.message || 'Failed to save changes. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    setActionError(null);
    try {
      await deleteQuote(quote.id);
      navigate('/app/quotes');
    } catch (err: any) {
      console.error('Delete quote error:', err);
      setActionError(err?.message || 'Failed to delete quote. Please try again.');
      setActionLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleFollowUpConfirm = async (nextDate: string, notesAppend?: string) => {
    setActionLoading(true);
    setActionError(null);
    try {
      await markFollowedUp(quote.id, nextDate, notesAppend);

      if (directQuote) {
        setDirectQuote((prev) =>
          prev
            ? {
                ...prev,
                status: 'followed_up',
                followUpDate: nextDate,
                notes: notesAppend
                  ? prev.notes
                    ? `${prev.notes}\n[${getLocalToday()}]: ${notesAppend}`
                    : `[${getLocalToday()}]: ${notesAppend}`
                  : prev.notes,
                updatedAt: new Date().toISOString(),
              }
            : null
        );
      }
    } catch (err: any) {
      console.error('Mark followed up error:', err);
      setActionError(err?.message || 'Failed to update follow-up schedule.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (status: Status) => {
    setActionLoading(true);
    setActionError(null);
    try {
      await updateStatus(quote.id, status);

      if (directQuote) {
        setDirectQuote((prev) =>
          prev
            ? {
                ...prev,
                status,
                updatedAt: new Date().toISOString(),
              }
            : null
        );
      }
    } catch (err: any) {
      console.error('Status change error:', err);
      setActionError(err?.message || 'Failed to update status.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 pb-20 md:pb-8">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Navigation & Header Actions */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link
            to="/app/quotes"
            id="link-back-to-quotes"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to all quotes</span>
          </Link>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                id="btn-edit-quote-detail"
                type="button"
                onClick={handleStartEdit}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            )}

            <button
              id="btn-delete-quote-detail"
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-rose-600 bg-white hover:bg-rose-50 border border-rose-200 rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {actionError && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Main Details Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs mb-6">
          {isEditing ? (
            /* EDIT FORM */
            <form onSubmit={handleSaveEdit} className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Edit Quotation</h2>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Customer / Business Name *
                </label>
                <input
                  id="edit-customer-name"
                  type="text"
                  required
                  disabled={actionLoading}
                  value={editName}
                  onChange={(e) => {
                    setEditName(e.target.value);
                    if (editErrors.name) setEditErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 ${
                    editErrors.name ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:ring-indigo-500'
                  }`}
                />
                {editErrors.name && <p className="text-xs text-rose-600 font-medium mt-1">{editErrors.name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    WhatsApp Phone Number *
                  </label>
                  <div className="flex gap-2">
                    <div className="relative w-32 shrink-0">
                      <select
                        id="edit-customer-country-code"
                        disabled={actionLoading}
                        value={editCountryCode}
                        onChange={(e) => setEditCountryCode(e.target.value)}
                        aria-label="Country Code"
                        className="w-full px-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer disabled:opacity-60"
                      >
                        {COUNTRY_CODES.map((item) => (
                          <option key={item.code} value={item.code}>
                            {item.flag} {item.code} ({item.country.split(' ')[0]})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="relative flex-1">
                      <input
                        id="edit-customer-phone"
                        type="tel"
                        required
                        disabled={actionLoading}
                        value={editPhoneNumber}
                        onChange={(e) => handleEditPhoneChange(e.target.value)}
                        placeholder={editCountryCode === '+91' ? '98765 43210' : 'Phone number'}
                        className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 ${
                          editErrors.phone ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:ring-indigo-500'
                        }`}
                      />
                    </div>
                  </div>
                  {editErrors.phone ? (
                    <p className="text-xs text-rose-600 font-medium mt-1">{editErrors.phone}</p>
                  ) : (
                    <p className="text-[11px] text-slate-400 mt-1">
                      Full: <span className="font-semibold text-slate-600">{getFullEditPhone() || editCountryCode}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Quote Amount (₹) *
                  </label>
                  <input
                    id="edit-quote-amount"
                    type="number"
                    required
                    min="0"
                    step="any"
                    disabled={actionLoading}
                    value={editAmount}
                    onChange={(e) => {
                      setEditAmount(e.target.value);
                      if (editErrors.amount) setEditErrors((prev) => ({ ...prev, amount: undefined }));
                    }}
                    className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 ${
                      editErrors.amount ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:ring-indigo-500'
                    }`}
                  />
                  {editErrors.amount && <p className="text-xs text-rose-600 font-medium mt-1">{editErrors.amount}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Quotation Date *
                  </label>
                  <input
                    id="edit-quote-date"
                    type="date"
                    required
                    disabled={actionLoading}
                    value={editQuoteDate}
                    onChange={(e) => setEditQuoteDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Follow-Up Date *
                  </label>
                  <input
                    id="edit-followup-date"
                    type="date"
                    required
                    disabled={actionLoading}
                    value={editFollowUpDate}
                    onChange={(e) => setEditFollowUpDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Notes & Details
                </label>
                <textarea
                  id="edit-quote-notes"
                  rows={3}
                  disabled={actionLoading}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="btn-save-edit-quote"
                  type="submit"
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving…</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* VIEW MODE */
            <>
              {/* Header Title & Amount */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      {quote.customerName}
                    </h1>
                    <StatusBadge status={quote.status} quote={quote} />
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1.5 font-medium text-slate-700">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {quote.phone}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Quotation Date: <strong className="text-slate-700">{quote.quoteDate}</strong>
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 sm:text-right min-w-[170px]">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Quoted Amount
                  </span>
                  <span className="text-2xl font-black text-slate-900 tracking-tight">
                    {formatCurrency(quote.amount)}
                  </span>
                </div>
              </div>

              {/* Follow-Up Schedule & Primary WhatsApp Action */}
              <div className="py-6 border-b border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                        overdue
                          ? 'bg-rose-100 text-rose-600'
                          : dueToday
                          ? 'bg-indigo-100 text-indigo-600'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Follow-Up Status
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        {overdue ? (
                          <span className="text-rose-600 font-extrabold">
                            {daysOverdue} {daysOverdue === 1 ? 'day' : 'days'} overdue (Scheduled: {quote.followUpDate})
                          </span>
                        ) : dueToday ? (
                          <span className="text-indigo-700 font-extrabold">Due for follow-up today!</span>
                        ) : (
                          <span>Next scheduled follow-up: <strong className="text-slate-800">{quote.followUpDate}</strong></span>
                        )}
                      </p>
                    </div>
                  </div>

                  <WhatsAppButton
                    customerName={quote.customerName}
                    phone={quote.phone}
                    amount={quote.amount}
                    quoteDate={quote.quoteDate}
                    businessName={user?.businessName}
                    size="lg"
                  />
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="py-6 border-b border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Quotation Status & Workflow
                  </h3>
                  {actionLoading && (
                    <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-semibold">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating status…</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Mark Followed Up with Loop */}
                  <button
                    id="btn-action-followed-up"
                    type="button"
                    disabled={actionLoading}
                    onClick={() => setShowPrompt(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Mark Followed Up</span>
                  </button>

                  {/* Mark Won */}
                  <button
                    id="btn-action-won"
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleStatusChange('won')}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer disabled:opacity-50 ${
                      quote.status === 'won'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Won</span>
                  </button>

                  {/* Mark Lost */}
                  <button
                    id="btn-action-lost"
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleStatusChange('lost')}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer disabled:opacity-50 ${
                      quote.status === 'lost'
                        ? 'bg-slate-700 text-white'
                        : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Mark Lost</span>
                  </button>

                  {/* Waiting reset */}
                  {quote.status !== 'waiting' && (
                    <button
                      id="btn-action-waiting"
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleStatusChange('waiting')}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Reset to Waiting
                    </button>
                  )}
                </div>
              </div>

              {/* Notes & Interaction Log */}
              <div className="py-6 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Notes & Details
                </h3>
                {quote.notes ? (
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                    {quote.notes}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    No notes recorded yet. Click Edit above to add scope details.
                  </p>
                )}
              </div>

              {/* Timestamps / Last Updated Info */}
              <div className="pt-4 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-slate-400" />
                  <span>Last updated {formatTimeAgo(quote.updatedAt)}</span>
                </div>
                <div>Created: {quote.createdAt ? new Date(quote.createdAt).toLocaleDateString() : quote.quoteDate}</div>
              </div>
            </>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div
            id="modal-delete-quote"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in"
          >
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-slate-200 shadow-xl text-center">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Delete this quote?</h3>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                This will permanently delete the quote for <strong className="text-slate-800">{quote.customerName}</strong>. This can't be undone.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  id="btn-cancel-delete"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="btn-confirm-delete"
                  disabled={actionLoading}
                  onClick={handleDelete}
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-60"
                >
                  {actionLoading ? 'Deleting…' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Follow-Up Loop Modal */}
        <FollowUpDatePrompt
          isOpen={showPrompt}
          customerName={quote.customerName}
          currentFollowUpDate={quote.followUpDate}
          onClose={() => setShowPrompt(false)}
          onConfirm={handleFollowUpConfirm}
        />
      </main>

      <MobileBottomNav />
    </div>
  );
};
