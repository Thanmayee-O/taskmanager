import express from 'express';
const router = express.Router();
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';

router.route('/')
  .get(getCategories)
  .post(createCategory);

router.route('/:id')
  .patch(updateCategory)
  .delete(deleteCategory);

export default router;
