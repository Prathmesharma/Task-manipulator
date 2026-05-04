# Team Task Manager

A full-stack Team Task Manager application built with Node.js, Express, MongoDB, and vanilla HTML/CSS/JS. The application features user authentication, role-based access control (Admin/Member), and project/task management capabilities.

## Features

*   **User Authentication**: Secure login and registration using JWT and bcrypt.
*   **Role-Based Access Control**:
    *   **Admin**: Can manage projects, assign tasks, and oversee team progress.
    *   **Member**: Can view assigned tasks and update their status.
*   **Project Management**: Create and manage different projects.
*   **Task Management**: Create tasks, assign them to members, set deadlines, and track status.
*   **Responsive UI**: Vanilla HTML/CSS/JS frontend for a fast and lightweight experience.

## Tech Stack

*   **Frontend**: HTML, CSS, JavaScript (Vanilla)
*   **Backend**: Node.js, Express.js
*   **Database**: MongoDB (Mongoose)
*   **Authentication**: JSON Web Tokens (JWT)

## Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/) installed
*   A [MongoDB](https://www.mongodb.com/) URI (either local or MongoDB Atlas)

### Installation

1.  **Clone the repository** (if applicable) or navigate to the project directory:
    ```bash
    cd team-task-manager
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Variables**:
    Create a `.env` file in the root of your project and add the following variables:
    ```env
    PORT=3000
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    ```
    *Replace `your_mongodb_connection_string` and `your_jwt_secret_key` with your actual values.*

### Running the Application

*   **Development Mode** (uses nodemon for auto-restarting):
    ```bash
    npm run dev
    ```
*   **Production Mode**:
    ```bash
    npm start
    ```

The application will be accessible at `http://localhost:3000` (or whatever port you specified in `.env`).

## Deployment (Railway)

This project is structured for easy deployment on [Railway](https://railway.app/).

1.  Create a new project on Railway.
2.  Add a MongoDB database service.
3.  Add a Web service linked to this GitHub repository (or deploy via CLI).
4.  In the Web service settings, configure the environment variables (`MONGODB_URI`, `JWT_SECRET`). Railway will handle the `PORT`.
5.  Railway will automatically detect the `start` script in `package.json` and deploy your app.
