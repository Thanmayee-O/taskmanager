import express from 'express';
import cors from 'cors';
import taskRoutes from './routes/taskRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { protect } from './middleware/authMiddleware.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Enable CORS with explicit support for PATCH and standard headers
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle pre-flight requests globally

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

export default app;
