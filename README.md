# Debate Management API

RESTful API built with Node.js and Express to manage debate clubs, tournaments, dynamic matchmaking, and speaker statistics.

## Features

- **Role-Based Access Control:** Custom, highly secure middleware handling Admins, Club Owners, Judges, and standard Debaters.
- **Dynamic Matchmaking Pipeline:** waitlist registration and team formation. Transactional room generation.
- **Tabulation & Scoring:** Secure ballot submission system with data integrity checks.
- **Statistical Engine:** Native SQL aggregation to generate granular user dashboards (win rates, positional mastery, partner synergy).
- **Soft Deletion:** Safe data archiving to preserve historical tournament records without breaking foreign key constraints.

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MS SQL Server
- **ORM:** Sequelize
- **Security:** bcryptjs (password hashing), custom header-based authentication.

## Local Setup & Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/DmytroTarasenk0/Debate-API.git
   cd Debate-API
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Create a `.env` file in the root directory and add your MS SQL database credentials:

   ```env
   PORT = 3000
   DB_SERVER = Server_name
   DB_USER = user
   DB_PASSWORD = password
   DB_DATABASE = DB_name
   NODE_ENV = development
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```

## Authentication

Currently, the API utilises a custom header for stateless authentication.
For all protected routes, you must include the following in your request headers:

- `x-user-id: <user_id>`

> Note: Future iterations will probably migrate this to JWT.

## API Documentation

A full Postman collection containing all available endpoints, request bodies, and parameters is included in this repository.

- Navigate to the `postman/` folder and import the `debates.postman_collection.json` file into Postman.

### Core Domain Routes

- `/api/users` - User registration, profile management, and statistics.
- `/api/clubs` - Club and its Owners management.
- `/api/events` - Full Event pipeline, from forming teams and rooms to scoring. +Simple Update/Read/Delete
- `/api/admins/grant` - Simple route to grant Administrator status to another user.
