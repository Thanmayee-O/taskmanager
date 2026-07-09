import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

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
      setTasks(fetchedTasks);
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
      await api.createTask(taskData);
      await fetchData(); // Reload to get fresh list and updated goal progress
    } catch (err) {
      setError(err.message || 'Failed to create task');
      throw err;
    }
  };

  const toggleTask = async (id, currentCompleted) => {
    setError(null);
    try {
      // Optimistic UI update for tasks (helps make it feel snappy)
      setTasks(prev =>
        prev.map(t => (t._id === id ? { ...t, completed: !currentCompleted } : t))
      );
      await api.updateTask(id, { completed: !currentCompleted });
      await fetchData(); // Sync state with server (re-sorts and updates goals counts)
    } catch (err) {
      setError(err.message || 'Failed to update task');
      await fetchData(); // Rollback
    }
  };

  const modifyTask = async (id, updates) => {
    setError(null);
    try {
      await api.updateTask(id, updates);
      await fetchData();
    } catch (err) {
      setError(err.message || 'Failed to edit task');
      throw err;
    }
  };

  const deleteTask = async (id) => {
    setError(null);
    try {
      // Optimistic delete
      setTasks(prev => prev.filter(t => t._id !== id));
      await api.deleteTask(id);
      await fetchData();
    } catch (err) {
      setError(err.message || 'Failed to delete task');
      await fetchData();
    }
  };

  // Goals actions
  const addGoal = async (goalData) => {
    setError(null);
    try {
      await api.createGoal(goalData);
      await fetchData();
    } catch (err) {
      setError(err.message || 'Failed to create goal');
      throw err;
    }
  };

  const modifyGoal = async (id, updates) => {
    setError(null);
    try {
      await api.updateGoal(id, updates);
      await fetchData();
    } catch (err) {
      setError(err.message || 'Failed to update goal');
      throw err;
    }
  };

  const deleteGoal = async (id) => {
    setError(null);
    try {
      await api.deleteGoal(id);
      await fetchData();
    } catch (err) {
      setError(err.message || 'Failed to delete goal');
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
