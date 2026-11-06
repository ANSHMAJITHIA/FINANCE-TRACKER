const { User, Transaction, Budget, Goal } = require('../models');
const generateToken = require('../utils/generateToken');
const {
  generateDemoTransactions,
  generateDemoBudgets,
  generateDemoGoals,
} = require('../utils/seedData');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, currency } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      currency: currency || 'USD',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        monthlyBudgetLimit: user.monthlyBudgetLimit || 0,
        savingsGoal: user.savingsGoal || 0,
        token,
      },
      message: 'Account created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter both email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        monthlyBudgetLimit: user.monthlyBudgetLimit || 0,
        savingsGoal: user.savingsGoal || 0,
        avatar: user.avatar || '',
        token,
      },
      message: 'Login successful',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        monthlyBudgetLimit: user.monthlyBudgetLimit || 0,
        savingsGoal: user.savingsGoal || 0,
        avatar: user.avatar || '',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, currency, monthlyBudgetLimit, savingsGoal, avatar } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        ...(name && { name }),
        ...(currency && { currency }),
        ...(monthlyBudgetLimit !== undefined && { monthlyBudgetLimit: Number(monthlyBudgetLimit) }),
        ...(savingsGoal !== undefined && { savingsGoal: Number(savingsGoal) }),
        ...(avatar !== undefined && { avatar }),
      },
      { new: true }
    );

    res.json({
      success: true,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        currency: updatedUser.currency,
        monthlyBudgetLimit: updatedUser.monthlyBudgetLimit,
        savingsGoal: updatedUser.savingsGoal,
        avatar: updatedUser.avatar,
      },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Seed sample transactions, budgets and goals for current user
// @route   POST /api/auth/seed
// @access  Private
const seedUserData = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Clear existing for clean reload
    await Transaction.deleteMany({ user: userId });
    await Budget.deleteMany({ user: userId });
    await Goal.deleteMany({ user: userId });

    const demoTransactions = generateDemoTransactions(userId);
    const demoBudgets = generateDemoBudgets(userId, currentMonthStr);
    const demoGoals = generateDemoGoals(userId);

    await Transaction.insertMany(demoTransactions);
    await Budget.insertMany(demoBudgets);
    await Goal.insertMany(demoGoals);

    res.json({
      success: true,
      message: 'Sample financial dataset populated successfully!',
      stats: {
        transactionsCount: demoTransactions.length,
        budgetsCount: demoBudgets.length,
        goalsCount: demoGoals.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear all user data (reset account)
// @route   POST /api/auth/clear-data
// @access  Private
const clearUserData = async (req, res, next) => {
  try {
    const userId = req.user._id;
    await Transaction.deleteMany({ user: userId });
    await Budget.deleteMany({ user: userId });
    await Goal.deleteMany({ user: userId });

    res.json({
      success: true,
      message: 'All personal financial records cleared successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  seedUserData,
  clearUserData,
};
