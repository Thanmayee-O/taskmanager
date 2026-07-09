import React from 'react';
import TaskItem from './TaskItem';
import { ClipboardList, Sparkles, Search, X } from 'lucide-react';

export default function TaskList({ 
  tasks, 
  goals, 
  onToggleTask, 
  onModifyTask, 
  onDeleteTask, 
  filter,
  selectedIndex,
  searchQuery,
  onClearSearch
}) {
  if (tasks.length === 0) {
    // Empty state when search query returns 0 matches
    if (searchQuery && searchQuery.trim()) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-200/10 dark:bg-slate-900/10 border border-dashed border-slate-300 dark:border-slate-800/80 rounded-3xl backdrop-blur-sm animate-in fade-in zoom-in-95 duration-350">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-150 dark:border-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 shadow-sm">
            <Search size={20} />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
            No matching tasks found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-450 max-w-xs leading-relaxed font-semibold mb-4">
            Try modifying your search keywords or clear the filter to see your list.
          </p>
          <button
            onClick={onClearSearch}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all"
          >
            <X size={12} />
            Clear Search
          </button>
        </div>
      );
    }

    // Default workspace empty states
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-200/10 dark:bg-slate-900/10 border border-dashed border-slate-300 dark:border-slate-800/80 rounded-3xl backdrop-blur-sm animate-in fade-in zoom-in-95 duration-350">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-150 dark:border-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 shadow-sm">
          <ClipboardList size={22} />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
          {filter === 'completed'
            ? 'No completed tasks yet'
            : filter === 'active'
            ? 'All tasks completed!'
            : 'Your focus is clear'}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-450 max-w-xs leading-relaxed font-semibold">
          {filter === 'completed'
            ? 'Finish some tasks from your active list to see them here.'
            : filter === 'active'
            ? 'Great job! Add another task above or enjoy some downtime.'
            : 'Capture tasks and align them with your weekly or monthly goals.'}
        </p>
        {filter === 'active' && (
          <div className="flex items-center gap-1.5 mt-4 text-[10px] font-bold text-indigo-700 dark:text-indigo-400 tracking-wider uppercase bg-indigo-50 dark:bg-indigo-950/20 px-3 py-1.5 rounded-full border border-indigo-150 dark:border-indigo-900/30">
            <Sparkles size={10} />
            Focus Achieved
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {tasks.map((task, index) => (
        <TaskItem
          key={task._id}
          task={task}
          goals={goals}
          onToggleTask={onToggleTask}
          onModifyTask={onModifyTask}
          onDeleteTask={onDeleteTask}
          isSelected={index === selectedIndex}
        />
      ))}
    </div>
  );
}
