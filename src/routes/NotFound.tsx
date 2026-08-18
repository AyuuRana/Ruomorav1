/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, FileQuestion } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { useApp } from '../lib/AppContext';

export const NotFound: React.FC = () => {
  const { isAuthenticated } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white border border-slate-200/80 rounded-2xl p-8 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center mx-auto mb-5 shadow-xs">
            <FileQuestion className="w-7 h-7" />
          </div>

          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">404</h1>
          <h2 className="text-lg font-bold text-slate-800 mb-2">Page Not Found</h2>
          <p className="text-xs text-slate-500 leading-relaxed mb-6">
            The page you are looking for doesn't exist or may have been moved.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                id="btn-404-dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-xs transition-colors"
              >
                <Home className="w-4 h-4" />
                Go to Dashboard
              </Link>
            ) : (
              <Link
                to="/"
                id="btn-404-home"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-xs transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
