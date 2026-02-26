// ===================================
// Firebase Initialization & Config
// ===================================
let db, auth, currentUser;
let userSettings = { monthlyBudget: null, monthlyPeriodStartDay: 1 };

// Initialize Firebase when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Firebase
    firebase.initializeApp(window.firebaseConfig);
    auth = firebase.auth();
    db = firebase.database();

    // Do not persist sessions across browser restarts
    auth.setPersistence(firebase.auth.Auth.Persistence.NONE).catch((error) => {
        console.error('Error setting auth persistence:', error);
    });

    let appInitialized = false;
    
    // Check authentication state
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            showApp();
            updateUserUI(user);
            
            if (!appInitialized){
                initializeApp();
                appInitialized = true;
            }

            // Eğer e-posta doğrulanmamışsa, sadece bilgilendirici bir uyarı göster
            if (!user.emailVerified) {
                showToast(
                    t(
                        'Hesabınız aktif, ancak güvenlik için e-posta adresinizi doğrulamanız önerilir.',
                        'Your account is active, but for security it is recommended to verify your email address.'
                    ),
                    'info'
                );
            }
        } else {
            currentUser = null;
            appInitialized = false;
            updateUserUI(null);
            showAuth();
        }
    });
    
    // Hide loading screen
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
    }, 1500);
    
    // Initialize UI
    initializeUI();
});

// ===================================
// Language Management
// ===================================
const translations = {
    tr: {},
    en: {}
};

let currentLang = 'tr';

function initializeLanguage() {
    const savedLang = localStorage.getItem('language') || 'tr';
    currentLang = savedLang;
    document.body.setAttribute('data-lang', currentLang);
    updateLanguageButton();
    updateAllTranslations();
}

function toggleLanguage() {
    currentLang = currentLang === 'tr' ? 'en' : 'tr';
    localStorage.setItem('language', currentLang);
    document.body.setAttribute('data-lang', currentLang);
    updateLanguageButton();
    updateAllTranslations();
}

function updateLanguageButton() {
    const langBtn = document.getElementById('lang-toggle');
    if (langBtn) {
        langBtn.querySelector('.lang-text').textContent = currentLang.toUpperCase();
    }
}

function updateAllTranslations() {
    const elements = document.querySelectorAll('[data-tr]');
    elements.forEach(el => {
        const trText = el.getAttribute('data-tr');
        const enText = el.getAttribute('data-en');
        el.textContent = currentLang === 'tr' ? trText : enText;
    });
}

function t(tr, en) {
    return currentLang === 'tr' ? tr : en;
}

// ===================================
// Theme Management
// ===================================
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        updateThemeIcon(true);
    }
}

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcon(isDark);
}

function updateThemeIcon(isDark) {
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');
    if (sunIcon && moonIcon) {
        sunIcon.style.display = isDark ? 'none' : 'block';
        moonIcon.style.display = isDark ? 'block' : 'none';
    }
}

// ===================================
// UI Initialization
// ===================================
function initializeUI() {
    initializeLanguage();
    initializeTheme();
    
    // Auth form switching
    document.getElementById('show-signup')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('login-form').classList.remove('active');
        document.getElementById('signup-form').classList.add('active');
    });
    
    document.getElementById('show-login')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('signup-form').classList.remove('active');
        document.getElementById('login-form').classList.add('active');
    });
    
    // Auth buttons
    document.getElementById('login-btn')?.addEventListener('click', handleLogin);
    document.getElementById('signup-btn')?.addEventListener('click', handleSignup);
    document.getElementById('forgot-password')?.addEventListener('click', handlePasswordReset);
    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
    
    // Theme and language toggles
    document.getElementById('auth-theme-toggle')?.addEventListener('click', toggleTheme);
    document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
    document.getElementById('lang-toggle')?.addEventListener('click', toggleLanguage);

    // User menu
    document.getElementById('user-menu-toggle')?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleUserMenu();
    });
    document.getElementById('user-settings-btn')?.addEventListener('click', () => {
        closeUserMenu();
        openSettingsModal();
    });
    
    // Action buttons
    document.getElementById('add-income-btn')?.addEventListener('click', () => openTransactionModal('income'));
    document.getElementById('add-expense-btn')?.addEventListener('click', () => openTransactionModal('expense'));
    document.getElementById('manage-categories-btn')?.addEventListener('click', openCategoryModal);
    
    // Modal close buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });
    
    // Click outside modal to close
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeAllModals();
            }
        });
    });
    
    // Transaction modal
    document.getElementById('save-transaction-btn')?.addEventListener('click', handleSaveTransaction);
    document.getElementById('transaction-category')?.addEventListener('change', handleCategoryChange);
    document.getElementById('add-currency-btn')?.addEventListener('click', openCurrencyModal);
    
    // Category modal
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            loadCategories(e.target.getAttribute('data-type'));
        });
    });
    document.getElementById('add-category-btn-modal')?.addEventListener('click', handleAddCategory);
    
    // Currency modal
    document.getElementById('save-currency-btn')?.addEventListener('click', handleAddCurrency);
    
    // Settings modal
    document.getElementById('save-settings-btn')?.addEventListener('click', handleSaveSettings);
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            filterTransactions(e.target.getAttribute('data-filter'));
        });
    });
    
    // Date range for daily chart
    document.getElementById('start-date')?.addEventListener('change', updateDailyChart);
    document.getElementById('end-date')?.addEventListener('change', updateDailyChart);

    // Date change also updates category analysis
    document.getElementById('start-date')?.addEventListener('change', updateCategoryAnalysis);
    document.getElementById('end-date')?.addEventListener('change', updateCategoryAnalysis);

    // Close user menu when clicking outside
    document.addEventListener('click', (e) => {
        const userMenu = document.querySelector('.user-menu');
        if (!userMenu) return;
        if (!userMenu.contains(e.target)) {
            closeUserMenu();
        }
    });
    
    // Set default dates (last 7 days)
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    if (document.getElementById('end-date')) {
        document.getElementById('end-date').valueAsDate = today;
    }
    if (document.getElementById('start-date')) {
        document.getElementById('start-date').valueAsDate = lastWeek;
    }
}

