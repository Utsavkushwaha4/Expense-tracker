import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  Wallet, TrendingUp, TrendingDown, PlusCircle, Trash2, ArrowUpRight, ArrowDownRight 
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  // App States
  const [analytics, setAnalytics] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [salaryInput, setSalaryInput] = useState('');
  
  // Expense Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryName, setCategoryName] = useState('Food');

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
    const endpoint = isRegister ? '/auth/register' : '/auth/login';
    const payload = isRegister ? { name, email, password } : { email, password };
    try {
      const res = await axios.post(`${API_BASE}${endpoint}`, payload);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
    } catch (err) {
      alert(err.response?.data?.message || 'Authentication error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setAnalytics(null);
    setExpenses([]);
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

  // Login/Register Screen
  if (!token) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700">
          <h2 className="text-2xl font-bold text-center mb-6 text-emerald-400">
            {isRegister ? 'Create an Account' : 'Expense Tracker Login'}
          </h2>
          <form onSubmit={handleAuth} className="space-y-4">
            {isRegister && (
              <input
                type="text"
                placeholder="Full Name"
                className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:border-emerald-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}
            <input
              type="email"
              placeholder="Email Address"
              className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:border-emerald-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:border-emerald-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 font-semibold rounded-lg transition"
            >
              {isRegister ? 'Sign Up' : 'Log In'}
            </button>
          </form>
          <p className="text-center text-sm text-slate-400 mt-4 cursor-pointer hover:underline" onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
          </p>
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
            <p className="text-slate-400 text-sm">Monthly Salary & Expense Comparison Engine</p>
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
          {/* Comparison Chart */}
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

          {/* Add Expense Form */}
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
                  className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-lg mt-1 text-sm"
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
                  className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-lg mt-1 text-sm"
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
                  className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-lg mt-1 text-sm"
                >
                  <option value="Food">Food & Dining</option>
                  <option value="Rent">Rent & Housing</option>
                  <option value="Bills">Bills & Utilities</option>
                  <option value="Travel">Travel & Commute</option>
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