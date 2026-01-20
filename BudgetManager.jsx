import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Plus, Trash2, LogOut, Globe } from 'lucide-react';

// Language dictionary
const translations = {
  tr: {
    appTitle: 'Bütçe Yöneticisi',
    login: 'Giriş Yap',
    register: 'Kayıt Ol',
    username: 'Kullanıcı Adı',
    password: 'Şifre',
    logout: 'Çıkış',
    totalIncome: 'Toplam Gelir',
    totalExpense: 'Toplam Gider',
    balance: 'Kalan',
    addEntry: 'Kayıt Ekle',
    income: 'Gelir',
    expense: 'Gider',
    category: 'Kategori',
    amount: 'Miktar',
    date: 'Tarih',
    add: 'Ekle',
    delete: 'Sil',
    all: 'Tümü',
    expenseChart: 'Gider Dağılımı',
    noData: 'Henüz veri yok',
    fillAll: 'Tüm alanları doldurun',
    loginError: 'Kullanıcı adı veya şifre hatalı',
    userExists: 'Bu kullanıcı zaten mevcut',
    registerSuccess: 'Kayıt başarılı! Giriş yapabilirsiniz.',
    switchToRegister: 'Hesabınız yok mu? Kayıt olun',
    switchToLogin: 'Hesabınız var mı? Giriş yapın'
  },
  en: {
    appTitle: 'Budget Manager',
    login: 'Login',
    register: 'Register',
    username: 'Username',
    password: 'Password',
    logout: 'Logout',
    totalIncome: 'Total Income',
    totalExpense: 'Total Expenses',
    balance: 'Balance',
    addEntry: 'Add Entry',
    income: 'Income',
    expense: 'Expense',
    category: 'Category',
    amount: 'Amount',
    date: 'Date',
    add: 'Add',
    delete: 'Delete',
    all: 'All',
    expenseChart: 'Expense Distribution',
    noData: 'No data yet',
    fillAll: 'Please fill all fields',
    loginError: 'Invalid username or password',
    userExists: 'Username already exists',
    registerSuccess: 'Registration successful! You can now login.',
    switchToRegister: "Don't have an account? Register",
    switchToLogin: 'Have an account? Login'
  }
};

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function BudgetManager() {
  const [lang, setLang] = useState('tr');
  const [currentUser, setCurrentUser] = useState(null);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [entries, setEntries] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  
  const [formData, setFormData] = useState({
    type: 'expense',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  const t = translations[lang];

  // Load user session on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const result = await window.storage.get('current_session');
        if (result?.value) {
          const username = result.value;
          setCurrentUser(username);
          await loadUserEntries(username);
        }
      } catch (error) {
        console.log('No active session');
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, []);

  // Load user entries
  const loadUserEntries = async (username) => {
    try {
      const result = await window.storage.get(`entries_${username}`);
      if (result?.value) {
        setEntries(JSON.parse(result.value));
      }
    } catch (error) {
      setEntries([]);
    }
  };

  // Save entries
  const saveEntries = async (username, data) => {
    try {
      await window.storage.set(`entries_${username}`, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save entries:', error);
    }
  };

  // Authentication
  const handleAuth = async (isLogin) => {
    if (!authUsername.trim() || !authPassword.trim()) {
      alert(t.fillAll);
      return;
    }

    try {
      if (isLogin) {
        const result = await window.storage.get(`user_${authUsername}`);
        if (result?.value && JSON.parse(result.value).password === authPassword) {
          setCurrentUser(authUsername);
          await window.storage.set('current_session', authUsername);
          await loadUserEntries(authUsername);
          setAuthUsername('');
          setAuthPassword('');
        } else {
          alert(t.loginError);
        }
      } else {
        try {
          const existing = await window.storage.get(`user_${authUsername}`);
          if (existing) {
            alert(t.userExists);
            return;
          }
        } catch {
          // User doesn't exist, proceed with registration
        }
        
        await window.storage.set(`user_${authUsername}`, JSON.stringify({ password: authPassword }));
        alert(t.registerSuccess);
        setIsRegisterMode(false);
        setAuthUsername('');
        setAuthPassword('');
      }
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await window.storage.delete('current_session');
    } catch (error) {
      console.error('Logout error:', error);
    }
    setCurrentUser(null);
    setEntries([]);
  };

  // Entry management
  const handleAddEntry = async () => {
    if (!formData.category.trim() || !formData.amount || !formData.date) {
      alert(t.fillAll);
      return;
    }

    const newEntry = {
      id: Date.now(),
      type: formData.type,
      category: formData.category.trim(),
      amount: parseFloat(formData.amount),
      date: formData.date
    };

    const updatedEntries = [...entries, newEntry];
    setEntries(updatedEntries);
    await saveEntries(currentUser, updatedEntries);

    setFormData({
      type: 'expense',
      category: '',
      amount: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleDeleteEntry = async (id) => {
    const updatedEntries = entries.filter(e => e.id !== id);
    setEntries(updatedEntries);
    await saveEntries(currentUser, updatedEntries);
  };

  // Calculations
  const totalIncome = entries.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  const totalExpense = entries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const balance = totalIncome - totalExpense;

  // Chart data
  const expenseCategories = entries
    .filter(e => e.type === 'expense')
    .reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

  const chartData = Object.entries(expenseCategories).map(([name, value]) => ({
    name,
    value
  }));

  // Filtered entries
  const filteredEntries = filter === 'all' ? entries : entries.filter(e => e.type === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    );
  }

  // Auth Screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              {isRegisterMode ? t.register : t.login}
            </h1>
            <button
              onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')}
              className="p-2 rounded-full hover:bg-gray-100 transition"
            >
              <Globe className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.username}
              </label>
              <input
                type="text"
                value={authUsername}
                onChange={(e) => setAuthUsername(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAuth(!isRegisterMode)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.password}
              </label>
              <input
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAuth(!isRegisterMode)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition"
              />
            </div>
            <button
              onClick={() => handleAuth(!isRegisterMode)}
              className="w-full bg-indigo-500 text-white py-3 rounded-lg font-semibold hover:bg-indigo-600 active:scale-95 transition"
            >
              {isRegisterMode ? t.register : t.login}
            </button>
          </div>

          <button
            onClick={() => setIsRegisterMode(!isRegisterMode)}
            className="w-full mt-4 text-indigo-600 text-sm hover:underline"
          >
            {isRegisterMode ? t.switchToLogin : t.switchToRegister}
          </button>
        </div>
      </div>
    );
  }

  // Main App
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">{t.appTitle}</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')}
                className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm font-medium hover:bg-opacity-30 transition"
              >
                {lang === 'tr' ? 'EN' : 'TR'}
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm font-medium hover:bg-opacity-30 transition flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" />
                {t.logout}
              </button>
            </div>
          </div>

          {/* Balance Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-lg p-3">
              <div className="text-xs opacity-90">{t.totalIncome}</div>
              <div className="text-xl font-bold mt-1">₺{totalIncome.toFixed(2)}</div>
            </div>
            <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-lg p-3">
              <div className="text-xs opacity-90">{t.totalExpense}</div>
              <div className="text-xl font-bold mt-1">₺{totalExpense.toFixed(2)}</div>
            </div>
            <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-lg p-3">
              <div className="text-xs opacity-90">{t.balance}</div>
              <div className="text-xl font-bold mt-1">₺{balance.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Add Entry Form */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {t.addEntry}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
            >
              <option value="income">{t.income}</option>
              <option value="expense">{t.expense}</option>
            </select>
            <input
              type="number"
              placeholder={t.amount}
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder={t.category}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
            />
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <button
            onClick={handleAddEntry}
            className="w-full mt-3 bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 active:scale-95 transition"
          >
            {t.add}
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {['all', 'income', 'expense'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-2 rounded-lg font-semibold transition ${
                filter === f
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {t[f]}
            </button>
          ))}
        </div>

        {/* Entries List */}
        <div className="bg-white rounded-xl shadow-md p-4">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-8 text-gray-400">{t.noData}</div>
          ) : (
            <div className="space-y-2">
              {filteredEntries.map(entry => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{entry.category}</div>
                    <div className="text-sm text-gray-500">{entry.date}</div>
                  </div>
                  <div className={`text-lg font-bold mr-3 ${
                    entry.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ₺{entry.amount.toFixed(2)}
                  </div>
                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">{t.expenseChart}</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
