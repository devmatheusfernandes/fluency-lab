#!/bin/bash

# Firebase Firestore Rules Deployment Script
# Run this script to deploy the updated Firestore security rules

echo "🔒 Deploying Firestore Security Rules..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "🔐 Please login to Firebase first:"
    firebase login
fi

# Deploy only Firestore rules
echo "📤 Deploying Firestore rules..."
firebase deploy --only firestore:rules

if [ $? -eq 0 ]; then
    echo "✅ Firestore rules deployed successfully!"
    echo "🔍 You can verify the rules in the Firebase Console:"
    echo "https://console.firebase.google.com/project/$(firebase use --quiet)/firestore/rules"
else
    echo "❌ Failed to deploy Firestore rules. Please check your configuration."
    exit 1
fi