# Task Management API

A task management system built with Node.js, Express, and SQLite. This application includes user authentication with JWT, role-based access control, and task CRUD operations.

## Features

- User Registration and Authentication
- Role-Based Access Control (Admin and User roles)
- Task Creation, Update, Deletion, and Retrieval
- Task Filtering by Priority, Status, and Assigned User

## Technologies Used

- Node.js
- Express.js
- SQLite
- JWT (JSON Web Token) for Authentication
- Bcrypt.js for Password Hashing

## Installation
Clone the Repository
- git clone https://github.com/yourusername/task-management-api.git
- cd task-management-api

1.Install Dependencies
- npm install
2.Run the Server
- npm install nodemon -g
- nodemon server.js

The server will start on http://localhost:3002.

API Endpoints
User Registration
URL: /register

Method: POST
Description: Register a new user.

Content-Type: application/json
{
  "username": "aditya",
  "password": "password123",
  "role": "user"
}

User Login
URL: /login

Method: POST
Description: Log in a user and receive a JWT token.

Content-Type: application/json
{
  "username": "aditya",
  "password": "password123"
}

Get User Details
URL: /getDetails

Method: GET
Description: Get the details of all users.

Headers:
Authorization: Bearer <JWT_TOKEN>

Create Task
URL: /tasks

Method: POST
Description: Create a new task (admin only).

Headers:
Authorization: Bearer <JWT_TOKEN>

{
  "title": "Complete project",
  "description": "Finalize all project details",
  "priority": "high",
  "status": "pending",
  "assigned_user": "aditya"
}

Update Task
URL: /tasks/:id

Method: PUT
Description: Update an existing task (admin only).

Headers:
Authorization: Bearer <JWT_TOKEN>

Copy code
{
  "title": "Complete project",
  "description": "Finalize all project details",
  "priority": "high",
  "status": "in-progress",
  "assigned_user": "aditya"
}

Delete Task
URL: /tasks/:id

Method: DELETE
Description: Delete a task (admin only).

Headers:
Authorization: Bearer <JWT_TOKEN>

Get Task Details with Filters
URL: /taskDetails

Method: GET
Description: Retrieve tasks with optional filters for priority, status, and assigned user.

Headers:
Authorization: Bearer <JWT_TOKEN>

Query Parameters:
priority: Filter by priority (optional)
status: Filter by status (optional)
assigned_user: Filter by assigned user (optional)
