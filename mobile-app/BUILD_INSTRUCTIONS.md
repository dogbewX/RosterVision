# How to Compile for iOS (EAS Build)

**Important**: You are on Windows. You **cannot** build the iOS app locally. You must use EXPO's Cloud Build service (EAS).

## Prerequisites
1.  **Apple Developer Account**: You **MUST** have a paid Apple Developer Program membership ($99/year) to build a standalone `.ipa` file that can be installed on real devices. Apple does not allow side-loading like Android.
2.  **Expo Account**: Free account on expo.dev.

## Steps

1.  **Install EAS CLI** (if not done):
    ```powershell
    npm install -g eas-cli
    ```

2.  **Login**:
    ```powershell
    eas login
    ```

3.  **Configure**:
    ```powershell
    eas build:configure
    ```
    - Select **iOS**.

4.  **Device Registration (Ad-hoc Build)**:
    To install the app on your specific iPhone/iPad, you need to register its **UDID** with Apple. EAS handles this for you.
    Run:
    ```powershell
    eas device:create
    ```
    - Follow the link / QR code instructions to register your connected device.

5.  **Build**:
    Run the build command for the `preview` profile (Internal Distribution):
    ```powershell
    eas build --platform ios --profile preview
    ```

6.  **Install**:
    - Once the build completes (15-30 mins in the cloud), EAS will provide a QR code / Link.
    - Scan it with your Camera app (not Expo Go) to install the app.

---
**Troubleshooting**:
- If you do **not** have a paid Apple Developer Account, you **cannot** build a standalone app for iOS using this method. Your only options are:
    1.  Continue using **Expo Go**.
    2.  Use an **iOS Simulator** build (requires a Mac).
