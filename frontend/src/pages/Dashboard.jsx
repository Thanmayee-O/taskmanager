import React, { useState, useEffect } from 'react';
import { useTasks } from '../hooks/useTasks';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import FilterBar from '../components/FilterBar';
import GoalForm from '../components/GoalForm';
import GoalBanner from '../components/GoalBanner';
import { Target, ListTodo, RefreshCw, AlertCircle, Sparkles, Search, X } from 'lucide-react';

export default function Dashboard() {
  const {
    tasks,
    goals,
    loading,
    error,
    filter,
    setFilter,
    addTask,
    toggleTask,
    modifyTask,
    deleteTask,
    addGoal,
    deleteGoal,
    refresh,
  } = useTasks();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Enhance goals with client-side computed progress for instant responsiveness
  const goalsWithProgress = goals.map(goal => {
    const goalTasks = tasks.filter(t => t.goalId && String(t.goalId) === String(goal._id));
    const totalTasks = goalTasks.length;
    const completedTasks = goalTasks.filter(t => t.completed).length;
    return {
      ...goal,
      totalTasks,
      completedTasks
    };
  });

  // Filter tasks locally by tab (filter) AND search query
  const filteredTasks = tasks.filter(t => {
    // 1. Tab filter checks
    if (filter === 'active' && t.completed) return false;
    if (filter === 'completed' && !t.completed) return false;

    // 2. Search query keyword checks (search title or tags)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchTags = t.tags.some(tag => tag.toLowerCase().includes(q));
      return matchTitle || matchTags;
    }

    return true;
  });

  // Calculate task counts for filter tabs based on raw client tasks list
  const taskCounts = {
    all: tasks.length,
    active: tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t => t.completed).length
  };

  // Keep index within boundaries on list size adjustments
  useEffect(() => {
    if (filteredTasks.length === 0) {
      setSelectedIndex(-1);
    } else if (selectedIndex >= filteredTasks.length) {
      setSelectedIndex(filteredTasks.length - 1);
    }
  }, [filteredTasks.length, selectedIndex]);

  // Global Keyboard Shortcuts (Arrow keys, Space, Delete, Esc)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeEl = document.activeElement;
      const isInputFocused = activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'SELECT' || 
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.isContentEditable
      );

      // Do not intercept hotkeys if user is currently writing in a form input
      if (isInputFocused) {
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => {
          const nextIdx = prev + 1;
          return nextIdx < filteredTasks.length ? nextIdx : prev;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => {
          const nextIdx = prev - 1;
          return nextIdx >= 0 ? nextIdx : prev;
        });
      } else if (e.key === ' ') {
        // Space bar: Toggle completion
        if (selectedIndex >= 0 && selectedIndex < filteredTasks.length) {
          e.preventDefault();
          const task = filteredTasks[selectedIndex];
          toggleTask(task._id, task.completed);
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        // Delete task with standard prompt
        if (selectedIndex >= 0 && selectedIndex < filteredTasks.length) {
          e.preventDefault();
          const task = filteredTasks[selectedIndex];
          if (window.confirm(`Delete task "${task.title}"?`)) {
            deleteTask(task._id);
          }
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setSelectedIndex(-1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredTasks, selectedIndex, toggleTask, deleteTask]);

  const handleClearSearch = () => {
    setSearchQuery('');
    setSelectedIndex(-1);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 lg:py-12 space-y-10">
      {/* Header section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-900 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            🎯 Focus Board
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-450 mt-1.5 font-medium">
            Clarity on what to do next. Fast task capture and goal alignment.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {error && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-450 border border-rose-100 dark:border-rose-900/30 rounded-xl text-xs font-semibold">
              <AlertCircle size={14} />
              Sync Error
            </span>
          )}
          <button
            onClick={() => refresh()}
            disabled={loading}
            className="flex items-center justify-center p-2.5 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800 transition-all active:scale-95 disabled:opacity-50"
            title="Refresh database"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      {/* Main Grid: Goals vs Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Goals (1/3 width) */}
        <section className="lg:col-span-1 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Target className="text-indigo-600 dark:text-indigo-400" size={18} />
              Active Goals
            </h2>
            <span className="text-xs font-bold text-slate-500 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
              {goals.length}
            </span>
          </div>

          <GoalForm onAddGoal={addGoal} />

          {loading && goals.length === 0 ? (
            // Shimmer skeletons for goals
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="p-5 bg-slate-200/20 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse space-y-3">
                  <div className="h-4 bg-slate-300 dark:bg-slate-800 rounded-md w-1/3" />
                  <div className="h-5 bg-slate-300 dark:bg-slate-800 rounded-md w-3/4" />
                  <div className="space-y-1">
                    <div className="h-3 bg-slate-300 dark:bg-slate-800 rounded-md w-1/4" />
                    <div className="h-2 bg-slate-300 dark:bg-slate-800 rounded-full w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : goals.length === 0 ? (
            <div className="p-6 text-center bg-slate-200/10 dark:bg-slate-900/10 border border-dashed border-slate-300 dark:border-slate-800/60 rounded-3xl backdrop-blur-sm">
              <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed font-medium">
                No active goals. Create a goal for **this week** or **this month** to align your tasks and track progress.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {goalsWithProgress.map((goal) => (
                <GoalBanner
                  key={goal._id}
                  goal={goal}
                  onDeleteGoal={deleteGoal}
                />
              ))}
            </div>
          )}
        </section>

        {/* Right Column: Tasks (2/3 width) */}
        <section className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <ListTodo className="text-indigo-600 dark:text-indigo-400" size={18} />
                Focus Board
              </h2>
            </div>

            {/* Task creation form */}
            <TaskForm goals={goalsWithProgress} onAddTask={addTask} />

            {/* Search and Filters control toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-100/40 dark:bg-slate-900/10 p-3 rounded-2xl border border-slate-200 dark:border-slate-800/60 backdrop-blur-sm">
              <FilterBar filter={filter} setFilter={setFilter} taskCounts={taskCounts} />
              
              <div className="relative w-full md:max-w-[240px]">
                <Search className="absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" size={13} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedIndex(-1);
                  }}
                  placeholder="Search by text or tags..."
                  className="w-full text-xs pl-9 pr-8 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/60 transition-all shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-2.5 top-2.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 p-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Clear search query"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {loading && tasks.length === 0 ? (
            // Shimmer skeletons for tasks
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 bg-slate-200/20 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800/40 rounded-2xl animate-pulse flex items-center gap-4">
                  <div className="w-5 h-5 rounded-lg bg-slate-300 dark:bg-slate-800" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-300 dark:bg-slate-800 rounded-md w-1/2" />
                    <div className="flex gap-2">
                      <div className="h-3 bg-slate-300 dark:bg-slate-800 rounded-full w-12" />
                      <div className="h-3 bg-slate-300 dark:bg-slate-800 rounded-full w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <TaskList
              tasks={filteredTasks}
              goals={goalsWithProgress}
              onToggleTask={toggleTask}
              onModifyTask={modifyTask}
              onDeleteTask={deleteTask}
              filter={filter}
              selectedIndex={selectedIndex}
              searchQuery={searchQuery}
              onClearSearch={handleClearSearch}
            />
          )}

          {!loading && tasks.length > 0 && (
            <div className="text-center pt-2">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5 font-bold uppercase tracking-wider bg-slate-100/40 dark:bg-slate-900/10 border border-slate-200/50 dark:border-slate-800/40 py-2.5 px-4 rounded-xl">
                <Sparkles size={11} className="text-indigo-600 dark:text-indigo-400 animate-pulse" />
                <span>Shortcuts: <kbd className="bg-white dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 shadow-sm text-slate-600 dark:text-slate-400 mx-0.5">↓↑</kbd> Navigate | <kbd className="bg-white dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 shadow-sm text-slate-600 dark:text-slate-400 mx-0.5">Space</kbd> Check | <kbd className="bg-white dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 shadow-sm text-slate-600 dark:text-slate-400 mx-0.5">Del</kbd> Delete | <kbd className="bg-white dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 shadow-sm text-slate-600 dark:text-slate-400 mx-0.5">Ctrl+K</kbd> Quick-Add</span>
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
