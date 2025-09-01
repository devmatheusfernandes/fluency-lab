@echo off
REM Firebase Firestore Rules Deployment Script
REM Run this script to deploy the updated Firestore security rules

echo 🔒 Deploying Firestore Security Rules...

REM Check if Firebase CLI is installed
where firebase >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Firebase CLI is not installed. Please install it first:
    echo npm install -g firebase-tools
    exit /b 1
)

REM Check if user is logged in
firebase projects:list >nul 2>nul
if %errorlevel% neq 0 (
    echo 🔐 Please login to Firebase first:
    firebase login
)

REM Deploy only Firestore rules
echo 📤 Deploying Firestore rules...
firebase deploy --only firestore:rules

if %errorlevel% equ 0 (
    echo ✅ Firestore rules deployed successfully!
    echo 🔍 You can verify the rules in the Firebase Console
) else (
    echo ❌ Failed to deploy Firestore rules. Please check your configuration.
    exit /b 1
)

pause