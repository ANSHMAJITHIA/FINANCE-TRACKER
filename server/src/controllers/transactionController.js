const { Transaction } = require('../models');

// @desc    Get all transactions with filtering, searching, sorting and pagination
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      type,
      category,
      search,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      sortBy = 'date',
      sortOrder = 'desc',
      page = 1,
      limit = 50,
    } = req.query;

    // Fetch user transactions
    let transactions = await Transaction.find({ user: userId });

    // Apply Filters
    if (type && type !== 'all') {
      transactions = transactions.filter((t) => t.type.toLowerCase() === type.toLowerCase());
    }

    if (category && category !== 'all') {
      transactions = transactions.filter(
        (t) => t.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (search) {
      const q = search.toLowerCase();
      transactions = transactions.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.notes && t.notes.toLowerCase().includes(q)) ||
          (t.category && t.category.toLowerCase().includes(q)) ||
          (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(q)))
      );
    }

    if (startDate) {
      const start = new Date(startDate).getTime();
      transactions = transactions.filter((t) => new Date(t.date).getTime() >= start);
    }

    if (endDate) {
      const end = new Date(endDate).getTime();
      transactions = transactions.filter((t) => new Date(t.date).getTime() <= end);
    }

    if (minAmount) {
      transactions = transactions.filter((t) => Number(t.amount) >= Number(minAmount));
    }

    if (maxAmount) {
      transactions = transactions.filter((t) => Number(t.amount) <= Number(maxAmount));
    }

    // Calculate Summary Stats from filtered dataset
    let totalIncome = 0;
    let totalExpense = 0;
    let totalInvestment = 0;

    transactions.forEach((t) => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'income') totalIncome += amt;
      else if (t.type === 'expense') totalExpense += amt;
      else if (t.type === 'investment') totalInvestment += amt;
    });

    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : 0;

    // Sorting
    transactions.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === 'date') {
        valA = new Date(a.date).getTime();
        valB = new Date(b.date).getTime();
      } else if (sortBy === 'amount') {
        valA = Number(a.amount);
        valB = Number(b.amount);
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Pagination
    const totalCount = transactions.length;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = transactions.slice(startIndex, startIndex + limitNum);

    res.json({
      success: true,
      data: paginated,
      meta: {
        totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
        currentPage: pageNum,
        limit: limitNum,
        summary: {
          totalIncome: Number(totalIncome.toFixed(2)),
          totalExpense: Number(totalExpense.toFixed(2)),
          totalInvestment: Number(totalInvestment.toFixed(2)),
          netSavings: Number(netSavings.toFixed(2)),
          savingsRate: Number(savingsRate),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
const getTransactionById = async (req, res, next) => {
  try {
    const tx = await Transaction.findById(req.params.id);

    if (!tx || tx.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.json({ success: true, data: tx });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res, next) => {
  try {
    const {
      title,
      amount,
      type,
      category,
      date,
      paymentMethod,
      notes,
      tags,
      isRecurring,
      recurringInterval,
    } = req.body;

    if (!title || !amount || !type || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, amount, type, and category',
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than zero',
      });
    }

    const tx = await Transaction.create({
      user: req.user._id,
      title: title.trim(),
      amount: Number(amount),
      type,
      category: category.trim(),
      date: date || new Date().toISOString(),
      paymentMethod: paymentMethod || 'Debit Card',
      notes: notes || '',
      tags: Array.isArray(tags) ? tags : typeof tags === 'string' && tags ? tags.split(',').map((t) => t.trim()) : [],
      isRecurring: Boolean(isRecurring),
      recurringInterval: recurringInterval || 'none',
      status: 'completed',
    });

    res.status(201).json({
      success: true,
      data: tx,
      message: 'Transaction recorded successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res, next) => {
  try {
    const tx = await Transaction.findById(req.params.id);

    if (!tx || tx.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    const {
      title,
      amount,
      type,
      category,
      date,
      paymentMethod,
      notes,
      tags,
      isRecurring,
      recurringInterval,
      status,
    } = req.body;

    const updated = await Transaction.findByIdAndUpdate(
      req.params.id,
      {
        ...(title && { title: title.trim() }),
        ...(amount !== undefined && { amount: Number(amount) }),
        ...(type && { type }),
        ...(category && { category: category.trim() }),
        ...(date && { date: new Date(date).toISOString() }),
        ...(paymentMethod && { paymentMethod }),
        ...(notes !== undefined && { notes }),
        ...(tags !== undefined && {
          tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : [],
        }),
        ...(isRecurring !== undefined && { isRecurring: Boolean(isRecurring) }),
        ...(recurringInterval && { recurringInterval }),
        ...(status && { status }),
      },
      { new: true }
    );

    res.json({
      success: true,
      data: updated,
      message: 'Transaction updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res, next) => {
  try {
    const tx = await Transaction.findById(req.params.id);

    if (!tx || tx.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    await Transaction.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Transaction removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk import transactions (e.g., CSV upload)
// @route   POST /api/transactions/import
// @access  Private
const importTransactions = async (req, res, next) => {
  try {
    const { transactions } = req.body;

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of transactions to import',
      });
    }

    const userId = req.user._id;
    const validated = [];

    for (const item of transactions) {
      if (item.title && item.amount && item.type && item.category) {
        validated.push({
          user: userId,
          title: item.title.trim(),
          amount: Math.abs(Number(item.amount)),
          type: item.type.toLowerCase(),
          category: item.category.trim(),
          date: item.date ? new Date(item.date).toISOString() : new Date().toISOString(),
          paymentMethod: item.paymentMethod || 'Debit Card',
          notes: item.notes || '',
          tags: item.tags || [],
          status: 'completed',
        });
      }
    }

    if (validated.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid transaction records found in the import payload',
      });
    }

    const created = await Transaction.insertMany(validated);

    res.status(201).json({
      success: true,
      count: created.length,
      message: `Successfully imported ${created.length} transactions`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  importTransactions,
};
