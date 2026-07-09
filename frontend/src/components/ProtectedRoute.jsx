import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { token, user, loading, navigate } = useAuth();

  useEffect(() => {
    // If not loading, and we don't have user/token, force redirect to /login
    if (!loading && (!token || (!user && token))) {
      navigate('/login');
    }
  }, [loading, token, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        {/* Loading Spinner */}
        <div className="w-10 h-10 border-4 border-indigo-200 dark:border-indigo-950 border-t-indigo-600 rounded-full animate-spin mb-4" />
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Validating session...</p>
      </div>
    );
  }

  // If there's a token and user is verified, render kids
  if (token) {
    return <>{children}</>;
  }

  return null;
}
