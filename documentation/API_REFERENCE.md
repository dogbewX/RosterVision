# API Reference

**Base URL (Production):** `https://fd-dashboard-web.onrender.com`
**Base URL (Local):** `http://localhost:3000`

## 1. Authentication

### Register
- **Endpoint:** `POST /api/auth/register`
- **Body:**
  ```json
  { "username": "string", "email": "string", "password": "string" }
  ```
- **Response:** User object + Success Message.

### Login
- **Endpoint:** `POST /api/auth/login`
- **Body:**
  ```json
  { "username": "string", "password": "string" }
  ```
- **Response:**
  ```json
  { "user": { "id": 1, "username": "...", "type": "Normal|Admin" }, "message": "Logged in" }
  ```

---

## 2. Players

### Get Players
Retrieves player list for a specific week.
- **Endpoint:** `GET /api/players`
- **Query Params:**
  - `year` (optional): Default to current year.
  - `week` (optional): Default to latest available week.
- **Response:**
  ```json
  {
      "meta": { "year": 2025, "week": 16 },
      "data": [ { "Id": "...", "First_Name": "...", "Salary": 5000, "FPPG": 15.5, ... } ]
  }
  ```

### Import Players (Admin Only)
Uploads CSV data.
- **Endpoint:** `POST /api/players/import`
- **Body:**
  ```json
  {
      "players": [ ... ],
      "year": 2025,
      "week": 16,
      "overwrite": true
  }
  ```

---

## 3. Rosters

### Get Latest Roster
Fetches the user's most recent roster for the current week.
- **Endpoint:** `GET /api/rosters/latest/:userId`
- **Response:** Array of player objects with an additional `isFlex` boolean property.

### Get All Rosters
- **Endpoint:** `GET /api/rosters/:userId`
- **Response:** List of roster summaries (ID, name, week).

### Save Roster
- **Endpoint:** `POST /api/rosters`
- **Body:**
  ```json
  {
      "userId": 1,
      "entries": [ { "playerId": "...", "slotType": "QB" } ],
      "name": "My Roster"
  }
  ```
