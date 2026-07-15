import Task from '../models/Task.js';
import Goal from '../models/Goal.js';

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res, next) => {
  try {
    const { status, category, priority, goalId, search, sortBy } = req.query;
    let query = { userId: req.userId };

    // Status Filter
    if (status === 'active') {
      query.completed = false;
    } else if (status === 'completed') {
      query.completed = true;
    }

    // Category Filter
    if (category) {
      query.category = category;
    }

    // Priority Filter
    if (priority) {
      query.priority = priority;
    }

    // Goal Filter
    if (goalId) {
      if (goalId === 'none' || goalId === 'null') {
        query.goalId = null;
      } else {
        query.goalId = goalId;
      }
    }

    // Search keyword match
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { category: searchRegex },
        { tags: { $in: [searchRegex] } }
      ];
    }

    const tasks = await Task.find(query);

    // Sorting in memory to match complex requirements and keep existing sort behavior
    tasks.sort((a, b) => {
      // Apply primary sort criteria if requested
      if (sortBy) {
        switch (sortBy) {
          case 'dueDate': {
            if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);
            if (a.dueDate) return -1;
            if (b.dueDate) return 1;
            break;
          }
          case 'priority': {
            const priorityWeight = { high: 3, medium: 2, low: 1 };
            const weightA = priorityWeight[a.priority] || 2;
            const weightB = priorityWeight[b.priority] || 2;
            if (weightA !== weightB) return weightB - weightA; // higher weight first
            break;
          }
          case 'newest': {
            return new Date(b.createdAt) - new Date(a.createdAt);
          }
          case 'oldest': {
            return new Date(a.createdAt) - new Date(b.createdAt);
          }
          case 'alphabetical': {
            return a.title.localeCompare(b.title);
          }
          case 'completedFirst': {
            if (a.completed !== b.completed) return a.completed ? -1 : 1;
            break;
          }
          case 'pendingFirst': {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            break;
          }
        }
      }

      // Default sorting fallback:
      // 1. Uncompleted tasks first, completed tasks last.
      // 2. For tasks in the same completion status, sort by due date ascending (soonest first).
      // 3. Null due dates go to the bottom of their respective completion group.
      // 4. Default fallback to newest created first.
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;

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
export const createTask = async (req, res, next) => {
  try {
    const { title, completed, dueDate, priority, tags, goalId, category } = req.body;

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
      category: category || 'Other',
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
export const updateTask = async (req, res, next) => {
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
export const deleteTask = async (req, res, next) => {
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

// @desc    Parse raw task text with Gemini AI
// @route   POST /api/tasks/parse
// @access  Private
export const parseTaskText = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ success: false, message: 'Text to parse is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not configured in backend .env. Triggering fallback.');
      return res.status(200).json({
        success: true,
        fallback: true,
        data: null,
        message: 'Gemini API key not configured. Fall back to local regex parser.'
      });
    }

    const currentLocalTime = new Date().toISOString();
    const prompt = `Parse the following task into JSON: "${text}". Reference current time is: ${currentLocalTime} (UTC).`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: {
                title: {
                  type: 'STRING',
                  description: 'Cleaned task title without date, priority, or tags.'
                },
                dueDate: {
                  type: 'STRING',
                  description: 'ISO-8601 string format (e.g. YYYY-MM-DDTHH:mm:ss.sssZ) in UTC, or null if not specified. Calculate relative to the reference time.'
                },
                priority: {
                  type: 'STRING',
                  enum: ['low', 'medium', 'high'],
                  description: 'low, medium, or high. Default to medium if not specified.'
                },
                category: {
                  type: 'STRING',
                  enum: ['Health', 'Office / Work', 'Personal', 'Study', 'Finance', 'Fitness', 'Shopping', 'Home', 'Travel', 'Other'],
                  description: 'The category this task fits best. Choose from: Health, Office / Work, Personal, Study, Finance, Fitness, Shopping, Home, Travel, Other.'
                },
                tags: {
                  type: 'ARRAY',
                  items: {
                    type: 'STRING'
                  },
                  description: 'Array of tags found, without the hash (#) symbol.'
                }
              },
              required: ['title', 'priority', 'tags', 'category']
            }
          }
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`Gemini API call failed with status ${response.status}: ${errText}. Triggering fallback.`);
      return res.status(200).json({
        success: true,
        fallback: true,
        data: null,
        message: `Gemini API returned error status ${response.status}. Fall back to local regex parser.`
      });
    }

    const responseData = await response.json();
    const candidate = responseData?.candidates?.[0];
    const textResponse = candidate?.content?.parts?.[0]?.text;

    if (!textResponse) {
      console.warn('Gemini API returned an empty content candidates array. Triggering fallback.');
      return res.status(200).json({
        success: true,
        fallback: true,
        data: null,
        message: 'Empty Gemini API response content. Fall back to local regex parser.'
      });
    }

    const parsed = JSON.parse(textResponse);
    return res.status(200).json({
      success: true,
      fallback: false,
      data: {
        title: parsed.title || text.trim(),
        dueDate: parsed.dueDate || null,
        priority: parsed.priority || 'medium',
        category: parsed.category || 'Other',
        tags: parsed.tags || [],
      }
    });

  } catch (error) {
    console.error('Error during AI task parsing:', error);
    // Return clean fallback instead of crashing
    return res.status(200).json({
      success: true,
      fallback: true,
      data: null,
      message: error.message || 'Error occurred during AI task parsing. Fall back to local regex parser.'
    });
  }
};

