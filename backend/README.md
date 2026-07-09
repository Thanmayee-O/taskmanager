# Focus Backend

Node.js + Express REST API for Focus Personal Task Manager.

## Endpoints

```
GET    /api/tasks          # List tasks (supports ?status=active|completed)
POST   /api/tasks          # Create task
PATCH  /api/tasks/:id      # Update task (title, completed, dueDate, priority, tags, goalId)
DELETE /api/tasks/:id      # Delete task

GET    /api/goals          # List goals with computed progress counts
POST   /api/goals          # Create goal
PATCH  /api/goals/:id      # Update goal
DELETE /api/goals/:id      # Delete goal
```

## Running the API

1. Configure variables in `.env`
2. Install dependencies: `npm install`
3. Run dev server: `npm run dev` (Runs on Port 5000)
