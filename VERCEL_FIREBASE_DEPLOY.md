# 🚀 Deploy to Vercel with Firebase

Complete guide to deploy your Course Slides Manager to Vercel with Firebase cloud storage.

## 📋 Prerequisites

✅ GitHub repository with your code (already done!)
✅ Firebase project created (clouse-d224f) ✅
✅ Vercel account (create at [vercel.com](https://vercel.com))

## 🔥 Step 1: Enable Firebase Services (5 minutes)

### Enable Firestore Database
1. Go to [Firestore Console](https://console.firebase.google.com/project/clouse-d224f/firestore)
2. Click **"Create database"**
3. Select **"Start in test mode"**
4. Choose your location (closest to your users)
5. Click **"Enable"**

### Enable Firebase Storage
1. Go to [Storage Console](https://console.firebase.google.com/project/clouse-d224f/storage)
2. Click **"Get started"**
3. Select **"Start in test mode"**
4. Use the same location as Firestore
5. Click **"Done"**

### Set Security Rules

#### Firestore Rules
Go to Firestore → Rules tab:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /files/{fileId} {
      allow read: if true;
      allow write: if true;
    }
    match /courses/{courseId} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```
Click **"Publish"**

#### Storage Rules
Go to Storage → Rules tab:
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
Click **"Publish"**

## 🚀 Step 2: Deploy to Vercel (10 minutes)

### A. Connect Your Repository

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. Click **"Add New..." → "Project"**
3. **Import your GitHub repository**
   - If not connected, click "Add GitHub Account"
   - Select your repository: `gg` or your repo name
   - Click **"Import"**

### B. Configure Project Settings

Vercel will auto-detect Next.js. Verify these settings:

- **Framework Preset:** Next.js ✅
- **Root Directory:** `./` ✅
- **Build Command:** `npm run build` ✅
- **Output Directory:** `.next` ✅
- **Install Command:** `npm install` ✅

### C. Add Environment Variables

**CRITICAL:** Click **"Environment Variables"** and add these **one by one**:

| Variable Name | Value |
|--------------|-------|
| `NEXT_PUBLIC_APP_NAME` | `Course Slides Manager` |
| `NEXT_PUBLIC_APP_URL` | (leave blank for now, will update after deploy) |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyCR_pGK-V-75hFZFvnzr3nLboOiYsyrqIc` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `clouse-d224f.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `clouse-d224f` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `clouse-d224f.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `1027073844210` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:1027073844210:web:7a9474922be4b7e517016b` |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | `G-H2TB825FSC` |

**How to add:**
1. Click "Add" for each variable
2. Paste the Name
3. Paste the Value
4. Select "Production", "Preview", "Development" (all three)
5. Click "Add"
6. Repeat for all 9 variables

### D. Deploy!

1. Click **"Deploy"** button
2. Wait 2-3 minutes for build
3. ✅ Your app is live!

## 🔄 Step 3: Update App URL

After deployment completes:

1. **Copy your Vercel URL** (e.g., `https://your-app.vercel.app`)
2. **Go to Vercel Dashboard → Settings → Environment Variables**
3. **Edit `NEXT_PUBLIC_APP_URL`:**
   - Delete the old value
   - Add new value: `https://your-app.vercel.app` (your actual URL)
   - Click "Save"
4. **Redeploy:**
   - Go to Deployments tab
   - Click "..." → "Redeploy"

## ✅ Step 4: Test Your Deployment

### Test File Upload & Sharing

1. **Open your Vercel URL:** `https://your-app.vercel.app`
2. **Create a course:**
   - Click "Create New Course"
   - Name: "Test Course"
   - Create it
3. **Upload a file:**
   - Click on your course
   - Click "Upload Files"
   - Drag & drop a PPT/PPTX file
   - Wait for upload to complete
4. **Test sharing:**
   - Click the green **Share button** on the uploaded file
   - Copy the share link
   - Open in incognito/private window
   - Verify you can download the file!

### Test on Phone

1. Send the share link to your phone (WhatsApp, SMS, etc.)
2. Open the link on your phone
3. Click "Download File"
4. ✅ File should download!

## 📱 Share Links Format

Your share links will look like:
```
https://your-app.vercel.app/share/abc123xyz
```

Anyone with this link can:
- View file info
- Download the file
- Access from any device (phone, tablet, PC)

## 🔧 Troubleshooting

### Build Failed
**Error:** Missing environment variables
**Fix:** Make sure all 9 Firebase variables are added in Vercel

### Files Not Uploading
**Error:** "Permission denied" or upload fails
**Fix:**
- Check Firestore is enabled in test mode
- Check Storage is enabled in test mode
- Verify security rules are published

### Share Links Don't Work
**Error:** "File not found"
**Fix:**
- Make sure `NEXT_PUBLIC_APP_URL` matches your Vercel URL
- Verify Firestore has the file metadata
- Check Storage rules allow public read

### Environment Variables Not Working
**Fix:**
- Make sure all variables start with `NEXT_PUBLIC_`
- Redeploy after adding/changing variables
- Check spelling of variable names

## 🎯 Custom Domain (Optional)

Want a custom domain like `slides.yourdomain.com`?

1. Go to Vercel Dashboard → Settings → Domains
2. Click "Add"
3. Enter your domain
4. Follow DNS configuration steps
5. Wait for SSL (automatic, ~10 minutes)
6. Update `NEXT_PUBLIC_APP_URL` to your custom domain
7. Redeploy

## 🔐 Production Security (Important!)

Current setup uses **test mode** (anyone can read/write). For production:

### Update Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /files/{fileId} {
      allow read: if true;  // Keep public for sharing
      allow write: if request.auth != null;  // Require auth
    }
    match /courses/{courseId} {
      allow read: if true;
      allow write: if request.auth != null;  // Require auth
    }
  }
}
```

### Update Storage Rules
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /courses/{courseId}/{fileName} {
      allow read: if true;  // Keep public for sharing
      allow write: if request.auth != null;  // Require auth
    }
  }
}
```

Then add authentication (NextAuth.js, Firebase Auth, etc.)

## 📊 Monitor Usage

### Vercel
- Go to [Vercel Dashboard](https://vercel.com/dashboard)
- Check Analytics for traffic
- Monitor build/deploy logs

### Firebase
- Go to [Firebase Console](https://console.firebase.google.com/project/clouse-d224f)
- Check Usage tab for:
  - Storage usage (5GB free)
  - Bandwidth (1GB/day free)
  - Database reads/writes

## 🎉 Success Checklist

- ✅ Firestore enabled and configured
- ✅ Storage enabled and configured
- ✅ All 9 environment variables added to Vercel
- ✅ Deployed successfully
- ✅ App URL updated in environment variables
- ✅ Tested file upload
- ✅ Tested file sharing
- ✅ Share link works on phone

## 🆘 Need Help?

- **Vercel Issues:** [Vercel Support](https://vercel.com/support)
- **Firebase Issues:** [Firebase Support](https://firebase.google.com/support)
- **Check Logs:** Vercel Dashboard → Deployments → View Function Logs

---

## Quick Copy-Paste for Vercel Environment Variables

```
NEXT_PUBLIC_APP_NAME=Course Slides Manager
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCR_pGK-V-75hFZFvnzr3nLboOiYsyrqIc
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=clouse-d224f.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=clouse-d224f
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=clouse-d224f.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1027073844210
NEXT_PUBLIC_FIREBASE_APP_ID=1:1027073844210:web:7a9474922be4b7e517016b
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-H2TB825FSC
```

**Remember:** Add each one separately in Vercel Dashboard!

---

**Ready to deploy?** 🚀

1. Enable Firestore & Storage (5 min)
2. Deploy to Vercel (5 min)
3. Add environment variables (3 min)
4. Update APP_URL and redeploy (2 min)
5. Test and share with friends! 🎉