// ===================================
// Authentication
// ===================================
function showAuth() {
    document.getElementById('auth-container').style.display = 'flex';
    document.getElementById('app-container').style.display = 'none';
}

function showApp() {
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('app-container').style.display = 'flex';
}

function updateUserUI(user) {
    const avatarEl = document.getElementById('user-avatar');
    const emailTextEl = document.getElementById('user-email-text');
    const menuEmailEl = document.getElementById('user-menu-email');

    if (!avatarEl || !emailTextEl || !menuEmailEl) return;

    if (!user) {
        avatarEl.textContent = 'U';
        emailTextEl.textContent = '';
        menuEmailEl.textContent = '';
        return;
    }

    const email = user.email || '';
    const initial = email ? email.charAt(0).toUpperCase() : 'U';

    avatarEl.textContent = initial;
    emailTextEl.textContent = email;
    menuEmailEl.textContent = email;
}

function toggleUserMenu() {
    const dropdown = document.getElementById('user-menu-dropdown');
    if (!dropdown) return;
    dropdown.classList.toggle('open');
}

function closeUserMenu() {
    const dropdown = document.getElementById('user-menu-dropdown');
    if (!dropdown) return;
    dropdown.classList.remove('open');
}

async function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        showToast(t('Lütfen tüm alanları doldurun', 'Please fill in all fields'), 'error');
        return;
    }
    
    try {
        await auth.signInWithEmailAndPassword(email, password);
        showToast(t('Giriş başarılı!', 'Login successful!'), 'success');
    } catch (error) {
        console.error('Login error:', error);
        showToast(t('Giriş başarısız: ' + error.message, 'Login failed: ' + error.message), 'error');
    }
}

async function handleSignup() {
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-password-confirm').value;
    
    if (!email || !password || !confirmPassword) {
        showToast(t('Lütfen tüm alanları doldurun', 'Please fill in all fields'), 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showToast(t('Şifreler eşleşmiyor', 'Passwords do not match'), 'error');
        return;
    }
    
    if (password.length < 6) {
        showToast(t('Şifre en az 6 karakter olmalıdır', 'Password must be at least 6 characters'), 'error');
        return;
    }
    
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        // Initialize default categories and currency
        await initializeUserDefaults(userCredential.user.uid);

        try {
            await userCredential.user.sendEmailVerification();
            showToast(
                t(
                    'Hesap oluşturuldu! Lütfen e-posta adresinizi doğrulamak için mailinizi kontrol edin.',
                    'Account created! Please check your email to verify your address.'
                ),
                'success'
            );
        } catch (verificationError) {
            console.error('Email verification error:', verificationError);
            showToast(
                t(
                    'Hesap oluşturuldu ancak doğrulama e-postası gönderilemedi. Lütfen daha sonra tekrar deneyin.',
                    'Account created, but verification email could not be sent. Please try again later.'
                ),
                'error'
            );
        }
    } catch (error) {
        console.error('Signup error:', error);
        showToast(t('Kayıt başarısız: ' + error.message, 'Signup failed: ' + error.message), 'error');
    }
}

async function handlePasswordReset() {
    const emailInput = document.getElementById('login-email');
    const email = emailInput ? emailInput.value.trim() : '';

    if (!email) {
        showToast(
            t('Lütfen e-posta adresinizi girin', 'Please enter your email address'),
            'error'
        );
        return;
    }

    try {
        await auth.sendPasswordResetEmail(email);
        showToast(
            t(
                'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi',
                'Password reset link has been sent to your email'
            ),
            'success'
        );
    } catch (error) {
        console.error('Password reset error:', error);
        showToast(
            t(
                'Şifre sıfırlama isteği başarısız: ' + error.message,
                'Password reset request failed: ' + error.message
            ),
            'error'
        );
    }
}

async function handleLogout() {
    try {
        await auth.signOut();
        showToast(t('Çıkış yapıldı', 'Logged out'), 'success');
        closeUserMenu();
    } catch (error) {
        console.error('Logout error:', error);
        showToast(t('Çıkış başarısız', 'Logout failed'), 'error');
    }
}

