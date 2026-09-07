import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  Wallet, TrendingUp, TrendingDown, Trash2, ArrowUpRight, ArrowDownRight,
  Shield, Eye, EyeOff, Lock, Mail, User, ArrowRight, Home, BarChart2, Plus, 
  FileText, X, Sparkles, LogOut, CheckCircle2
} from 'lucide-react';

const API_BASE = 'https://expense-tracker-cqsw.onrender.com/api';

const CATEGORIES = [
  'Food',
  'Shopping',
  'Recharge',
  'Online Transfer',
  'Gift',
  'Fruits',
  'Vegetable',
  'Snacks',
  'Health',
  'Rent',
  'Travel',
  'Transportation',
  'Clothing',
  'Repair',
  'Other'
];

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '');
  
  // Auth Form States
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register' | 'forgot' | 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // App Navigation States (Tabs)
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'charts' | 'reports' | 'account'
  const [isModalOpen, setIsModalOpen] = useState(false);

  // App States
  const [analytics, setAnalytics] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [salaryInput, setSalaryInput] = useState('');
  
  // Expense Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryName, setCategoryName] = useState('Food');

  // Check URL on load for /reset-password/:token
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/reset-password/')) {
      const extractedToken = path.split('/reset-password/')[1];
      if (extractedToken) {
        setResetToken(extractedToken);
        setAuthMode('reset');
      }
    }
  }, []);

  // Auth Headers
  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` },
  });

  // Fetch data
  const fetchData = async () => {
    if (!token) return;
    try {
      const [analyticsRes, expensesRes] = await Promise.all([
        axios.get(`${API_BASE}/expenses/analytics/monthly-comparison`, getAuthHeaders()),
        axios.get(`${API_BASE}/expenses`, getAuthHeaders()),
      ]);
      setAnalytics(analyticsRes.data);
      setExpenses(expensesRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      if (err.response?.status === 401) handleLogout();
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Auth Handlers
  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = authMode === 'register' ? '/auth/register' : '/auth/login';
    const payload = authMode === 'register' ? { name, email, password } : { email, password };
    try {
      const res = await axios.post(`${API_BASE}${endpoint}`, payload);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      
      const loggedInName = res.data?.user?.name || name || email.split('@')[0];
      if (loggedInName) {
        localStorage.setItem('userName', loggedInName);
        setUserName(loggedInName);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Authentication error');
    }
  };

  // Forgot Password Handler
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage('');
    try {
      const res = await axios.post(`${API_BASE}/auth/forgot-password`, { email });
      setStatusMessage(res.data.message || 'Reset link sent! Please check your email.');
    } catch (err) {
      alert(err.response?.data?.message || 'Error sending reset email');
    } finally {
      setLoading(false);
    }
  };

  // Reset Password Handler
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setLoading(true);
    setStatusMessage('');
    try {
      const res = await axios.post(`${API_BASE}/auth/reset-password/${resetToken}`, { password });
      alert(res.data.message || 'Password updated successfully! Please login.');
      window.history.pushState({}, '', '/');
      setAuthMode('login');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reset password. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    setToken('');
    setUserName('');
    setAnalytics(null);
    setExpenses([]);
    setAuthMode('login');
  };

  // Salary Update
  const updateSalary = async (e) => {
    e.preventDefault();
    if (!salaryInput) return;
    try {
      await axios.put(`${API_BASE}/auth/salary`, { monthlySalary: Number(salaryInput) }, getAuthHeaders());
      setSalaryInput('');
      fetchData();
    } catch (err) {
      alert('Failed to update salary');
    }
  };

  // Add Expense
  const addExpense = async (e) => {
    e.preventDefault();
    if (!title || !amount) return;
    try {
      await axios.post(`${API_BASE}/expenses`, {
        title,
        amount: Number(amount),
        categoryName,
      }, getAuthHeaders());
      setTitle('');
      setAmount('');
      setCategoryName('Food');
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Failed to add expense');
    }
  };

  // Delete Expense
  const deleteExpense = async (id) => {
    try {
      await axios.delete(`${API_BASE}/expenses/${id}`, getAuthHeaders());
      fetchData();
    } catch (err) {
      alert('Failed to delete expense');
    }
  };

  // Dynamic First Name Extractor
  const getFirstName = () => {
    if (!userName) return 'FinPulse User';
    return userName.trim().split(' ')[0];
  };

  // ---------------- AUTHENTICATION PORTAL ----------------
  if (!token) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#070b14] px-4 py-10 relative overflow-hidden font-sans select-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-emerald-500/10 via-teal-500/10 to-transparent blur-[120px] pointer-events-none" />

        <div className="w-full max-w-4xl relative z-10">
          <div className="flex items-center justify-between mb-6 px-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[1px] shadow-lg shadow-emerald-500/20">
                <div className="w-full h-full bg-[#090e1a] rounded-[15px] flex items-center justify-center text-emerald-400 font-bold">
                  ₹
                </div>
              </div>
              <div>
                <h1 className="text-white text-base font-bold tracking-tight flex items-center gap-2">
                  FinPulse
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    EXPENSE OS
                  </span>
                </h1>
                <p className="text-slate-500 text-xs">Autonomous Personal Wealth Engine</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 border border-slate-800 px-3.5 py-1.5 rounded-full backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Secure Vault Active</span>
            </div>
          </div>

          <div className="bg-[#0b1120]/90 backdrop-blur-2xl border border-slate-800/80 rounded-[32px] p-6 sm:p-10 shadow-2xl shadow-black/80 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div>
                <span className="text-[11px] uppercase tracking-widest font-bold text-emerald-400/90 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1 rounded-lg inline-block mb-3">
                  Financial Intelligence
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
                  Take total command of <br className="hidden sm:inline" />
                  <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                    your monthly capital.
                  </span>
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm mt-3 leading-relaxed">
                  Real-time cash flow monitoring, dynamic month-on-month expense analytics, and instant balance auditing.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#080d18] border border-slate-800 shadow-xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Projected Efficiency
                  </span>
                  <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md text-[10px]">
                    +18.4% This Month
                  </span>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-medium">Net Available Balance</p>
                  <p className="text-xl font-black text-white tracking-tight">₹48,250.00</p>
                </div>
                <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full w-[72%] rounded-full" />
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero-knowledge client encryption &amp; local sync</span>
              </div>
            </div>

            <div className="lg:col-span-7 bg-[#0d1527]/70 border border-slate-800/80 rounded-2xl p-6 sm:p-8">
              <div className="mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {authMode === 'login' && 'Sign in to Console'}
                  {authMode === 'register' && 'Create Your Ledger'}
                  {authMode === 'forgot' && 'Account Recovery'}
                  {authMode === 'reset' && 'Create New Key'}
                </h3>
                <p className="text-slate-400 text-xs mt-1">
                  {authMode === 'login' && 'Enter your authorized credentials below'}
                  {authMode === 'register' && 'Start organizing your monthly cash flow in seconds'}
                  {authMode === 'forgot' && 'Provide your email address to initiate recovery'}
                  {authMode === 'reset' && 'Define a fresh password for your account'}
                </p>
              </div>

              {statusMessage && (
                <div className="mb-4 p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  {statusMessage}
                </div>
              )}

              {(authMode === 'login' || authMode === 'register') && (
                <form onSubmit={handleAuth} className="space-y-4">
                  {authMode === 'register' && (
                    <div>
                      <label className="block text-slate-400 text-xs font-medium mb-1.5">Full Name</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          placeholder="e.g. Utsav Kushwaha"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="w-full pl-10 pr-4 py-2.5 bg-[#080d18] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-slate-400 text-xs font-medium mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        placeholder="you@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-[#080d18] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-slate-400 text-xs font-medium">Password</label>
                      {authMode === 'login' && (
                        <button
                          type="button"
                          onClick={() => { setAuthMode('forgot'); setStatusMessage(''); }}
                          className="text-[11px] text-emerald-400 hover:text-emerald-300 transition"
                        >
                          Forgot key?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full pl-10 pr-10 py-2.5 bg-[#080d18] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{authMode === 'register' ? 'Initialize Account' : 'Authenticate Session'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="text-center pt-3">
                    <button
                      type="button"
                      onClick={() => setAuthMode(authMode === 'register' ? 'login' : 'register')}
                      className="text-xs text-slate-400 hover:text-white transition cursor-pointer"
                    >
                      {authMode === 'register' ? (
                        <>Existing member? <span className="text-emerald-400 font-semibold underline">Sign In</span></>
                      ) : (
                        <>New to FinPulse? <span className="text-emerald-400 font-semibold underline">Create Ledger</span></>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {authMode === 'forgot' && (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-slate-400 text-xs font-medium mb-1.5">Registered Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        placeholder="you@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-[#080d18] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    <span>{loading ? 'Dispersing...' : 'Dispatch Token'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => { setAuthMode('login'); setStatusMessage(''); }}
                      className="text-xs text-slate-400 hover:text-white transition cursor-pointer"
                    >
                      &larr; Return to Sign In
                    </button>
                  </div>
                </form>
              )}

              {authMode === 'reset' && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-slate-400 text-xs font-medium mb-1.5">New Key Phrase</label>
                    <input
                      type="password"
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 bg-[#080d18] border border-slate-700/80 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs font-medium mb-1.5">Confirm Key Phrase</label>
                    <input
                      type="password"
                      placeholder="Re-enter key phrase"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 bg-[#080d18] border border-slate-700/80 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? 'Committing...' : 'Store New Password'}
                  </button>
                </form>
              )}
            </div>
          </div>

          <footer className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 px-3 text-[11px] text-slate-500">
            <p>FinPulse Capital Systems &bull; All calculations handled locally</p>
            <div className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-800/80 px-3 py-1.5 rounded-full backdrop-blur-md">
              <span className="text-slate-400 text-xs">Built by</span>
              <span className="text-xs font-semibold text-emerald-400">Utsav Kushwaha</span>
              <span className="text-slate-600 text-xs">&amp;</span>
              <span className="text-xs font-semibold text-teal-400">Gunjan Kushwaha</span>
            </div>
          </footer>
        </div>
      </div>
    );
  }

  const diffPercent = parseFloat(analytics?.differencePercent || '0');

  // ---------------- AUTHENTICATED DASHBOARD ----------------
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 pb-36 md:pb-12 font-sans selection:bg-emerald-500/30 select-none relative overflow-x-hidden">
      
      {/* Top Header with Personalized Welcome Greeting */}
      <header className="sticky top-0 z-30 bg-[#0b1120]/90 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3.5 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[1px] shadow-md shadow-emerald-500/10">
              <div className="w-full h-full bg-[#090e1a] rounded-[15px] flex items-center justify-center text-emerald-400 font-black">
                ₹
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-tight">
                  Welcome, <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">{getFirstName()}</span> 👋
                </h1>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  PRO
                </span>
              </div>
              <p className="text-slate-500 text-xs hidden sm:block">Autonomous Expense &amp; Capital Engine</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 bg-[#0f172a] border border-slate-800/80 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'home' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('charts')}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'charts' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'reports' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              Reports
            </button>
            <button
              onClick={() => setActiveTab('account')}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'account' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              Account
            </button>
          </div>

          {/* Action Header Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl shadow-md shadow-emerald-500/20 active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Log Expense</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">

        {/* Financial KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[#0b1120]/90 border border-slate-800/80 p-4 sm:p-5 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px] sm:text-xs font-medium">Monthly Salary</span>
              <span className="text-emerald-400/80 bg-emerald-500/10 p-1.5 rounded-lg hidden sm:block">
                <Wallet className="w-3.5 h-3.5" />
              </span>
            </div>
            <h3 className="text-lg sm:text-2xl font-black text-white mt-1">₹{analytics?.salary || 0}</h3>
            <form onSubmit={updateSalary} className="flex gap-2 mt-2 sm:mt-3">
              <input
                type="number"
                placeholder="Set salary"
                className="w-full bg-[#070b14] px-2 py-1 text-xs rounded-lg border border-slate-700/80 text-white focus:outline-none focus:border-emerald-500"
                value={salaryInput}
                onChange={(e) => setSalaryInput(e.target.value)}
              />
              <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-2.5 rounded-lg transition">
                Set
              </button>
            </form>
          </div>

          <div className="bg-[#0b1120]/90 border border-slate-800/80 p-4 sm:p-5 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px] sm:text-xs font-medium">Current Month Spent</span>
              <span className="text-rose-400/80 bg-rose-500/10 p-1.5 rounded-lg hidden sm:block">
                <TrendingUp className="w-3.5 h-3.5" />
              </span>
            </div>
            <h3 className="text-lg sm:text-2xl font-black text-rose-400 mt-1">₹{analytics?.currentMonthTotal || 0}</h3>
            <p className="text-[10px] sm:text-[11px] text-slate-500 mt-2">Active burn rate</p>
          </div>

          <div className="bg-[#0b1120]/90 border border-slate-800/80 p-4 sm:p-5 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px] sm:text-xs font-medium">Previous Month</span>
              <span className="text-slate-400 bg-slate-800 p-1.5 rounded-lg hidden sm:block">
                <TrendingDown className="w-3.5 h-3.5" />
              </span>
            </div>
            <h3 className="text-lg sm:text-2xl font-black text-slate-300 mt-1">₹{analytics?.previousMonthTotal || 0}</h3>
            <div className="flex items-center gap-1 mt-2 text-[10px] sm:text-xs font-semibold">
              {diffPercent > 0 ? (
                <span className="text-rose-400 flex items-center"><ArrowUpRight className="w-3 h-3"/> +{diffPercent}% vs prev</span>
              ) : diffPercent < 0 ? (
                <span className="text-emerald-400 flex items-center"><ArrowDownRight className="w-3 h-3"/> {diffPercent}% vs prev</span>
              ) : (
                <span className="text-slate-500">Same as prev</span>
              )}
            </div>
          </div>

          <div className="bg-[#0b1120]/90 border border-slate-800/80 p-4 sm:p-5 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px] sm:text-xs font-medium">Net Balance</span>
              <span className="text-teal-400 bg-teal-500/10 p-1.5 rounded-lg hidden sm:block">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
            </div>
            <h3 className={`text-lg sm:text-2xl font-black mt-1 ${(analytics?.remainingBalance || 0) < 0 ? 'text-rose-500' : 'text-emerald-400'}`}>
              ₹{analytics?.remainingBalance || 0}
            </h3>
            <p className="text-[10px] sm:text-[11px] text-slate-500 mt-2">Available surplus</p>
          </div>
        </div>

        {/* VIEW 1: HOME (Expenses Feed) */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            <div className="bg-[#0b1120]/90 border border-slate-800/80 rounded-2xl p-4 sm:p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white">Recent Transactions</h3>
                  <p className="text-xs text-slate-400">All expenses logged this month</p>
                </div>
                <span className="text-xs text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
                  {expenses.length} Records
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="text-slate-400 border-b border-slate-800/80 text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="pb-3 font-semibold">Title</th>
                      <th className="pb-3 font-semibold">Category</th>
                      <th className="pb-3 font-semibold">Date</th>
                      <th className="pb-3 font-semibold">Amount</th>
                      <th className="pb-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {expenses.length > 0 ? (
                      expenses.map((exp) => (
                        <tr key={exp._id} className="hover:bg-slate-800/30 transition">
                          <td className="py-3 font-medium text-white">{exp.title}</td>
                          <td className="py-3">
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] sm:text-[11px] font-medium bg-slate-900 border border-slate-800 text-slate-300">
                              {exp.category?.name || 'General'}
                            </span>
                          </td>
                          <td className="py-3 text-slate-400 text-xs">{new Date(exp.date).toLocaleDateString()}</td>
                          <td className="py-3 text-rose-400 font-bold">₹{exp.amount}</td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => deleteExpense(exp._id)}
                              className="text-slate-500 hover:text-rose-400 transition p-1"
                              title="Delete Expense"
                            >
                              <Trash2 className="w-4 h-4 inline" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-10 text-center text-slate-500 text-xs">
                          No transactions recorded yet. Tap the '+' button to log your first spend!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: CHARTS (Category Comparison) */}
        {activeTab === 'charts' && (
          <div className="bg-[#0b1120]/90 border border-slate-800/80 p-5 sm:p-7 rounded-2xl shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" /> Category: This Month vs Last Month
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Comparative spend distribution across all categories</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-3 h-3 rounded bg-slate-600 inline-block" /> Prev Month
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Current Month
                </span>
              </div>
            </div>

            <div className="h-80 w-full pt-4">
              {analytics?.categoryBreakdown && analytics.categoryBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.categoryBreakdown}>
                    <XAxis dataKey="category" stroke="#64748b" textAnchor="end" height={60} tick={{ fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                    <Legend />
                    <Bar dataKey="previousMonth" fill="#64748b" name="Previous Month" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="currentMonth" fill="#10b981" name="Current Month" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                  <BarChart2 className="w-8 h-8 mb-2 opacity-30" />
                  No comparative transaction data available for this cycle yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: REPORTS (Financial Audit Breakdown) */}
        {activeTab === 'reports' && (
          <div className="bg-[#0b1120]/90 border border-slate-800/80 p-5 sm:p-7 rounded-2xl shadow-xl space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-400" /> Monthly Financial Audit Report
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">High-level summary of your savings velocity and burn rate</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#080d18] border border-slate-800 space-y-1">
                <p className="text-xs text-slate-500 font-medium">Monthly Burn Ratio</p>
                <p className="text-xl font-bold text-white">
                  {analytics?.salary ? `${Math.round(((analytics?.currentMonthTotal || 0) / analytics.salary) * 100)}%` : '0%'}
                </p>
                <p className="text-[11px] text-slate-500">Percentage of monthly salary exhausted</p>
              </div>

              <div className="p-4 rounded-xl bg-[#080d18] border border-slate-800 space-y-1">
                <p className="text-xs text-slate-500 font-medium">Total Entries Logged</p>
                <p className="text-xl font-bold text-emerald-400">{expenses.length}</p>
                <p className="text-[11px] text-slate-500">Transactions stored in ledger</p>
              </div>

              <div className="p-4 rounded-xl bg-[#080d18] border border-slate-800 space-y-1">
                <p className="text-xs text-slate-500 font-medium">Monthly Net Growth</p>
                <p className={`text-xl font-bold ${(analytics?.remainingBalance || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {(analytics?.remainingBalance || 0) >= 0 ? '+ Savings Surplus' : '- Budget Deficit'}
                </p>
                <p className="text-[11px] text-slate-500">Calculated against base monthly salary</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>All balances and category aggregates are recalculated autonomously upon transaction submission.</span>
            </div>
          </div>
        )}

        {/* VIEW 4: ACCOUNT (User Profile & Credentials Management) */}
        {activeTab === 'account' && (
          <div className="max-w-2xl mx-auto bg-[#0b1120]/90 border border-slate-800/80 p-6 sm:p-8 rounded-2xl shadow-xl space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">Account Settings &amp; Security</h3>
              <p className="text-xs text-slate-400 mt-1">Manage your active FinPulse session and credentials</p>
            </div>

            <div className="p-4 rounded-xl bg-[#080d18] border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg">
                  {getFirstName().charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{userName || 'Authenticated User'}</p>
                  <p className="text-xs text-slate-500">Active FinPulse Ledger Member</p>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                Connected
              </span>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Security &amp; Credentials</h4>
              <button
                onClick={() => {
                  handleLogout();
                  setAuthMode('forgot');
                }}
                className="w-full text-left p-3.5 bg-[#080d18] hover:bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 transition flex items-center justify-between cursor-pointer"
              >
                <span>Reset Account Password</span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                onClick={handleLogout}
                className="w-full text-left p-3.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl text-xs text-rose-400 font-semibold transition flex items-center justify-between cursor-pointer"
              >
                <span>Terminate Session &amp; Sign Out</span>
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </main>

      {/* ---------------- LOG EXPENSE MODAL POPUP ---------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#0b1120] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-white">+ Log New Expense</h3>
                <p className="text-xs text-slate-400">Add an expenditure to your monthly ledger</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-500 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={addExpense} className="space-y-4">
              {/* 1. Category Selector */}
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1.5">Select Category</label>
                <select
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full bg-[#080d18] border border-slate-700/80 rounded-xl p-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Title Input */}
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1.5">Expense Title</label>
                <input
                  type="text"
                  placeholder="e.g. Swiggy order, Mobile recharge"
                  className="w-full bg-[#080d18] border border-slate-700/80 rounded-xl p-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* 3. Amount Input */}
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1.5">Price / Amount (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 450"
                  className="w-full bg-[#080d18] border border-slate-700/80 rounded-xl p-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 font-bold text-xs rounded-xl border border-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition cursor-pointer"
                >
                  Save Expense
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BESPOKE FLOATING ISLAND BOTTOM NAVIGATION (REFERENCE MATCHED DOCK) */}
      {/* ========================================================================= */}
      <div className="md:hidden fixed bottom-4 inset-x-4 max-w-md mx-auto z-40">
        
        {/* Outer Floating Dock Frame */}
        <div className="relative bg-[#0d1424] border border-slate-700/70 rounded-[36px] shadow-[0_15px_40px_-10px_rgba(0,0,0,0.8)] px-5 pt-3 pb-2 backdrop-blur-2xl">
          
          {/* Center Notch Curved Silhouette Mask */}
          <div className="absolute -top-[23px] left-1/2 -translate-x-1/2 w-[78px] h-[34px] pointer-events-none">
            <svg viewBox="0 0 78 34" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path d="M0 34C14 34 16 12 39 12C62 12 64 34 78 34H0Z" fill="#0d1424"/>
              <path d="M0 34C14 34 16 12 39 12C62 12 64 34 78 34" stroke="#334155" strokeWidth="1.2"/>
            </svg>
          </div>

          {/* Elevated Floating Action Button (+) */}
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="absolute -top-7 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 text-slate-950 flex items-center justify-center shadow-[0_8px_20px_rgba(16,185,129,0.35)] active:scale-90 transition-transform cursor-pointer z-50 border-[3px] border-[#070b14]"
            title="Log Expense"
          >
            <Plus className="w-7 h-7 stroke-[2.8] stroke-slate-950" />
          </button>

          {/* 4 Navigation Buttons */}
          <div className="grid grid-cols-5 items-center text-center">
            
            {/* 1. Home */}
            <button 
              onClick={() => setActiveTab('home')} 
              className={`flex flex-col items-center gap-1 transition cursor-pointer ${
                activeTab === 'home' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === 'home' ? 'bg-emerald-500/15' : ''}`}>
                <Home className="w-4 h-4" />
              </div>
              <span className={`text-[10px] tracking-tight ${activeTab === 'home' ? 'font-bold' : 'font-semibold'}`}>Home</span>
            </button>

            {/* 2. Charts */}
            <button 
              onClick={() => setActiveTab('charts')} 
              className={`flex flex-col items-center gap-1 transition cursor-pointer ${
                activeTab === 'charts' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === 'charts' ? 'bg-emerald-500/15' : ''}`}>
                <BarChart2 className="w-4 h-4" />
              </div>
              <span className={`text-[10px] tracking-tight ${activeTab === 'charts' ? 'font-bold' : 'font-semibold'}`}>Charts</span>
            </button>

            {/* Center Socket Spacer */}
            <div className="w-full h-10"></div>

            {/* 3. Reports */}
            <button 
              onClick={() => setActiveTab('reports')} 
              className={`flex flex-col items-center gap-1 transition cursor-pointer ${
                activeTab === 'reports' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === 'reports' ? 'bg-emerald-500/15' : ''}`}>
                <FileText className="w-4 h-4" />
              </div>
              <span className={`text-[10px] tracking-tight ${activeTab === 'reports' ? 'font-bold' : 'font-semibold'}`}>Reports</span>
            </button>

            {/* 4. Account */}
            <button 
              onClick={() => setActiveTab('account')} 
              className={`flex flex-col items-center gap-1 transition cursor-pointer ${
                activeTab === 'account' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === 'account' ? 'bg-emerald-500/15' : ''}`}>
                <User className="w-4 h-4" />
              </div>
              <span className={`text-[10px] tracking-tight ${activeTab === 'account' ? 'font-bold' : 'font-semibold'}`}>Account</span>
            </button>

          </div>

          {/* Bottom Swipe Indicator Pill */}
          <div className="w-28 h-1 bg-slate-600/70 rounded-full mx-auto mt-2"></div>

        </div>
      </div>

    </div>
  );
}