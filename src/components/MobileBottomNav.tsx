/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Plus, Settings } from 'lucide-react';
import { useApp } from '../lib/AppContext';

export const MobileBottomNav: React.FC = () => {
  const { user } = useApp();

  if (!user) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-3 py-2 pb-safe shadow-lg">
      <nav className="flex items-center justify-around max-w-md mx-auto">
        <NavLink
          to="/app/dashboard"
          id="mobile-nav-dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 ${
              isActive
                ? 'text-indigo-600 font-bold scale-105'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Dashboard</span>
        </NavLink>

        <NavLink
          to="/app/quotes"
          end
          id="mobile-nav-quotes"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 ${
              isActive
                ? 'text-indigo-600 font-bold scale-105'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`
          }
        >
          <FileText className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Quotes</span>
        </NavLink>

        <NavLink
          to="/app/quotes/new"
          id="mobile-nav-new"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 ${
              isActive
                ? 'text-indigo-600 font-bold'
                : 'text-slate-700 hover:text-indigo-600 font-medium'
            }`
          }
        >
          <div className="w-9 h-9 -mt-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-md shadow-indigo-300 transition-transform active:scale-95">
            <Plus className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <span className="text-[10px] mt-0.5 font-bold tracking-tight text-indigo-600">Add</span>
        </NavLink>

        <NavLink
          to="/app/settings"
          id="mobile-nav-settings"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 ${
              isActive
                ? 'text-indigo-600 font-bold scale-105'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`
          }
        >
          <Settings className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Settings</span>
        </NavLink>
      </nav>
    </div>
  );
};