async function initializeUserDefaults(userId) {
    // Default categories
    const defaultCategories = {
        income: {
            'Maaş': { name: 'Maaş', nameEn: 'Salary', subcategories: {} },
            'Yan Gelir': { name: 'Yan Gelir', nameEn: 'Side Income', subcategories: {} },
            'Yatırım': { name: 'Yatırım', nameEn: 'Investment', subcategories: {} }
        },
        expense: {
            'Yeme-İçme': { name: 'Yeme-İçme', nameEn: 'Food & Drink', subcategories: {} },
            'Ulaşım': { name: 'Ulaşım', nameEn: 'Transportation', subcategories: {} },
            'Alışveriş': { name: 'Alışveriş', nameEn: 'Shopping', subcategories: {} },
            'Faturalar': { name: 'Faturalar', nameEn: 'Bills', subcategories: {} },
            'Eğlence': { name: 'Eğlence', nameEn: 'Entertainment', subcategories: {} }
        }
    };
    
    // Default currency
    const defaultCurrencies = {
        'TRY': { code: 'TRY', symbol: '₺' }
    };
    
    await db.ref(`users/${userId}/categories`).set(defaultCategories);
    await db.ref(`users/${userId}/currencies`).set(defaultCurrencies);
}

function loadUserSettings() {
    if (!currentUser) return;

    if (settingsRef) {
        settingsRef.off();
    }

    settingsRef = db.ref(`users/${currentUser.uid}/settings`);
    settingsRef.on('value', (snapshot) => {
        const settings = snapshot.val() || {};
        userSettings.monthlyBudget =
            typeof settings.monthlyBudget === 'number' ? settings.monthlyBudget : null;
        userSettings.monthlyPeriodStartDay =
            typeof settings.monthlyPeriodStartDay === 'number' && settings.monthlyPeriodStartDay >= 1 && settings.monthlyPeriodStartDay <= 28
                ? settings.monthlyPeriodStartDay
                : 1;
        updateBudgetUsage();
    });
}

function openSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (!modal) return;

    const budgetInput = document.getElementById('monthly-budget-amount');
    const daySelect = document.getElementById('monthly-period-start-day');
    if (budgetInput) {
        budgetInput.value =
            userSettings.monthlyBudget && userSettings.monthlyBudget > 0
                ? userSettings.monthlyBudget
                : '';
    }
    if (daySelect) {
        daySelect.value = String(userSettings.monthlyPeriodStartDay || 1);
    }

    modal.classList.add('active');
}

async function handleSaveSettings() {
    if (!currentUser) return;

    const budgetInput = document.getElementById('monthly-budget-amount');
    const daySelect = document.getElementById('monthly-period-start-day');
    if (!budgetInput || !daySelect) return;

    const budgetValue = parseFloat(budgetInput.value);
    const dayValue = parseInt(daySelect.value, 10);

    if (isNaN(budgetValue) || budgetValue <= 0) {
        showToast(
            t('Lütfen geçerli bir bütçe girin', 'Please enter a valid budget amount'),
            'error'
        );
        return;
    }

    const normalizedDay =
        !isNaN(dayValue) && dayValue >= 1 && dayValue <= 28 ? dayValue : 1;

    try {
        await db.ref(`users/${currentUser.uid}/settings`).update({
            monthlyBudget: budgetValue,
            monthlyPeriodStartDay: normalizedDay
        });
        showToast(
            t('Ayarlar kaydedildi', 'Settings saved'),
            'success'
        );
        closeAllModals();
    } catch (error) {
        console.error('Save settings error:', error);
        showToast(
            t('Ayarlar kaydedilemedi', 'Failed to save settings'),
            'error'
        );
    }
}

// ===================================
// App Initialization
// ===================================
function initializeApp() {
    loadCurrencies();
    loadTransactions();
    loadUserSettings();
}

// ===================================
// Currency Management
// ===================================
async function loadCurrencies() {
    if (!currentUser) return;
    
    const currenciesRef = db.ref(`users/${currentUser.uid}/currencies`);
    currenciesRef.on('value', (snapshot) => {
        const currencies = snapshot.val() || { 'TRY': { code: 'TRY', symbol: '₺' } };
        updateCurrencySelect(currencies);
    });
}

function updateCurrencySelect(currencies) {
    const select = document.getElementById('transaction-currency');
    if (!select) return;
    
    select.innerHTML = '';
    Object.entries(currencies).forEach(([code, currency]) => {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = `${currency.symbol} ${code}`;
        select.appendChild(option);
    });
}

function openCurrencyModal() {
    document.getElementById('currency-modal').classList.add('active');
    document.getElementById('new-currency-code').value = '';
    document.getElementById('new-currency-symbol').value = '';
}

async function handleAddCurrency() {
    if (!currentUser) return;
    
    const code = document.getElementById('new-currency-code').value.toUpperCase().trim();
    const symbol = document.getElementById('new-currency-symbol').value.trim();
    
    if (!code || !symbol) {
        showToast(t('Lütfen tüm alanları doldurun', 'Please fill in all fields'), 'error');
        return;
    }
    
    if (code.length !== 3) {
        showToast(t('Para birimi kodu 3 karakter olmalıdır', 'Currency code must be 3 characters'), 'error');
        return;
    }
    
    try {
        await db.ref(`users/${currentUser.uid}/currencies/${code}`).set({
            code: code,
            symbol: symbol
        });
        
        showToast(t('Para birimi eklendi', 'Currency added'), 'success');
        closeAllModals();
    } catch (error) {
        console.error('Add currency error:', error);
        showToast(t('Para birimi eklenemedi', 'Failed to add currency'), 'error');
    }
}

