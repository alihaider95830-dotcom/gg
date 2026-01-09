# ✅ Vercel Deployment Checklist

Follow these steps in order (15 minutes total):

## 🔥 Part 1: Enable Firebase (5 minutes)

### ☐ Enable Firestore
1. Open: https://console.firebase.google.com/project/clouse-d224f/firestore
2. Click "Create database"
3. Select "Start in **test mode**"
4. Click "Enable"

### ☐ Enable Storage
1. Open: https://console.firebase.google.com/project/clouse-d224f/storage
2. Click "Get started"
3. Select "Start in **test mode**"
4. Click "Done"

### ☐ Set Rules (Firestore)
1. Go to Firestore → Rules tab
2. Paste this and click "Publish":
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### ☐ Set Rules (Storage)
1. Go to Storage → Rules tab
2. Paste this and click "Publish":
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

---

## 🚀 Part 2: Deploy to Vercel (10 minutes)

### ☐ Step 1: Go to Vercel
Open: https://vercel.com/new

### ☐ Step 2: Import Repository
- Click "Import Git Repository"
- Select your GitHub repo
- Click "Import"

### ☐ Step 3: Add Environment Variables

Click "Environment Variables" and add these **9 variables** one by one:

```
Name: NEXT_PUBLIC_APP_NAME
Value: Course Slides Manager
---
Name: NEXT_PUBLIC_APP_URL
Value: (leave blank for now)
---
Name: NEXT_PUBLIC_FIREBASE_API_KEY
Value: AIzaSyCR_pGK-V-75hFZFvnzr3nLboOiYsyrqIc
---
Name: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
Value: clouse-d224f.firebaseapp.com
---
Name: NEXT_PUBLIC_FIREBASE_PROJECT_ID
Value: clouse-d224f
---
Name: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
Value: clouse-d224f.firebasestorage.app
---
Name: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
Value: 1027073844210
---
Name: NEXT_PUBLIC_FIREBASE_APP_ID
Value: 1:1027073844210:web:7a9474922be4b7e517016b
---
Name: NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
Value: G-H2TB825FSC
```

For each variable:
- Click "Add"
- Paste Name and Value
- Select: Production ✅ Preview ✅ Development ✅
- Click "Add"

### ☐ Step 4: Deploy
Click "Deploy" button and wait 2-3 minutes

### ☐ Step 5: Update APP_URL
After deployment:
1. Copy your Vercel URL (e.g., `https://your-app-xyz.vercel.app`)
2. Go to: Settings → Environment Variables
3. Find `NEXT_PUBLIC_APP_URL`
4. Click "Edit"
5. Paste your Vercel URL
6. Click "Save"
7. Go to Deployments → Click "..." → "Redeploy"

---

## ✅ Part 3: Test Everything (2 minutes)

### ☐ Test Upload
1. Open your Vercel URL
2. Create a course
3. Upload a PPT file
4. Wait for "Synced to cloud" message

### ☐ Test Sharing
1. Click green Share button on uploaded file
2. Copy the link
3. Open in incognito/private window
4. Click "Download File"
5. ✅ Should download!

### ☐ Test on Phone
1. Send share link to your phone
2. Open link
3. Download file
4. ✅ Works!

---

## 🎉 Done!

Your app is live and working! Share links with friends.

**Your App:** https://your-app.vercel.app
**Share Links:** https://your-app.vercel.app/share/xxx

---

## 🆘 Problems?

### Build Failed
- Check all 9 environment variables are added
- Make sure they're spelled correctly
- Redeploy

### Upload Fails
- Make sure Firestore is enabled
- Make sure Storage is enabled
- Check rules are published

### Share Links Don't Work
- Update `NEXT_PUBLIC_APP_URL` with your Vercel URL
- Redeploy after updating

---

**Total Time:** ~15 minutes
**Cost:** $0 (Free tier)
**Result:** Fully working cloud file sharing app! 🚀
