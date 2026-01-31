# Project Status & Handover Notes
**Last Updated:** January 16, 2026

This document serves as a quick reference guide to get back up to speed with the **FanDuel Dashboard (Roster Vision)** project after a break.

## 1. Feature Summary (MVP2 + Updates)

### Web Application
-   **Dashboard (Roster Vision)**: Displays optimized fantasy sports rosters with improved filtering.
-   **Admin Panel**: Restricted area for administrators to upload original FanDuel CSV data files.
    -   *Security*: Admin button only visible to users with `role: admin`.
-   **Authentication**: Login/Register functionality using PostgreSQL database.
-   **Data Processing**: Parses CSV uploads to populate the database.
-   **AI Assistant**: Integrated Chat Bot upgraded to **Gemini 2.0**, featuring robust full-project indexing (RAG) and rate limit handling.

### Mobile Application (Expo)
-   **Roster Viewing**: Connects to the live Render API to fetch and display rosters.
-   **Week Selection**: Users can now filter rosters by week.
-   **Testing**: Automated regression test suite (Jest) for RosterContext and App component smoke tests.
-   **UI Optimizations**:
    -   Displays FPPG (Fantasy Points Per Game) rounded to one decimal.
    -   Optimized layout for mobile screens.

### Backend & Database
-   **Server**: Node.js + Express hosted on Render.
-   **Database**: PostgreSQL hosted on Render.
    -   Stores `users`, `players`, and generated `rosters`.

---

## 2. Render Connection Details
**Important**: These are your production credentials.

### External Connection String
Use this to connect via **pgAdmin**, **TablePlus**, or local scripts:
```
postgres://roster_vision_db_user:2LklpaeoiF9eo3sjBPTWAxkzE9Llxqbk@dpg-d53ml66r433s73cem740-a.ohio-postgres.render.com:5432/roster_vision_db
```
*(Note: Ensure SSL is enabled/required in your client)*

### Environment Variables (Server)
These are currently set in your Render Web Service settings:
-   `DB_HOST`: `dpg-d53ml66r433s73cem740-a`
-   `DB_USER`: `roster_vision_db_user`
-   `DB_PASSWORD`: `2LklpaeoiF9eo3sjBPTWAxkzE9Llxqbk`
-   `DB_NAME`: `roster_vision_db`
-   `DB_PORT`: `5432`

---

## 3. Known Issues & Status
*As of Jan 16, 2026*

### Web App
-   **Status**: Stable.
-   **Resolved**: Fixed filters to work alongside mobile enhancements.
-   **Resolved**: Admin button visibility issue (fixed).
-   **Resolved**: "Failed to fetch" on admin upload (fixed).

### Mobile App
-   **Status**: Stable.
-   **Resolved**: Added automated regression tests to prevent regressions.
-   **Resolved**: Connection to local IP removed; now points to `https://fd-dashboard.onrender.com/api`.

### Deployment
-   **Status**: Up-to-date.
-   **Git**: `main` branch is synced with Render auto-deploy.
-   **Bot**: Gemini 2.0 upgrade and RAG fixes deployed.

---

## 4. Notes & Next Steps
*Add your thoughts here when you return.*

### Ideas for Future Features
-   [ ] Add "Reset Password" flow.
-   [ ] Strict input validation on the CSV parser?
-   [ ] Push notifications for mobile when new rosters are available?
-   [ ]

### Maintenance Tasks
-   [ ] Check Render free tier usage limits.
-   [ ] Review database backup strategy.
-   [ ] Run regression tests periodically (`npm test` in mobile dir).

### Brainstorming
-   
-   
