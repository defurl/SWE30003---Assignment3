# LC-PMS Developer README

This document provides the technical setup and architectural workflow for the Long Chau Pharmacy Management System.

## 1. Tech Stack

* **Frontend:** ReactJS (Vite), Tailwind CSS, React Router
* **Backend:** Node.js, ExpressJS
* **Database:** MySQL
* **Authentication:** JWT with bcrypt hashing

## 2. Local Development Setup

### Step 1: Database Setup

1.  **Start Services:** Launch XAMPP and start the Apache & MySQL services.
2.  **Create Database:** In phpMyAdmin, create a new database named `longchau_db`.
3.  **Import Schema:** Select `longchau_db`, go to the "Import" tab, and import `schema.sql`.
4.  **Seed Data:** Go to the "SQL" tab and execute the `seed.sql` script to populate tables.

### Step 2: Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Configure environment variables in a `.env` file:**
    ```
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=
    DB_NAME=longchau_db
    JWT_SECRET=your_super_secret_key_for_jwt_tokens
    ```
4.  **Start the server:**
    ```bash
    node server.js
    ```
    The backend will run on `http://localhost:5000`.

### Step 3: Frontend Setup

1.  **In a new terminal, navigate to the frontend directory:**
    ```bash
    cd frontend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The frontend will run on `http://localhost:5173`.

## 3. Test Accounts

All test accounts use the password: `password123`

| Role           | Username    |
| :------------- | :---------- |
| Customer       | customer    |
| Pharmacist     | pharmacist  |
| Cashier        | cashier     |
| Branch Manager | manager     |
| Warehouse      | warehouse   |

## 4. Architectural & Data Workflow

The application operates on a decoupled client-server model. The flow for any given feature follows this sequence:

1.  **View (React Component):** A user interaction triggers an event handler within a component (e.g., `handleSubmit` in `LoginPage.jsx`).
2.  **API Client (`apiClient.js`):** The event handler calls a corresponding function in the `apiClient`. This client is the sole point of contact with the backend. It constructs the `fetch` request, sets the appropriate `Content-Type` header, and attaches the JWT from `localStorage` to the `Authorization` header for protected routes.
3.  **Server Entry & Routing (Express):** The Express server receives the HTTP request. Based on the URL prefix (e.g., `/api/auth`), `server.js` passes the request to the relevant router (e.g., `authRoutes.js`).
4.  **Middleware (`authMiddleware.js`):** If the route is protected, the `protect` middleware is executed first. It verifies the JWT. If the token is valid, it decodes the payload (containing `id` and `role`) and attaches it to the `req.user` object. If invalid, it terminates the request with a `401 Unauthorized` error.
5.  **Controller (`*Controller.js`):** The router calls the appropriate controller function. The controller is the core of the business logic. It destructures necessary data from `req.body` or `req.params` and uses the `req.user` object for authorization checks (e.g., `if (req.user.role !== 'pharmacist')`).
6.  **Database Query (`db.js`):** The controller function uses the promise-wrapped `db` connection pool to execute SQL queries. All queries use prepared statements (e.g., `WHERE id = ?`) to prevent SQL injection.
7.  **Response:** The controller sends a JSON response back to the client with either the requested data (`status 200 OK`) or a descriptive error message (`status 400, 401, 403, 404, 500`).
8.  **State Update (React Context/State):** The `apiClient` receives the response. The original component then uses this data to update its state via `useState` or a context function like `login()`. This state change triggers a re-render of the UI, displaying the new data or view to the user.
