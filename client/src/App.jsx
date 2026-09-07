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

  // ---------------- MODERN SPLIT-CARD AUTH SCREEN ----------------
  if (!token) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#070b12] px-4 py-8 relative overflow-hidden font-sans">
        
        {/* Ambient Mesh Dots */}
        <div 
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#10b981 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px'
          }}
        />

        {/* Minimal Brand Tag Top Left */}
        <div className="absolute top-6 left-6 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm">
            <Wallet className="w-4 h-4" />
          </div>
          <span className="text-white font-bold tracking-wider text-sm">
            FINPULSE <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 ml-1">EXPENSE OS</span>
          </span>
        </div>

        {/* Main Split-Card Box */}
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl shadow-black/80 border border-slate-200/80 overflow-hidden grid grid-cols-1 md:grid-cols-12 relative z-10">
          
          {/* Left Hero Panel (Dark Blue / Cyan-Emerald Glow) */}
          <div className="md:col-span-5 bg-[#0e1626] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700/60 mb-6 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-300 tracking-widest uppercase">
                  Smart Wealth Intelligence
                </span>
              </div>

              <div className="w-13 h-13 w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 shadow-inner">
                <TrendingUp className="w-6 h-6" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                Intelligent Expense <br />
                <span className="text-emerald-400">&amp; Budget Analytics.</span>
              </h2>

              <p className="text-slate-400 text-xs sm:text-sm mt-4 leading-relaxed font-normal">
                Real-time cash flow monitoring, automated category tracking, and monthly financial comparison.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800/80 relative z-10 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-800/90 border border-slate-700 flex items-center justify-center text-emerald-400">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">End-to-End Encrypted</p>
                <p className="text-[10px] text-slate-400 font-medium">Secured authentication &amp; data vault</p>
              </div>
            </div>
          </div>

          {/* Right Panel (Clean Portal Login Form) */}
          <div className="md:col-span-7 bg-white p-8 sm:p-12 flex flex-col justify-between relative">
            <div 
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#0e1626 1.2px, transparent 1.2px)',
                backgroundSize: '18px 18px'
              }}
            />

            <div className="relative z-10">
              {/* Heading */}
              <div className="mb-6">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {authMode === 'login' && 'FINANCIAL ACCESS'}
                  {authMode === 'register' && 'CREATE PORTAL ACCOUNT'}
                  {authMode === 'forgot' && 'ACCOUNT RECOVERY'}
                  {authMode === 'reset' && 'CREATE NEW PASSWORD'}
                </h3>
                <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">
                  {authMode === 'login' && 'Secure Portal Login'}
                  {authMode === 'register' && 'Register For Free Account'}
                  {authMode === 'forgot' && 'Reset Password Via Secure Token'}
                  {authMode === 'reset' && 'Enter Your Updated Password'}
                </p>
              </div>

              {/* Status/Success Message */}
              {statusMessage && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium rounded-xl text-center">
                  {statusMessage}
                </div>
              )}

              {/* 1. LOGIN / REGISTER FORM */}
              {(authMode === 'login' || authMode === 'register') && (
                <form onSubmit={handleAuth} className="space-y-4">
                  {authMode === 'register' && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-1.5">
                        FULL NAME
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <User className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          placeholder="Your Name"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-1.5">
                      REGISTERED EMAIL
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        type="email"
                        placeholder="utsavkushwaha4@gmail.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-1.5">
                      PASSWORD
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter password"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {authMode === 'login' && (
                    <div className="flex items-center justify-between text-xs pt-1">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
                        />
                        <span className="text-[11px] font-medium">Keep me signed in</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => { setAuthMode('forgot'); setStatusMessage(''); }}
                        className="font-bold text-slate-500 hover:text-emerald-600 uppercase tracking-wider text-[10px] transition"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-[#0e1626] hover:bg-slate-900 active:scale-[0.99] text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 mt-2 cursor-pointer"
                  >
                    <span>{authMode === 'register' ? 'Create Free Account' : 'Authorize Login'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="text-center mt-5">
                    <p className="text-xs text-slate-500">
                      {authMode === 'register' ? 'Already have an account?' : "Don't have an account?"}{' '}
                      <button
                        type="button"
                        onClick={() => setAuthMode(authMode === 'register' ? 'login' : 'register')}
                        className="text-emerald-600 font-bold hover:underline cursor-pointer"
                      >
                        {authMode === 'register' ? 'Log In' : 'Sign Up'}
                      </button>
                    </p>
                  </div>
                </form>
              )}

              {/* 2. FORGOT PASSWORD FORM */}
              {authMode === 'forgot' && (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <p className="text-xs text-slate-500 mb-2">
                    Enter your registered email address. We'll generate a secure token to reset your password.
                  </p>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-1.5">
                      REGISTERED EMAIL
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        type="email"
                        placeholder="Your Registered Email"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-[#0e1626] hover:bg-slate-900 active:scale-[0.99] text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    <span>{loading ? 'Processing...' : 'Send Recovery Link'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => { setAuthMode('login'); setStatusMessage(''); }}
                      className="text-xs text-slate-500 hover:text-emerald-600 font-bold hover:underline cursor-pointer"
                    >
                      &larr; Back to Login
                    </button>
                  </div>
                </form>
              )}

              {/* 3. RESET PASSWORD FORM */}
              {authMode === 'reset' && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-1.5">
                      NEW PASSWORD
                    </label>
                    <input
                      type="password"
                      placeholder="New Password"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-1.5">
                      CONFIRM NEW PASSWORD
                    </label>
                    <input
                      type="password"
                      placeholder="Confirm New Password"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-[#0e1626] hover:bg-slate-900 text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? 'Updating Password...' : 'Save New Password'}
                  </button>
                </form>
              )}
            </div>

            {/* Gateflow Style Designed & Developed Credits */}
            <footer className="mt-8 pt-4 border-t border-slate-100 text-center relative z-10">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                Designed &amp; Developed by{' '}
                <span className="text-slate-800 font-bold">Utsav Kushwaha</span> &amp;{' '}
                <span className="text-slate-800 font-bold">Gunjan Kushwaha</span>
              </p>
            </footer>

          </div>
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
                className="w-full bg-slate-800 px-2 py-1 text-sm rounded border border-slate-700"
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
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 font-semibold rounded-lg transition mt-2 text-sm"
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
                          className="text-slate-500 hover:text-rose-400 transition"
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