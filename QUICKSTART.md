# Quick Start Guide - ParaFlow

Get your finance tracker running in 10 minutes!

## 🚀 Fast Track Setup

### Step 1: Download Files (1 min)
Download all these files to a folder:
- `index.html`
- `styles.css`
- `app.js`
- `README.md`
- `FIREBASE_SETUP.md`

### Step 2: Firebase Setup (5 min)

1. **Create Project** → [console.firebase.google.com](https://console.firebase.google.com)
   - Click "Add project"
   - Name it "ParaFlow"
   - Disable Analytics (optional)

2. **Enable Authentication**
   - Go to Authentication → Get Started
   - Enable "Email/Password"

3. **Create Database**
   - Go to Realtime Database → Create Database
   - Choose location: Europe (Belgium) for Turkey
   - Start in "test mode"

4. **Secure the Database**
   - Go to Database → Rules tab
   - Replace with:
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
   - Click "Publish"

5. **Get Config**
   - Click gear icon → Project settings
   - Scroll to "Your apps" → Click web icon `</>`
   - Copy the config object

### Step 3: Update Code (2 min)

1. Open `index.html` in text editor
2. Find line ~436 with `firebaseConfig`
3. Paste your Firebase config
4. Save file

### Step 4: Deploy to GitHub Pages (2 min)

**Option A: Web Upload**
1. Create new repo on GitHub
2. Upload all files
3. Settings → Pages → Deploy from main branch
4. Done! Your URL: `https://username.github.io/repo-name/`

**Option B: Command Line**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/repo-name.git
git push -u origin main
```
Then enable Pages in repo settings.

## ✅ Test It

1. Open your GitHub Pages URL
2. Click "Kayıt Ol" (Sign Up)
3. Create account with email/password
4. Add a test transaction
5. See it appear in charts!

## 🎨 Customize

### Change Colors
In `styles.css`, modify these variables:
```css
:root {
    --primary-500: #3b82f6;  /* Main blue */
    --primary-600: #2563eb;  /* Darker blue */
}
```

### Add Your Logo
Replace the ₺ symbol in `index.html`:
```html
<div class="logo-icon">₺</div>  <!-- Replace with your icon -->
```

### Default Currency
In `app.js`, find `initializeUserDefaults()` and change:
```javascript
defaultCurrencies: {
    'USD': { code: 'USD', symbol: '$' }  // Instead of TRY
}
```

## 📱 Use It

- **Desktop**: Open in any browser
- **Mobile**: Save to home screen for app-like experience
  - iPhone: Share → Add to Home Screen
  - Android: Menu → Add to Home Screen

## 🔒 Security Tips

1. **Use strong passwords** (min 8 characters)
2. **Don't share credentials**
3. **Check Firebase Console** regularly
4. **Monitor usage** in Firebase → Usage tab

## 🐛 Common Issues

**"Permission denied"**
→ Check Firebase rules are published

**"Network error"**
→ Check Firebase config is correct

**"Not loading"**
→ Make sure you're using a server (not opening file:// directly)

**Charts not showing**
→ Add some transactions first!

## 📚 Next Steps

- Read full `README.md` for detailed features
- Check `FIREBASE_SETUP.md` for advanced configuration
- Customize categories for your needs
- Add more currencies as needed

## 💡 Pro Tips

1. **Backup**: Export database monthly from Firebase Console
2. **Budget**: Use category totals to track spending limits
3. **Review**: Check charts weekly to spot trends
4. **Organize**: Use subcategories for detailed tracking
5. **Currency**: Add all currencies you use upfront

## 🎯 Usage Examples

**Track Monthly Salary:**
1. Add Income → Category: "Maaş" → Amount: 50000 TRY

**Log Coffee Purchase:**
1. Add Expense → Category: "Yeme-İçme" → Amount: 85 TRY

**Split Rent Payment:**
1. Add custom category: "Ev → Kira"
2. Add Expense → Category: "Ev" → Subcategory: "Kira"

**Multi-currency Trip:**
1. Add currencies: USD, EUR
2. Log expenses in each currency
3. View in summary (shown in TRY by default)

## 🌟 Features Overview

✅ Track income & expenses
✅ Visual charts & graphs
✅ Categories & subcategories
✅ Multiple currencies
✅ Dark/Light mode
✅ Turkish/English
✅ Mobile responsive
✅ Real-time sync
✅ Private & secure

## Need Help?

1. Check browser console (F12) for errors
2. Review Firebase Console for data issues
3. Read full documentation in README.md
4. Check Firebase status: status.firebase.google.com

---

**You're ready to go! Start tracking your finances.** 💰📊
