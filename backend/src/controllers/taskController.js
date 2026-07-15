import Task from '../models/Task.js';

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res, next) => {
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
export const createTask = async (req, res, next) => {
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
                tags: {
                  type: 'ARRAY',
                  items: {
                    type: 'STRING'
                  },
                  description: 'Array of tags found, without the hash (#) symbol.'
                }
              },
              required: ['title', 'priority', 'tags']
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

