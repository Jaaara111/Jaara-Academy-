# Jaara Academy - Android Project Guide

This project is built using **Kotlin** and **XML** with an **MVVM** intent.

## How to Run
1. Open **Android Studio**.
2. Select **"Open"** and navigate to the `/android` folder.
3. Wait for **Gradle** to sync all dependencies.
4. Update the `BASE_URL` in `NetworkModule.kt` to point to your PHP backend (tusaale: `http://10.0.2.2/jaara_api/` haddii aad localhost ku isticmaalayso emulator-ka).
5. Ensure the PHP scripts (`login.php`, `exams.php`, etc.) exist on your server.
6. Build and run on an emulator or physical device.

## Project Structure
- `ui/auth`: Login and Registration.
- `ui/dashboard`: User dashboard, Profile, and PDF Viewer.
- `api`: Retrofit service and Network configuration.
- `models`: Data classes for User, Exams, etc.

## Key Dependencies
- Retrofit (Networking)
- Coroutines (Background tasks)
- ViewBinding (UI interactions)
- Material Design 3

## Admin Access
Currently, admin access is hardcoded in `LoginActivity.kt` based on a phone number whitelist. You can expand this to check the `role` field from your API response.
