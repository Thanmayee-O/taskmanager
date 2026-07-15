import React from 'react';

export default function FilterBar({ filter, setFilter, taskCounts }) {
  const tabs = [
    { id: 'all', label: 'All', count: taskCounts.all },
    { id: 'active', label: 'Active', count: taskCounts.active },
    { id: 'completed', label: 'Completed', count: taskCounts.completed },
  ];

  return (
    <div className="flex bg-slate-200/60 dark:bg-slate-900/60 p-1 rounded-2xl border border-slate-300 dark:border-slate-800/80 backdrop-blur-md shadow-sm">
      {tabs.map((tab) => {
        const isActive = filter === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
              isActive
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
            <span
              className={`inline-block px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                isActive
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-850'
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
