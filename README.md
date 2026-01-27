# ParaFlow - Personal Finance Tracker

A modern, mobile-responsive personal income and expense tracking web application built with vanilla JavaScript, HTML, and CSS. Features Firebase Authentication and Realtime Database for secure, user-specific financial data management.

## Features

### Core Functionality
- ✅ User authentication (email/password) with Firebase
- ✅ Private user sessions with isolated financial data
- ✅ Income and expense tracking with detailed records
- ✅ Custom category management with subcategories
- ✅ Multi-currency support (default: Turkish Lira)
- ✅ Real-time data synchronization

### Visualization
- 📊 Pie/doughnut chart for expense distribution by category
- 📈 Bar chart for daily expense trends
- 💰 Summary cards showing total income, expenses, and balance
- 📅 Date range filtering for detailed analysis

### UI/UX
- 🌍 Bilingual support (Turkish & English)
- 🌓 Light and Dark mode with smooth transitions
- 📱 Fully mobile-responsive design
- 🎨 Modern blue-themed interface
- ⚡ Smooth animations and transitions

## Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Authentication**: Firebase Authentication
- **Database**: Firebase Realtime Database
- **Charts**: Chart.js
- **Fonts**: Plus Jakarta Sans, Sora (Google Fonts)
- **Hosting**: GitHub Pages compatible

## Project Structure

```
paraflow/
├── index.html          # Main HTML file with app structure
├── styles.css          # Complete styling with theme support
├── app.js              # Application logic and Firebase integration
└── README.md           # Documentation
```

## Firebase Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter a project name (e.g., "ParaFlow")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Firebase Authentication

1. In your Firebase project, click "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable "Email/Password" authentication:
   - Click on "Email/Password"
   - Toggle the first switch (Email/Password) to enable
   - Click "Save"

### 3. Create Realtime Database

1. In Firebase Console, click "Realtime Database" in the left sidebar
2. Click "Create Database"
3. Choose a database location (select closest to your users)
4. Select "Start in test mode" for development
   - **IMPORTANT**: For production, you'll need to update security rules (see below)
5. Click "Enable"

### 4. Configure Security Rules

Once your database is created, update the security rules:

1. Go to "Realtime Database" → "Rules" tab
2. Replace the rules with:

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

These rules ensure:
- Users can only read/write their own data
- Authentication is required for all operations

3. Click "Publish"

### 5. Get Firebase Configuration

1. In Firebase Console, click the gear icon (⚙️) next to "Project Overview"
2. Click "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon `</>` to add a web app
5. Register your app with a nickname (e.g., "ParaFlow Web")
6. Copy the Firebase configuration object

### 6. Add Configuration to Your App

Open `index.html` and find this section near the bottom:

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

Replace the placeholder values with your actual Firebase configuration values.

**Example:**
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyBx1234567890abcdefghijk",
    authDomain: "paraflow-12345.firebaseapp.com",
    databaseURL: "https://paraflow-12345-default-rtdb.firebaseio.com",
    projectId: "paraflow-12345",
    storageBucket: "paraflow-12345.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890"
};
```

## GitHub Pages Deployment

### Option 1: Using GitHub Web Interface

1. Create a new GitHub repository
2. Upload these files:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `README.md`

3. Go to repository Settings
4. Navigate to "Pages" in the left sidebar
5. Under "Source", select "Deploy from a branch"
6. Select "main" branch and "/ (root)" folder
7. Click "Save"
8. Your site will be published at: `https://yourusername.github.io/repository-name/`

### Option 2: Using Git Command Line

1. Initialize Git repository:
```bash
git init
git add .
git commit -m "Initial commit: ParaFlow finance tracker"
```

2. Create repository on GitHub (without initializing with README)

3. Link and push:
```bash
git remote add origin https://github.com/yourusername/repository-name.git
git branch -M main
git push -u origin main
```

4. Enable GitHub Pages (follow steps from Option 1, steps 3-7)

### Important Notes for GitHub Pages

- Make sure all file references in HTML are relative (not absolute paths)
- The app works entirely client-side, perfect for GitHub Pages
- No server-side code needed
- Firebase handles all backend operations

## Database Structure

The application uses the following Firebase Realtime Database structure:

```
users/
  {userId}/
    categories/
      income/
        {categoryKey}/
          name: "Category Name"
          nameEn: "Category Name (English)"
          subcategories/
            {subcategoryKey}/
              name: "Subcategory Name"
              nameEn: "Subcategory Name (English)"
      expense/
        {categoryKey}/
          name: "Category Name"
          nameEn: "Category Name (English)"
          subcategories/
            {subcategoryKey}/
              name: "Subcategory Name"
              nameEn: "Subcategory Name (English)"
    currencies/
      {currencyCode}/
        code: "USD"
        symbol: "$"
    transactions/
      {transactionId}/
        type: "income" | "expense"
        amount: 1000.00
        currency: "TRY"
        categoryKey: "salary"
        subcategoryKey: "monthly" (optional)
        date: "2025-01-27"
        description: "Optional description"
        timestamp: 1234567890
```

