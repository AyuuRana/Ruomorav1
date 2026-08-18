/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Phone,
  DollarSign,
  Calendar,
  Clock,
  FileText,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { MobileBottomNav } from '../../components/MobileBottomNav';
import { useApp } from '../../lib/AppContext';
import { getLocalToday, addDaysToDate } from '../../lib/followUpLogic';
import { isValidPhone, isValidNationalPhone, isValidAmount } from '../../lib/validation';
import { COUNTRY_CODES, splitPhoneAndCountryCode } from '../../lib/whatsapp';

export const QuoteNew: React.FC = () => {
  const navigate = useNavigate();
  const { addQuote } = useApp();

  const today = getLocalToday();
  const defaultFollowUp = addDaysToDate(today, 3);

  const [customerName, setCustomerName] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [quoteDate, setQuoteDate] = useState(today);
  const [followUpDate, setFollowUpDate] = useState(defaultFollowUp);
  const [notes, setNotes] = useState('');

  // Field-specific validation error states
  const [fieldErrors, setFieldErrors] = useState<{
    customerName?: string;
    phone?: string;
    amount?: string;
    quoteDate?: string;
    followUpDate?: string;
  }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePhoneInputChange = (rawInput: string) => {
    // If user pastes a full international number like "+91 9876543210" or "+1 555 1234"
    if (rawInput.trim().startsWith('+')) {
      const parsed = splitPhoneAndCountryCode(rawInput);
      setCountryCode(parsed.countryCode);
      setPhoneNumber(parsed.nationalNumber.replace(/[^\d\s-]/g, ''));
    } else {
      setPhoneNumber(rawInput);
    }

    if (fieldErrors.phone) {
      setFieldErrors((prev) => ({ ...prev, phone: undefined }));
    }
  };

  const getFullPhoneNumber = (): string => {
    const cleanNational = phoneNumber.replace(/\D/g, '');
    return `${countryCode}${cleanNational}`;
  };

  const validate = (): boolean => {
    const errors: {
      customerName?: string;
      phone?: string;
      amount?: string;
      quoteDate?: string;
      followUpDate?: string;
    } = {};

    if (!customerName.trim()) {
      errors.customerName = 'Customer name is required';
    }

    const cleanNational = phoneNumber.replace(/\D/g, '');
    const fullPhone = `${countryCode}${cleanNational}`;

    if (!cleanNational) {
      errors.phone = 'WhatsApp phone number is required';
    } else if (!isValidNationalPhone(cleanNational) || !isValidPhone(fullPhone)) {
      errors.phone = 'Please enter a valid phone number (e.g. 10 digits for India)';
    }

    if (!amount.trim()) {
      errors.amount = 'Quote amount is required';
    } else if (!isValidAmount(amount)) {
      errors.amount = 'Please enter a valid positive number';
    }

    if (!quoteDate) {
      errors.quoteDate = 'Quote date is required';
    }

    if (!followUpDate) {
      errors.followUpDate = 'Follow-up date is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const fullPhone = getFullPhoneNumber();

      await addQuote({
        customerName: customerName.trim(),
        phone: fullPhone,
        amount: parseFloat(amount),
        quoteDate,
        followUpDate,
        status: 'waiting',
        notes: notes.trim() || null,
      });

      // Redirect immediately to Dashboard on success
      navigate('/app/dashboard');
    } catch (err: any) {
      console.error('Save quote error:', err);
      const friendlyMessage =
        err?.message ||
        'Unable to save quote right now. Please check your connection and try again.';
      setFormError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 pb-20 md:pb-8">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <Link
            to="/app/dashboard"
            id="link-back-dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 mb-3 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Add New Quote
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Log your sent quote details and set your first follow-up reminder date.
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
          {formError && (
            <div className="mb-6 p-3.5 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Customer Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Customer Name / Business *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="input-customer-name"
                  type="text"
                  required
                  disabled={loading}
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if (fieldErrors.customerName) {
                      setFieldErrors((prev) => ({ ...prev, customerName: undefined }));
                    }
                  }}
                  placeholder="e.g. Priya Sharma (Apex Studio)"
                  className={`w-full pl-10 pr-3.5 py-2.5 bg-white border rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-shadow disabled:opacity-60 ${
                    fieldErrors.customerName
                      ? 'border-rose-400 focus:ring-rose-400 focus:border-rose-400'
                      : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                />
              </div>
              {fieldErrors.customerName && (
                <p className="text-xs text-rose-600 font-medium mt-1">
                  {fieldErrors.customerName}
                </p>
              )}
            </div>

            {/* Phone & Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  WhatsApp Phone Number *
                </label>
                <div className="flex gap-2">
                  {/* Explicit Country Code Selector */}
                  <div className="relative w-32 shrink-0">
                    <select
                      id="select-customer-country-code"
                      disabled={loading}
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
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

                  {/* National Phone Input */}
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      id="input-customer-phone"
                      type="tel"
                      required
                      disabled={loading}
                      value={phoneNumber}
                      onChange={(e) => handlePhoneInputChange(e.target.value)}
                      placeholder={countryCode === '+91' ? '98765 43210' : 'Phone number'}
                      className={`w-full pl-9 pr-3 py-2.5 bg-white border rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-shadow disabled:opacity-60 ${
                        fieldErrors.phone
                          ? 'border-rose-400 focus:ring-rose-400 focus:border-rose-400'
                          : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
                      }`}
                    />
                  </div>
                </div>
                {fieldErrors.phone ? (
                  <p className="text-xs text-rose-600 font-medium mt-1">{fieldErrors.phone}</p>
                ) : (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Full number stored as: <span className="font-semibold text-slate-600">{getFullPhoneNumber() || countryCode}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Quote Amount *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <input
                    id="input-quote-amount"
                    type="number"
                    required
                    min="0"
                    step="any"
                    disabled={loading}
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      if (fieldErrors.amount) {
                        setFieldErrors((prev) => ({ ...prev, amount: undefined }));
                      }
                    }}
                    placeholder="e.g. 45000"
                    className={`w-full pl-10 pr-3.5 py-2.5 bg-white border rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-shadow disabled:opacity-60 ${
                      fieldErrors.amount
                        ? 'border-rose-400 focus:ring-rose-400 focus:border-rose-400'
                        : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                  />
                </div>
                {fieldErrors.amount && (
                  <p className="text-xs text-rose-600 font-medium mt-1">{fieldErrors.amount}</p>
                )}
              </div>
            </div>

            {/* Dates: Quote Date & Follow-Up Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Quotation Date *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    id="input-quote-date"
                    type="date"
                    required
                    disabled={loading}
                    value={quoteDate}
                    onChange={(e) => {
                      setQuoteDate(e.target.value);
                      if (fieldErrors.quoteDate) {
                        setFieldErrors((prev) => ({ ...prev, quoteDate: undefined }));
                      }
                    }}
                    className={`w-full pl-10 pr-3.5 py-2.5 bg-white border rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 transition-shadow disabled:opacity-60 ${
                      fieldErrors.quoteDate
                        ? 'border-rose-400 focus:ring-rose-400 focus:border-rose-400'
                        : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                  />
                </div>
                {fieldErrors.quoteDate && (
                  <p className="text-xs text-rose-600 font-medium mt-1">
                    {fieldErrors.quoteDate}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Follow-Up Date *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <input
                    id="input-followup-date"
                    type="date"
                    required
                    disabled={loading}
                    value={followUpDate}
                    onChange={(e) => {
                      setFollowUpDate(e.target.value);
                      if (fieldErrors.followUpDate) {
                        setFieldErrors((prev) => ({ ...prev, followUpDate: undefined }));
                      }
                    }}
                    className={`w-full pl-10 pr-3.5 py-2.5 bg-white border rounded-lg text-sm text-slate-900 focus:outline-hidden focus:ring-2 transition-shadow disabled:opacity-60 ${
                      fieldErrors.followUpDate
                        ? 'border-rose-400 focus:ring-rose-400 focus:border-rose-400'
                        : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                  />
                </div>
                {fieldErrors.followUpDate ? (
                  <p className="text-xs text-rose-600 font-medium mt-1">
                    {fieldErrors.followUpDate}
                  </p>
                ) : (
                  <div className="flex gap-1.5 mt-1.5">
                    {[2, 3, 5, 7].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setFollowUpDate(addDaysToDate(today, days))}
                        className="text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 px-2 py-0.5 rounded border border-slate-200 cursor-pointer"
                      >
                        +{days}d
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Notes & Scope (Optional)
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3.5 pointer-events-none text-slate-400">
                  <FileText className="w-4 h-4" />
                </div>
                <textarea
                  id="input-quote-notes"
                  rows={3}
                  disabled={loading}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Sent 2 proposals. Client expressed interest in the full website redesign package."
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-shadow disabled:opacity-60"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                id="btn-cancel-new-quote"
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-save-quote"
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving…</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save Quote</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
};
