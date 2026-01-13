# Quick Start: Firebase Setup

## Step 1: Create Firebase Project (5 minutes)

1. Go to https://console.firebase.google.com/
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `smartgateentry` (or your preferred name)
4. Click **Continue**
5. **Disable Google Analytics** (optional, recommended for now) or enable it if you want
6. Click **Create project**
7. Wait for project creation (takes ~30 seconds)

## Step 2: Enable Firestore Database (2 minutes)

1. In Firebase Console, click **"Build"** in left menu
2. Click **"Firestore Database"**
3. Click **"Create database"**
4. Choose **"Start in test mode"** (for development)
   - ⚠️ For production, you'll need to set proper security rules later
5. Choose a location closest to your users (e.g., `us-central`, `asia-south1` for India)
6. Click **"Enable"**

## Step 3: Get Configuration (2 minutes)

1. In Firebase Console, click the **gear icon** ⚙️ next to "Project Overview"
2. Click **"Project settings"**
3. Scroll down to **"Your apps"** section
4. Click the **web icon** `</>` (or "Add app" > "Web")
5. Register app:
   - App nickname: `SmartGate Entry Web`
   - Check "Also set up Firebase Hosting" (optional, we're using Vercel)
   - Click **"Register app"**
6. **Copy the configuration object** that looks like:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## Step 4: Add to Your Project (1 minute)

1. In your project root, create a `.env` file (copy from `.env.example` if it exists)
2. Add your Firebase config values:

```env
VITE_FIREBASE_API_KEY=AIza... (paste your apiKey)
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

3. **Save the file**

## Step 5: Test It! (1 minute)

1. Run `npm run dev`
2. Open browser console (F12)
3. You should see no Firebase errors
4. Try creating a user or society - data should save to Firebase
5. Check Firebase Console > Firestore Database - you should see collections created!

## That's It! ✅

Your app is now using Firebase for online storage. All users will share the same data.

## Next Steps (Optional)

- **Set up security rules** for production (see Firebase documentation)
- **Migrate existing data** from localStorage using the Backup/Restore feature
- **Enable real-time updates** (data will sync automatically across all users)

## Troubleshooting

- **"Firebase not configured"**: Check `.env` file exists and has correct values
- **"Permission denied"**: Firestore is in test mode - should work. Check browser console for errors
- **"Network error"**: Check your internet connection and Firebase project is active


