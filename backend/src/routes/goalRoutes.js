import express from 'express';
const router = express.Router();
import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
} from '../controllers/goalController.js';

router.route('/')
  .get(getGoals)
  .post(createGoal);

router.route('/:id')
  .patch(updateGoal)
  .put(updateGoal)
  .delete(deleteGoal);

export default router;
