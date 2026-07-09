const API_BASE_URL = 'http://localhost:5000/api';

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
    // Global 401 logout redirect (only if not already on the login page)
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    throw new Error('Unauthorized session. Please log in.');
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
  getTasks: async (status = '') => {
    const url = status ? `${API_BASE_URL}/tasks?status=${status}` : `${API_BASE_URL}/tasks`;
    const response = await fetch(url, {
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
      method: 'PATCH',
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
      method: 'PATCH',
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
};
