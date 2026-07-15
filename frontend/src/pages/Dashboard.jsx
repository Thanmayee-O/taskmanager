import React, { useState, useEffect, useRef } from 'react';
import { useTasks } from '../hooks/useTasks';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import GoalForm from '../components/GoalForm';
import GoalBanner from '../components/GoalBanner';
import {
  Target,
  ListTodo,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Search,
  X,
  Heart,
  Briefcase,
  User,
  BookOpen,
  Wallet,
  Dumbbell,
  ShoppingCart,
  Home,
  Plane,
  MoreHorizontal,
  Plus,
  Calendar,
  ShieldAlert,
  ArrowUpDown,
  Bell,
  CheckCircle2,
  ListFilter,
  Check,
  ChevronDown,
  Award,
  Zap,
  Clock,
  Star,
  Gift,
  Edit2,
  Trash
} from 'lucide-react';

// Color classes mapping for backgrounds, borders, text, and accents
const colorDetails = {
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/20', text: 'text-emerald-650 dark:text-emerald-400', border: 'border-emerald-250 dark:border-emerald-900/40', accent: 'bg-emerald-500' },
  blue: { bg: 'bg-blue-50 dark:bg-blue-950/20', text: 'text-blue-650 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-900/40', accent: 'bg-blue-500' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-950/20', text: 'text-purple-655 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-900/40', accent: 'bg-purple-500' },
  indigo: { bg: 'bg-indigo-50 dark:bg-indigo-950/20', text: 'text-indigo-650 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-900/40', accent: 'bg-indigo-500' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-950/20', text: 'text-amber-650 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-900/40', accent: 'bg-amber-500' },
  pink: { bg: 'bg-pink-50 dark:bg-pink-950/20', text: 'text-pink-650 dark:text-pink-400', border: 'border-pink-200 dark:border-pink-900/40', accent: 'bg-pink-500' },
  rose: { bg: 'bg-rose-50 dark:bg-rose-950/20', text: 'text-rose-650 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-900/40', accent: 'bg-rose-500' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-950/20', text: 'text-orange-650 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-900/40', accent: 'bg-orange-500' },
  cyan: { bg: 'bg-cyan-50 dark:bg-cyan-950/20', text: 'text-cyan-650 dark:text-cyan-400', border: 'border-cyan-200 dark:border-cyan-900/40', accent: 'bg-cyan-500' },
  slate: { bg: 'bg-slate-50 dark:bg-slate-950/20', text: 'text-slate-655 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-800/40', accent: 'bg-slate-500' }
};

// Lucide icon mapping
const availableIcons = {
  Briefcase,
  User,
  Heart,
  BookOpen,
  Wallet,
  Dumbbell,
  ShoppingCart,
  Home,
  Plane,
  Star,
  Award,
  Zap,
  Clock,
  Gift,
  Bell,
  MoreHorizontal
};

const defaultCategories = [
  { name: 'Work / Office', icon: Briefcase, color: 'blue', isDefault: true },
  { name: 'Personal', icon: User, color: 'purple', isDefault: true },
  { name: 'Health', icon: Heart, color: 'emerald', isDefault: true },
  { name: 'Study', icon: BookOpen, color: 'indigo', isDefault: true }
];

export default function Dashboard() {
  const {
    tasks,
    goals,
    categories,
    loading,
    error,
    addTask,
    toggleTask,
    modifyTask,
    deleteTask,
    addGoal,
    deleteGoal,
    addCategory,
    modifyCategory,
    deleteCategory,
    refresh,
  } = useTasks();

  // Controlled GoalForm states
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
  const [goalFormPeriod, setGoalFormPeriod] = useState('week');
  const goalFormRef = useRef(null);

  // Custom Category Modal States
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catModalMode, setCatModalMode] = useState('create'); // create, edit
  const [catModalId, setCatModalId] = useState(null);
  const [catName, setCatName] = useState('');
  const [catIcon, setCatIcon] = useState('Star');
  const [catColor, setCatColor] = useState('blue');
  const [catError, setCatError] = useState('');
  const [isCatSaving, setIsCatSaving] = useState(false);

  // Search & Filter Toolbar States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterTab, setActiveFilterTab] = useState('all'); // all, today, upcoming, overdue, completed, pending
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [goalFilter, setGoalFilter] = useState('All');
  const [sortBy, setSortBy] = useState('dueDate'); // dueDate, priority, newest, oldest, alphabetical, completedFirst, pendingFirst
  const [viewMode, setViewMode] = useState('standard'); // standard, category

  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Time boundaries
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  // Focus utility for Task Quick-Add
  const focusTaskInput = () => {
    const input = document.querySelector('input[placeholder*="Focus on a new task"]');
    if (input) {
      input.focus();
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const openGoalForm = (period) => {
    setGoalFormPeriod(period);
    setIsGoalFormOpen(true);
    setTimeout(() => {
      goalFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  // Category Modal Handlers
  const handleOpenCreateCategory = () => {
    setCatModalMode('create');
    setCatModalId(null);
    setCatName('');
    setCatIcon('Star');
    setCatColor('blue');
    setCatError('');
    setIsCatModalOpen(true);
  };

  const handleOpenEditCategory = (e, cat) => {
    e.stopPropagation(); // Prevent card filter toggle
    setCatModalMode('edit');
    setCatModalId(cat._id);
    setCatName(cat.name);
    setCatIcon(cat.rawIconName || 'Star');
    setCatColor(cat.color);
    setCatError('');
    setIsCatModalOpen(true);
  };

  const handleDeleteCategoryClick = async (e, cat) => {
    e.stopPropagation(); // Prevent card filter toggle
    if (window.confirm(`Delete custom category "${cat.name}"? Tasks assigned to this category will revert to "Other".`)) {
      try {
        await deleteCategory(cat._id);
        if (categoryFilter === cat.name) {
          setCategoryFilter('All');
        }
      } catch (err) {
        alert(err.message || 'Failed to delete category');
      }
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!catName.trim()) {
      setCatError('Category name is required');
      return;
    }
    setCatError('');
    setIsCatSaving(true);
    try {
      if (catModalMode === 'create') {
        await addCategory({
          name: catName.trim(),
          icon: catIcon,
          color: catColor
        });
      } else {
        await modifyCategory(catModalId, {
          name: catName.trim(),
          icon: catIcon,
          color: catColor
        });
      }
      setIsCatModalOpen(false);
    } catch (err) {
      setCatError(err.message || 'Failed to save category');
    } finally {
      setIsCatSaving(false);
    }
  };

  // Compile default and custom user categories
  const mergedCategories = [
    ...defaultCategories,
    ...categories.map(cat => ({
      _id: cat._id,
      name: cat.name,
      icon: availableIcons[cat.icon] || MoreHorizontal,
      rawIconName: cat.icon,
      color: cat.color,
      isDefault: false
    }))
  ];

  // Notification Counts
  const dueTodayTasks = tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) >= startOfToday && new Date(t.dueDate) <= endOfToday);
  const overdueTasks = tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < startOfToday);
  const highPriorityTasks = tasks.filter(t => !t.completed && t.priority === 'high');

  // Compute local progress statistics
  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter(t => t.completed).length;
  const overallPercentage = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  const weeklyGoalsTasks = tasks.filter(t => t.goalId && goals.some(g => String(g._id) === String(t.goalId) && g.period === 'week'));
  const weeklyGoalsCompleted = weeklyGoalsTasks.filter(t => t.completed).length;
  const weeklyGoalPercentage = weeklyGoalsTasks.length > 0 ? Math.round((weeklyGoalsCompleted / weeklyGoalsTasks.length) * 100) : 0;

  const monthlyGoalsTasks = tasks.filter(t => t.goalId && goals.some(g => String(g._id) === String(t.goalId) && g.period === 'month'));
  const monthlyGoalsCompleted = monthlyGoalsTasks.filter(t => t.completed).length;
  const monthlyGoalPercentage = monthlyGoalsTasks.length > 0 ? Math.round((monthlyGoalsCompleted / monthlyGoalsTasks.length) * 100) : 0;

  const completedTodayCount = tasks.filter(t => {
    if (!t.completed || !t.updatedAt) return false;
    const date = new Date(t.updatedAt);
    return date >= startOfToday && date <= endOfToday;
  }).length;
  const remainingCount = tasks.filter(t => !t.completed).length;

  // Category counts and metrics
  const categoryStats = mergedCategories.map(cat => {
    // Treat Office / Work and Work / Office tasks together for backwards compatibility
    const catTasks = tasks.filter(t => 
      t.category === cat.name || 
      (cat.name === 'Work / Office' && t.category === 'Office / Work')
    );
    const total = catTasks.length;
    const completed = catTasks.filter(t => t.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const details = colorDetails[cat.color] || colorDetails.slate;
    return {
      ...cat,
      total,
      completed,
      percentage,
      details
    };
  });

  // Unified sorting and filtering process
  const filteredTasks = tasks.filter(t => {
    // 1. Tab filters
    if (activeFilterTab === 'today') {
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate);
      if (d < startOfToday || d > endOfToday) return false;
    } else if (activeFilterTab === 'upcoming') {
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate);
      if (d <= endOfToday) return false;
    } else if (activeFilterTab === 'overdue') {
      if (t.completed) return false;
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate);
      if (d >= startOfToday) return false;
    } else if (activeFilterTab === 'completed') {
      if (!t.completed) return false;
    } else if (activeFilterTab === 'pending') {
      if (t.completed) return false;
    }

    // 2. Category filter
    if (categoryFilter !== 'All') {
      // Map Office / Work to Work / Office in selection checks
      const itemCat = t.category === 'Office / Work' ? 'Work / Office' : t.category;
      if (itemCat !== categoryFilter) return false;
    }

    // 3. Priority filter
    if (priorityFilter !== 'All') {
      if (t.priority !== priorityFilter) return false;
    }

    // 4. Goal filter
    if (goalFilter !== 'All') {
      if (goalFilter === 'none') {
        if (t.goalId) return false;
      } else {
        if (String(t.goalId) !== String(goalFilter)) return false;
      }
    }

    // 5. Search query (Title, Category, Tags, Priority)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchCategory = t.category && t.category.toLowerCase().includes(q);
      const matchTags = t.tags && t.tags.some(tag => tag.toLowerCase().includes(q));
      const matchPriority = t.priority && t.priority.toLowerCase().includes(q);
      return matchTitle || matchCategory || matchTags || matchPriority;
    }

    return true;
  });

  // Apply sorting
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'dueDate': {
        if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        break;
      }
      case 'priority': {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        const weightA = priorityWeight[a.priority] || 2;
        const weightB = priorityWeight[b.priority] || 2;
        if (weightA !== weightB) return weightB - weightA;
        break;
      }
      case 'newest': {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      case 'oldest': {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      case 'alphabetical': {
        return a.title.localeCompare(b.title);
      }
      case 'completedFirst': {
        if (a.completed !== b.completed) return a.completed ? -1 : 1;
        break;
      }
      case 'pendingFirst': {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        break;
      }
    }
    // Fallback: uncompleted first, then due date, then newest
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Split tasks into sections for standard view mode
  const overdueList = sortedTasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < startOfToday);
  const todayList = sortedTasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) >= startOfToday && new Date(t.dueDate) <= endOfToday);
  const upcomingList = sortedTasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) > endOfToday);
  const backlogList = sortedTasks.filter(t => !t.completed && !t.dueDate);
  
  const completedTodayList = sortedTasks.filter(t => {
    if (!t.completed || !t.updatedAt) return false;
    const date = new Date(t.updatedAt);
    return date >= startOfToday && date <= endOfToday;
  });
  const otherCompletedList = sortedTasks.filter(t => {
    if (!t.completed) return false;
    if (!t.updatedAt) return true;
    const date = new Date(t.updatedAt);
    return date < startOfToday;
  });

  // Flat representation of displayed tasks for keyboard arrow selection
  const displayedTasks = [
    ...overdueList,
    ...todayList,
    ...upcomingList,
    ...backlogList,
    ...completedTodayList,
    ...otherCompletedList
  ];

  const selectedTaskId = displayedTasks[selectedIndex]?._id || null;

  // Sync index on size shifts
  useEffect(() => {
    if (displayedTasks.length === 0) {
      setSelectedIndex(-1);
    } else if (selectedIndex >= displayedTasks.length) {
      setSelectedIndex(displayedTasks.length - 1);
    }
  }, [displayedTasks.length, selectedIndex]);

  // Group tasks by category for category view mode
  const tasksByCategory = {};
  sortedTasks.forEach(t => {
    const itemCat = t.category === 'Office / Work' ? 'Work / Office' : t.category;
    if (!tasksByCategory[itemCat]) {
      tasksByCategory[itemCat] = [];
    }
    tasksByCategory[itemCat].push(t);
  });

  // Keyboard Navigation Hook
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeEl = document.activeElement;
      const isInputFocused = activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'SELECT' || 
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.isContentEditable
      );

      if (isInputFocused) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => {
          const nextIdx = prev + 1;
          return nextIdx < displayedTasks.length ? nextIdx : prev;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => {
          const nextIdx = prev - 1;
          return nextIdx >= 0 ? nextIdx : prev;
        });
      } else if (e.key === ' ') {
        if (selectedIndex >= 0 && selectedIndex < displayedTasks.length) {
          e.preventDefault();
          const task = displayedTasks[selectedIndex];
          toggleTask(task._id, task.completed);
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedIndex >= 0 && selectedIndex < displayedTasks.length) {
          e.preventDefault();
          const task = displayedTasks[selectedIndex];
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
  }, [displayedTasks, selectedIndex, toggleTask, deleteTask]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setActiveFilterTab('all');
    setCategoryFilter('All');
    setPriorityFilter('All');
    setGoalFilter('All');
    setSelectedIndex(-1);
  };

  // SVG circular properties
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallPercentage / 100) * circumference;

  // Enhance goals with client-side computed progress
  const goalsWithProgress = goals.map(goal => {
    const goalTasks = tasks.filter(t => t.goalId && String(t.goalId) === String(goal._id));
    const total = goalTasks.length;
    const completed = goalTasks.filter(t => t.completed).length;
    return {
      ...goal,
      totalTasks: total,
      completedTasks: completed
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12 space-y-8">
      {/* Header bar */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-900 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            🎯 Focus Board
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-455 mt-1.5 font-semibold">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} — Simplify your productivity.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => refresh()}
            disabled={loading}
            className="flex items-center justify-center p-2.5 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-808 transition-all active:scale-95 disabled:opacity-50"
            title="Sync Database"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      {/* Quick Actions Row */}
      <section className="bg-white dark:bg-slate-900/40 p-4 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-sm dark:shadow-md flex flex-wrap items-center gap-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-2 flex items-center gap-1">
          <Zap size={12} className="text-indigo-505 animate-pulse" /> Quick Actions
        </span>
        <button
          onClick={focusTaskInput}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-650 hover:bg-indigo-550 text-white rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all"
        >
          <Plus size={14} /> Add Task
        </button>
        <button
          onClick={() => openGoalForm('week')}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-105 dark:bg-slate-950 dark:hover:bg-slate-900 text-slate-750 dark:text-slate-350 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold active:scale-95 transition-all"
        >
          <Target size={13} className="text-emerald-500" /> + Weekly Goal
        </button>
        <button
          onClick={() => openGoalForm('month')}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-105 dark:bg-slate-955 dark:hover:bg-slate-900 text-slate-750 dark:text-slate-355 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold active:scale-95 transition-all"
        >
          <Target size={13} className="text-blue-500" /> + Monthly Goal
        </button>
        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block"></div>
        <button
          onClick={() => { setActiveFilterTab('completed'); setSelectedIndex(-1); }}
          className="px-3.5 py-2 text-xs text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-205 font-bold hover:bg-slate-50 dark:hover:bg-slate-955 rounded-xl transition-all"
        >
          View Completed
        </button>
        <button
          onClick={() => { setActiveFilterTab('overdue'); setSelectedIndex(-1); }}
          className="px-3.5 py-2 text-xs text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-455 font-bold hover:bg-slate-50 dark:hover:bg-slate-950 rounded-xl transition-all"
        >
          View Overdue ({overdueTasks.length})
        </button>
      </section>

      {/* Notifications highlights */}
      { (dueTodayTasks.length > 0 || overdueTasks.length > 0 || highPriorityTasks.length > 0) && (
        <section className="bg-amber-50/70 dark:bg-amber-955/15 border border-amber-200 dark:border-amber-900/30 p-4 rounded-2xl flex flex-wrap gap-4 items-center justify-between text-xs text-amber-900 dark:text-amber-400 font-bold animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Bell size={14} className="text-amber-500 animate-swing" />
              <span>Dashboard Warnings:</span>
            </span>
            {dueTodayTasks.length > 0 && (
              <button 
                onClick={() => { setActiveFilterTab('today'); setSelectedIndex(-1); }}
                className="bg-white dark:bg-slate-950 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-900/40 hover:underline flex items-center gap-1"
              >
                📅 {dueTodayTasks.length} due today
              </button>
            )}
            {overdueTasks.length > 0 && (
              <button
                onClick={() => { setActiveFilterTab('overdue'); setSelectedIndex(-1); }}
                className="bg-rose-50 dark:bg-rose-950/40 text-rose-650 dark:text-rose-405 border border-rose-205 dark:border-rose-900/40 px-2 py-0.5 rounded-lg hover:underline flex items-center gap-1"
              >
                🚨 {overdueTasks.length} overdue
              </button>
            )}
            {highPriorityTasks.length > 0 && (
              <span className="bg-white dark:bg-slate-950 px-2 py-0.5 rounded-lg border border-amber-205 dark:border-amber-900/40 flex items-center gap-1">
                ⭐ {highPriorityTasks.length} urgent pending
              </span>
            )}
          </div>
        </section>
      )}

      {/* Grid: Analytics Dashboard & Goal Progress */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Circle Progress Widget */}
        <div className="bg-white dark:bg-slate-900/50 p-6 border border-slate-200 dark:border-slate-800/80 rounded-3xl flex items-center justify-between shadow-sm dark:shadow-md hover:shadow-indigo-500/5 dark:hover:shadow-indigo-950/20 transition-all duration-300">
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <Award size={14} className="text-indigo-500" />
              Board Progress
            </h3>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-white">
              {overallPercentage}%
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-450 font-bold">
              {completedTasksCount} / {totalTasksCount} tasks completed
            </p>
          </div>
          <div className="relative flex items-center justify-center">
            <svg className="w-18 h-18 transform -rotate-90">
              <circle cx="36" cy="36" r={radius} className="stroke-slate-100 dark:stroke-slate-850" strokeWidth="6" fill="transparent" />
              <circle cx="36" cy="36" r={radius} className="stroke-indigo-650 dark:stroke-indigo-500 transition-all duration-500 ease-out" strokeWidth="6" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
            </svg>
            <span className="absolute text-xs font-extrabold text-indigo-650 dark:text-indigo-400">
              {overallPercentage}%
            </span>
          </div>
        </div>

        {/* Goal Tracker Widget */}
        <div className="bg-white dark:bg-slate-900/50 p-6 border border-slate-200 dark:border-slate-800/80 rounded-3xl space-y-4 shadow-sm dark:shadow-md hover:shadow-indigo-500/5 dark:hover:shadow-indigo-950/20 transition-all duration-300">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500 flex items-center gap-1.5">
            <Target size={14} className="text-indigo-505" />
            Goals Alignment
          </h3>
          <div className="space-y-3.5">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-655 dark:text-slate-350">Weekly Goal Tasks</span>
                <span className="text-slate-800 dark:text-slate-250">{weeklyGoalPercentage}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-200/40 dark:border-slate-850">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${weeklyGoalPercentage}%` }} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-655 dark:text-slate-350">Monthly Goal Tasks</span>
                <span className="text-slate-800 dark:text-slate-250">{monthlyGoalPercentage}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-200/40 dark:border-slate-850">
                <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${monthlyGoalPercentage}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Counter Summary Widget */}
        <div className="bg-white dark:bg-slate-900/50 p-6 border border-slate-200 dark:border-slate-800/80 rounded-3xl flex flex-col justify-between shadow-sm dark:shadow-md hover:shadow-indigo-500/5 dark:hover:shadow-indigo-950/20 transition-all duration-300">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            <Zap size={14} className="text-indigo-500" />
            Productivity Pulse
          </h3>
          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-105 dark:border-slate-800/60 p-3 rounded-2xl text-center shadow-inner">
              <span className="block text-2xl font-black text-emerald-600 dark:text-emerald-400">{completedTodayCount}</span>
              <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Done Today</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-105 dark:border-slate-800/60 p-3 rounded-2xl text-center shadow-inner">
              <span className="block text-2xl font-black text-indigo-650 dark:text-indigo-405">{remainingCount}</span>
              <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Remaining</span>
            </div>
          </div>
        </div>
      </section>

      {/* Predefined Category Grid Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-750 dark:text-slate-350 flex items-center gap-2">
            <span>📂 Categories Focus</span>
          </h2>
          <button
            onClick={handleOpenCreateCategory}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-305 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 rounded-xl transition-all shadow-sm"
          >
            <Plus size={12} /> Add Category
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {categoryStats.map((cat) => {
            const CatIcon = cat.icon;
            const isFilterSelected = categoryFilter === cat.name;
            return (
              <div
                key={cat.name}
                onClick={() => {
                  setCategoryFilter(isFilterSelected ? 'All' : cat.name);
                  setSelectedIndex(-1);
                }}
                className={`group relative cursor-pointer p-5 rounded-2xl border transition-all duration-350 flex flex-col justify-between shadow-sm hover:shadow-md hover:scale-[1.015] ${
                  isFilterSelected
                    ? 'border-indigo-650 dark:border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 ring-2 ring-indigo-500/10'
                    : 'bg-white dark:bg-slate-900/40 border-slate-205 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-850/60'
                }`}
              >
                {/* Actions overlay for custom categories */}
                {!cat.isDefault && (
                  <div className="absolute right-3.5 top-3.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={(e) => handleOpenEditCategory(e, cat)}
                      className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-750 dark:text-slate-400 dark:hover:text-slate-200 shadow-sm border border-slate-200/50 dark:border-slate-700/50 transition-all"
                      title="Edit Category"
                    >
                      <Edit2 size={10} />
                    </button>
                    <button
                      onClick={(e) => handleDeleteCategoryClick(e, cat)}
                      className="p-1 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 shadow-sm border border-rose-100/50 dark:border-rose-900/30 transition-all"
                      title="Delete Category"
                    >
                      <Trash size={10} />
                    </button>
                  </div>
                )}

                <div className="flex items-start justify-between">
                  <div className={`p-2.5 rounded-xl border ${cat.details.border} ${cat.details.bg}`}>
                    <CatIcon size={16} className={cat.details.text} />
                  </div>
                  {cat.total > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-slate-500 dark:text-slate-400">
                      {cat.completed}/{cat.total}
                    </span>
                  )}
                </div>
                
                <div className="mt-5 space-y-1.5">
                  <span className="block text-sm font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
                    {cat.name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div className="flex-1 bg-slate-100 dark:bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-200/20">
                      <div className={`h-full rounded-full transition-all duration-500 ${
                        cat.percentage >= 100 ? 'bg-emerald-500' : cat.details.accent
                      }`} style={{ width: `${cat.percentage}%` }} />
                    </div>
                    <span className="text-[9px] font-black text-slate-550 dark:text-slate-450">{cat.percentage}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Main Board Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Goal Focus List (1/3 Width) */}
        <section className="lg:col-span-1 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-250 flex items-center gap-2">
              <Target className="text-indigo-600 dark:text-indigo-400" size={18} />
              Goals Alignment
            </h2>
            <span className="text-xs font-bold text-slate-500 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
              {goals.length}
            </span>
          </div>

          <div ref={goalFormRef}>
            <GoalForm
              onAddGoal={addGoal}
              isOpen={isGoalFormOpen}
              setIsOpen={setIsGoalFormOpen}
              defaultPeriod={goalFormPeriod}
            />
          </div>

          {loading && goals.length === 0 ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="p-5 bg-slate-200/10 dark:bg-slate-900/10 border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse space-y-3">
                  <div className="h-4 bg-slate-300 dark:bg-slate-800 rounded-md w-1/3" />
                  <div className="h-5 bg-slate-300 dark:bg-slate-800 rounded-md w-3/4" />
                </div>
              ))}
            </div>
          ) : goals.length === 0 ? (
            <div className="p-6 text-center bg-slate-200/5 dark:bg-slate-900/5 border border-dashed border-slate-300 dark:border-slate-800/60 rounded-3xl">
              <p className="text-xs text-slate-550 dark:text-slate-455 leading-relaxed font-semibold">
                No active targets. Setup target priorities for **this week** or **this month** to align task structures.
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

        {/* Right column: Tasks panel (2/3 Width) */}
        <section className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <ListTodo className="text-indigo-650 dark:text-indigo-400" size={18} />
                Tasks Workspace
              </h2>
              {/* View mode toggle */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 p-1 rounded-xl shadow-inner">
                <button
                  onClick={() => setViewMode('standard')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'standard'
                      ? 'bg-white dark:bg-slate-900 text-indigo-655 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Date Sections
                </button>
                <button
                  onClick={() => setViewMode('category')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'category'
                      ? 'bg-white dark:bg-slate-900 text-indigo-655 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Group by Category
                </button>
              </div>
            </div>

            {/* Task Quick-Add form */}
            <TaskForm goals={goalsWithProgress} categories={categories} onAddTask={addTask} />

            {/* Advanced Filters Toolbar */}
            <div className="space-y-3 bg-slate-50/50 dark:bg-slate-900/10 p-4 rounded-2xl border border-slate-200 dark:border-slate-805/60 backdrop-blur-sm shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3 text-slate-400 dark:text-slate-555" size={14} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSelectedIndex(-1);
                    }}
                    placeholder="Search by title, tags, priority, category..."
                    className="w-full text-xs pl-9 pr-8 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-xl text-slate-800 dark:text-slate-105 placeholder:text-slate-400 dark:placeholder:text-slate-550 focus:outline-none focus:border-indigo-500/50 transition-all shadow-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => { setSearchQuery(''); setSelectedIndex(-1); }}
                      className="absolute right-2.5 top-2.5 text-slate-400 dark:text-slate-500 hover:text-slate-705 p-0.5 rounded-md hover:bg-slate-150 transition-colors"
                      title="Clear search"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Sorting Select */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-505 whitespace-nowrap flex items-center gap-1.5">
                    <ArrowUpDown size={12} /> Sort By
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setSelectedIndex(-1);
                    }}
                    className="text-xs px-3 py-2 bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-350 focus:outline-none focus:border-indigo-500/50 shadow-sm"
                  >
                    <option value="dueDate">Due Date</option>
                    <option value="priority">Priority</option>
                    <option value="newest">Newest Created</option>
                    <option value="oldest">Oldest Created</option>
                    <option value="alphabetical">Alphabetical</option>
                    <option value="completedFirst">Completed First</option>
                    <option value="pendingFirst">Pending First</option>
                  </select>
                </div>
              </div>

              {/* Advanced Filter Drops Row */}
              <div className="flex flex-wrap gap-2 items-center border-t border-slate-200/50 dark:border-slate-800/40 pt-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550 whitespace-nowrap flex items-center gap-1.5 mr-1">
                  <ListFilter size={12} /> Filters
                </span>
                
                {/* Tab Filter buttons */}
                <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-955 border border-slate-200/60 dark:border-slate-800 p-0.5 rounded-xl mr-2">
                  {['all', 'today', 'upcoming', 'overdue', 'completed', 'pending'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => { setActiveFilterTab(tab); setSelectedIndex(-1); }}
                      className={`px-2.5 py-1 text-[10px] font-bold capitalize rounded-lg transition-all ${
                        activeFilterTab === tab
                          ? 'bg-white dark:bg-slate-900 text-indigo-650 dark:text-indigo-405 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
                      }`}
                    >
                      {tab === 'all' ? 'All Tasks' : tab}
                    </button>
                  ))}
                </div>

                {/* Priority Dropdown */}
                <select
                  value={priorityFilter}
                  onChange={(e) => { setPriorityFilter(e.target.value); setSelectedIndex(-1); }}
                  className="text-[10px] font-bold px-2 py-1 bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-650 dark:text-slate-350 focus:outline-none"
                >
                  <option value="All">All Priorities</option>
                  <option value="high">🔥 High Priority</option>
                  <option value="medium">⚡ Medium Priority</option>
                  <option value="low">💤 Low Priority</option>
                </select>

                {/* Goals Dropdown */}
                <select
                  value={goalFilter}
                  onChange={(e) => { setGoalFilter(e.target.value); setSelectedIndex(-1); }}
                  className="text-[10px] font-bold px-2 py-1 bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-805 rounded-lg text-slate-655 dark:text-slate-350 focus:outline-none max-w-[140px] truncate"
                >
                  <option value="All">All Goals</option>
                  <option value="none">No Goal Linked</option>
                  {goals.map(g => (
                    <option key={g._id} value={g._id}>
                      🎯 {g.title}
                    </option>
                  ))}
                </select>

                {/* Category Dropdown */}
                <select
                  value={categoryFilter}
                  onChange={(e) => { setCategoryFilter(e.target.value); setSelectedIndex(-1); }}
                  className="text-[10px] font-bold px-2 py-1 bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-805 rounded-lg text-slate-650 dark:text-slate-350 focus:outline-none"
                >
                  <option value="All">All Categories</option>
                  {Array.from(new Set(['Work / Office', 'Personal', 'Health', 'Study', ...categories.map(c => c.name), 'Other'])).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                {/* Clear Filter Trigger */}
                {(searchQuery || activeFilterTab !== 'all' || categoryFilter !== 'All' || priorityFilter !== 'All' || goalFilter !== 'All') && (
                  <button
                    onClick={handleClearFilters}
                    className="text-[10px] font-extrabold text-indigo-650 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-0.5 ml-auto hover:underline"
                  >
                    <X size={10} /> Reset Filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Skeletons loader */}
          {loading && tasks.length === 0 ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 bg-slate-200/10 dark:bg-slate-900/10 border border-slate-200 dark:border-slate-800/40 rounded-2xl animate-pulse flex items-center gap-4">
                  <div className="w-5 h-5 rounded bg-slate-300 dark:bg-slate-850" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-300 dark:bg-slate-850 rounded w-1/2" />
                    <div className="h-3 bg-slate-300 dark:bg-slate-850 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : viewMode === 'category' ? (
            /* View Mode: Group by Category */
            <div className="space-y-8 animate-in fade-in duration-300">
              {Object.keys(tasksByCategory).length === 0 ? (
                <div className="p-12 text-center bg-slate-200/5 dark:bg-slate-900/5 border border-dashed border-slate-300 dark:border-slate-800/60 rounded-3xl">
                  <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed font-semibold">
                    No tasks found matching current filters.
                  </p>
                </div>
              ) : (
                Object.keys(tasksByCategory).map(catName => {
                  const catDetails = colorDetails[mergedCategories.find(c => c.name === catName)?.color] || colorDetails.slate;
                  const matchedCat = mergedCategories.find(c => c.name === catName);
                  const CatIcon = matchedCat ? matchedCat.icon : MoreHorizontal;
                  const catTasks = tasksByCategory[catName];
                  
                  return (
                    <div key={catName} className="space-y-3.5">
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-750 dark:text-slate-300 flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-2">
                        <span className={`p-1.5 rounded-lg border ${catDetails.border} ${catDetails.bg}`}>
                          <CatIcon size={12} className={catDetails.text} />
                        </span>
                        <span>{catName} Tasks</span>
                        <span className="text-[10px] font-bold text-slate-400 bg-white dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-850">
                          {catTasks.length}
                        </span>
                      </h3>
                      
                      <TaskList
                        tasks={catTasks}
                        goals={goalsWithProgress}
                        categories={categories}
                        onToggleTask={toggleTask}
                        onModifyTask={modifyTask}
                        onDeleteTask={deleteTask}
                        filter={activeFilterTab}
                        selectedTaskId={selectedTaskId}
                        searchQuery={searchQuery}
                        onClearSearch={handleClearFilters}
                      />
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* View Mode: Standard Date & Status Sections */
            <div className="space-y-8 animate-in fade-in duration-300">
              {sortedTasks.length === 0 ? (
                <TaskList
                  tasks={sortedTasks}
                  goals={goalsWithProgress}
                  categories={categories}
                  onToggleTask={toggleTask}
                  onModifyTask={modifyTask}
                  onDeleteTask={deleteTask}
                  filter={activeFilterTab}
                  selectedTaskId={selectedTaskId}
                  searchQuery={searchQuery}
                  onClearSearch={handleClearFilters}
                />
              ) : (
                <>
                  {/* Overdue Tasks Section */}
                  {overdueList.length > 0 && (
                    <div className="space-y-3.5">
                      <h3 className="text-xs font-black uppercase tracking-wider text-rose-650 dark:text-rose-400 flex items-center gap-2 border-b border-slate-100 dark:border-slate-855 pb-2">
                        <ShieldAlert size={14} className="text-rose-500 animate-pulse" />
                        <span>Overdue Tasks</span>
                        <span className="text-[9px] font-black text-white bg-rose-600 px-2 py-0.5 rounded-md border border-rose-600 shadow-sm animate-pulse">
                          {overdueList.length}
                        </span>
                      </h3>
                      <TaskList
                        tasks={overdueList}
                        goals={goalsWithProgress}
                        categories={categories}
                        onToggleTask={toggleTask}
                        onModifyTask={modifyTask}
                        onDeleteTask={deleteTask}
                        filter={activeFilterTab}
                        selectedTaskId={selectedTaskId}
                        searchQuery={searchQuery}
                        onClearSearch={handleClearFilters}
                      />
                    </div>
                  )}

                  {/* Today's Tasks Section */}
                  {todayList.length > 0 && (
                    <div className="space-y-3.5">
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-705 dark:text-slate-300 flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-2">
                        <Clock size={14} className="text-emerald-500" />
                        <span>Today's Focus</span>
                        <span className="text-[10px] font-bold text-slate-400 bg-white dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-850">
                          {todayList.length}
                        </span>
                      </h3>
                      <TaskList
                        tasks={todayList}
                        goals={goalsWithProgress}
                        categories={categories}
                        onToggleTask={toggleTask}
                        onModifyTask={modifyTask}
                        onDeleteTask={deleteTask}
                        filter={activeFilterTab}
                        selectedTaskId={selectedTaskId}
                        searchQuery={searchQuery}
                        onClearSearch={handleClearFilters}
                      />
                    </div>
                  )}

                  {/* Upcoming Tasks Section */}
                  {upcomingList.length > 0 && (
                    <div className="space-y-3.5">
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-750 dark:text-slate-350 flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-2">
                        <Calendar size={14} className="text-indigo-500" />
                        <span>Upcoming targets</span>
                        <span className="text-[10px] font-bold text-slate-400 bg-white dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-855">
                          {upcomingList.length}
                        </span>
                      </h3>
                      <TaskList
                        tasks={upcomingList}
                        goals={goalsWithProgress}
                        categories={categories}
                        onToggleTask={toggleTask}
                        onModifyTask={modifyTask}
                        onDeleteTask={deleteTask}
                        filter={activeFilterTab}
                        selectedTaskId={selectedTaskId}
                        searchQuery={searchQuery}
                        onClearSearch={handleClearFilters}
                      />
                    </div>
                  )}

                  {/* Backlog / No Due Date Tasks Section */}
                  {backlogList.length > 0 && (
                    <div className="space-y-3.5">
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-750 dark:text-slate-300 flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-2">
                        <ListTodo size={14} className="text-slate-400" />
                        <span>Focus Backlog (No Date)</span>
                        <span className="text-[10px] font-bold text-slate-400 bg-white dark:bg-slate-955 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-850">
                          {backlogList.length}
                        </span>
                      </h3>
                      <TaskList
                        tasks={backlogList}
                        goals={goalsWithProgress}
                        categories={categories}
                        onToggleTask={toggleTask}
                        onModifyTask={modifyTask}
                        onDeleteTask={deleteTask}
                        filter={activeFilterTab}
                        selectedTaskId={selectedTaskId}
                        searchQuery={searchQuery}
                        onClearSearch={handleClearFilters}
                      />
                    </div>
                  )}

                  {/* Completed Today Section */}
                  {completedTodayList.length > 0 && (
                    <div className="space-y-3.5">
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-450 flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-2">
                        <CheckCircle2 size={14} className="text-emerald-500" />
                        <span>Completed Today</span>
                        <span className="text-[10px] font-bold text-slate-400 bg-white dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-850">
                          {completedTodayList.length}
                        </span>
                      </h3>
                      <TaskList
                        tasks={completedTodayList}
                        goals={goalsWithProgress}
                        categories={categories}
                        onToggleTask={toggleTask}
                        onModifyTask={modifyTask}
                        onDeleteTask={deleteTask}
                        filter={activeFilterTab}
                        selectedTaskId={selectedTaskId}
                        searchQuery={searchQuery}
                        onClearSearch={handleClearFilters}
                      />
                    </div>
                  )}

                  {/* Completed Earlier Section */}
                  {otherCompletedList.length > 0 && (
                    <div className="space-y-3.5">
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-455 flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-2">
                        <CheckCircle2 size={14} className="text-slate-350" />
                        <span>Completed Earlier</span>
                        <span className="text-[10px] font-bold text-slate-400 bg-white dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-850">
                          {otherCompletedList.length}
                        </span>
                      </h3>
                      <TaskList
                        tasks={otherCompletedList}
                        goals={goalsWithProgress}
                        categories={categories}
                        onToggleTask={toggleTask}
                        onModifyTask={modifyTask}
                        onDeleteTask={deleteTask}
                        filter={activeFilterTab}
                        selectedTaskId={selectedTaskId}
                        searchQuery={searchQuery}
                        onClearSearch={handleClearFilters}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Keyboard Shortcuts Prompt */}
          {!loading && tasks.length > 0 && (
            <div className="text-center pt-2">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5 font-bold uppercase tracking-wider bg-slate-100/40 dark:bg-slate-900/10 border border-slate-200/50 dark:border-slate-800/40 py-2.5 px-4 rounded-xl">
                <Sparkles size={11} className="text-indigo-600 dark:text-indigo-400 animate-pulse" />
                <span>Shortcuts: <kbd className="bg-white dark:bg-slate-955 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 shadow-sm text-slate-650 dark:text-slate-450 mx-0.5">↓↑</kbd> Navigate | <kbd className="bg-white dark:bg-slate-955 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 shadow-sm text-slate-655 dark:text-slate-455 mx-0.5">Space</kbd> Check | <kbd className="bg-white dark:bg-slate-955 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 shadow-sm text-slate-650 dark:text-slate-455 mx-0.5">Del</kbd> Delete | <kbd className="bg-white dark:bg-slate-955 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 shadow-sm text-slate-650 dark:text-slate-450 mx-0.5">Ctrl+K</kbd> Quick-Add</span>
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Category CRUD Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                {catModalMode === 'create' ? <Plus size={18} className="text-indigo-650" /> : <Edit2 size={16} className="text-indigo-650" />}
                {catModalMode === 'create' ? 'Create Custom Category' : 'Edit Custom Category'}
              </h3>
              <button
                onClick={() => setIsCatModalOpen(false)}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-650 dark:hover:text-slate-250 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-5 pt-4">
              {/* Category Name */}
              <div className="space-y-1.5">
                <label htmlFor="cat-name" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Category Name
                </label>
                <input
                  id="cat-name"
                  type="text"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Finance, Shopping, Fitness"
                  className="w-full text-xs px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500/50 shadow-sm"
                  required
                  disabled={isCatSaving}
                />
              </div>

              {/* Icon Selector Grid */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Select Icon
                </label>
                <div className="grid grid-cols-6 gap-2 bg-slate-50 dark:bg-slate-955 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-800/40">
                  {Object.keys(availableIcons).map((iconName) => {
                    const IconComponent = availableIcons[iconName];
                    const isSelected = catIcon === iconName;
                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setCatIcon(iconName)}
                        className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-indigo-650 border-indigo-650 text-white shadow-md scale-105'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100'
                        }`}
                        title={iconName}
                      >
                        <IconComponent size={15} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Selector Grid */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Choose Accent Color
                </label>
                <div className="grid grid-cols-5 gap-2.5 bg-slate-50 dark:bg-slate-955 p-3.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40">
                  {Object.keys(colorDetails).map((colorName) => {
                    const isSelected = catColor === colorName;
                    const details = colorDetails[colorName];
                    return (
                      <button
                        key={colorName}
                        type="button"
                        onClick={() => setCatColor(colorName)}
                        className={`w-full h-8 rounded-xl flex items-center justify-center border-2 transition-all ${details.accent} ${
                          isSelected
                            ? 'border-indigo-600 dark:border-white scale-105 shadow-md'
                            : 'border-transparent opacity-85 hover:opacity-100 hover:scale-102'
                        }`}
                        title={colorName}
                      >
                        {isSelected && <Check size={12} className="text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {catError && (
                <p className="text-xs text-rose-500 dark:text-rose-400 font-bold">{catError}</p>
              )}

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="px-4 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-450 rounded-xl text-xs font-bold transition-all border border-slate-200/80 dark:border-slate-800"
                  disabled={isCatSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-650 hover:bg-indigo-550 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:scale-100"
                  disabled={isCatSaving}
                >
                  {isCatSaving ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
