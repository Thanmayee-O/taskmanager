const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const getHeaders = (customToken) => {
  const token = customToken || localStorage.getItem('token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  if (response.status === 401) {
    localStorage.removeItem('token');
    
    let message = 'Unauthorized session. Please log in.';
    try {
      const errorData = await response.json();
      if (errorData && errorData.message) {
        message = errorData.message;
      }
    } catch (e) {
      // Fallback if response does not contain json
    }

    // Global 401 logout redirect (only if not already on the login page)
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    throw new Error(message);
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.message || `HTTP error! status: ${response.status}`;
    throw new Error(message);
  }
  
  return response.json();
};

export const api = {
  // Authentication
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    return handleResponse(response); // returns { success, token, data }
  },

  signup: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return handleResponse(response); // returns { success, token, data }
  },

  getMe: async (customToken) => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: getHeaders(customToken),
    });
    const result = await handleResponse(response);
    return result.data;
  },

  // Tasks
  getTasks: async (params = {}) => {
    let url = `${API_BASE_URL}/tasks`;
    if (typeof params === 'string') {
      if (params) url += `?status=${params}`;
    } else if (params && typeof params === 'object') {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, val);
        }
      });
      const queryString = query.toString();
      if (queryString) url += `?${queryString}`;
    }
    const response = await fetch(url, {
      headers: getHeaders(),
    });
    const result = await handleResponse(response);
    return result.data;
  },

  getTaskAnalytics: async () => {
    const response = await fetch(`${API_BASE_URL}/tasks/analytics`, {
      headers: getHeaders(),
    });
    const result = await handleResponse(response);
    return result.data;
  },

  createTask: async (taskData) => {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        ...getHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });
    const result = await handleResponse(response);
    return result.data;
  },

  updateTask: async (id, taskData) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: {
        ...getHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });
    const result = await handleResponse(response);
    return result.data;
  },

  deleteTask: async (id) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const result = await handleResponse(response);
    return result.data;
  },

  parseTaskWithAI: async (text) => {
    const response = await fetch(`${API_BASE_URL}/tasks/parse`, {
      method: 'POST',
      headers: {
        ...getHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
    return handleResponse(response);
  },

  // Goals
  getGoals: async () => {
    const response = await fetch(`${API_BASE_URL}/goals`, {
      headers: getHeaders(),
    });
    const result = await handleResponse(response);
    return result.data;
  },

  createGoal: async (goalData) => {
    const response = await fetch(`${API_BASE_URL}/goals`, {
      method: 'POST',
      headers: {
        ...getHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(goalData),
    });
    const result = await handleResponse(response);
    return result.data;
  },

  updateGoal: async (id, goalData) => {
    const response = await fetch(`${API_BASE_URL}/goals/${id}`, {
      method: 'PUT',
      headers: {
        ...getHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(goalData),
    });
    const result = await handleResponse(response);
    return result.data;
  },

  deleteGoal: async (id) => {
    const response = await fetch(`${API_BASE_URL}/goals/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const result = await handleResponse(response);
    return result.data;
  },

  getCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      headers: getHeaders(),
    });
    const result = await handleResponse(response);
    return result.data;
  },

  createCategory: async (categoryData) => {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: {
        ...getHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    });
    const result = await handleResponse(response);
    return result.data;
  },

  updateCategory: async (id, categoryData) => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PATCH',
      headers: {
        ...getHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    });
    const result = await handleResponse(response);
    return result.data;
  },

  deleteCategory: async (id) => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const result = await handleResponse(response);
    return result.data;
  },
};
