import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ShieldCheck, Sparkles, LogIn, UserPlus, Eye, EyeOff, User } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function Login() {
  const { login, signup, showToast } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);

  // Form Inputs State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password Toggles State
  const [showPassword, setShowPassword] = useState(false);


  // Loading & Error States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Reusable Single Field Validation Logic
  const validateField = (field, value, currentPassword = password) => {
    let errorMsg = '';
    
    if (field === 'name') {
      if (!isLoginMode && !value.trim()) {
        errorMsg = 'Name is required';
      }
    } else if (field === 'email') {
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!value.trim()) {
        errorMsg = 'Email is required';
      } else if (!emailRegex.test(value)) {
        errorMsg = 'Enter a valid email address';
      }
    } else if (field === 'password') {
      if (!value) {
        errorMsg = 'Password is required';
      } else {
        // Enforce password requirements
        if (value.length < 8) {
          errorMsg = 'Password must contain at least 8 characters';
        } else if (!/[A-Z]/.test(value)) {
          errorMsg = 'Password must contain at least one uppercase letter';
        } else if (!/[a-z]/.test(value)) {
          errorMsg = 'Password must contain at least one lowercase letter';
        } else if (!/[0-9]/.test(value)) {
          errorMsg = 'Password must contain at least one number';
        } else if (!/[^A-Za-z0-9]/.test(value)) {
          errorMsg = 'Password must contain at least one special character';
        }
      }
    } else if (field === 'confirmPassword') {
      if (!isLoginMode) {
        if (!value) {
          errorMsg = 'Confirm password is required';
        } else if (value !== currentPassword) {
          errorMsg = 'Passwords do not match';
        }
      }
    }

    setErrors((prev) => ({ ...prev, [field]: errorMsg }));
    return errorMsg;
  };

  // Handle Input Changes
  const handleInputChange = (field, value) => {
    if (field === 'name') setName(value);
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);
    if (field === 'confirmPassword') setConfirmPassword(value);

    // If there is already an inline error displayed, validate dynamically to clear it as they type
    if (errors[field]) {
      validateField(field, value, field === 'password' ? value : password);
    }

    // Dynamic passwords match checker
    if (field === 'password' && errors.confirmPassword) {
      if (confirmPassword === value) {
        setErrors((prev) => ({ ...prev, confirmPassword: '' }));
      }
    }
    if (field === 'confirmPassword' && errors.password) {
      // If user fixes the primary password to match, check
      validateField('password', password);
    }

    // Reset general server errors
    if (serverError) setServerError('');
  };

  // Perform whole-form validation on blur
  const handleBlur = (field) => {
    const valMap = { name, email, password, confirmPassword };
    validateField(field, valMap[field]);
  };

  // Validate entire form on submit
  const validateForm = () => {
    const nameErr = validateField('name', name);
    const emailErr = validateField('email', email);
    const passErr = validateField('password', password);
    const confirmErr = validateField('confirmPassword', confirmPassword);

    if (isLoginMode) {
      return !emailErr && !passErr;
    }
    return !nameErr && !emailErr && !passErr && !confirmErr;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);
    setServerError('');

    try {
      if (isLoginMode) {
        await login(email, password);
      } else {
        await signup(name, email, password);
      }
    } catch (err) {
      const errMsg = err.message || 'Authentication failed. Please verify credentials.';
      
      // Inline routing of specific backend errors to the respective input field
      if (errMsg.toLowerCase().includes('already registered') || errMsg.toLowerCase().includes('already exists')) {
        setErrors((prev) => ({ ...prev, email: 'Email is already registered' }));
        showToast('Registration failed: Email already exists', 'error');
      } else if (errMsg.toLowerCase().includes('user not found')) {
        setErrors((prev) => ({ ...prev, email: 'User not found' }));
        showToast('Login failed: User not found', 'error');
      } else if (errMsg.toLowerCase().includes('invalid email or password') || errMsg.toLowerCase().includes('incorrect password')) {
        setServerError('Invalid email or password');
        showToast('Authentication failed', 'error');
      } else {
        setServerError(errMsg);
        showToast(errMsg, 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-300 relative overflow-hidden">
      
      {/* Background grid details */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60 pointer-events-none" />

      {/* Floating Light Glows */}
      <div className="absolute w-[400px] h-[400px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl -top-20 -left-20 pointer-events-none" />
      <div className="absolute w-[450px] h-[450px] bg-violet-500/10 dark:bg-violet-500/5 rounded-full blur-3xl -bottom-20 -right-20 pointer-events-none" />

      {/* Top Header Row */}
      <header className="relative w-full max-w-6xl mx-auto px-6 h-20 flex items-center justify-between z-10">
        <span className="text-2xl font-black bg-gradient-to-r from-indigo-650 to-violet-650 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
          Focus
        </span>
        <ThemeToggle />
      </header>

      {/* Main Form Center Layout */}
      <main className="relative flex-1 flex items-center justify-center p-6 z-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Marketing Blurb */}
          <div className="lg:col-span-6 space-y-6 text-left lg:pr-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50">
              <Sparkles size={11} />
              Your Personal Space
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1] text-slate-900 dark:text-white">
              Capture tasks fast, stay on what matters.
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg font-medium">
              Focus is a clean, single-user workspace built to clear mental clutter. No complex spreadsheets, no team noise. Just lightning-fast task capture, priority badges, and weekly or monthly goals that align your daily focus automatically.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-white/60 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-250 uppercase tracking-wide mb-1">Instant Capturing</h4>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-450 leading-relaxed">Type your task, hit Enter, and organize due dates later.</p>
              </div>
              <div className="p-4 bg-white/60 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-250 uppercase tracking-wide mb-1">Aligned Goals</h4>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-450 leading-relaxed">Link tasks to weekly/monthly targets and watch progress updates live.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Form Card */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-md p-8 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-3xl backdrop-blur-md shadow-lg dark:shadow-xl dark:shadow-indigo-950/5">
              
              <div className="mb-8">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">
                  {isLoginMode ? 'Welcome back' : 'Create your workspace'}
                </h3>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-450">
                  {isLoginMode ? 'Enter credentials to access your task board.' : 'Get started with a private personal account.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                
                {/* Name Input (Sign Up Only) */}
                {!isLoginMode && (
                  <div className="space-y-1">
                    <label htmlFor="name" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Name
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500 pointer-events-none">
                        <User size={16} />
                      </span>
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        onBlur={() => handleBlur('name')}
                        placeholder="John Doe"
                        disabled={isSubmitting}
                        className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border ${
                          errors.name
                            ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                            : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500/80'
                        } rounded-xl text-sm focus:outline-none transition-all duration-200`}
                      />
                    </div>
                    {errors.name && (
                      <p className="text-[11px] text-rose-600 dark:text-rose-400 font-bold mt-1">
                        {errors.name}
                      </p>
                    )}
                  </div>
                )}

                {/* Email input */}
                <div className="space-y-1">
                  <label htmlFor="email" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500 pointer-events-none">
                      <Mail size={16} />
                    </span>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                      placeholder="you@example.com"
                      disabled={isSubmitting}
                      className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border ${
                        errors.email
                          ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                          : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500/80'
                      } rounded-xl text-sm focus:outline-none transition-all duration-200`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 font-bold mt-1">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password input */}
                <div className="space-y-1">
                  <label htmlFor="password" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500 pointer-events-none">
                      <Lock size={16} />
                    </span>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      onBlur={() => handleBlur('password')}
                      placeholder="••••••••"
                      disabled={isSubmitting}
                      className={`w-full pl-10 pr-12 py-2.5 bg-slate-50 dark:bg-slate-950/60 border ${
                        errors.password
                          ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                          : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500/80'
                      } rounded-xl text-sm focus:outline-none transition-all duration-200`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isSubmitting}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 focus:outline-none"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 font-bold mt-1 max-w-[340px] leading-tight">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password Input (Sign Up Only) */}
                {!isLoginMode && (
                  <div className="space-y-1">
                    <label htmlFor="confirmPassword" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500 pointer-events-none">
                        <Lock size={16} />
                      </span>
                      <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        onBlur={() => handleBlur('confirmPassword')}
                        onPaste={(e) => e.preventDefault()}
                        placeholder="••••••••"
                        disabled={isSubmitting}
                        className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border ${
                          errors.confirmPassword
                            ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                            : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500/80'
                        } rounded-xl text-sm focus:outline-none transition-all duration-200`}
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-[11px] text-rose-600 dark:text-rose-400 font-bold mt-1">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                )}

                {/* Server-side/Auth general errors banner */}
                {serverError && (
                  <div className="p-3 text-xs text-rose-600 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-xl animate-shake">
                    {serverError}
                  </div>
                )}

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold tracking-wider uppercase shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] disabled:scale-100 transition-all duration-200 flex items-center justify-center gap-2 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      {/* Premium Loading Spinner */}
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Processing...</span>
                    </>
                  ) : isLoginMode ? (
                    <>
                      <LogIn size={14} />
                      Log In
                    </>
                  ) : (
                    <>
                      <UserPlus size={14} />
                      Create Account
                    </>
                  )}
                </button>
              </form>

              {/* Mode Toggle Link */}
              <div className="mt-6 text-center text-xs">
                <span className="text-slate-500 dark:text-slate-450 font-medium">
                  {isLoginMode ? "Don't have an account? " : 'Already have an account? '}
                </span>
                <button
                  onClick={() => {
                    setIsLoginMode(!isLoginMode);
                    setServerError('');
                    setErrors({
                      name: '',
                      email: '',
                      password: '',
                      confirmPassword: '',
                    });
                    setName('');
                    setEmail('');
                    setPassword('');
                    setConfirmPassword('');
                  }}
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline active:opacity-80 transition-all"
                  disabled={isSubmitting}
                >
                  {isLoginMode ? 'Create one here' : 'Log in here'}
                </button>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative w-full max-w-6xl mx-auto px-6 h-16 flex items-center justify-center border-t border-slate-200 dark:border-slate-900 text-[10px] font-bold text-slate-400 uppercase tracking-widest z-10">
        <ShieldCheck size={14} className="text-emerald-500 mr-1.5" />
        Private Data Isolation Guard Active
      </footer>
    </div>
  );
}
