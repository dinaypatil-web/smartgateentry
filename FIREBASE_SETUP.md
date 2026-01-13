# Firebase Setup Guide for Online Data Storage

## Overview
The app has been configured to support Firebase Firestore for online data storage, enabling all users to share the same data across devices and locations.

## Current Status
✅ Camera flickering issue fixed
✅ Firebase integration code added
⚠️ Firebase configuration needed
⚠️ Some async/await updates needed in DataContext

## Setup Steps

### 1. Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Enter project name (e.g., "smartgateentry")
4. Follow the setup wizard

### 2. Enable Firestore Database
1. In Firebase Console, go to "Build" > "Firestore Database"
2. Click "Create database"
3. Start in **test mode** (for development) or **production mode** (with security rules)
4. Choose a location (select closest to your users)

### 3. Get Firebase Configuration
1. In Firebase Console, go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click the web icon (`</>`) to add a web app
4. Register app name (e.g., "SmartGate Entry Web")
5. Copy the Firebase configuration object

### 4. Add Environment Variables
Create a `.env` file in the project root with your Firebase config:

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

### 5. Update Firebase Config File
Edit `src/config/firebase.js` and replace the placeholder values with your actual Firebase config (or use env variables as shown above).

### 6. Set Firestore Security Rules (IMPORTANT)

Go to Firestore Database > Rules and set appropriate rules. For development:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents (for development only)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **For production**, implement proper security rules based on user authentication.

### 7. Test the Setup
1. Run `npm run dev`
2. Check browser console for any Firebase errors
3. The app will automatically use Firebase if configured correctly, otherwise falls back to localStorage

## Migration from localStorage to Firebase

If you have existing data in localStorage:

1. **Manual Migration**: Use the backup/restore feature in Superadmin Dashboard
   - Create a backup from localStorage
   - Configure Firebase
   - Restore the backup (it will save to Firebase)

2. **Automatic Migration**: A migration utility is available in `src/utils/migration.js`
   - Run `migrateToFirebase()` function after Firebase is configured

## Architecture

The app uses a hybrid storage system:

- **If Firebase is configured**: Uses Firestore for all data operations
- **If Firebase is not configured**: Falls back to localStorage

This ensures backward compatibility and allows gradual migration.

## Files Modified/Created

1. `src/config/firebase.js` - Firebase configuration
2. `src/utils/api.js` - Firestore API functions
3. `src/utils/storageApi.js` - Unified storage API wrapper
4. `src/utils/migration.js` - Data migration utility
5. `src/components/CameraCapture.jsx` - Fixed camera flickering
6. `src/context/DataContext.jsx` - Updated to support async operations

## Next Steps After Setup

1. Test all CRUD operations (Create, Read, Update, Delete)
2. Verify data syncs across different devices/browsers
3. Set up proper Firestore security rules for production
4. Consider implementing real-time listeners for live data updates

## Troubleshooting

- **"Firebase not configured"**: Check that `.env` file exists and has correct values
- **Permission errors**: Check Firestore security rules
- **Connection errors**: Verify Firebase project is active and billing is enabled (if needed)


