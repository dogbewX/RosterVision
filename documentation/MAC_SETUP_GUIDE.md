# Mac Development Setup Guide

This guide will help you migrate your development environment from Windows to macOS.

## 1. Install Basic Tools (Terminal)

Open your **Terminal** app (Command+Space, type "Terminal") and run the following commands.

### A. Install Homebrew
Homebrew is the standard package manager for Mac (like `npm` but for system tools).
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```
*Follow the on-screen instructions (you may need to enter your Mac password and press Enter).*

### B. Install Node.js, Git, and Watchman
Once Homebrew is done, install the core requirements:
```bash
brew install node
brew install git
brew install watchman
```
*Note: `watchman` is a specific requirement for React Native/Expo on Mac to watch file changes efficiently.*

### C. Install VS Code
Download and install [Visual Studio Code for Mac](https://code.visualstudio.com/download).

---

## 2. Setup the Project

### A. Clone the Repository
1.  Open Terminal.
2.  Navigate to where you want the code (e.g., "Documents"):
    ```bash
    cd ~/Documents
    ```
3.  Clone your repo:
    ```bash
    git clone https://github.com/dogbew-us/AntiGrav.git
    ```
4.  Enter the folder:
    ```bash
    cd AntiGrav/FanDuelDashboard
    ```

### B. Install Dependencies
You need to install libraries for both the Server/Web and the Mobile App.

**1. Root/Server Dependencies:**
```bash
npm install
```

**2. Mobile App Dependencies:**
```bash
cd mobile-app
npm install
```

---

## 3. Running the App on Mac

### A. Start the Backend/Web
Open a new Terminal tab (Cmd+T) inside `FanDuelDashboard`:
```bash
npm start
```
*(Or `npm run dev` for the frontend)*

### B. Start the Mobile App (Simulators)
One of the biggest benefits of Mac is the built-in iOS Simulator.

1.  **Install Xcode** (Optional but recommended for full simulation):
    - Install "Xcode" from the Mac App Store (it's large, ~12GB).
    - Open it once to accept the license agreement.
    - Preferences > Locations > Command Line Tools: Select the latest version.

2.  **Run with Expo:**
    ```bash
    cd mobile-app
    npx expo start
    ```
3.  **Launch Simulator**:
    - Press `i` in the terminal to open the iOS Simulator automatically.
    - No need for "Tunnels" or scanning QR codes (though you can still do that if you want to test on a real phone).

---

## 4. Transferring Credentials
Don't forget to move your `.env` file!
1.  On your Windows PC, open `FanDuelDashboard/.env`.
2.  On your Mac, create a new file `FanDuelDashboard/.env`.
3.  Copy/Paste the contents (Database URL, Secrets, etc.).

---

## 5. Credentials (KEEP PRIVATE)

> [!CAUTION]
> **SECURITY WARNING**: Do NOT commit this file with your actual passwords. If you fill these in, allow this file in `.gitignore` or keep it local only.

### GitHub
- **Username**: dogbew-us
- **Email**: [Enter Email]
- **Password/Token**: [Enter Personal Access Token]

#### How to generate a Token (Required instead of Password):
1.  Go to **GitHub.com** > Click your Profile Photo > **Settings**.
2.  Scroll down to **Developer settings** (bottom left).
3.  Click **Personal access tokens** > **Tokens (classic)**.
4.  Click **Generate new token (classic)**.
5.  **Note**: "Mac Setup".
6.  **Scopes**: Check `repo` (Full control of private repositories).
7.  Click **Generate token**.
8.  **COPY IT IMMEDIATELY**. You won't see it again. Use *this* long string as your password when Git asks.

### Render
- **Email/Username**: [Enter Render Email]
- **Password**: [Enter Render Password]

