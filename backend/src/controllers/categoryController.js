import Category from '../models/Category.js';
import Task from '../models/Task.js';

// @desc    Get all custom categories
// @route   GET /api/categories
// @access  Private
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ userId: req.userId });
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a custom category
// @route   POST /api/categories
// @access  Private
export const createCategory = async (req, res, next) => {
  try {
    const { name, icon, color } = req.body;

    if (!name || name.trim() === '') {
      res.status(400);
      throw new Error('Category name is required');
    }
    if (!icon) {
      res.status(400);
      throw new Error('Category icon is required');
    }
    if (!color) {
      res.status(400);
      throw new Error('Category color is required');
    }

    // Check if category name is one of the protected defaults
    const defaults = ['Work / Office', 'Personal', 'Health', 'Study'];
    if (defaults.some(d => d.toLowerCase() === name.trim().toLowerCase())) {
      res.status(400);
      throw new Error(`"${name.trim()}" is a default category and cannot be created as a custom category.`);
    }

    // Check for duplicate custom category name
    const existing = await Category.findOne({ userId: req.userId, name: new RegExp(`^${name.trim()}$`, 'i') });
    if (existing) {
      res.status(400);
      throw new Error(`Category "${name.trim()}" already exists.`);
    }

    const category = await Category.create({
      name: name.trim(),
      icon,
      color,
      userId: req.userId,
    });

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a custom category
// @route   PATCH /api/categories/:id
// @access  Private
export const updateCategory = async (req, res, next) => {
  try {
    const { name, icon, color } = req.body;
    let category = await Category.findOne({ _id: req.params.id, userId: req.userId });

    if (!category) {
      res.status(404);
      throw new Error(`Category not found with id of ${req.params.id}`);
    }

    const oldName = category.name;

    // Check if new name matches protected default category
    const defaults = ['Work / Office', 'Personal', 'Health', 'Study'];
    if (name && defaults.some(d => d.toLowerCase() === name.trim().toLowerCase())) {
      res.status(400);
      throw new Error(`Cannot rename category to default "${name.trim()}"`);
    }

    // Check for duplicate name if renaming
    if (name && name.trim().toLowerCase() !== oldName.toLowerCase()) {
      const existing = await Category.findOne({ userId: req.userId, name: new RegExp(`^${name.trim()}$`, 'i') });
      if (existing) {
        res.status(400);
        throw new Error(`Category "${name.trim()}" already exists.`);
      }
    }

    // Update category
    category.name = name ? name.trim() : category.name;
    category.icon = icon || category.icon;
    category.color = color || category.color;

    await category.save();

    // If renamed, update all associated tasks category label
    if (name && name.trim() !== oldName) {
      await Task.updateMany(
        { userId: req.userId, category: oldName },
        { category: name.trim() }
      );
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a custom category
// @route   DELETE /api/categories/:id
// @access  Private
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, userId: req.userId });

    if (!category) {
      res.status(404);
      throw new Error(`Category not found with id of ${req.params.id}`);
    }

    const catName = category.name;

    // Delete custom category
    await category.deleteOne();

    // Reset tasks assigned to this category back to 'Other'
    await Task.updateMany(
      { userId: req.userId, category: catName },
      { category: 'Other' }
    );

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
