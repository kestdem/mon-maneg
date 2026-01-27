# Firebase Configuration Guide

This guide provides step-by-step instructions for setting up Firebase for the ParaFlow application.

## Table of Contents
1. [Create Firebase Project](#1-create-firebase-project)
2. [Enable Authentication](#2-enable-authentication)
3. [Setup Realtime Database](#3-setup-realtime-database)
4. [Configure Security Rules](#4-configure-security-rules)
5. [Get Configuration Keys](#5-get-configuration-keys)
6. [Update Application](#6-update-application)
7. [Testing](#7-testing)

## 1. Create Firebase Project

### Steps:
1. Navigate to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project details:
   - **Project name**: `ParaFlow` (or your preferred name)
   - Click **Continue**
4. Google Analytics (optional):
   - Toggle on/off as preferred
   - If enabled, select or create Analytics account
   - Click **Continue**
5. Wait for project creation (takes ~30 seconds)
6. Click **Continue** when ready

### Important Notes:
- Project name becomes part of your Firebase URLs
- Choose a meaningful name for easy identification
- Project ID is permanent and cannot be changed

## 2. Enable Authentication

### Steps:
1. In Firebase Console, select your project
2. In left sidebar, click **"Authentication"**
3. Click **"Get started"** button
4. Navigate to **"Sign-in method"** tab
5. Enable Email/Password:
   - Click on **"Email/Password"** row
   - Toggle **"Enable"** switch (first option)
   - Leave "Email link" disabled (second option)
   - Click **"Save"**

### Verification:
- Status should show as "Enabled" with green checkmark
- Email/Password should be in the enabled providers list

### Security Best Practices:
```javascript
// Optional: Add email verification (add to app.js)
async function handleSignup() {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        await userCredential.user.sendEmailVerification();
        showToast('Verification email sent!', 'success');
    } catch (error) {
        // Handle error
    }
}
```

## 3. Setup Realtime Database

### Steps:
1. In Firebase Console, click **"Realtime Database"** in left sidebar
2. Click **"Create Database"** button
3. Select database location:
   - For Turkey users: Select **"europe-west1 (Belgium)"** (closest)
   - For US users: Select **"us-central1"**
   - For other regions: Choose closest location
4. Security rules setup:
   - Select **"Start in test mode"**
   - Click **"Enable"**
   - ⚠️ **IMPORTANT**: We'll update rules in next step

### Understanding Test Mode:
- **Test Mode**: Anyone can read/write (for 30 days)
- ⚠️ **NOT SUITABLE FOR PRODUCTION**
- We'll change to secure rules immediately

### Database URL Format:
```
https://PROJECT_ID-default-rtdb.REGION.firebasedatabase.app
```

Example:
```
https://paraflow-a1b2c-default-rtdb.europe-west1.firebasedatabase.app
```

## 4. Configure Security Rules

### Steps:
1. In Realtime Database page, click **"Rules"** tab
2. You'll see default test mode rules:
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

3. **Replace** with secure production rules:
```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

4. Click **"Publish"**

### Rule Explanation:

```json
{
  "rules": {
    // Root node containing all user data
    "users": {
      // $uid is a wildcard - matches any user ID
      "$uid": {
        // Users can only read their own data
        ".read": "$uid === auth.uid",
        // Users can only write to their own data
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

**What this does:**
- ✅ Allows users to access only `users/{their-uid}/` path
- ✅ Requires authentication (checks `auth.uid`)
- ✅ Prevents users from seeing others' data
- ✅ Prevents unauthorized access

### Advanced Rules (Optional):

For additional security, you can add validation:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid",
        
        "transactions": {
          "$transactionId": {
            ".validate": "newData.hasChildren(['type', 'amount', 'currency', 'date'])",
            "type": {
              ".validate": "newData.val() === 'income' || newData.val() === 'expense'"
            },
            "amount": {
              ".validate": "newData.isNumber() && newData.val() > 0"
            }
          }
        },
        
        "categories": {
          ".validate": "newData.hasChildren(['income', 'expense'])"
        }
      }
    }
  }
}
```

## 5. Get Configuration Keys

### Steps:
1. Click the **gear icon** (⚙️) next to "Project Overview"
2. Select **"Project settings"**
3. Scroll down to **"Your apps"** section
4. If no web app exists:
   - Click the **web icon** `</>`
   - Enter app nickname: `ParaFlow Web`
   - Check **"Also set up Firebase Hosting"** (optional)
   - Click **"Register app"**
5. Copy the configuration object

### Configuration Format:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",              // Public API key
  authDomain: "project.firebaseapp.com",
  databaseURL: "https://project-default-rtdb.region.firebasedatabase.app",
  projectId: "project-id",
  storageBucket: "project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

### Understanding Each Key:

| Key | Purpose | Can be public? |
|-----|---------|----------------|
| `apiKey` | Identifies your Firebase project | ✅ Yes (protected by auth rules) |
| `authDomain` | Domain for authentication redirects | ✅ Yes |
| `databaseURL` | Your Realtime Database URL | ✅ Yes |
| `projectId` | Unique project identifier | ✅ Yes |
| `storageBucket` | Cloud Storage bucket (unused here) | ✅ Yes |
| `messagingSenderId` | For Firebase Cloud Messaging | ✅ Yes |
| `appId` | Unique app identifier | ✅ Yes |

**Security Note**: These keys are designed to be public. Security is enforced through database rules, not key secrecy.

## 6. Update Application

### Steps:
1. Open `index.html` in your editor
2. Find this section (near line 436):

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

3. Replace with your actual values from Firebase Console

### Example (with real values):
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyBxK9L2mN3o4P5qR6s7T8u9V0wX1yZ2a3B",
    authDomain: "paraflow-finance.firebaseapp.com",
    databaseURL: "https://paraflow-finance-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "paraflow-finance",
    storageBucket: "paraflow-finance.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890abcdef"
};
```

4. Save the file

### For GitHub Pages:
- Commit the updated `index.html`
- Push to GitHub
- Changes will be live after GitHub Pages rebuilds (1-2 minutes)

### Environment Variables (Advanced):
For more security in production, consider using environment variables:

```javascript
// Create a separate config.js file (don't commit to git)
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    // ... etc
};

// Add config.js to .gitignore
// Inject variables during build/deployment
```

## 7. Testing

### Local Testing:

1. **Start a local server**:
```bash
# Option 1: Python
python -m http.server 8000

# Option 2: Node.js
npx http-server -p 8000

# Option 3: PHP
php -S localhost:8000
```

2. **Open in browser**:
```
http://localhost:8000
```

### Test Checklist:

#### Authentication Tests:
- [ ] Sign up with new email
- [ ] Verify user appears in Firebase Console → Authentication → Users
- [ ] Log out
- [ ] Log in with same credentials
- [ ] Try signing up with same email (should fail)
- [ ] Try logging in with wrong password (should fail)

#### Database Tests:
- [ ] Add income transaction
- [ ] Check Firebase Console → Realtime Database → Data
- [ ] Verify data appears under `users/{your-uid}/transactions`
- [ ] Add expense transaction
- [ ] View transactions list
- [ ] Delete a transaction
- [ ] Verify deletion in Firebase Console

#### Category Tests:
- [ ] Open category management
- [ ] Add new income category
- [ ] Add subcategory under existing category
- [ ] Delete a category
- [ ] Switch between income/expense tabs

#### Currency Tests:
- [ ] Add new currency (USD, EUR, etc.)
- [ ] Create transaction with new currency
- [ ] Verify currency appears in transaction list

#### Chart Tests:
- [ ] Verify expense distribution chart shows data
- [ ] Change date range for daily chart
- [ ] Add transactions and see charts update
- [ ] Delete transactions and see charts update

#### UI Tests:
- [ ] Toggle between light/dark mode
- [ ] Toggle between TR/EN language
- [ ] Test on mobile device or responsive mode
- [ ] Verify layout adapts to different screen sizes

### Debugging Common Issues:

#### "Permission Denied" Error:
```javascript
// Check in browser console:
console.log('Current user:', firebase.auth().currentUser);
console.log('User ID:', firebase.auth().currentUser?.uid);

// Verify in Firebase Rules:
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",  // Make sure this matches
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

#### Configuration Not Loading:
```javascript
// Add this to app.js after initialization:
console.log('Firebase initialized:', firebase.apps.length > 0);
console.log('Auth configured:', !!firebase.auth());
console.log('Database configured:', !!firebase.database());
```

#### CORS Issues (Local Development):
- Don't open `index.html` directly (file://)
- Always use a local server (http://)
- Check browser console for specific CORS errors

### Firebase Console Monitoring:

1. **Authentication Usage**:
   - Go to: Authentication → Usage
   - Monitor: Daily active users, sign-ups

2. **Database Usage**:
   - Go to: Realtime Database → Usage
   - Monitor: Bandwidth, storage, concurrent connections

3. **Error Logs**:
   - Issues usually appear in browser console
   - Check: Network tab for failed requests

## Security Checklist

Before going live:

- [ ] Security rules configured (not test mode)
- [ ] Authentication enabled
- [ ] Email verification implemented (optional)
- [ ] Password requirements enforced
- [ ] Rate limiting considered (Firebase App Check)
- [ ] Billing alerts set up
- [ ] Backup strategy in place
- [ ] Terms of service & privacy policy created

## Monitoring & Maintenance

### Weekly Checks:
- Review Authentication → Users for suspicious accounts
- Check Database → Usage for unexpected spikes
- Monitor app performance

### Monthly Tasks:
- Export database backup
- Review security rules
- Check for Firebase updates
- Review authentication logs

### Firebase Quotas (Free Spark Plan):

| Resource | Limit |
|----------|-------|
| Realtime Database Storage | 1 GB |
| Realtime Database Downloads | 10 GB/month |
| Concurrent Connections | 100 |
| Authentication | Unlimited |

For most personal use cases, free tier is sufficient.

## Support Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Console](https://console.firebase.google.com/)
- [Firebase CLI](https://firebase.google.com/docs/cli)
- [Firebase Status](https://status.firebase.google.com/)
- [Stack Overflow - Firebase Tag](https://stackoverflow.com/questions/tagged/firebase)

## Next Steps

After successful testing:
1. Deploy to GitHub Pages (see main README.md)
2. Share the URL with users
3. Monitor usage in Firebase Console
4. Gather user feedback
5. Iterate and improve

---

**Questions or issues?** Check the main README.md troubleshooting section or Firebase documentation.
