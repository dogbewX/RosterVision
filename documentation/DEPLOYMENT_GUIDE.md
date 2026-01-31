# Deployment Guide (PostgreSQL + NodeJS)

To publish your database and web app to the internet, we recommend using **Render.com** (easiest) or **Railway.app**. Both support PostgreSQL and Node.js out of the box.

## 1. Prepare your Code
Open your `package.json` and ensure you have a `start` script.
**Add this line** to the "scripts" section if it's missing:
```json
"scripts": {
  "start": "node server/index.js",
  "build": "vite build",
  ...
}
```
*Note: The platform will run `npm install`, then `npm run build`, then `npm start`.*

## 2. Push to GitHub
Make sure your latest code is pushed to your GitHub repository.

## 3. Create Database (Render.com)
1.  Sign up/Log in to [Render](https://render.com).
2.  Click **New +** -> **PostgreSQL**.
3.  Name: `fd_dashboard_db` (Must use underscores, NO hyphens).
4.  Region: `Ohio (US East)` (or closest to you).
5.  Plan: **Free** (for hobby use).
6.  Click **Create Database**.
7.  **Copy the "Internal Database URL"** (for internal use) or "External Database URL". Ideally, you will use the Internal one for the Web Service.

## 4. Create Web Service (Render.com)
1.  Click **New +** -> **Web Service**.
2.  Connect your **GitHub Repository**.
3.  Name: `fd-dashboard-web`.
4.  Region: Same as database.
5.  Branch: `main`.
6.  **Root Directory**: `FanDuelDashboard` (Important! Your code is in this folder).
7.  **Build Command**: `npm install && npm run db:init && npm run build` (This installs dependencies, creates DB tables, then builds).
8.  **Start Command**: `npm start`
8.  **Environment Variables**:
    You MUST set these variables so the app can connect to the DB.
    - `DB_USER`: `roster_vision_db_user`
    - `DB_HOST`: `dpg-d53ml66r433s73cem740-a`
    - `DB_NAME`: `roster_vision_db`
    - `DB_PASSWORD`: `2LklpaeoiF9eo3sjBPTWAxkzE9Llxqbk`
    - `DB_PORT`: `5432`
    
    *Alternatively, if your code supports a single connection string:*
    - `DATABASE_URL`: `postgres://user:password@hostname:5432/dbname`
    *(Note: You may need to update `server/index.js` to look for `process.env.DATABASE_URL` if you want to use the single string).*

9.  Click **Create Web Service**.

## 5. Mobile App Configuration
Once deployed, Render will give you a URL (e.g., `https://fd-dashboard.onrender.com`).
**You must update your Mobile App** to point to this new URL instead of `192.168.x.x`.
1.  Open `mobile-app/src/services/api.js`.
2.  Change `BASE_URL` to `https://fd-dashboard.onrender.com/api`.
3.  Rebuild the mobile app (EAS Build) or reload Expo Go.

## 6. Accessing Database (pgAdmin)
You can inspect your data using **pgAdmin** or any SQL client.
1.  Go to Render Dashboard -> **PostgreSQL**.
2.  Find the **Connections** info box.
3.  Copy the **"External Database URL"** details:
    -   **Host Name**: `dpg-d53ml66r433s73cem740-a.ohio-postgres.render.com`
    -   **Port**: `5432`
    -   **Database**: `roster_vision_db`
    -   **Username**: `roster_vision_db_user`
    -   **Password**: `2LklpaeoiF9eo3sjBPTWAxkzE9Llxqbk`
4.  Open **pgAdmin**:
    -   Right Click Servers -> Register -> Server.
    -   **General Tab**: Name it "Render DB".
    -   **Connection Tab**: Fill in Host, Port, DB, User, Password.
    -   **Parameters (or SSL) Tab**: Set **SSL Mode** to `Require` (This is critical for Render).
5.  Click Save. You can now view tables like `users` and `rosters`.
