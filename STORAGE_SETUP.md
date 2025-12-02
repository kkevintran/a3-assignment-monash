# Firebase Storage Setup Instructions

## The Problem

You're getting CORS errors because Firebase Storage is not enabled in your Firebase project.

## Solution: Enable Firebase Storage

### Step 1: Enable Storage in Firebase Console

1. Go to: https://console.firebase.google.com/project/monash-a3/storage
2. Click **"Get Started"**
3. Choose **"Start in production mode"** (we have security rules configured)
4. Select a location: **`australia-southeast1`** (to match your Firestore location)
5. Click **"Done"**

### Step 2: Deploy Storage Rules

After enabling Storage, run this command in your terminal:

```bash
firebase deploy --only storage
```

Or deploy everything:

```bash
firebase deploy
```

### Step 3: Verify

After deploying, try uploading a file again. The CORS errors should be resolved.

## What the Storage Rules Do

The `storage.rules` file I created allows:

- ✅ Authenticated users to upload resumes to `/resumes/{userId}/`
- ✅ Authenticated users to upload cover letters to `/cover-letters/{userId}/`
- ✅ Users to read their own files
- ✅ Other authenticated users to read files (for job posters viewing applications)
- ❌ Unauthenticated users cannot upload or read files
- ❌ Users cannot upload to other users' folders

## Troubleshooting

If you still get errors after enabling Storage:

1. **Check Storage is enabled**: Go to Firebase Console → Storage and verify you see the Storage interface
2. **Verify rules are deployed**: Check the Rules tab in Storage console - you should see the rules from `storage.rules`
3. **Check authentication**: Make sure you're logged in when trying to upload
4. **Check browser console**: Look for more specific error messages

## Alternative: Test Mode (Not Recommended for Production)

If you need to test quickly, you can temporarily use test mode:

- In Firebase Console → Storage → Rules tab
- Click "Edit rules"
- Use test mode rules (allows all reads/writes)
- **Remember to switch back to production mode with proper rules!**