// ===================================
// Category Management
// ===================================
function openCategoryModal() {
    document.getElementById('category-modal').classList.add('active');
    loadCategories('income');
}

async function loadCategories(type) {
    if (!currentUser) return;
    
    const categoriesRef = db.ref(`users/${currentUser.uid}/categories/${type}`);
    const snapshot = await categoriesRef.once('value');
    const categories = snapshot.val() || {};
    
    displayCategories(categories, type);
    updateParentCategorySelect(categories);
}

function displayCategories(categories, type) {
    const list = document.getElementById('categories-list');
    if (!list) return;
    
    list.innerHTML = '';
    
    Object.entries(categories).forEach(([key, category]) => {
        // Main category
        const item = document.createElement('div');
        item.className = 'category-item';
        item.innerHTML = `
            <span class="category-name">${currentLang === 'tr' ? category.name : (category.nameEn || category.name)}</span>
            <button class="delete-category-btn" onclick="deleteCategory('${type}', '${key}')">
                ${t('Sil', 'Delete')}
            </button>
        `;
        list.appendChild(item);
        
        // Subcategories
        if (category.subcategories) {
            Object.entries(category.subcategories).forEach(([subKey, subcategory]) => {
                const subItem = document.createElement('div');
                subItem.className = 'category-item subcategory';
                subItem.innerHTML = `
                    <span class="category-name">${currentLang === 'tr' ? subcategory.name : (subcategory.nameEn || subcategory.name)}</span>
                    <button class="delete-category-btn" onclick="deleteCategory('${type}', '${key}', '${subKey}')">
                        ${t('Sil', 'Delete')}
                    </button>
                `;
                list.appendChild(subItem);
            });
        }
    });
    
    if (Object.keys(categories).length === 0) {
        list.innerHTML = `<div class="empty-state"><p>${t('Henüz kategori yok', 'No categories yet')}</p></div>`;
    }
}

function updateParentCategorySelect(categories) {
    const select = document.getElementById('parent-category');
    if (!select) return;
    
    select.innerHTML = `<option value="">${t('Ana kategori olarak ekle', 'Add as main category')}</option>`;
    
    Object.entries(categories).forEach(([key, category]) => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = currentLang === 'tr' ? category.name : (category.nameEn || category.name);
        select.appendChild(option);
    });
}

async function handleAddCategory() {
    if (!currentUser) return;
    
    const type = document.querySelector('.category-tab.active').getAttribute('data-type');
    const name = document.getElementById('new-category-name').value.trim();
    const parentKey = document.getElementById('parent-category').value;
    
    if (!name) {
        showToast(t('Lütfen kategori adı girin', 'Please enter category name'), 'error');
        return;
    }
    
    const categoryKey = name.replace(/\s+/g, '-').toLowerCase();
    
    try {
        if (parentKey) {
            // Add as subcategory
            await db.ref(`users/${currentUser.uid}/categories/${type}/${parentKey}/subcategories/${categoryKey}`).set({
                name: name,
                nameEn: name
            });
        } else {
            // Add as main category
            await db.ref(`users/${currentUser.uid}/categories/${type}/${categoryKey}`).set({
                name: name,
                nameEn: name,
                subcategories: {}
            });
        }
        
        showToast(t('Kategori eklendi', 'Category added'), 'success');
        document.getElementById('new-category-name').value = '';
        loadCategories(type);
    } catch (error) {
        console.error('Add category error:', error);
        showToast(t('Kategori eklenemedi', 'Failed to add category'), 'error');
    }
}

async function deleteCategory(type, categoryKey, subcategoryKey = null) {
    if (!currentUser) return;
    
    if (!confirm(t('Bu kategoriyi silmek istediğinizden emin misiniz?', 'Are you sure you want to delete this category?'))) {
        return;
    }
    
    try {
        if (subcategoryKey) {
            await db.ref(`users/${currentUser.uid}/categories/${type}/${categoryKey}/subcategories/${subcategoryKey}`).remove();
        } else {
            await db.ref(`users/${currentUser.uid}/categories/${type}/${categoryKey}`).remove();
        }
        
        showToast(t('Kategori silindi', 'Category deleted'), 'success');
        loadCategories(type);
    } catch (error) {
        console.error('Delete category error:', error);
        showToast(t('Kategori silinemedi', 'Failed to delete category'), 'error');
    }
}

// ===================================
// Transaction Management
// ===================================
let currentTransactionType = 'expense';

function openTransactionModal(type) {
    currentTransactionType = type;
    document.getElementById('transaction-modal').classList.add('active');
    
    const title = document.getElementById('modal-title');
    if (title) {
        title.setAttribute('data-tr', type === 'income' ? 'Gelir Ekle' : 'Gider Ekle');
        title.setAttribute('data-en', type === 'income' ? 'Add Income' : 'Add Expense');
        title.textContent = currentLang === 'tr' ? 
            (type === 'income' ? 'Gelir Ekle' : 'Gider Ekle') :
            (type === 'income' ? 'Add Income' : 'Add Expense');
    }
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('transaction-date').value = today;
    
    loadTransactionCategories(type);
}

