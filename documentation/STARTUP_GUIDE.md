# Startup Guide

This document outlines the commands required to start the various components of the FanDuel Dashboard application: the Web App (Frontend + Backend), the RAG AI Service, and the Mobile App.

## 1. Web App & RAG Service

The RAG (Retrieval-Augmented Generation) Service is integrated directly into the backend server. Starting the backend automatically enables the AI features.

### Option A: Development Mode (Recommended)
Run the backend and frontend in separate terminals to enable hot-reloading.

**Terminal 1: Backend API + RAG Service**
Runs on `http://localhost:3000`.
```powershell
npm start
```

**Terminal 2: Frontend Web App**
Runs on `http://localhost:5173`.
```powershell
npm run dev
```
> **Note:** Access the RAG AI Chat at `http://localhost:5173/ai-chat.html`.

### Option B: Production Mode
Build the frontend and serve it statically via the backend. This mimics the deployment environment.

```powershell
# Build the frontend
npm run build

# Start the server (serves both API and static frontend files)
npm start
```
*   **App URL:** `http://localhost:3000`
*   **API URL:** `http://localhost:3000/api`

---

## 2. Mobile App

The mobile app is built with Expo. You will need the **Expo Go** app installed on your physical device (iOS or Android).

**Terminal 3: Mobile Packager**
```powershell
cd mobile-app
npx expo start
```

**Instructions:**
1.  Wait for the QR code to generate in the terminal.
2.  Open **Expo Go** on your phone.
3.  Scan the QR code.
    *   **Android:** Use the Expo Go app's scanner.
    *   **iOS:** Use the standard Camera app.

> **Important:** Your phone and computer must be on the **same Wi-Fi network**. The app attempts to connect to your computer's local IP address.

---

## 3. Troubleshooting / Notes

*   **Port Conflicts:**
    *   Ensure port `3000` is free for the backend.
    *   Ensure port `5173` is free for the frontend (Vite).
    *   Expo usually defaults to port `8081`.
*   **RAG Service Indexing:**
    *   If the AI Chat says "Index not found", you need to trigger an index.
    *   You can do this via the UI in the "AI Chat" page or by sending a POST request to `/api/ai/index`.
