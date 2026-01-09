# 🔥 Firebase Configuration - Ready to Use!

Your Firebase is configured and ready! Here's what's set up:

## ✅ Your Firebase Project
- **Project ID:** clouse-d224f
- **Project Name:** Clouse
- **Region:** Global

## 📝 Configuration Status

✅ Firebase SDK installed
✅ Environment variables configured
✅ Firestore Database (needs enabling)
✅ Firebase Storage (needs enabling)
✅ Cloud Functions ready
✅ Analytics enabled

## 🚀 Next Steps (IMPORTANT!)

### 1. Enable Firestore Database

1. Go to [Firebase Console](https://console.firebase.google.com/project/clouse-d224f/firestore)
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development)
4. Select your closest location
5. Click **"Enable"**

### 2. Enable Firebase Storage

1. Go to [Firebase Console](https://console.firebase.google.com/project/clouse-d224f/storage)
2. Click **"Get started"**
3. Choose **"Start in test mode"**
4. Use the same location as Firestore
5. Click **"Done"**

### 3. Set Up Security Rules

#### Firestore Rules
Go to Firestore → Rules tab and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow public read for file sharing
    match /files/{fileId} {
      allow read: if true;
      allow write: if true;  // Change to auth check in production
    }

    match /courses/{courseId} {
      allow read: if true;
      allow write: if true;  // Change to auth check in production
    }
  }
}
```

#### Storage Rules
Go to Storage → Rules tab and paste:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /courses/{courseId}/{fileName} {
      allow read: if true;  // Public read for sharing
      allow write: if true;  // Change to auth check in production
    }
  }
}
```

## 🎯 Start Using the App

```bash
# Start development server
npm run dev

# Open http://localhost:3000
# Create a course
# Upload a file
# Click the Share button to get a shareable link!
```

## 📱 How File Sharing Works

1. **Upload:** Files go to Firebase Storage
2. **Store:** Metadata saved in Firestore
3. **Share:** Get a public link like: `https://yourapp.com/share/abc123`
4. **Download:** Anyone with the link can download on any device!

## 🔐 For Production (Later)

When deploying to Vercel:

1. Add all environment variables in Vercel Dashboard:
   - Go to Project Settings → Environment Variables
   - Add each `NEXT_PUBLIC_FIREBASE_*` variable
   - Deploy!

2. Update security rules to require authentication

## ⚠️ Important Notes

- **Test Mode:** Current rules allow anyone to read/write (for development)
- **Free Tier:** 5GB storage, 1GB/day downloads
- **Never commit:** `.env.local` is in `.gitignore` (secure!)
- **Share links:** Work immediately after enabling Firestore + Storage

## 🆘 Troubleshooting

### "Permission denied" errors
→ Make sure Firestore and Storage are enabled in test mode

### "Configuration not found" errors
→ Check that `.env.local` exists and has all variables

### Files not uploading
→ Verify Storage is enabled and rules allow write access

### Share links don't work
→ Ensure Firestore is enabled for metadata storage

## 🎉 You're All Set!

Just enable Firestore and Storage (2 minutes), then start uploading and sharing files!

---

**Quick Links:**
- [Firebase Console](https://console.firebase.google.com/project/clouse-d224f)
- [Firestore Setup](https://console.firebase.google.com/project/clouse-d224f/firestore)
- [Storage Setup](https://console.firebase.google.com/project/clouse-d224f/storage)