async function loadTransactionCategories(type) {
    if (!currentUser) return;
    
    const categoriesRef = db.ref(`users/${currentUser.uid}/categories/${type}`);
    const snapshot = await categoriesRef.once('value');
    const categories = snapshot.val() || {};
    
    const select = document.getElementById('transaction-category');
    select.innerHTML = `<option value="">${t('Seçiniz', 'Select')}</option>`;
    
    Object.entries(categories).forEach(([key, category]) => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = currentLang === 'tr' ? category.name : (category.nameEn || category.name);
        select.appendChild(option);
    });
    
    // Store categories for subcategory loading
    select.dataset.categories = JSON.stringify(categories);
}

function handleCategoryChange() {
    const select = document.getElementById('transaction-category');
    const subcategorySelect = document.getElementById('transaction-subcategory');
    const categoryKey = select.value;
    
    if (!categoryKey) {
        subcategorySelect.innerHTML = `<option value="">${t('Seçiniz', 'Select')}</option>`;
        return;
    }
    
    const categories = JSON.parse(select.dataset.categories || '{}');
    const category = categories[categoryKey];
    
    subcategorySelect.innerHTML = `<option value="">${t('Seçiniz', 'Select')}</option>`;
    
    if (category && category.subcategories) {
        Object.entries(category.subcategories).forEach(([key, subcategory]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = currentLang === 'tr' ? subcategory.name : (subcategory.nameEn || subcategory.name);
            subcategorySelect.appendChild(option);
        });
    }
}

async function handleSaveTransaction() {
    if (!currentUser) return;
    
    const amount = parseFloat(document.getElementById('transaction-amount').value);
    const currency = document.getElementById('transaction-currency').value;
    const categoryKey = document.getElementById('transaction-category').value;
    const subcategoryKey = document.getElementById('transaction-subcategory').value;
    const date = document.getElementById('transaction-date').value;
    const description = document.getElementById('transaction-description').value.trim();
    
    if (!amount || !currency || !categoryKey || !date) {
        showToast(t('Lütfen gerekli alanları doldurun', 'Please fill in required fields'), 'error');
        return;
    }
    
    if (amount <= 0) {
        showToast(t('Miktar 0\'dan büyük olmalıdır', 'Amount must be greater than 0'), 'error');
        return;
    }
    
    try {
        const transaction = {
            type: currentTransactionType,
            amount: amount,
            currency: currency,
            categoryKey: categoryKey,
            subcategoryKey: subcategoryKey || null,
            date: date,
            description: description || '',
            timestamp: firebase.database.ServerValue.TIMESTAMP
        };
        
        await db.ref(`users/${currentUser.uid}/transactions`).push(transaction);
        
        showToast(t('İşlem eklendi', 'Transaction added'), 'success');
        closeAllModals();
        resetTransactionForm();
        loadTransactions();
        updateSummary();
        updateCharts();
    } catch (error) {
        console.error('Save transaction error:', error);
        showToast(t('İşlem eklenemedi', 'Failed to add transaction'), 'error');
    }
}

function resetTransactionForm() {
    document.getElementById('transaction-amount').value = '';
    document.getElementById('transaction-category').value = '';
    document.getElementById('transaction-subcategory').value = '';
    document.getElementById('transaction-description').value = '';
}

async function deleteTransaction(transactionId) {
    if (!currentUser) return;
    
    if (!confirm(t('Bu işlemi silmek istediğinizden emin misiniz?', 'Are you sure you want to delete this transaction?'))) {
        return;
    }
    
    try {
        await db.ref(`users/${currentUser.uid}/transactions/${transactionId}`).remove();
        showToast(t('İşlem silindi', 'Transaction deleted'), 'success');
        loadTransactions();
        updateSummary();
        updateCharts();
    } catch (error) {
        console.error('Delete transaction error:', error);
        showToast(t('İşlem silinemedi', 'Failed to delete transaction'), 'error');
    }
}

// ===================================
// Transactions Display
// ===================================
let allTransactions = [];
let allCategories = {};
let transactionsRef = null;
let settingsRef = null;

async function loadTransactions() {
    if (!currentUser) return;

    // 🔁 Eski listener varsa kapat
    if (transactionsRef) {
        transactionsRef.off();
    }

    // 📂 Kategorileri yükle
    const categoriesSnapshot = await db
        .ref(`users/${currentUser.uid}/categories`)
        .once('value');

    allCategories = categoriesSnapshot.val() || { income: {}, expense: {} };

    // 💱 Para birimlerini yükle
    const currenciesSnapshot = await db
        .ref(`users/${currentUser.uid}/currencies`)
        .once('value');

    currencies = currenciesSnapshot.val() || {
        'TRY': { code: 'TRY', symbol: '₺' }
    };

    // 📄 İşlemleri realtime dinle
    transactionsRef = db.ref(`users/${currentUser.uid}/transactions`);

    transactionsRef.on('value', (snapshot) => {
        const transactions = snapshot.val() || {};

        allTransactions = Object.entries(transactions)
            .map(([id, transaction]) => ({
                id,
                ...transaction
            }))
            .sort((a, b) => b.timestamp - a.timestamp);

        // 🎨 UI güncellemeleri SADECE veri geldikten sonra
        displayTransactions(allTransactions, currencies);
        updateSummary();
        updateCharts();
    });
}


