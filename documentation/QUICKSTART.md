# 🚀 FanDuel Dashboard - Quickstart Guide

## 1. Web App (Frontend)
The main dashboard showing player data and roster management.
*   **URL:** [http://localhost:5173](http://localhost:5173)
*   **Production Data:** Enabled (connected to FanDuel Production API).

## 2. AI Chat (RAG)
The AI assistant that answers questions about your codebase.
*   **URL:** [http://localhost:5173/ai-chat.html](http://localhost:5173/ai-chat.html)
*   **Features:**
    *   **Full Re-Index:** Scans entire project.
    *   **Quick Update:** Only scans changed files (Fast).

## 3. Mobile App
To run the mobile app, you need to start the Expo server.

**Terminal Command:**
```bash
cd mobile-app
npx expo start
```
*   **Scan QR Code:** Use your phone (Expo Go app) to scan the QR code.
*   **Backend:** Configured to use Production API automatically.

## 4. Backend Server
The local server powering the AI Chat.
*   **Status:** Must be running on Port 3000.
*   **Command:** `node server/index.js`
