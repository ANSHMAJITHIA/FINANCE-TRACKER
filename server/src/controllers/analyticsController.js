const { Transaction, Budget, Goal } = require('../models');

// Categorization according to 50/30/20 rule
const NEEDS_CATEGORIES = [
  'housing & rent',
  'utilities',
  'groceries',
  'food & dining',
  'transportation',
  'health & medical',
  'debt & loans',
  'insurance',
];

const WANTS_CATEGORIES = [
  'entertainment',
  'shopping',
  'travel',
  'personal care',
  'hobbies',
  'subscriptions',
  'general expense',
];

const SAVINGS_CATEGORIES = [
  'stocks',
  'savings',
  'crypto',
  'real estate',
  'retirement',
  'emergency fund',
  'investments',
];

const CATEGORY_COLORS = {
  'Food & Dining': '#f59e0b',
  'Housing & Rent': '#3b82f6',
  'Utilities': '#06b6d4',
  'Transportation': '#8b5cf6',
  'Shopping': '#10b981',
  'Entertainment': '#ec4899',
  'Health & Medical': '#ef4444',
  'Education': '#6366f1',
  'Travel': '#14b8a6',
  'Investments': '#84cc16',
  'Salary': '#22c55e',
  'Freelance': '#38bdf8',
  'General Expense': '#94a3b8',
};

// @desc    Get complete analytics dashboard data
// @route   GET /api/analytics/dashboard
// @access  Private
const getDashboardAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const allTransactions = await Transaction.find({ user: userId });

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    // Calculate Lifetime Totals
    let lifetimeIncome = 0;
    let lifetimeExpense = 0;
    let lifetimeInvestment = 0;

    allTransactions.forEach((t) => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'income') lifetimeIncome += amt;
      else if (t.type === 'expense') lifetimeExpense += amt;
      else if (t.type === 'investment') lifetimeInvestment += amt;
    });

    const netWorth = lifetimeIncome - lifetimeExpense;

    // Filter Current Month Transactions
    const currentMonthTxs = allTransactions.filter((t) => {
      const d = new Date(t.date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });

    let currentMonthIncome = 0;
    let currentMonthExpense = 0;
    let currentMonthInvestment = 0;

    currentMonthTxs.forEach((t) => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'income') currentMonthIncome += amt;
      else if (t.type === 'expense') currentMonthExpense += amt;
      else if (t.type === 'investment') currentMonthInvestment += amt;
    });

    const currentMonthSavings = currentMonthIncome - currentMonthExpense;
    const savingsRate =
      currentMonthIncome > 0
        ? Number(((currentMonthSavings / currentMonthIncome) * 100).toFixed(1))
        : 0;

    // 1. Monthly History (Last 6 Months) for Bar Chart
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlySeries = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth();
      const monthLabel = `${monthNames[m]} ${y !== currentYear ? "'" + String(y).slice(-2) : ''}`;

      const txs = allTransactions.filter((t) => {
        const td = new Date(t.date);
        return td.getFullYear() === y && td.getMonth() === m;
      });

      let inc = 0;
      let exp = 0;
      let inv = 0;

      txs.forEach((t) => {
        const amt = Number(t.amount) || 0;
        if (t.type === 'income') inc += amt;
        else if (t.type === 'expense') exp += amt;
        else if (t.type === 'investment') inv += amt;
      });

      monthlySeries.push({
        month: monthLabel,
        income: Number(inc.toFixed(2)),
        expense: Number(exp.toFixed(2)),
        investment: Number(inv.toFixed(2)),
        net: Number((inc - exp).toFixed(2)),
      });
    }

    // 2. Category Breakdown for Donut Chart (Current Month)
    const categoryTotals = {};
    currentMonthTxs
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
      });

    const categoryBreakdown = Object.entries(categoryTotals)
      .map(([name, value]) => ({
        name,
        value: Number(value.toFixed(2)),
        color: CATEGORY_COLORS[name] || '#64748b',
        percentage:
          currentMonthExpense > 0
            ? Number(((value / currentMonthExpense) * 100).toFixed(1))
            : 0,
      }))
      .sort((a, b) => b.value - a.value);

    // 3. Daily Cashflow for Area Chart (Current Month, day by day)
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const dailyTrend = [];
    let runningExpense = 0;

    for (let day = 1; day <= Math.min(daysInMonth, now.getDate()); day++) {
      const dayTxs = currentMonthTxs.filter((t) => {
        const td = new Date(t.date);
        return td.getDate() === day;
      });

      let dayIncome = 0;
      let dayExpense = 0;

      dayTxs.forEach((t) => {
        const amt = Number(t.amount) || 0;
        if (t.type === 'income') dayIncome += amt;
        if (t.type === 'expense') dayExpense += amt;
      });

      runningExpense += dayExpense;

      dailyTrend.push({
        day: `${day} ${monthNames[currentMonth]}`,
        income: Number(dayIncome.toFixed(2)),
        expense: Number(dayExpense.toFixed(2)),
        cumulativeExpense: Number(runningExpense.toFixed(2)),
      });
    }

    // 4. 50/30/20 Rule Analysis
    let needsSpent = 0;
    let wantsSpent = 0;
    let savingsSpent = currentMonthInvestment;

    currentMonthTxs
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const cat = t.category.toLowerCase();
        const amt = Number(t.amount) || 0;
        if (NEEDS_CATEGORIES.some((c) => cat.includes(c))) {
          needsSpent += amt;
        } else if (SAVINGS_CATEGORIES.some((c) => cat.includes(c))) {
          savingsSpent += amt;
        } else {
          wantsSpent += amt;
        }
      });

    // Also include pure investments in savings bucket
    const totalAllocated = currentMonthIncome || (needsSpent + wantsSpent + savingsSpent) || 1;
    const needsPct = Number(((needsSpent / totalAllocated) * 100).toFixed(1));
    const wantsPct = Number(((wantsSpent / totalAllocated) * 100).toFixed(1));
    const savingsPct = Number(((savingsSpent / totalAllocated) * 100).toFixed(1));

    // Health Score calculation (0 to 100)
    let healthScore = 70;
    if (savingsPct >= 20) healthScore += 15;
    else if (savingsPct >= 10) healthScore += 8;
    if (needsPct <= 50) healthScore += 15;
    else if (needsPct > 70) healthScore -= 20;
    if (currentMonthSavings > 0) healthScore += 5;
    healthScore = Math.max(10, Math.min(100, healthScore));

    // 5. Recent 5 Transactions
    const recentTransactions = [...allTransactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 6);

    res.json({
      success: true,
      data: {
        kpis: {
          netWorth: Number(netWorth.toFixed(2)),
          currentMonthIncome: Number(currentMonthIncome.toFixed(2)),
          currentMonthExpense: Number(currentMonthExpense.toFixed(2)),
          currentMonthSavings: Number(currentMonthSavings.toFixed(2)),
          savingsRate,
          lifetimeIncome: Number(lifetimeIncome.toFixed(2)),
          lifetimeExpense: Number(lifetimeExpense.toFixed(2)),
          transactionCount: allTransactions.length,
        },
        monthlySeries,
        categoryBreakdown,
        dailyTrend,
        rule503020: {
          needs: { amount: Number(needsSpent.toFixed(2)), percentage: needsPct, target: 50 },
          wants: { amount: Number(wantsSpent.toFixed(2)), percentage: wantsPct, target: 30 },
          savings: { amount: Number(savingsSpent.toFixed(2)), percentage: savingsPct, target: 20 },
          healthScore,
          status:
            healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Healthy' : 'Needs Attention',
        },
        recentTransactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardAnalytics,
};