function displayTransactions(transactions, currencies) {
    const list = document.getElementById('transactions-list');
    if (!list) return;
    
    list.innerHTML = '';
    
    if (transactions.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📊</div>
                <p>${t('Henüz işlem yok', 'No transactions yet')}</p>
            </div>
        `;
        return;
    }
    
    transactions.forEach(transaction => {
        const category = allCategories[transaction.type]?.[transaction.categoryKey];
        const subcategory = transaction.subcategoryKey ? 
            category?.subcategories?.[transaction.subcategoryKey] : null;
        
        const categoryName = currentLang === 'tr' ? 
            (category?.name || transaction.categoryKey) : 
            (category?.nameEn || category?.name || transaction.categoryKey);
        
        const subcategoryName = subcategory ? 
            (currentLang === 'tr' ? subcategory.name : (subcategory.nameEn || subcategory.name)) : '';
        
        const currency = currencies[transaction.currency] || { symbol: transaction.currency };
        
        const item = document.createElement('div');
        item.className = `transaction-item ${transaction.type}`;
        item.innerHTML = `
            <div class="transaction-info">
                <div class="transaction-icon">${transaction.type === 'income' ? '↑' : '↓'}</div>
                <div class="transaction-details">
                    <div class="transaction-category">
                        ${categoryName}${subcategoryName ? ' → ' + subcategoryName : ''}
                    </div>
                    ${transaction.description ? `<div class="transaction-description">${transaction.description}</div>` : ''}
                    <div class="transaction-date">${formatDate(transaction.date)}</div>
                </div>
            </div>
            <div class="transaction-amount-wrapper">
                <div class="transaction-amount">
                    ${transaction.type === 'income' ? '+' : '-'}${currency.symbol}${transaction.amount.toFixed(2)}
                </div>
                <button class="transaction-delete" onclick="deleteTransaction('${transaction.id}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        `;
        list.appendChild(item);
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(currentLang === 'tr' ? 'tr-TR' : 'en-US', options);
}

function filterTransactions(filter) {
    const currencies = {}; // Will be populated when needed
    
    if (filter === 'all') {
        displayTransactions(allTransactions, currencies);
    } else {
        const filtered = allTransactions.filter(t => t.type === filter);
        displayTransactions(filtered, currencies);
    }
}

// ===================================
// Summary Calculations
// ===================================
async function updateSummary() {
    if (!currentUser) return;
    
    const currenciesSnapshot = await db.ref(`users/${currentUser.uid}/currencies`).once('value');
    const currencies = currenciesSnapshot.val() || { 'TRY': { code: 'TRY', symbol: '₺' } };
    const defaultCurrency = currencies['TRY'] || Object.values(currencies)[0];
    
    let totalIncome = 0;
    let totalExpense = 0;
    
    allTransactions.forEach(transaction => {
        // For simplicity, we're not doing currency conversion
        // In a real app, you'd convert all to a base currency
        if (transaction.currency === 'TRY' || !currencies[transaction.currency]) {
            if (transaction.type === 'income') {
                totalIncome += transaction.amount;
            } else {
                totalExpense += transaction.amount;
            }
        }
    });
    
    const balance = totalIncome - totalExpense;
    
    document.getElementById('total-income').textContent = 
        `${defaultCurrency.symbol}${totalIncome.toFixed(2)}`;
    document.getElementById('total-expense').textContent = 
        `${defaultCurrency.symbol}${totalExpense.toFixed(2)}`;
    document.getElementById('balance').textContent = 
        `${defaultCurrency.symbol}${balance.toFixed(2)}`;

    updateBudgetUsage();
}

function updateBudgetUsage() {
    const usageTextEl = document.getElementById('budget-usage-text');
    const barEl = document.getElementById('budget-progress-bar');

    if (!usageTextEl || !barEl) return;

    if (!currentUser || !userSettings.monthlyBudget) {
        usageTextEl.textContent = t('Tanımlı değil', 'Not set');
        barEl.style.width = '0%';
        barEl.style.backgroundColor = 'var(--primary-500)';
        return;
    }

    const budget = userSettings.monthlyBudget;
    const now = new Date();
    const startDay = userSettings.monthlyPeriodStartDay || 1;

    // Dönem başlangıç tarihini hesapla
    let periodStart = new Date(now.getFullYear(), now.getMonth(), startDay);
    if (now.getDate() < startDay) {
        // Bir önceki ayın başlangıç gününden itibaren say
        periodStart = new Date(now.getFullYear(), now.getMonth() - 1, startDay);
    }

    let periodExpenses = 0;
    allTransactions.forEach((transaction) => {
        if (transaction.type !== 'expense') return;
        if (transaction.currency !== 'TRY') return; // Basitlik için yalnızca TRY

        const date = new Date(transaction.date);
        if (date >= periodStart && date <= now) {
            periodExpenses += transaction.amount;
        }
    });

    const ratio = budget > 0 ? periodExpenses / budget : 0;
    const percent = Math.max(0, Math.min(100, ratio * 100));

    // Daha kompakt gösterim için kısaltılmış format
    const formatter = new Intl.NumberFormat(currentLang === 'tr' ? 'tr-TR' : 'en-US', {
        notation: 'compact',
        maximumFractionDigits: 1
    });

    const spentCompact = formatter.format(periodExpenses);
    const budgetCompact = formatter.format(budget);
    const percentText = `${Math.round(ratio * 100)}%`;

    usageTextEl.textContent = `${spentCompact} / ${budgetCompact} • ${percentText}`;
    barEl.style.width = `${percent}%`;

    if (ratio <= 0.8) {
        barEl.style.backgroundColor = 'var(--success)';
    } else if (ratio <= 1) {
        barEl.style.backgroundColor = 'var(--warning)';
    } else {
        barEl.style.backgroundColor = 'var(--error)';
    }
}

// ===================================
// Charts
// ===================================
let expenseChart = null;
let dailyChart = null;
let monthlyChart = null;

async function updateCharts() {
    updateExpenseChart();
    updateDailyChart();
    updateMonthlyChart();
    updateCategoryAnalysis();
}

function updateExpenseChart() {
    const expenses = allTransactions.filter(t => t.type === 'expense');
    
    // Group by category
    const categoryTotals = {};
    expenses.forEach(expense => {
        const category = allCategories.expense?.[expense.categoryKey];
        const categoryName = currentLang === 'tr' ? 
            (category?.name || expense.categoryKey) : 
            (category?.nameEn || category?.name || expense.categoryKey);
        
        if (!categoryTotals[categoryName]) {
            categoryTotals[categoryName] = 0;
        }
        categoryTotals[categoryName] += expense.amount;
    });
    
    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    
    const ctx = document.getElementById('expense-chart');
    if (!ctx) return;
    
    if (expenseChart) {
        expenseChart.destroy();
    }
    
    const isDark = document.body.classList.contains('dark-mode');
    const textColor = isDark ? '#cbd5e1' : '#000000';
    const chartFont = { size: 14, weight: '600', family: "'Plus Jakarta Sans', sans-serif" };

    expenseChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#3b82f6',
                    '#10b981',
                    '#f59e0b',
                    '#ef4444',
                    '#8b5cf6',
                    '#ec4899',
                    '#14b8a6',
                    '#f97316'
                ],
                borderWidth: 0
            }]
        },
        options: {
            devicePixelRatio: typeof window !== 'undefined' && window.devicePixelRatio ? Math.min(window.devicePixelRatio, 3) : 1,
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: textColor,
                        padding: 16,
                        font: chartFont,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    titleFont: chartFont,
                    bodyFont: chartFont,
                    titleColor: textColor,
                    bodyColor: textColor,
                    backgroundColor: isDark ? 'rgba(30,41,59,0.95)' : 'rgba(255,255,255,0.98)',
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            return `${label}: ₺${value.toFixed(2)}`;
                        }
                    }
                }
            }
        }
    });
}

