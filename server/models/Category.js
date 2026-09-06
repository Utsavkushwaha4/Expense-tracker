const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    budgetLimit: {
      type: Number,
      default: 0, // e.g. Food ke liye monthly max limit
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);