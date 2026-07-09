const Goal = require('../models/Goal');
const Task = require('../models/Task');

// @desc    Get all goals (including computed progress)
// @route   GET /api/goals
// @access  Private
exports.getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ userId: req.userId });

    // Dynamically calculate task counts for each goal
    const goalsWithProgress = await Promise.all(
      goals.map(async (goal) => {
        const totalTasks = await Task.countDocuments({ goalId: goal._id, userId: req.userId });
        const completedTasks = await Task.countDocuments({ goalId: goal._id, completed: true, userId: req.userId });
        return {
          ...goal.toObject(),
          totalTasks,
          completedTasks,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: goalsWithProgress.length,
      data: goalsWithProgress,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new goal
// @route   POST /api/goals
// @access  Private
exports.createGoal = async (req, res, next) => {
  try {
    const { title, period } = req.body;

    if (!title || title.trim() === '') {
      res.status(400);
      throw new Error('Goal title is required');
    }

    if (!period || !['week', 'month'].includes(period)) {
      res.status(400);
      throw new Error('Goal period must be either "week" or "month"');
    }

    const goal = await Goal.create({
      title,
      period,
      userId: req.userId,
    });

    res.status(201).json({
      success: true,
      data: {
        ...goal.toObject(),
        totalTasks: 0,
        completedTasks: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a goal
// @route   PATCH /api/goals/:id
// @access  Private
exports.updateGoal = async (req, res, next) => {
  try {
    let goal = await Goal.findOne({ _id: req.params.id, userId: req.userId });

    if (!goal) {
      res.status(404);
      throw new Error(`Goal not found with id of ${req.params.id}`);
    }

    const { title, period } = req.body;
    if (period && !['week', 'month'].includes(period)) {
      res.status(400);
      throw new Error('Goal period must be either "week" or "month"');
    }

    goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    // Compute progress for response
    const totalTasks = await Task.countDocuments({ goalId: goal._id, userId: req.userId });
    const completedTasks = await Task.countDocuments({ goalId: goal._id, completed: true, userId: req.userId });

    res.status(200).json({
      success: true,
      data: {
        ...goal.toObject(),
        totalTasks,
        completedTasks,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a goal
// @route   DELETE /api/goals/:id
// @access  Private
exports.deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.userId });

    if (!goal) {
      res.status(404);
      throw new Error(`Goal not found with id of ${req.params.id}`);
    }

    // Unlink any associated tasks first
    await Task.updateMany({ goalId: req.params.id, userId: req.userId }, { goalId: null });

    // Delete the goal itself
    await goal.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