function updateDailyChart() {
    const startDate = document.getElementById('start-date')?.value;
    const endDate = document.getElementById('end-date')?.value;
    
    if (!startDate || !endDate) return;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Filter expenses in date range
    const expenses = allTransactions.filter(t => {
        if (t.type !== 'expense') return false;
        const transactionDate = new Date(t.date);
        return transactionDate >= start && transactionDate <= end;
    });
    
    // Group by date
    const dailyTotals = {};
    expenses.forEach(expense => {
        const date = expense.date;
        if (!dailyTotals[date]) {
            dailyTotals[date] = 0;
        }
        dailyTotals[date] += expense.amount;
    });
    
    // Create array of all dates in range
    const labels = [];
    const data = [];
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
        const dateStr = currentDate.toISOString().split('T')[0];
        labels.push(formatDateShort(dateStr));
        data.push(dailyTotals[dateStr] || 0);
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    const ctx = document.getElementById('daily-chart');
    if (!ctx) return;
    
    if (dailyChart) {
        dailyChart.destroy();
    }
    
    const isDark = document.body.classList.contains('dark-mode');
    const textColor = isDark ? '#cbd5e1' : '#000000';
    const gridColor = isDark ? '#334155' : '#e2e8f0';
    const tickFont = { size: 13, weight: '600', family: "'Plus Jakarta Sans', sans-serif" };

    dailyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: t('Gider', 'Expense'),
                data: data,
                backgroundColor: '#3b82f6',
                borderRadius: 6
            }]
        },
        options: {
            devicePixelRatio: typeof window !== 'undefined' && window.devicePixelRatio ? Math.min(window.devicePixelRatio, 3) : 1,
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    titleFont: tickFont,
                    bodyFont: tickFont,
                    titleColor: textColor,
                    bodyColor: textColor,
                    backgroundColor: isDark ? 'rgba(30,41,59,0.95)' : 'rgba(255,255,255,0.98)',
                    callbacks: {
                        label: function(context) {
                            return `₺${context.parsed.y.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColor,
                        font: tickFont,
                        maxRotation: 45,
                        minRotation: 0
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    ticks: {
                        color: textColor,
                        font: tickFont,
                        callback: function(value) {
                            return '₺' + value;
                        }
                    },
                    grid: {
                        color: gridColor
                    }
                }
            }
        }
    });
}

function formatDateShort(dateString) {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return `${day}/${month}`;
}

function formatMonthLabel(date) {
    const options = { month: 'short', year: 'numeric' };
    return date.toLocaleDateString(
        currentLang === 'tr' ? 'tr-TR' : 'en-US',
        options
    );
}

function updateMonthlyChart() {
    const ctx = document.getElementById('monthly-chart');
    if (!ctx) return;

    // Son 6 ayı göster
    const now = new Date();
    const monthKeys = [];
    const labels = [];

    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthKeys.push(key);
        labels.push(formatMonthLabel(d));
    }

    const incomeData = new Array(monthKeys.length).fill(0);
    const expenseData = new Array(monthKeys.length).fill(0);

    allTransactions.forEach((transaction) => {
        if (transaction.currency !== 'TRY') return; // Basitlik için yalnızca TRY
        if (!transaction.date) return;

        const key = transaction.date.slice(0, 7);
        const index = monthKeys.indexOf(key);
        if (index === -1) return;

        if (transaction.type === 'income') {
            incomeData[index] += transaction.amount;
        } else if (transaction.type === 'expense') {
            expenseData[index] += transaction.amount;
        }
    });

    if (monthlyChart) {
        monthlyChart.destroy();
    }

    const isDark = document.body.classList.contains('dark-mode');
    const textColor = isDark ? '#cbd5e1' : '#000000';
    const gridColor = isDark ? '#334155' : '#e2e8f0';
    const tickFont = { size: 13, weight: '600', family: "'Plus Jakarta Sans', sans-serif" };

    monthlyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: t('Gelir', 'Income'),
                    data: incomeData,
                    backgroundColor: '#22c55e',
                    borderRadius: 4
                },
                {
                    label: t('Gider', 'Expense'),
                    data: expenseData,
                    backgroundColor: '#ef4444',
                    borderRadius: 4
                }
            ]
        },
        options: {
            devicePixelRatio: typeof window !== 'undefined' && window.devicePixelRatio ? Math.min(window.devicePixelRatio, 3) : 1,
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: textColor,
                        font: tickFont,
                        padding: 16,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    titleFont: tickFont,
                    bodyFont: tickFont,
                    titleColor: textColor,
                    bodyColor: textColor,
                    backgroundColor: isDark ? 'rgba(30,41,59,0.95)' : 'rgba(255,255,255,0.98)',
                    callbacks: {
                        label: function(context) {
                            return `₺${context.parsed.y.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColor,
                        font: tickFont
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    ticks: {
                        color: textColor,
                        font: tickFont,
                        callback: function(value) {
                            return '₺' + value;
                        }
                    },
                    grid: {
                        color: gridColor
                    }
                }
            }
        }
    });
}

