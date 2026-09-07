import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  Wallet, TrendingUp, TrendingDown, PlusCircle, Trash2, ArrowUpRight, ArrowDownRight,
  Shield, Eye, EyeOff, Lock, Mail, User, ArrowRight
} from 'lucide-react';

const API_BASE = 'https://expense-tracker-cqsw.onrender.com/api';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  
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

  // Auth Handlers (Login / Register)
  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = authMode === 'register' ? '/auth/register' : '/auth/login';
    const payload = authMode === 'register' ? { name, email, password } : { email, password };
    try {
      const res = await axios.post(`${API_BASE}${endpoint}`, payload);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
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
    setToken('');
    setAnalytics(null);
    setExpenses([]);
    setAuthMode('login');
  };

  // Salary Update
  const updateSalary = async (e) => {
    e.preventDefault();
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

  // ---------------- BESPOKE MODERN FINTECH AUTH SCREEN ----------------
  if (!token) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#070b14] px-4 py-10 relative overflow-hidden font-sans select-none">
        
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-emerald-500/10 via-teal-500/10 to-transparent blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-emerald-600/5 blur-[100px] pointer-events-none" />

        {/* Outer Container */}
        <div className="w-full max-w-4xl relative z-10">
          
          {/* Top Brand Bar */}
          <div className="flex items-center justify-between mb-6 px-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[1px] shadow-lg shadow-emerald-500/20">
                <div className="w-full h-full bg-[#090e1a] rounded-[15px] flex items-center justify-center text-emerald-400">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h1 className="text-white text-base font-bold tracking-tight flex items-center gap-2">
                  FinPulse
                  <span className="text-[10px] font-semibold tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    EXPENSE OS
                  </span>
                </h1>
                <p className="text-slate-500 text-xs">Autonomous Personal Wealth Engine</p>
              </div>
            </div>

            {/* Micro Badge */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 border border-slate-800 px-3.5 py-1.5 rounded-full backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Secure Vault Active</span>
            </div>
          </div>

          {/* Unified Matte-Glass Main Card */}
          <div className="bg-[#0b1120]/90 backdrop-blur-2xl border border-slate-800/80 rounded-[32px] p-6 sm:p-10 shadow-2xl shadow-black/80 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Visual Feature Teaser */}
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

              {/* Dynamic Mockup Card (App feature teaser) */}
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
                {/* Visual Progress Line */}
                <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full w-[72%] rounded-full" />
                </div>
              </div>

              {/* Privacy Footnote */}
              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero-knowledge client encryption &amp; local sync</span>
              </div>
            </div>

            {/* Right Column: Portal Form */}
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

              {/* Status Notice */}
              {statusMessage && (
                <div className="mb-4 p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  {statusMessage}
                </div>
              )}

              {/* 1. LOGIN / REGISTER */}
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
                          className="w-full pl-10 pr-4 py-2.5 bg-[#080d18] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
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
                        className="w-full pl-10 pr-4 py-2.5 bg-[#080d18] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
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
                        className="w-full pl-10 pr-10 py-2.5 bg-[#080d18] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
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

                  {authMode === 'login' && (
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="remember"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-3.5 h-3.5 accent-emerald-500 rounded cursor-pointer bg-slate-800 border-slate-700"
                      />
                      <label htmlFor="remember" className="text-xs text-slate-400 cursor-pointer select-none">
                        Keep active session on this device
                      </label>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-[0.99] transition flex items-center justify-center gap-2 cursor-pointer"
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

              {/* 2. FORGOT PASSWORD */}
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

              {/* 3. RESET PASSWORD */}
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

          {/* Footer Signature with 'Built by' & Balanced Size */}
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

  // Comparison Percent helper
  const diffPercent = parseFloat(analytics?.differencePercent || '0');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header */}
        <header className="flex justify-between items-center bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow">
          <div>
            <h1 className="text-2xl font-black text-emerald-400 flex items-center gap-2">
              <Wallet className="w-8 h-8" /> FinPulse
            </h1>
            <p className="text-slate-400 text-sm">Monthly Salary &amp; Expense Comparison Engine</p>
          </div>
          <button onClick={handleLogout} className="px-4 py-2 bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white rounded-lg transition text-sm">
            Logout
          </button>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-sm">Monthly Salary</span>
            <h3 className="text-2xl font-bold mt-1">₹{analytics?.salary || 0}</h3>
            <form onSubmit={updateSalary} className="flex gap-2 mt-3">
              <input
                type="number"
                placeholder="Update salary"
                className="w-full bg-slate-800 px-2 py-1 text-sm rounded border border-slate-700 text-slate-100"
                value={salaryInput}
                onChange={(e) => setSalaryInput(e.target.value)}
              />
              <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-xs px-3 rounded font-medium">Set</button>
            </form>
          </div>

          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-sm">Current Month Spent</span>
            <h3 className="text-2xl font-bold mt-1 text-rose-400">₹{analytics?.currentMonthTotal || 0}</h3>
            <p className="text-xs text-slate-500 mt-2">Total expenses this month</p>
          </div>

          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-sm">Previous Month Total</span>
            <h3 className="text-2xl font-bold mt-1 text-slate-300">₹{analytics?.previousMonthTotal || 0}</h3>
            <div className="flex items-center gap-1 mt-2 text-xs font-semibold">
              {diffPercent > 0 ? (
                <span className="text-rose-400 flex items-center"><ArrowUpRight className="w-4 h-4"/> +{diffPercent}% vs last month</span>
              ) : diffPercent < 0 ? (
                <span className="text-emerald-400 flex items-center"><ArrowDownRight className="w-4 h-4"/> {diffPercent}% vs last month</span>
              ) : (
                <span className="text-slate-500">Same as last month</span>
              )}
            </div>
          </div>

          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-sm">Remaining Balance</span>
            <h3 className={`text-2xl font-bold mt-1 ${(analytics?.remainingBalance || 0) < 0 ? 'text-rose-500' : 'text-emerald-400'}`}>
              ₹{analytics?.remainingBalance || 0}
            </h3>
            <p className="text-xs text-slate-500 mt-2">Salary minus current expenses</p>
          </div>
        </div>

        {/* Charts & Form Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900 p-6 rounded-xl border border-slate-800">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" /> Category: This Month vs Last Month
            </h3>
            <div className="h-72">
              {analytics?.categoryBreakdown && analytics.categoryBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.categoryBreakdown}>
                    <XAxis dataKey="category" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                    <Legend />
                    <Bar dataKey="previousMonth" fill="#64748b" name="Previous Month" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="currentMonth" fill="#10b981" name="Current Month" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500">
                  No transaction data available for comparison yet.
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-emerald-400" /> Log Expense
            </h3>
            <form onSubmit={addExpense} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400">Expense Title</label>
                <input
                  type="text"
                  placeholder="e.g. Swiggy order, Metro pass"
                  className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-lg mt-1 text-sm text-slate-100"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Amount (₹)</label>
                <input
                  type="number"
                  placeholder="Amount"
                  className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-lg mt-1 text-sm text-slate-100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Category</label>
                <select
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-lg mt-1 text-sm text-slate-100"
                >
                  <option value="Food">Food &amp; Dining</option>
                  <option value="Rent">Rent &amp; Housing</option>
                  <option value="Bills">Bills &amp; Utilities</option>
                  <option value="Travel">Travel &amp; Commute</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 font-semibold rounded-lg transition mt-2 text-sm cursor-pointer"
              >
                Add Transaction
              </button>
            </form>
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h3 className="text-lg font-bold mb-4">Recent Expenses</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="pb-3">Title</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {expenses.length > 0 ? (
                  expenses.map((exp) => (
                    <tr key={exp._id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 font-medium">{exp.title}</td>
                      <td className="py-3 text-slate-400">{exp.category?.name || 'General'}</td>
                      <td className="py-3 text-slate-500">{new Date(exp.date).toLocaleDateString()}</td>
                      <td className="py-3 text-rose-400 font-semibold">₹{exp.amount}</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => deleteExpense(exp._id)}
                          className="text-slate-500 hover:text-rose-400 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-slate-500">
                      No expenses logged yet. Add your first expense above!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}