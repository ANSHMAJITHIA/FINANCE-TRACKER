const { Budget, Transaction } = require('../models');

// Helper to get current YYYY-MM
const getCurrentMonthStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

// @desc    Get all budgets for a given month with calculated spent amounts
// @route   GET /api/budgets
// @access  Private
const getBudgets = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const month = req.query.month || getCurrentMonthStr();

    // Fetch user budgets for the month
    const budgets = await Budget.find({ user: userId, month });

    // Fetch all expenses for this month to calculate actual spending
    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1).toISOString();
    const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999).toISOString();

    const allExpenses = await Transaction.find({
      user: userId,
      type: 'expense',
      startDate,
      endDate,
    });

    // Map spending per category
    const spendingMap = {};
    allExpenses.forEach((tx) => {
      const cat = tx.category.toLowerCase();
      spendingMap[cat] = (spendingMap[cat] || 0) + Number(tx.amount);
    });

    // Merge budgets with actual spend data
    let totalBudgeted = 0;
    let totalSpent = 0;

    const enrichedBudgets = budgets.map((b) => {
      const allocated = Number(b.amount);
      const spent = Number((spendingMap[b.category.toLowerCase()] || 0).toFixed(2));
      const remaining = Number((allocated - spent).toFixed(2));
      const percent = allocated > 0 ? Number(((spent / allocated) * 100).toFixed(1)) : 0;

      let status = 'normal';
      if (percent >= 100) {
        status = 'exceeded';
      } else if (percent >= (b.alertThreshold || 80)) {
        status = 'warning';
      }

      totalBudgeted += allocated;
      totalSpent += spent;

      return {
        _id: b._id,
        category: b.category,
        amount: allocated,
        spent,
        remaining,
        percent,
        status,
        month: b.month,
        alertThreshold: b.alertThreshold || 80,
        color: b.color || '#6366f1',
        notes: b.notes || '',
      };
    });

    res.json({
      success: true,
      data: enrichedBudgets,
      summary: {
        month,
        totalBudgeted: Number(totalBudgeted.toFixed(2)),
        totalSpent: Number(totalSpent.toFixed(2)),
        remainingBudget: Number((totalBudgeted - totalSpent).toFixed(2)),
        overallPercentage:
          totalBudgeted > 0 ? Number(((totalSpent / totalBudgeted) * 100).toFixed(1)) : 0,
        categoryCount: enrichedBudgets.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update category budget for month
// @route   POST /api/budgets
// @access  Private
const createBudget = async (req, res, next) => {
  try {
    const { category, amount, month, alertThreshold, color, notes } = req.body;
    const userId = req.user._id;
    const targetMonth = month || getCurrentMonthStr();

    if (!category || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both category and budget limit amount',
      });
    }

    // Check if budget exists for this category and month
    const existing = await Budget.findOne({
      user: userId,
      category: category.trim(),
      month: targetMonth,
    });

    if (existing) {
      // Update existing
      const updated = await Budget.findByIdAndUpdate(
        existing._id,
        {
          amount: Number(amount),
          alertThreshold: alertThreshold ? Number(alertThreshold) : existing.alertThreshold,
          color: color || existing.color,
          notes: notes !== undefined ? notes : existing.notes,
        },
        { new: true }
      );
      return res.json({
        success: true,
        data: updated,
        message: `Updated ${category} budget to ${amount}`,
      });
    }

    const budget = await Budget.create({
      user: userId,
      category: category.trim(),
      amount: Number(amount),
      month: targetMonth,
      alertThreshold: alertThreshold ? Number(alertThreshold) : 80,
      color: color || '#6366f1',
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      data: budget,
      message: `Budget created for ${category}`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a budget
// @route   PUT /api/budgets/:id
// @access  Private
const updateBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget || budget.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    const { amount, alertThreshold, color, notes, category } = req.body;

    const updated = await Budget.findByIdAndUpdate(
      req.params.id,
      {
        ...(category && { category: category.trim() }),
        ...(amount !== undefined && { amount: Number(amount) }),
        ...(alertThreshold !== undefined && { alertThreshold: Number(alertThreshold) }),
        ...(color && { color }),
        ...(notes !== undefined && { notes }),
      },
      { new: true }
    );

    res.json({
      success: true,
      data: updated,
      message: 'Budget updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a budget
// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget || budget.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    await Budget.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Budget deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
};
