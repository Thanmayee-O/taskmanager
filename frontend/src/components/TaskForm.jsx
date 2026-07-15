import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronUp, Tag, ShieldAlert, Target, Plus, Sparkles } from 'lucide-react';
import { parseTaskFromText } from '../services/taskParser';
import { api } from '../services/api';

export default function TaskForm({ goals, onAddTask }) {
  const [title, setTitle] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [goalId, setGoalId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [parsedPreview, setParsedPreview] = useState(null);
  const [isParsing, setIsParsing] = useState(false);

  const inputRef = useRef(null);

  // Auto-focus on component mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Global keyboard shortcut Ctrl/Cmd + K to focus Quick-Add
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Run parser on keystrokes and auto-fill manual inputs
  const handleTitleChange = (val) => {
    setTitle(val);
    if (!val.trim()) {
      setParsedPreview(null);
      return;
    }
    try {
      const parsed = parseTaskFromText(val);
      setParsedPreview(parsed);

      // Auto-fill state fields so they sync into advanced options too
      if (parsed.priority) setPriority(parsed.priority);
      if (parsed.dueDate) {
        setDueDate(parsed.dueDate.split('T')[0]);
      }
      if (parsed.tags.length > 0) {
        setTagsInput(parsed.tags.join(', '));
      }
    } catch (err) {
      console.warn('Real-time parsing issue:', err);
    }
  };

  // AI refinement handler using Gemini API proxy with local fallback
  const handleAIRefine = async () => {
    if (!title.trim()) return;
    setIsParsing(true);
    setError('');
    try {
      const response = await api.parseTaskWithAI(title);
      let parsed = null;
      if (response.success && !response.fallback && response.data) {
        parsed = response.data;
      } else {
        console.info('Using local parser fallback due to backend settings/failure.');
        parsed = parseTaskFromText(title);
      }

      if (parsed.title) setTitle(parsed.title);
      if (parsed.priority) setPriority(parsed.priority);
      if (parsed.dueDate) {
        setDueDate(parsed.dueDate.split('T')[0]);
      }
      if (parsed.tags && parsed.tags.length > 0) {
        setTagsInput(parsed.tags.join(', '));
      }
      setParsedPreview(parsed);
      setShowOptions(true);
    } catch (err) {
      console.warn('AI refinement error, falling back to local parsing:', err);
      const parsed = parseTaskFromText(title);
      if (parsed.title) setTitle(parsed.title);
      if (parsed.priority) setPriority(parsed.priority);
      if (parsed.dueDate) {
        setDueDate(parsed.dueDate.split('T')[0]);
      }
      if (parsed.tags && parsed.tags.length > 0) {
        setTagsInput(parsed.tags.join(', '));
      }
      setParsedPreview(parsed);
      setShowOptions(true);
    } finally {
      setIsParsing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const parsed = parseTaskFromText(title);

      // Parse tags (comma separated)
      let tags = tagsInput
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
      
      if (tags.length === 0 && parsed.tags && parsed.tags.length > 0) {
        tags = parsed.tags;
      }

      // Format dueDate: if we have a manual YYYY-MM-DD input, combine it with parsed time or default noon
      let finalDueDate = null;
      if (dueDate) {
        const [year, month, day] = dueDate.split('-').map(Number);
        const d = new Date();
        d.setFullYear(year, month - 1, day);
        d.setHours(12, 0, 0, 0); // Default to local noon
        finalDueDate = d.toISOString();
      } else if (parsed.dueDate) {
        finalDueDate = parsed.dueDate;
      }

      const taskData = {
        title: parsed.title.trim(),
        priority: priority || parsed.priority,
        dueDate: finalDueDate,
        tags,
        goalId: goalId || null,
      };

      await onAddTask(taskData);
      // Reset form
      setTitle('');
      setTagsInput('');
      setDueDate('');
      setGoalId('');
      setPriority('medium');
      setParsedPreview(null);
      // Refocus input
      inputRef.current?.focus();
    } catch (err) {
      setError(err.message || 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm dark:shadow-xl transition-all duration-300 focus-within:border-indigo-500/50 focus-within:shadow-indigo-950/5"
      >
        {/* Main Title Input (Speed optimized) */}
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-slate-350 dark:border-slate-700 flex items-center justify-center bg-slate-50 dark:bg-slate-950/40">
            <Plus size={12} className="text-slate-400 dark:text-slate-500" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault();
                setTitle('');
                setDueDate('');
                setTagsInput('');
                setPriority('medium');
                setParsedPreview(null);
              }
            }}
            placeholder="Focus on a new task... (e.g. Call dentist tomorrow 3pm !high #health)"
            className="flex-1 bg-transparent border-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-0 text-base"
            disabled={isSubmitting || isParsing}
            onFocus={() => setShowOptions(true)}
          />
          {title.trim() && (
            <>
              <button
                type="button"
                onClick={handleAIRefine}
                disabled={isSubmitting || isParsing}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shadow-md active:scale-95 transition-all flex items-center gap-1.5 ${
                  isParsing 
                    ? 'bg-indigo-150 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 cursor-wait' 
                    : 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:text-indigo-750 dark:hover:text-indigo-300'
                }`}
                title="Refine task details with Gemini AI"
              >
                <Sparkles size={12} className={isParsing ? 'animate-spin' : 'animate-pulse text-indigo-500'} />
                {isParsing ? 'Refining...' : 'AI Refine'}
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isParsing}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md active:scale-95 transition-all"
              >
                {isSubmitting ? '...' : 'Save'}
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setShowOptions(!showOptions)}
            className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title="Toggle advanced options"
          >
            {showOptions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Real-time Parser Preview */}
        {parsedPreview && title.trim() && (
          <div className="mt-3 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-4 gap-y-2 animate-in fade-in slide-in-from-top-1 duration-150 shadow-sm">
            <span className="font-semibold text-slate-700 dark:text-slate-350 flex items-center gap-1.5">
              <Sparkles size={12} className="text-indigo-500 animate-pulse" />
              <span>Parsed:</span>
              <span className="text-slate-900 dark:text-white font-extrabold">{parsedPreview.title}</span>
            </span>
            {parsedPreview.dueDate && (
              <span className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/40 px-2 py-0.5 rounded-lg shadow-sm">
                <Calendar size={11} className="text-indigo-500" />
                <span>
                  {new Date(parsedPreview.dueDate).toLocaleString(undefined, { 
                    month: 'short', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit'
                  })}
                </span>
              </span>
            )}
            <span className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/40 px-2 py-0.5 rounded-lg shadow-sm capitalize">
              <ShieldAlert size={11} className={parsedPreview.priority === 'high' ? 'text-rose-500' : parsedPreview.priority === 'low' ? 'text-sky-500' : 'text-amber-500'} />
              <span>{parsedPreview.priority}</span>
            </span>
            {parsedPreview.tags.length > 0 && (
              <span className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/40 px-2 py-0.5 rounded-lg shadow-sm">
                <Tag size={11} className="text-indigo-500" />
                <span className="flex gap-1">
                  {parsedPreview.tags.map((t, i) => (
                    <span key={i} className="text-indigo-600 dark:text-indigo-400 font-extrabold">#{t}</span>
                  ))}
                </span>
              </span>
            )}
          </div>
        )}

        {/* Expandable Options Panel */}
        {showOptions && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Priority */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <ShieldAlert size={12} className="text-indigo-500 dark:text-indigo-400" />
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-650 dark:text-slate-350 focus:outline-none focus:border-indigo-500/50"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            {/* Due Date */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Calendar size={12} className="text-indigo-500 dark:text-indigo-400" />
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500/50 dark:[color-scheme:dark]"
              />
            </div>

            {/* Link to Goal */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Target size={12} className="text-indigo-500 dark:text-indigo-400" />
                Linked Goal
              </label>
              <select
                value={goalId}
                onChange={(e) => setGoalId(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-650 dark:text-slate-350 focus:outline-none focus:border-indigo-500/50"
              >
                <option value="">No goal linked</option>
                {goals.map((goal) => (
                  <option key={goal._id} value={goal._id}>
                    ({goal.period === 'week' ? 'W' : 'M'}) {goal.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Tag size={12} className="text-indigo-500 dark:text-indigo-400" />
                Tags
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="work, personal, design"
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>
        )}

        {error && (
          <div className="mt-3 text-xs text-rose-600 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-2.5 rounded-xl">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}
