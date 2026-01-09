# Firebase Setup Guide

This guide will help you set up Firebase for cloud storage and file sharing functionality.

## 🔥 Step 1: Create a Firebase Project

1. **Go to [Firebase Console](https://console.firebase.google.com)**
2. Click "Add project" or "Create a project"
3. Enter your project name (e.g., "course-slides-manager")
4. (Optional) Enable Google Analytics
5. Click "Create Project"

## 📱 Step 2: Register Your Web App

1. In your Firebase project dashboard, click the **Web icon** (`</>`)
2. Register your app with a nickname (e.g., "Course Slides Web")
3. **Copy the Firebase configuration** - you'll need this!
4. Click "Continue to console"

Your config will look like this:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## 🗄️ Step 3: Enable Firestore Database

1. In Firebase Console, click **"Firestore Database"** in the left menu
2. Click **"Create database"**
3. Choose **"Start in test mode"** (we'll secure it later)
4. Select your preferred location (choose closest to your users)
5. Click "Enable"

### Set Up Security Rules

After creating the database, go to the **"Rules"** tab and update:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to all documents
    match /{document=**} {
      allow read: if true;
    }

    // Allow write access to courses and files
    match /courses/{courseId} {
      allow write: if true;
    }

    match /files/{fileId} {
      allow write: if true;
    }
  }
}
```

**Note:** These are permissive rules for development. See "Production Security" section below for secure rules.

## 📦 Step 4: Enable Firebase Storage

1. Click **"Storage"** in the left menu
2. Click **"Get started"**
3. Choose **"Start in test mode"**
4. Click "Next"
5. Select the same location as your Firestore
6. Click "Done"

### Set Up Storage Security Rules

Go to the **"Rules"** tab in Storage and update:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /courses/{courseId}/{fileName} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

## 🔐 Step 5: Configure Your Application

1. **Create `.env.local` file** in your project root:
   ```bash
   cp .env.example .env.local
   ```

2. **Add your Firebase config** to `.env.local`:
   ```env
   NEXT_PUBLIC_APP_NAME="Course Slides Manager"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"

   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
   ```

3. **For Vercel deployment**, add these as environment variables in:
   - Vercel Dashboard → Your Project → Settings → Environment Variables

## ✅ Step 6: Test Your Setup

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Create a course and upload a file**

3. **Check Firebase Console:**
   - Go to **Firestore Database** - you should see `courses` and `files` collections
   - Go to **Storage** - you should see uploaded files in `courses/` folder

## 🚀 Using Cloud Features

### Upload Files to Cloud
The app now uses `FileUploadCloud` component which automatically:
- Uploads files to Firebase Storage
- Saves metadata to Firestore
- Generates download URLs
- Creates shareable links

### Share Files with Friends
1. Upload a file to any course
2. Click the **Share** button (green icon) on any file card
3. Copy the share link
4. Send to your friends - they can download on any device!

### Download from Cloud
- Files are automatically available from any device
- Download URLs never expire
- Share links work on phones, tablets, and computers

## 🔒 Production Security Rules

For production deployment, update your security rules:

### Firestore Rules (More Secure)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read access for sharing
    match /files/{fileId} {
      allow read: if true;
      allow write: if request.auth != null; // Requires authentication
    }

    match /courses/{courseId} {
      allow read: if true;
      allow write: if request.auth != null; // Requires authentication
    }

    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Storage Rules (More Secure)
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /courses/{courseId}/{fileName} {
      // Anyone can read (for sharing)
      allow read: if true;
      // Only authenticated users can upload/delete
      allow write: if request.auth != null;
    }
  }
}
```

## 💡 Tips & Best Practices

1. **File Size Limits:**
   - Firebase Storage free tier: 5 GB
   - Max file size: 100 MB per file (configurable)
   - Adjust in `next.config.js` if needed

2. **Costs:**
   - Free tier includes:
     - 5 GB storage
     - 1 GB/day downloads
     - 50K reads, 20K writes per day
   - Usually sufficient for 100-500 files

3. **Performance:**
   - Files are served from Firebase CDN
   - Global distribution
   - Fast download speeds worldwide

4. **Monitoring:**
   - Check Firebase Console → Usage tab
   - Set up budget alerts
   - Monitor storage and bandwidth usage

## 🐛 Troubleshooting

### Error: "Firebase: Error (auth/configuration-not-found)"
- Make sure all environment variables are set correctly
- Restart your development server after adding env vars

### Files Not Uploading
- Check Firebase Storage rules
- Verify your storage bucket URL is correct
- Check browser console for errors

### Share Links Not Working
- Ensure Firestore rules allow public read access
- Check that `NEXT_PUBLIC_APP_URL` is set correctly
- Verify file has a `downloadURL` in Firestore

### Storage Quota Exceeded
- Check Firebase Console → Storage → Usage
- Delete old/unused files
- Consider upgrading to Blaze plan (pay-as-you-go)

## 📞 Need Help?

- **Firebase Docs:** https://firebase.google.com/docs
- **Firebase Support:** https://firebase.google.com/support
- **Project Issues:** Create an issue on GitHub

## 🎉 You're All Set!

Your Course Slides Manager now has:
- ✅ Cloud storage for all files
- ✅ File sharing with shareable links
- ✅ Download from any device
- ✅ Automatic syncing
- ✅ No storage limits (beyond Firebase free tier)

Share away and enjoy unlimited cloud storage! 🎊
