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
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'completed'

  // Fetch all tasks, goals, and categories from API
  const fetchData = useCallback(async () => {
    if (!localStorage.getItem('token')) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [fetchedTasks, fetchedGoals, fetchedCategories] = await Promise.all([
        api.getTasks(''),
        api.getGoals(),
        api.getCategories().catch(err => {
          console.warn('Backend categories endpoint not fully ready or failing. Defaulting to empty.', err);
          return [];
        })
      ]);
      setTasks(sortTasks(fetchedTasks));
      setGoals(fetchedGoals);
      setCategories(fetchedCategories || []);
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

  const addCategory = async (catData) => {
    setError(null);
    try {
      const newCategory = await api.createCategory(catData);
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      setError(err.message || 'Failed to create category');
      throw err;
    }
  };

  const modifyCategory = async (id, catData) => {
    setError(null);
    try {
      const updatedCategory = await api.updateCategory(id, catData);
      setCategories(prev => prev.map(c => (c._id === id ? updatedCategory : c)));
      
      // Update tasks locally that were assigned to the old category name, if name changed
      if (catData.name) {
        const oldCat = categories.find(c => c._id === id);
        if (oldCat && oldCat.name !== catData.name) {
          setTasks(prev =>
            prev.map(t => (t.category === oldCat.name ? { ...t, category: catData.name } : t))
          );
        }
      }
      return updatedCategory;
    } catch (err) {
      setError(err.message || 'Failed to update category');
      throw err;
    }
  };

  const deleteCategory = async (id) => {
    setError(null);
    const catToDelete = categories.find(c => c._id === id);
    if (!catToDelete) return;
    
    let previousCategories = categories;
    setCategories(prev => prev.filter(c => c._id !== id));
    
    // Set all tasks using this custom category back to 'Other'
    setTasks(prev =>
      prev.map(t => (t.category === catToDelete.name ? { ...t, category: 'Other' } : t))
    );
    
    try {
      await api.deleteCategory(id);
    } catch (err) {
      setError(err.message || 'Failed to delete category');
      setCategories(previousCategories);
      await fetchData();
    }
  };

  return {
    tasks,
    goals,
    categories,
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
    addCategory,
    modifyCategory,
    deleteCategory,
    refresh: fetchData,
  };
};

