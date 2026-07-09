import React from 'react';
import { Trash2, TrendingUp, CalendarDays } from 'lucide-react';

export default function GoalBanner({ goal, onDeleteGoal }) {
  const { _id, title, period, totalTasks = 0, completedTasks = 0 } = goal;

  const percent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const isWeekly = period === 'week';

  return (
    <div className="relative overflow-hidden group p-5 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm hover:border-slate-350 dark:hover:border-slate-700/60 hover:bg-slate-50/50 dark:hover:bg-slate-900/60 transition-all duration-300">
      {/* Dynamic light glow effect on hover */}
      <div className={`absolute -right-8 -top-8 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-500 ${
        isWeekly ? 'bg-emerald-500' : 'bg-violet-500'
      }`} />

      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="space-y-1.5 flex-1 space-x-0 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
              isWeekly
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50'
                : 'bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-900/50'
            }`}>
              <CalendarDays size={10} />
              {isWeekly ? 'Weekly' : 'Monthly'}
            </span>

            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              {completedTasks} of {totalTasks} tasks done
            </span>
          </div>

          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-relaxed">
            {title}
          </h4>
        </div>

        <button
          onClick={() => {
            if (confirm('Are you sure you want to delete this goal? Linked tasks will not be deleted, but they will be unlinked.')) {
              onDeleteGoal(_id);
            }
          }}
          className="text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-300"
          title="Delete Goal"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <TrendingUp size={12} className={isWeekly ? 'text-emerald-600 dark:text-emerald-400' : 'text-violet-600 dark:text-violet-400'} />
            Progress
          </span>
          <span className="font-extrabold text-slate-700 dark:text-slate-200">{percent}%</span>
        </div>

        <div className="w-full h-2 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800/40">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              isWeekly
                ? 'bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-500 dark:to-teal-400'
                : 'bg-gradient-to-r from-violet-600 to-fuchsia-500 dark:from-violet-500 dark:to-fuchsia-400'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
