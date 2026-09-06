const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const Category = require('../models/Category');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// 1. Add New Expense
router.post('/', protect, async (req, res) => {
  const { categoryId, categoryName, title, amount, date, notes } = req.body;

  try {
    let finalCategoryId = categoryId;

    // Agar frontend se direct category name aaya ho aur ID na ho
    if (!finalCategoryId && categoryName) {
      let category = await Category.findOne({ user: req.user.id, name: categoryName });
      if (!category) {
        category = await Category.create({ user: req.user.id, name: categoryName });
      }
      finalCategoryId = category._id;
    }

    const expense = await Expense.create({
      user: req.user.id,
      category: finalCategoryId,
      title,
      amount,
      date: date || new Date(),
      notes,
    });

    const populatedExpense = await Expense.findById(expense._id).populate('category', 'name budgetLimit');
    res.status(201).json(populatedExpense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. Get All Expenses of Logged-in User
router.get('/', protect, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id })
      .populate('category', 'name budgetLimit')
      .sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. Delete an Expense
router.delete('/:id', protect, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 4. MONTH-OVER-MONTH COMPARISON & ANALYTICS
router.get('/analytics/monthly-comparison', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const currentDate = new Date();
    
    // Query params ya default current month/year
    const queryMonth = req.query.month ? parseInt(req.query.month) - 1 : currentDate.getMonth();
    const queryYear = req.query.year ? parseInt(req.query.year) : currentDate.getFullYear();

    // Current Month range
    const startOfCurrentMonth = new Date(queryYear, queryMonth, 1);
    const endOfCurrentMonth = new Date(queryYear, queryMonth + 1, 0, 23, 59, 59);

    // Previous Month range
    const startOfPrevMonth = new Date(queryYear, queryMonth - 1, 1);
    const endOfPrevMonth = new Date(queryYear, queryMonth, 0, 23, 59, 59);

    // Fetch expenses
    const currentExpenses = await Expense.find({
      user: req.user.id,
      date: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth },
    }).populate('category', 'name');

    const prevExpenses = await Expense.find({
      user: req.user.id,
      date: { $gte: startOfPrevMonth, $lte: endOfPrevMonth },
    }).populate('category', 'name');

    // Totals calculate karo
    const currentTotal = currentExpenses.reduce((sum, item) => sum + item.amount, 0);
    const prevTotal = prevExpenses.reduce((sum, item) => sum + item.amount, 0);

    // Percentage difference calculate karo
    let totalDifferencePercent = 0;
    if (prevTotal > 0) {
      totalDifferencePercent = (((currentTotal - prevTotal) / prevTotal) * 100).toFixed(2);
    }

    // Category breakdown
    const categoryStats = {};

    currentExpenses.forEach((exp) => {
      const catName = exp.category ? exp.category.name : 'Uncategorized';
      if (!categoryStats[catName]) {
        categoryStats[catName] = { category: catName, currentMonth: 0, previousMonth: 0 };
      }
      categoryStats[catName].currentMonth += exp.amount;
    });

    prevExpenses.forEach((exp) => {
      const catName = exp.category ? exp.category.name : 'Uncategorized';
      if (!categoryStats[catName]) {
        categoryStats[catName] = { category: catName, currentMonth: 0, previousMonth: 0 };
      }
      categoryStats[catName].previousMonth += exp.amount;
    });

    const categoryBreakdown = Object.values(categoryStats).map((item) => {
      let diff = 0;
      if (item.previousMonth > 0) {
        diff = (((item.currentMonth - item.previousMonth) / item.previousMonth) * 100).toFixed(2);
      }
      return {
        ...item,
        differencePercent: `${diff}%`,
      };
    });

    res.json({
      salary: user ? user.monthlySalary : 0,
      currentMonthTotal: currentTotal,
      previousMonthTotal: prevTotal,
      differencePercent: `${totalDifferencePercent}%`,
      remainingBalance: (user ? user.monthlySalary : 0) - currentTotal,
      categoryBreakdown,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;