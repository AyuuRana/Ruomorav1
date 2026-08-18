/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { AppProvider } from './lib/AppContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Landing } from './routes/public/Landing';
import { Login } from './routes/public/Login';
import { Signup } from './routes/public/Signup';
import { ForgotPassword } from './routes/public/ForgotPassword';
import { Dashboard } from './routes/app/Dashboard';
import { QuoteList } from './routes/app/QuoteList';
import { QuoteNew } from './routes/app/QuoteNew';
import { QuoteDetail } from './routes/app/QuoteDetail';
import { Settings } from './routes/app/Settings';
import { NotFound } from './routes/NotFound';

function PageTitleUpdater() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    if (path === '/') {
      document.title = 'Ruomora — Never Forget a Quote Follow-Up Again';
    } else if (path === '/login') {
      document.title = 'Log In | Ruomora';
    } else if (path === '/signup') {
      document.title = 'Sign Up Free | Ruomora';
    } else if (path === '/forgot-password') {
      document.title = 'Reset Password | Ruomora';
    } else if (path === '/app/dashboard' || path === '/dashboard') {
      document.title = 'Dashboard | Ruomora';
    } else if (path === '/app/quotes' || path === '/quotes') {
      document.title = 'Quotes Pipeline | Ruomora';
    } else if (path === '/app/quotes/new' || path === '/quotes/new') {
      document.title = 'Add New Quote | Ruomora';
    } else if (path.startsWith('/app/quotes/') || path.startsWith('/quotes/')) {
      document.title = 'Quotation Details | Ruomora';
    } else if (path === '/app/settings' || path === '/settings') {
      document.title = 'Settings | Ruomora';
    } else {
      document.title = 'Ruomora';
    }
  }, [location.pathname]);

  return null;
}

function LegacyQuoteDetailRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/app/quotes/${id}`} replace />;
}

function LegacyQuotesRedirect() {
  const location = useLocation();
  return <Navigate to={`/app/quotes${location.search}`} replace />;
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <PageTitleUpdater />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Canonical Protected App Routes */}
          <Route
            path="/app/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/quotes"
            element={
              <ProtectedRoute>
                <QuoteList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/quotes/new"
            element={
              <ProtectedRoute>
                <QuoteNew />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/quotes/:id"
            element={
              <ProtectedRoute>
                <QuoteDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />

          {/* Backward Compatibility Redirects to /app/* */}
          <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
          <Route path="/quotes" element={<LegacyQuotesRedirect />} />
          <Route path="/quotes/new" element={<Navigate to="/app/quotes/new" replace />} />
          <Route path="/quotes/:id" element={<LegacyQuoteDetailRedirect />} />
          <Route path="/settings" element={<Navigate to="/app/settings" replace />} />

          {/* Fallback 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