// @desc    Get detailed task analytics and progress statistics
// @route   GET /api/tasks/analytics
// @access  Private
export const getTaskAnalytics = async (req, res, next) => {
  try {
    const userId = req.userId;

    // Fetch all user tasks and goals
    const [tasks, goals] = await Promise.all([
      Task.find({ userId }),
      Goal.find({ userId })
    ]);

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;

    // 1. Overall Completion %
    const overallCompletion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Determine current week dates (Monday to Sunday)
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = now.getDay() || 7; // Monday is 1, Sunday is 7
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(now.getDate() - day + 1); // Set to Monday

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Determine current month dates
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Determine today's bounds (local relative)
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    // 2. Weekly Completion % (based on tasks due this week OR linked to weekly goals)
    const weeklyGoalIds = goals.filter(g => g.period === 'week').map(g => String(g._id));
    const weeklyTasks = tasks.filter(t => {
      const isDueThisWeek = t.dueDate && new Date(t.dueDate) >= startOfWeek && new Date(t.dueDate) <= endOfWeek;
      const isLinkedToWeeklyGoal = t.goalId && weeklyGoalIds.includes(String(t.goalId));
      return isDueThisWeek || isLinkedToWeeklyGoal;
    });
    const totalWeeklyTasks = weeklyTasks.length;
    const completedWeeklyTasks = weeklyTasks.filter(t => t.completed).length;
    const weeklyCompletion = totalWeeklyTasks > 0 ? Math.round((completedWeeklyTasks / totalWeeklyTasks) * 100) : 0;

    // 3. Monthly Completion % (based on tasks due this month OR linked to monthly goals)
    const monthlyGoalIds = goals.filter(g => g.period === 'month').map(g => String(g._id));
    const monthlyTasks = tasks.filter(t => {
      const isDueThisMonth = t.dueDate && new Date(t.dueDate) >= startOfMonth && new Date(t.dueDate) <= endOfMonth;
      const isLinkedToMonthlyGoal = t.goalId && monthlyGoalIds.includes(String(t.goalId));
      return isDueThisMonth || isLinkedToMonthlyGoal;
    });
    const totalMonthlyTasks = monthlyTasks.length;
    const completedMonthlyTasks = monthlyTasks.filter(t => t.completed).length;
    const monthlyCompletion = totalMonthlyTasks > 0 ? Math.round((completedMonthlyTasks / totalMonthlyTasks) * 100) : 0;

    // 4. Completed Today & Remaining Count
    const completedTodayCount = tasks.filter(t => t.completed && t.updatedAt && new Date(t.updatedAt) >= startOfToday && new Date(t.updatedAt) <= endOfToday).length;
    const remainingCount = tasks.filter(t => !t.completed).length;

    // 5. Category-wise breakdown
    const categories = ['Health', 'Office / Work', 'Personal', 'Study', 'Finance', 'Fitness', 'Shopping', 'Home', 'Travel', 'Other'];
    const categoryBreakdown = categories.map(cat => {
      const catTasks = tasks.filter(t => t.category === cat);
      const total = catTasks.length;
      const completed = catTasks.filter(t => t.completed).length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        category: cat,
        total,
        completed,
        percentage
      };
    });

    // 6. Notifications counts
    const todayTasks = tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) >= startOfToday && new Date(t.dueDate) <= endOfToday);
    const overdueTasks = tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < startOfToday);
    const highPriorityTasks = tasks.filter(t => !t.completed && t.priority === 'high');

    res.status(200).json({
      success: true,
      data: {
        overallCompletion,
        weeklyCompletion,
        monthlyCompletion,
        completedTodayCount,
        remainingCount,
        categoryBreakdown,
        notifications: {
          dueTodayCount: todayTasks.length,
          overdueCount: overdueTasks.length,
          highPriorityCount: highPriorityTasks.length,
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

