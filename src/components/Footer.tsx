/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-100 bg-slate-50/60 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <Logo size="sm" />
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              The focused quote follow-up tracker for freelancers, agencies, contractors, and service businesses. Never let a quote be forgotten.
            </p>
            <div className="pt-2 text-xs text-slate-400">
              Built with precision for small service businesses.
            </div>
          </div>

          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">
              The Problem
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Over 70% of sent quotes go cold simply because the provider got busy and missed sending a timely second touch.
            </p>
          </div>

          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">
              The Solution
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Ruomora keeps your pipeline active with daily due reminders and seamless 1-click WhatsApp follow-ups until Won or Lost.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Ruomora. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-indigo-600 transition-colors">
              Log In
            </Link>
            <Link to="/signup" className="hover:text-indigo-600 transition-colors">
              Sign Up
            </Link>
            <Link to="/forgot-password" className="hover:text-indigo-600 transition-colors">
              Reset Password
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