function updateCategoryAnalysis() {
    const container = document.getElementById('top-categories-list');
    if (!container) return;

    if (allTransactions.length === 0) {
        container.innerHTML = `<div class="empty-state"><p>${t('Henüz veri yok', 'No data yet')}</p></div>`;
        return;
    }

    const startDateVal = document.getElementById('start-date')?.value;
    const endDateVal = document.getElementById('end-date')?.value;

    let start = null;
    let end = null;

    if (startDateVal && endDateVal) {
        start = new Date(startDateVal);
        end = new Date(endDateVal);
    }

    const totalsByCategory = {};

    allTransactions.forEach((transaction) => {
        if (transaction.type !== 'expense') return;
        if (transaction.currency !== 'TRY') return; // Basitlik için yalnızca TRY

        if (start && end) {
            const transactionDate = new Date(transaction.date);
            if (transactionDate < start || transactionDate > end) {
                return;
            }
        }

        const category = allCategories.expense?.[transaction.categoryKey];
        const categoryName = currentLang === 'tr'
            ? (category?.name || transaction.categoryKey)
            : (category?.nameEn || category?.name || transaction.categoryKey);

        if (!totalsByCategory[categoryName]) {
            totalsByCategory[categoryName] = 0;
        }
        totalsByCategory[categoryName] += transaction.amount;
    });

    const entries = Object.entries(totalsByCategory)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    if (entries.length === 0) {
        container.innerHTML = `<div class="empty-state"><p>${t('Seçilen aralıkta gider yok', 'No expenses in selected range')}</p></div>`;
        return;
    }

    container.innerHTML = '';
    entries.forEach(([name, total]) => {
        const item = document.createElement('div');
        item.className = 'top-category-item';
        item.innerHTML = `
            <div class="top-category-name">${name}</div>
            <div class="top-category-amount">₺${total.toFixed(2)}</div>
        `;
        container.appendChild(item);
    });
}

// ===================================
// Modal Management
// ===================================
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

// ===================================
// Toast Notifications
// ===================================
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Make deleteCategory and deleteTransaction available globally
window.deleteCategory = deleteCategory;
window.deleteTransaction = deleteTransaction;
