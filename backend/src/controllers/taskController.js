const Task = require('../models/Task');

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = { userId: req.userId };

    if (status === 'active') {
      query.completed = false;
    } else if (status === 'completed') {
      query.completed = true;
    }

    const tasks = await Task.find(query);

    // Sort tasks in JavaScript:
    // 1. Uncompleted tasks first, completed tasks last.
    // 2. For tasks in the same completion status, sort by due date ascending (soonest first).
    // 3. Null due dates go to the bottom of their respective completion group.
    // 4. Default fallback to newest created first.
    tasks.sort((a, b) => {
      // Completed status grouping
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      // Due date sorting
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;

      // Fallback to newest created first
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res, next) => {
  try {
    const { title, completed, dueDate, priority, tags, goalId } = req.body;

    if (!title || title.trim() === '') {
      res.status(400);
      throw new Error('Task title is required');
    }

    const task = await Task.create({
      title,
      completed,
      dueDate: dueDate || null,
      priority,
      tags,
      goalId: goalId || null,
      userId: req.userId, // associate task with logged in user
    });

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a task
// @route   PATCH /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res, next) => {
  try {
    let task = await Task.findOne({ _id: req.params.id, userId: req.userId });

    if (!task) {
      res.status(404);
      throw new Error(`Task not found with id of ${req.params.id}`);
    }

    // Prepare fields for updates. Ensure null conversions if field is cleared.
    const updates = { ...req.body };
    if (updates.dueDate === '') updates.dueDate = null;
    if (updates.goalId === '') updates.goalId = null;

    task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId });

    if (!task) {
      res.status(404);
      throw new Error(`Task not found with id of ${req.params.id}`);
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
