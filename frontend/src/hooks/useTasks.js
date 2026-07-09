import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const sortTasks = (tasksList) => {
  return [...tasksList].sort((a, b) => {
    // 1. Completed status grouping
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    // 2. Due date sorting (soonest first)
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;

    // 3. Fallback to newest created first
    const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
    const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
    return dateB - dateA;
  });
};

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'completed'

  // Fetch all tasks and goals from API
  const fetchData = useCallback(async () => {
    if (!localStorage.getItem('token')) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [fetchedTasks, fetchedGoals] = await Promise.all([
        api.getTasks(''),
        api.getGoals()
      ]);
      setTasks(sortTasks(fetchedTasks));
      setGoals(fetchedGoals);
    } catch (err) {
      setError(err.message || 'Failed to fetch data from server');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Tasks actions
  const addTask = async (taskData) => {
    setError(null);
    try {
      const newTask = await api.createTask(taskData);
      setTasks(prev => sortTasks([...prev, newTask]));
    } catch (err) {
      setError(err.message || 'Failed to create task');
      throw err;
    }
  };

  const toggleTask = async (id, currentCompleted) => {
    setError(null);
    const nextCompleted = !currentCompleted;
    
    // Optimistic UI update for tasks (helps make it feel snappy)
    setTasks(prev =>
      sortTasks(prev.map(t => (t._id === id ? { ...t, completed: nextCompleted } : t)))
    );

    try {
      const updatedTask = await api.updateTask(id, { completed: nextCompleted });
      // Sync the exact updated task from server
      setTasks(prev =>
        sortTasks(prev.map(t => (t._id === id ? updatedTask : t)))
      );
    } catch (err) {
      setError(err.message || 'Failed to update task');
      // Rollback to original status
      setTasks(prev =>
        sortTasks(prev.map(t => (t._id === id ? { ...t, completed: currentCompleted } : t)))
      );
    }
  };

  const modifyTask = async (id, updates) => {
    setError(null);
    try {
      const updatedTask = await api.updateTask(id, updates);
      setTasks(prev =>
        sortTasks(prev.map(t => (t._id === id ? updatedTask : t)))
      );
    } catch (err) {
      setError(err.message || 'Failed to edit task');
      throw err;
    }
  };

  const deleteTask = async (id) => {
    setError(null);
    let previousTasks;
    setTasks(prev => {
      previousTasks = prev;
      return prev.filter(t => t._id !== id);
    });
    try {
      await api.deleteTask(id);
    } catch (err) {
      setError(err.message || 'Failed to delete task');
      setTasks(previousTasks);
    }
  };

  // Goals actions
  const addGoal = async (goalData) => {
    setError(null);
    try {
      const newGoal = await api.createGoal(goalData);
      setGoals(prev => [...prev, newGoal]);
    } catch (err) {
      setError(err.message || 'Failed to create goal');
      throw err;
    }
  };

  const modifyGoal = async (id, updates) => {
    setError(null);
    try {
      const updatedGoal = await api.updateGoal(id, updates);
      setGoals(prev =>
        prev.map(g => (g._id === id ? updatedGoal : g))
      );
    } catch (err) {
      setError(err.message || 'Failed to update goal');
      throw err;
    }
  };

  const deleteGoal = async (id) => {
    setError(null);
    let previousGoals;
    setGoals(prev => {
      previousGoals = prev;
      return prev.filter(g => g._id !== id);
    });
    // Unlink any associated tasks locally
    setTasks(prev =>
      prev.map(t => (t.goalId === id ? { ...t, goalId: null } : t))
    );
    try {
      await api.deleteGoal(id);
    } catch (err) {
      setError(err.message || 'Failed to delete goal');
      setGoals(previousGoals);
      await fetchData(); // Full rollback/sync
    }
  };

  return {
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
    modifyGoal,
    deleteGoal,
    refresh: fetchData,
  };
};

