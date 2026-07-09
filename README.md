# Focus — Personal Task Manager

Focus is a clean, minimal, single-user productivity tool designed for fast task capture, weekly/monthly goal alignment, and immediate clarity on what to do next.

## Technology Stack

- **Frontend:** React (Vite), Tailwind CSS (v3), PostCSS
- **Backend:** Node.js + Express
- **Database:** MongoDB (via Mongoose)
- **Architecture:** Two separate folders (`frontend/` and `backend/`) communicating over a REST API.

---

## Getting Started

### Prerequisites

You need the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) (either running locally or a MongoDB Atlas connection string)

---

### Step 1: Clone and Set Up the Database

Make sure your MongoDB server is running. 

- **Local MongoDB (Default):** The application connects to `mongodb://127.0.0.1:27017/focus` by default. Ensure the MongoDB service is active.
  - On Windows: Run `net start MongoDB` or verify the service is running in Windows Services.
  - On macOS/Linux: Run `brew services start mongodb-community` or `sudo systemctl start mongod`.

---

### Step 2: Set Up and Run the Backend

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create your `.env` file (a `.env.example` has been provided for reference):
   ```bash
   cp .env.example .env
   ```
   *Note: If your local MongoDB port is default, the configuration `MONGODB_URI=mongodb://127.0.0.1:27017/focus` will work out of the box.*
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the backend server in development mode (runs on port **5000**):
   ```bash
   npm run dev
   ```

---

### Step 3: Set Up and Run the Frontend

1. Open a new terminal window and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server (runs on port **5173**):
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173` to start using Focus.

---

## Features Implemented

1. **Fast Capture Input**: Prominent task capture bar. Write your task and press **Enter** to submit instantly.
2. **Weekly & Monthly Goals**: Create target focus banners. View active goal progress bars reflecting linked tasks (e.g., "2 of 5 done").
3. **Due Dates and Overdue Flags**: Assign due dates. Tasks are sorted soonest-due-first, and overdue tasks that are incomplete are highlighted with an active red overdue tag.
4. **State Filtering**: Quickly toggle between **All**, **Active**, and **Completed** filters with live item counts.
5. **Inline Editing**: Click a task's title to edit it in place. Saves automatically on **Enter** or **Blur**, and cancels on **Esc**.
6. **Priorities and Tags**: Set task priority (Low, Medium, High) with distinct colored badges and associate custom comma-separated tags.
7. **Clean REST API**: Well-structured Node/Express backend with validation checks and error handling middleware.
