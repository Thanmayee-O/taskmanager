import React from 'react';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

export default function TopBar() {
  const { user, logout } = useAuth();

  return (
    <div className="w-full border-b border-slate-200 dark:border-slate-900 bg-white/80 dark:bg-slate-950/40 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
            Focus
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* User profile identifier */}
          {user && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-350">
              <User size={12} className="text-indigo-500" />
              <span className="truncate max-w-[150px]">{user.email}</span>
            </div>
          )}

          {/* Theme Switcher Button */}
          <ThemeToggle />

          {/* Sign Out Button */}
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-slate-200 dark:border-slate-800 rounded-xl transition-all duration-300 active:scale-95"
            title="Log out from session"
          >
            <LogOut size={13} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
