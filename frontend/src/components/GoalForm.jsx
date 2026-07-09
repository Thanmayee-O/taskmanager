import React, { useState } from 'react';
import { Plus, X, Calendar } from 'lucide-react';

export default function GoalForm({ onAddGoal }) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [period, setPeriod] = useState('week');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Goal title is required');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await onAddGoal({ title: title.trim(), period });
      setTitle('');
      setIsOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to add goal');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-6">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 shadow-sm"
        >
          <Plus size={16} />
          Create New Goal
        </button>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="p-5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl backdrop-blur-md shadow-lg dark:shadow-xl animate-in fade-in slide-in-from-top-4 duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold tracking-wide text-slate-700 dark:text-slate-300 uppercase flex items-center gap-2">
              <Calendar size={16} className="text-indigo-600 dark:text-indigo-400" />
              Set Goal Focus
            </h3>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setError('');
                setTitle('');
              }}
              className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="goal-title" className="sr-only">Goal Title</label>
              <input
                id="goal-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What is your target? (e.g. Read 2 books, Write API docs)"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/80 transition-all text-sm"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="flex gap-4 items-center">
              <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPeriod('week')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold tracking-wide uppercase transition-all duration-200 ${
                    period === 'week'
                      ? 'bg-indigo-600 dark:bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                  disabled={isSubmitting}
                >
                  This Week
                </button>
                <button
                  type="button"
                  onClick={() => setPeriod('month')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold tracking-wide uppercase transition-all duration-200 ${
                    period === 'month'
                      ? 'bg-indigo-600 dark:bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                  disabled={isSubmitting}
                >
                  This Month
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="ml-auto px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
              >
                {isSubmitting ? 'Adding...' : 'Add Goal'}
              </button>
            </div>

            {error && <p className="text-xs text-rose-500 dark:text-rose-400 font-semibold">{error}</p>}
          </div>
        </form>
      )}
    </div>
  );
}