## Default Data

When a user signs up, the app automatically creates:

### Default Categories

**Income:**
- Maaş / Salary
- Yan Gelir / Side Income
- Yatırım / Investment

**Expense:**
- Yeme-İçme / Food & Drink
- Ulaşım / Transportation
- Alışveriş / Shopping
- Faturalar / Bills
- Eğlence / Entertainment

### Default Currency
- TRY (Turkish Lira) with symbol ₺

Users can add custom categories and currencies through the app interface.

## Usage Guide

### First Time Setup

1. Open the application in your browser
2. Click "Kayıt Ol" (Sign Up)
3. Enter your email and password
4. Click "Kayıt Ol" to create your account
5. You'll be automatically logged in with default categories

### Adding Transactions

1. Click "Gelir Ekle" (Add Income) or "Gider Ekle" (Add Expense)
2. Enter the amount
3. Select currency (default: TRY)
4. Choose a category and optionally a subcategory
5. Select the date
6. Add an optional description
7. Click "Kaydet" (Save)

### Managing Categories

1. Click "Kategoriler" (Categories)
2. Switch between Income and Expense tabs
3. To add a new category:
   - Enter category name
   - Choose whether it's a main category or subcategory
   - Click "Kategori Ekle" (Add Category)
4. To delete a category, click "Sil" (Delete) next to it

### Adding Currencies

1. When adding a transaction, click "+ Yeni Para Birimi" (+ New Currency)
2. Enter 3-letter currency code (e.g., USD, EUR)
3. Enter currency symbol (e.g., $, €)
4. Click "Ekle" (Add)

### Viewing Charts

- **Expense Distribution**: Automatically shows breakdown by category
- **Daily Expenses**: Select date range to see daily expense trends
- Charts update automatically when you add or delete transactions

### Language Toggle

- Click the language button in the header (TR/EN)
- Interface will switch between Turkish and English
- Preference is saved in browser

### Theme Toggle

- Click the sun/moon icon in the header
- Switch between light and dark mode
- Preference is saved in browser

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Security Considerations

### Current Setup (Development)
- Firebase security rules allow authenticated users to access only their data
- Email/password authentication with Firebase

### Production Recommendations
1. **Enable Email Verification**:
   ```javascript
   // In app.js, after signup
   await user.sendEmailVerification();
   ```

2. **Implement Password Reset**:
   ```javascript
   await auth.sendPasswordResetEmail(email);
   ```

3. **Add Rate Limiting**: Use Firebase App Check
4. **Monitor Usage**: Set up Firebase billing alerts
5. **Regular Backups**: Export database periodically

### Data Privacy
- All data is stored in Firebase under user-specific paths
- No data sharing between users
- Users own their data completely
- To delete account and data, contact Firebase Admin or implement deletion function

## Troubleshooting

### "Permission Denied" Error
- Check Firebase security rules are correctly configured
- Ensure user is logged in
- Verify authentication state

### Charts Not Displaying
- Check browser console for errors
- Ensure Chart.js is loading (check network tab)
- Verify transactions exist in database

### Authentication Issues
- Verify Firebase configuration is correct
- Check if Email/Password auth is enabled in Firebase Console
- Look for CORS issues if testing locally (use http-server or similar)

### Data Not Syncing
- Check internet connection
- Verify Firebase Database URL is correct
- Check browser console for database errors

## Local Development

For local development:

1. Use a local server (Firebase Hosting, http-server, or Python's SimpleHTTPServer)
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js http-server
   npx http-server
   ```

2. Open `http://localhost:8000` in your browser

**Note**: Simply opening `index.html` as a file may cause CORS issues with Firebase.

## Performance Tips

1. **Optimize Database Reads**: App uses real-time listeners efficiently
2. **Lazy Load Charts**: Charts only render when data is available
3. **Minimize Redraws**: Charts update only when necessary
4. **Cache Static Assets**: Leverage browser caching for CSS/JS

## Future Enhancements (Optional)

- Budget setting and tracking
- Recurring transactions
- Multi-month views
- Data export (CSV/PDF)
- Receipt photo upload
- Spending insights and recommendations
- Budget alerts and notifications

## License

This project is provided as-is for personal use. Feel free to modify and customize for your needs.

## Support

For issues or questions:
1. Check Firebase Console for configuration issues
2. Review browser console for JavaScript errors
3. Verify network connectivity to Firebase
4. Check GitHub Pages deployment status

## Credits

- **Charts**: Chart.js
- **Backend**: Firebase (Authentication & Realtime Database)
- **Fonts**: Google Fonts (Plus Jakarta Sans, Sora)
- **Icons**: SVG icons (inline)

---

**Note**: Remember to keep your Firebase configuration secure. Never commit sensitive credentials to public repositories. Consider using environment variables for production deployments.
