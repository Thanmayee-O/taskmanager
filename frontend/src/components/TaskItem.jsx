import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Calendar, Tag, Target, Check } from 'lucide-react';

export default function TaskItem({ task, goals, categories = [], onToggleTask, onModifyTask, onDeleteTask, isSelected }) {
  const { _id, title, completed, dueDate, priority, tags = [], goalId, category = 'Other' } = task;
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef(null);

  // Set focus when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (!editTitle.trim()) {
      setEditTitle(title);
      setIsEditing(false);
      return;
    }

    if (editTitle.trim() === title) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onModifyTask(_id, { title: editTitle.trim() });
      setIsEditing(false);
    } catch (err) {
      setEditTitle(title);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditTitle(title);
      setIsEditing(false);
    }
  };

  // Determine if task is overdue
  const isOverdue = (() => {
    if (!dueDate || completed) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  })();

  // Formatting date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Find linked goal
  const linkedGoal = goals.find((g) => g._id === goalId);

  // Styling maps
  const priorityStyles = {
    high: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/40',
    medium: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/40',
    low: 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-900/40',
  };

  // Resolve category color
  let categoryColor = 'slate';
  const matchedCustom = categories.find(c => c.name === category);
  if (matchedCustom) {
    categoryColor = matchedCustom.color;
  } else {
    // Map defaults
    const defaultColorMap = {
      'Work / Office': 'blue',
      'Personal': 'purple',
      'Health': 'emerald',
      'Study': 'indigo'
    };
    categoryColor = defaultColorMap[category] || 'slate';
  }

  const categoryColorStyles = {
    emerald: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30',
    blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/30',
    purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900/30',
    indigo: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/30',
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-705 dark:text-amber-450 border-amber-200 dark:border-amber-900/30',
    pink: 'bg-pink-50 dark:bg-pink-950/30 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-900/30',
    rose: 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-450 border-rose-200 dark:border-rose-900/30',
    orange: 'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900/30',
    cyan: 'bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-900/30',
    slate: 'bg-slate-50 dark:bg-slate-950/40 text-slate-700 dark:text-slate-450 border-slate-200 dark:border-slate-805/40'
  };

  const badgeStyle = categoryColorStyles[categoryColor] || categoryColorStyles.slate;

  return (
    <div
      className={`group flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300 ${
        isSelected
          ? 'bg-indigo-50/25 dark:bg-indigo-950/15 border-indigo-500 ring-2 ring-indigo-500/10 dark:ring-indigo-400/10 scale-[1.01] shadow-md'
          : completed
          ? 'bg-slate-100/50 dark:bg-slate-900/10 border-slate-200 dark:border-slate-900/40 opacity-60'
          : 'bg-white dark:bg-slate-900/30 border-slate-200 dark:border-slate-800/60 hover:border-slate-350 dark:hover:border-slate-700/60 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 shadow-sm'
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggleTask(_id, completed)}
        className={`mt-0.5 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
          completed
            ? 'bg-indigo-650 dark:bg-indigo-600 border-indigo-650 dark:border-indigo-600 text-white'
            : 'border-slate-300 dark:border-slate-700 hover:border-indigo-500 bg-slate-50 dark:bg-slate-950/40'
        }`}
        title={completed ? 'Mark as active' : 'Mark as completed'}
      >
        {completed && <Check size={12} strokeWidth={3} />}
      </button>

      {/* Content Area */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Title editing */}
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            disabled={isSaving}
            className="w-full bg-white dark:bg-slate-950/60 border border-indigo-500 rounded-xl px-3 py-1.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-550"
          />
        ) : (
          <h3
            onClick={() => setIsEditing(true)}
            className={`text-sm font-semibold leading-relaxed break-words cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors ${
              completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'
            }`}
            title="Click to edit task name"
          >
            {title}
          </h3>
        )}

        {/* Metadata Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          {/* Priority */}
          <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${priorityStyles[priority]}`}>
            {priority}
          </span>

          {/* Category */}
          <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${badgeStyle}`}>
            {category}
          </span>

          {/* Due Date */}
          {dueDate && (
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                isOverdue
                  ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/60'
                  : completed
                  ? 'bg-slate-100 dark:bg-slate-950 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-900'
                  : 'bg-slate-100 dark:bg-slate-950 text-slate-550 dark:text-slate-400 border-slate-200 dark:border-slate-800'
              }`}
            >
              <Calendar size={10} />
              {formatDate(dueDate)}
              {isOverdue && ' (Overdue)'}
            </span>
          )}

          {/* Linked Goal */}
          {linkedGoal && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border border-indigo-150 dark:border-indigo-900/30 max-w-[150px] truncate">
              <Target size={10} />
              {linkedGoal.title}
            </span>
          )}

          {/* Tags */}
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
            >
              <Tag size={8} className="opacity-70" />
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Delete Action Button */}
      <button
        onClick={() => onDeleteTask(_id)}
        className="text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 p-2 rounded-xl opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-300 self-center"
        title="Delete Task"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
