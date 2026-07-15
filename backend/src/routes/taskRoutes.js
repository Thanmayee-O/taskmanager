import express from 'express';
const router = express.Router();
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  parseTaskText,
  getTaskAnalytics,
} from '../controllers/taskController.js';

router.route('/')
  .get(getTasks)
  .post(createTask);

router.post('/parse', parseTaskText);
router.get('/analytics', getTaskAnalytics);

router.route('/:id')
  .patch(updateTask)
  .put(updateTask)
  .delete(deleteTask);

export default router;
