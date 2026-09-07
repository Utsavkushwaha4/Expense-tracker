const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth route is working!' });
});

// Register User
router.post('/register', async (req, res) => {
  const { name, email, password, monthlySalary } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      monthlySalary: monthlySalary || 0,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      monthlySalary: user.monthlySalary,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Login User
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        monthlySalary: user.monthlySalary,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Salary update
router.put('/salary', protect, async (req, res) => {
  const { monthlySalary } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.monthlySalary = monthlySalary;
    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      monthlySalary: updatedUser.monthlySalary,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---------------- NEW: FORGOT PASSWORD ----------------
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    // Generate random raw reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set token expiration (15 minutes from now)
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    await user.save();

    // Reset Link pointing to your Vercel frontend
    const resetUrl = `https://expense-tracker-eight-beta-38.vercel.app/reset-password/${resetToken}`;

    const message = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your Expense Tracker account.</p>
        <p>Click the button below to reset your password. This link is valid for <strong>15 minutes</strong>:</p>
        <a href="${resetUrl}" style="background: #2563eb; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        <p>If you didn't request this, you can safely ignore this email.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Expense Tracker - Password Reset',
        html: message,
      });

      res.status(200).json({ message: 'Password reset link sent to your email' });
    } catch (err) {
      user.resetPasswordToken = null;
      user.resetPasswordExpire = null;
      await user.save();
      return res.status(500).json({ message: 'Email could not be sent: ' + err.message });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---------------- NEW: RESET PASSWORD ----------------
router.post('/reset-password/:token', async (req, res) => {
  const { password } = req.body;

  // Hash url token to compare with DB hash
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Set new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Clear reset token fields
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

    await user.save();

    res.status(200).json({
      message: 'Password reset successful. You can now login with your new password.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;