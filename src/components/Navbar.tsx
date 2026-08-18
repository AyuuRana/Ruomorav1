/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LayoutDashboard, FileText, PlusCircle, Settings, LogOut, User } from 'lucide-react';
import { Logo } from './Logo';
import { useApp } from '../lib/AppContext';
import { Highlight } from './animate-ui/primitives/effects/highlight';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isPublicRoute =
    location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname === '/signup' ||
    location.pathname === '/forgot-password';

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const currentNavValue = location.pathname.includes('/quotes/new')
    ? 'new-quote'
    : location.pathname.includes('/quotes')
    ? 'quotes'
    : location.pathname.includes('/dashboard')
    ? 'dashboard'
    : undefined;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        <Logo />

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
          {isAuthenticated ? (
            <>
              {/* Highlight Animated Navigation for Dashboard, All Quotes, and Add Quote */}
              <Highlight
                value={currentNavValue}
                hover={true}
                exitDelay={150}
                className="rounded-xl bg-indigo-50 text-indigo-700 shadow-xs border border-indigo-100/80 inset-0"
                containerClassName="flex items-center gap-1.5 p-1 bg-slate-100/70 rounded-2xl border border-slate-200/60"
              >
                <Link
                  to="/app/dashboard"
                  id="nav-link-dashboard"
                  data-value="dashboard"
                  className={`px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs sm:text-sm font-bold transition-colors ${
                    location.pathname.includes('/dashboard')
                      ? 'text-indigo-700 font-extrabold'
                      : 'text-slate-600 hover:text-indigo-600'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/app/quotes"
                  id="nav-link-quotes"
                  data-value="quotes"
                  className={`px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs sm:text-sm font-bold transition-colors ${
                    location.pathname.includes('/quotes') && !location.pathname.includes('/new')
                      ? 'text-indigo-700 font-extrabold'
                      : 'text-slate-600 hover:text-indigo-600'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>All Quotes</span>
                </Link>

                <Link
                  to="/app/quotes/new"
                  id="nav-link-new-quote"
                  data-value="new-quote"
                  className={`px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs sm:text-sm font-bold transition-colors ${
                    location.pathname.includes('/quotes/new')
                      ? 'text-indigo-700 font-extrabold'
                      : 'text-indigo-600 hover:text-indigo-700'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ Add Quote</span>
                </Link>
              </Highlight>

              <div className="w-px h-5 bg-slate-200 mx-1"></div>

              <Link
                to="/app/settings"
                id="nav-link-settings"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
                  location.pathname.includes('/settings')
                    ? 'text-indigo-600 font-bold bg-indigo-50/50'
                    : 'text-slate-600 hover:text-indigo-600'
                }`}
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>

              <button
                id="btn-nav-logout"
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:inline">Log Out</span>
              </button>

              <div className="flex items-center gap-2 pl-2">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              </div>
            </>
          ) : (
            <>
              {isPublicRoute && location.pathname === '/' && (
                <>
                  <Highlight
                    hover={true}
                    exitDelay={200}
                    className="rounded-full bg-slate-100/90 inset-0"
                    containerClassName="flex items-center gap-1.5 border border-slate-200/70 rounded-full p-1.5 bg-slate-50/70 shadow-xs"
                  >
                    <a
                      href="#problem"
                      data-value="nav-problem"
                      className="px-4 py-2 rounded-full text-slate-600 hover:text-slate-900 transition-colors text-sm font-semibold"
                    >
                      The Problem
                    </a>
                    <a
                      href="#how-it-works"
                      data-value="nav-how-it-works"
                      className="px-4 py-2 rounded-full text-slate-600 hover:text-slate-900 transition-colors text-sm font-semibold"
                    >
                      How It Works
                    </a>
                    <a
                      href="#benefits"
                      data-value="nav-benefits"
                      className="px-4 py-2 rounded-full text-slate-600 hover:text-slate-900 transition-colors text-sm font-semibold"
                    >
                      Benefits
                    </a>
                  </Highlight>
                  <div className="w-px h-5 bg-slate-200 mx-1"></div>
                </>
              )}

              <Link
                to="/login"
                id="nav-link-login"
                className="text-slate-700 hover:text-indigo-600 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                id="nav-link-signup"
                className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs hover:shadow-sm"
              >
                Start Free
              </Link>
            </>
          )}
        </nav>

        {/* Mobile menu button */}
        <div className="flex items-center md:hidden gap-2">
          {isAuthenticated && (
            <Link
              to="/quotes/new"
              className="p-2 text-indigo-600 bg-indigo-50 rounded-lg font-bold"
              aria-label="Add quote"
            >
              <PlusCircle className="w-5 h-5" />
            </Link>
          )}
          <button
            id="btn-mobile-menu-toggle"
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2">
          {isAuthenticated ? (
            <>
              <div className="px-3 py-2 bg-slate-50 rounded-lg flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
              </div>

              <Link
                to="/app/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                Dashboard
              </Link>
              <Link
                to="/app/quotes"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <FileText className="w-4 h-4 text-indigo-600" />
                All Quotes
              </Link>
              <Link
                to="/app/quotes/new"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-indigo-700 bg-indigo-50"
              >
                <PlusCircle className="w-4 h-4 text-indigo-600" />
                Add New Quote
              </Link>
              <Link
                to="/app/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Settings className="w-4 h-4 text-indigo-600" />
                Settings & Account
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </>
          ) : (
            <>
              <a
                href="#problem"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                The Problem
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                How It Works
              </a>
              <a
                href="#benefits"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Benefits
              </a>
              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-semibold text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                >
                  Start Free
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
};
