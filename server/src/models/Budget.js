const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Budget category is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Budget limit amount is required'],
      min: [1, 'Budget must be at least 1'],
    },
    month: {
      type: String, // format: "YYYY-MM", e.g. "2026-11"
      required: true,
    },
    alertThreshold: {
      type: Number,
      default: 80, // percentage 1-100
      min: 10,
      max: 100,
    },
    color: {
      type: String,
      default: '#6366f1',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// One budget per category per month per user
budgetSchema.index({ user: 1, category: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
