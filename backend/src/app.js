const express = require('express');
const cors = require('cors');
const taskRoutes = require('./routes/taskRoutes');
const goalRoutes = require('./routes/goalRoutes');
const authRoutes = require('./routes/authRoutes');
const { protect } = require('./middleware/authMiddleware');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Enable CORS with explicit support for PATCH and standard headers
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON request bodies
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', protect, taskRoutes);
app.use('/api/goals', protect, goalRoutes);

// Simple Healthcheck/Welcome route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Focus API' });
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
