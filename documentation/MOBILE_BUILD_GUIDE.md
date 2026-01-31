# Mobile App Build Guide (EAS)

This guide explains how to build your Roster Vision mobile app for Android and iOS using **Expo Application Services (EAS)**.

> [!IMPORTANT]
> Since you are on **Windows**, you **cannot** build the iOS app locally. You must use EAS Cloud Builds.

## Prerequisites

1.  **Expo Account**: [Sign up here](https://expo.dev/signup).
2.  **EAS CLI**: Install the command line tool globally:
    ```powershell
    npm install -g eas-cli
    ```
3.  **Login**:
    ```powershell
    eas login
    ```
4.  **Apple Developer Account** (Required for iOS):
    - You need a paid [Apple Developer Program](https://developer.apple.com/programs/) membership ($99/year) to build for iOS devices.
    - *Without this, you can only use Expo Go.*

---

## 1. Project Configuration

Before building, ensure your project is configured.

1.  Navigate to the mobile app directory:
    ```powershell
    cd mobile-app
    ```
2.  Configure EAS (Run this once):
    ```powershell
    eas build:configure
    ```
    - Select **All** (or iOS/Android individually when prompted).
    - This creates an `eas.json` file in your `mobile-app` folder.

---

## 2. Android Build

### Option A: Build an APK (For testing on your device)
This creates a standard `.apk` file you can install directly on your Android phone.

1.  Run the build command:
    ```powershell
    eas build --platform android --profile preview
    ```
2.  **Wait**: The build runs in the cloud (takes 10-20 mins).
3.  **Install**:
    - When finished, EAS provides a standardized link.
    - Open the link on your Android phone to download and install.

### Option B: Build an AAB (For Google Play Store)
This creates an `.aab` bundle for store submission.

1.  Run the build command:
    ```powershell
    eas build --platform android --profile production
    ```
2.  **Submit**: Upload the resulting `.aab` file to the Google Play Console.

---

## 3. iOS Build

### Option A: Ad-hoc Build (For testing on specific devices)
You must register your device's UDID with Apple. EAS handles this automatically.

1.  **Register Device**:
    - Connect your iPhone/iPad to your PC vs USB/Wi-Fi is difficult on Windows, so generally, run:
    ```powershell
    eas device:create
    ```
    - Follow the instructions (typically scanning a QR code) to install a profile that registers your device.

2.  **Run the Build**:
    ```powershell
    eas build --platform ios --profile preview
    ```
3.  **Wait**: The build runs in the cloud (takes 15-30 mins).
4.  **Install**:
    - EAS provides a link/QR code.
    - Scan it with your default Camera app.
    - Click "Install".

### Option B: App Store Build (For TestFlight / App Store)

1.  Run the build command:
    ```powershell
    eas build --platform ios --profile production
    ```
2.  **Submit**:
    - Once built, you use "Transporter" (Mac app) or EAS Submit to upload to App Store Connect.
    - Command to auto-submit (requires setup): `eas submit --platform ios`

---

## Troubleshooting

### "Credentials missing"
If EAS complains about missing certificates or profiles:
- Answer **Yes** to all prompts asking to "Generate a new certificate/profile". EAS manages these for you.

### "Build failed"
- Check the error logs provided in the provided Expo Dashboard link.
- Common issues:
    - Syntax errors in code (Run `npx expo start` locally to check).
    - Invalid images/assets (Check `app.json` paths).

### "Install Failed" (iOS)
- This almost always means the device's UDID was not included in the build.
- Run `eas device:create` again, ensure your device connects, and then **re-build** the ad-hoc build.
