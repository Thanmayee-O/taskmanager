import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  
  // Toast Notification State
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' }

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    // Auto-dismiss after 3.5s
    const timer = setTimeout(() => {
      setToast(null);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  const closeToast = () => setToast(null);

  // Navigate function for routing without an external library
  const navigate = useCallback((path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  }, []);

  // Sync back/forward button clicks
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Logout method
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    showToast('Logged out successfully', 'success');
    navigate('/login');
  }, [navigate, showToast]);

  // Fetch current user details if token exists
  const fetchUser = useCallback(async (authToken) => {
    try {
      const userData = await api.getMe(authToken);
      setUser(userData);
    } catch (err) {
      console.error('Failed to validate token:', err.message);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Handle token changes and initial load
  useEffect(() => {
    if (token) {
      fetchUser(token);
    } else {
      setUser(null);
      setLoading(false);
      if (window.location.pathname !== '/login') {
        navigate('/login');
      }
    }
  }, [token, fetchUser, navigate]);

  // Auth actions
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.login({ email, password });
      const { token: userToken, data } = response;
      localStorage.setItem('token', userToken);
      setToken(userToken);
      setUser(data);
      showToast('Logged in successfully! Welcome back.', 'success');
      // Delay navigation to let the user see the success toast
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const signup = async (name, email, password) => {
    setLoading(true);
    try {
      const response = await api.signup({ name, email, password });
      const { token: userToken, data } = response;
      localStorage.setItem('token', userToken);
      setToken(userToken);
      setUser(data);
      showToast('Account created successfully! Preparing focus board.', 'success');
      // Delay navigation to let the user see the success toast
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        currentPath,
        navigate,
        login,
        signup,
        logout,
        showToast,
      }}
    >
      {children}

      {toast && (
        <div className="fixed bottom-5 right-5 z-[9999] p-4 bg-white dark:bg-slate-900 border-l-4 rounded-r-2xl shadow-xl border-indigo-500 dark:border-indigo-600 max-w-sm flex items-start gap-3 backdrop-blur-md animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="mt-0.5">
            {toast.type === 'success' ? (
              <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" size={18} />
            ) : toast.type === 'error' ? (
              <XCircle className="text-rose-600 dark:text-rose-450" size={18} />
            ) : (
              <AlertCircle className="text-indigo-600 dark:text-indigo-400" size={18} />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
              {toast.message}
            </p>
          </div>

          <button
            onClick={closeToast}
            className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
