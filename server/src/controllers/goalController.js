const { Goal } = require('../models');

// @desc    Get all savings goals with analytical metrics
// @route   GET /api/goals
// @access  Private
const getGoals = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const goals = await Goal.find({ user: userId });

    const now = new Date();

    const enriched = goals.map((g) => {
      const target = Number(g.targetAmount);
      const current = Number(g.currentAmount || 0);
      const remaining = Math.max(0, target - current);
      const percent = target > 0 ? Math.min(100, Number(((current / target) * 100).toFixed(1))) : 0;

      // Time calculation
      const targetDate = new Date(g.targetDate);
      const monthsLeft = Math.max(
        1,
        (targetDate.getFullYear() - now.getFullYear()) * 12 +
          (targetDate.getMonth() - now.getMonth())
      );

      const monthlyNeeded = remaining > 0 ? Number((remaining / monthsLeft).toFixed(2)) : 0;
      const isAchieved = current >= target;

      return {
        _id: g._id,
        title: g.title,
        targetAmount: target,
        currentAmount: current,
        remainingAmount: remaining,
        percentage: percent,
        targetDate: g.targetDate,
        monthsLeft,
        monthlyNeeded,
        isAchieved,
        category: g.category || 'General',
        color: g.color || '#10b981',
        status: isAchieved ? 'completed' : g.status || 'in-progress',
        notes: g.notes || '',
      };
    });

    const totalTarget = enriched.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalSaved = enriched.reduce((sum, g) => sum + g.currentAmount, 0);

    res.json({
      success: true,
      data: enriched,
      summary: {
        totalGoals: enriched.length,
        totalTarget: Number(totalTarget.toFixed(2)),
        totalSaved: Number(totalSaved.toFixed(2)),
        overallPercentage:
          totalTarget > 0 ? Number(((totalSaved / totalTarget) * 100).toFixed(1)) : 0,
        completedCount: enriched.filter((g) => g.isAchieved).length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new financial goal
// @route   POST /api/goals
// @access  Private
const createGoal = async (req, res, next) => {
  try {
    const { title, targetAmount, currentAmount, targetDate, category, color, notes } = req.body;

    if (!title || !targetAmount || !targetDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, target amount, and target date',
      });
    }

    const goal = await Goal.create({
      user: req.user._id,
      title: title.trim(),
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount || 0),
      targetDate: new Date(targetDate).toISOString(),
      category: category || 'General Savings',
      color: color || '#10b981',
      notes: notes || '',
      status: Number(currentAmount || 0) >= Number(targetAmount) ? 'completed' : 'in-progress',
    });

    res.status(201).json({
      success: true,
      data: goal,
      message: 'Financial goal created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add funds (deposit) towards a goal
// @route   POST /api/goals/:id/deposit
// @access  Private
const depositToGoal = async (req, res, next) => {
  try {
    const { amount } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Deposit amount must be greater than zero',
      });
    }

    const goal = await Goal.findById(req.params.id);
    if (!goal || goal.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    const newCurrent = Number(goal.currentAmount || 0) + Number(amount);
    const isCompleted = newCurrent >= Number(goal.targetAmount);

    const updated = await Goal.findByIdAndUpdate(
      req.params.id,
      {
        currentAmount: newCurrent,
        status: isCompleted ? 'completed' : goal.status,
      },
      { new: true }
    );

    res.json({
      success: true,
      data: updated,
      message: isCompleted
        ? `🎉 Goal Achieved! Added ${amount}. Goal is 100% funded!`
        : `Successfully contributed ${amount} to "${goal.title}"`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a goal
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal || goal.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    const { title, targetAmount, currentAmount, targetDate, category, color, status, notes } =
      req.body;

    const newTarget = targetAmount !== undefined ? Number(targetAmount) : goal.targetAmount;
    const newCurrent = currentAmount !== undefined ? Number(currentAmount) : goal.currentAmount;

    const updated = await Goal.findByIdAndUpdate(
      req.params.id,
      {
        ...(title && { title: title.trim() }),
        ...(targetAmount !== undefined && { targetAmount: newTarget }),
        ...(currentAmount !== undefined && { currentAmount: newCurrent }),
        ...(targetDate && { targetDate: new Date(targetDate).toISOString() }),
        ...(category && { category }),
        ...(color && { color }),
        ...(notes !== undefined && { notes }),
        status: newCurrent >= newTarget ? 'completed' : status || goal.status,
      },
      { new: true }
    );

    res.json({
      success: true,
      data: updated,
      message: 'Goal updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal || goal.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    await Goal.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Financial goal removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGoals,
  createGoal,
  depositToGoal,
  updateGoal,
  deleteGoal,
};
