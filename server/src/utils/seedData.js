const generateDemoTransactions = (userId) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  // Helper to format ISO date for day offset
  const createDate = (daysAgo) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString();
  };

  return [
    // Current Month Income
    {
      user: userId,
      title: 'Senior Software Engineer Salary',
      amount: 5500,
      type: 'income',
      category: 'Salary',
      date: createDate(2),
      paymentMethod: 'Bank Transfer',
      notes: 'Direct deposit monthly payout',
      tags: ['salary', 'tech', 'full-time'],
      status: 'completed',
    },
    {
      user: userId,
      title: 'UI/UX Freelance Consulting',
      amount: 1450,
      type: 'income',
      category: 'Freelance',
      date: createDate(8),
      paymentMethod: 'Bank Transfer',
      notes: 'Client milestone completion bonus',
      tags: ['freelance', 'client', 'design'],
      status: 'completed',
    },
    {
      user: userId,
      title: 'Quarterly Stock Dividend',
      amount: 320,
      type: 'income',
      category: 'Investments',
      date: createDate(14),
      paymentMethod: 'Bank Transfer',
      notes: 'Vanguard dividend reinvestment payout',
      tags: ['dividend', 'passive-income'],
      status: 'completed',
    },

    // Expenses - Housing
    {
      user: userId,
      title: 'Luxury Apartment Rent',
      amount: 1650,
      type: 'expense',
      category: 'Housing & Rent',
      date: createDate(3),
      paymentMethod: 'Bank Transfer',
      notes: 'Monthly apartment lease',
      tags: ['rent', 'fixed-expense'],
      status: 'completed',
    },

    // Expenses - Food & Dining
    {
      user: userId,
      title: 'Whole Foods Organic Groceries',
      amount: 184.5,
      type: 'expense',
      category: 'Food & Dining',
      date: createDate(1),
      paymentMethod: 'Credit Card',
      notes: 'Weekly fresh produce & kitchen restocking',
      tags: ['groceries', 'organic'],
      status: 'completed',
    },
    {
      user: userId,
      title: 'Artisan Sushi Dinner with Friends',
      amount: 125,
      type: 'expense',
      category: 'Food & Dining',
      date: createDate(4),
      paymentMethod: 'Credit Card',
      notes: 'Weekend dinner',
      tags: ['dining-out', 'social'],
      status: 'completed',
    },
    {
      user: userId,
      title: 'Trader Joe\'s Weekly Supplies',
      amount: 92.3,
      type: 'expense',
      category: 'Food & Dining',
      date: createDate(9),
      paymentMethod: 'Debit Card',
      notes: 'Snacks & groceries',
      tags: ['groceries'],
      status: 'completed',
    },
    {
      user: userId,
      title: 'Specialty Espresso & Bakery',
      amount: 18.75,
      type: 'expense',
      category: 'Food & Dining',
      date: createDate(0),
      paymentMethod: 'Apple Pay',
      notes: 'Morning coffee & croissant',
      tags: ['coffee'],
      status: 'completed',
    },

    // Expenses - Utilities
    {
      user: userId,
      title: 'Fiber Gigabit Internet',
      amount: 79.99,
      type: 'expense',
      category: 'Utilities',
      date: createDate(5),
      paymentMethod: 'Credit Card',
      notes: 'Home office high-speed internet',
      tags: ['utilities', 'internet'],
      status: 'completed',
    },
    {
      user: userId,
      title: 'Electric & Green Power Bill',
      amount: 115.4,
      type: 'expense',
      category: 'Utilities',
      date: createDate(11),
      paymentMethod: 'Bank Transfer',
      notes: 'Monthly utility billing',
      tags: ['utilities', 'electricity'],
      status: 'completed',
    },

    // Expenses - Transportation
    {
      user: userId,
      title: 'EV Charging & Station Fee',
      amount: 45.0,
      type: 'expense',
      category: 'Transportation',
      date: createDate(2),
      paymentMethod: 'Credit Card',
      notes: 'Supercharger recharge',
      tags: ['transport', 'ev'],
      status: 'completed',
    },
    {
      user: userId,
      title: 'City Metro Card Monthly Pass',
      amount: 85.0,
      type: 'expense',
      category: 'Transportation',
      date: createDate(12),
      paymentMethod: 'Debit Card',
      notes: 'Unlimited monthly transit',
      tags: ['transport', 'commute'],
      status: 'completed',
    },
    {
      user: userId,
      title: 'Uber Ride from Airport',
      amount: 38.5,
      type: 'expense',
      category: 'Transportation',
      date: createDate(7),
      paymentMethod: 'Credit Card',
      notes: 'Late evening cab ride',
      tags: ['uber', 'rideshare'],
      status: 'completed',
    },

    // Expenses - Entertainment & Subscriptions
    {
      user: userId,
      title: 'Netflix 4K + Spotify Premium',
      amount: 34.98,
      type: 'expense',
      category: 'Entertainment',
      date: createDate(6),
      paymentMethod: 'Credit Card',
      notes: 'Monthly streaming subscriptions',
      tags: ['entertainment', 'subscriptions'],
      status: 'completed',
    },
    {
      user: userId,
      title: 'IMAX Cinema Tickets (2x)',
      amount: 42.0,
      type: 'expense',
      category: 'Entertainment',
      date: createDate(10),
      paymentMethod: 'Debit Card',
      notes: 'Weekend movie premiere',
      tags: ['cinema', 'entertainment'],
      status: 'completed',
    },

    // Expenses - Shopping
    {
      user: userId,
      title: 'Noise Cancelling Headphones',
      amount: 249.99,
      type: 'expense',
      category: 'Shopping',
      date: createDate(13),
      paymentMethod: 'Credit Card',
      notes: 'Sony WH-1000XM5 on tech sale',
      tags: ['electronics', 'gadgets'],
      status: 'completed',
    },
    {
      user: userId,
      title: 'Athletic Running Shoes & Gear',
      amount: 110.0,
      type: 'expense',
      category: 'Shopping',
      date: createDate(15),
      paymentMethod: 'Credit Card',
      notes: 'Nike marathon shoes',
      tags: ['fitness', 'shopping'],
      status: 'completed',
    },

    // Expenses - Health & Medical
    {
      user: userId,
      title: 'Equinox Fitness Club Membership',
      amount: 120.0,
      type: 'expense',
      category: 'Health & Medical',
      date: createDate(5),
      paymentMethod: 'Debit Card',
      notes: 'Gym & swimming pool access',
      tags: ['health', 'gym'],
      status: 'completed',
    },

    // Investments
    {
      user: userId,
      title: 'S&P 500 Index Fund (VOO)',
      amount: 1000.0,
      type: 'investment',
      category: 'Stocks',
      date: createDate(4),
      paymentMethod: 'Bank Transfer',
      notes: 'Automated dollar-cost averaging into Vanguard index',
      tags: ['investment', 'stocks', 'long-term'],
      status: 'completed',
    },
    {
      user: userId,
      title: 'High-Yield Savings Transfer',
      amount: 500.0,
      type: 'investment',
      category: 'Savings',
      date: createDate(10),
      paymentMethod: 'Bank Transfer',
      notes: 'Transferred to 5.1% APY emergency reserve',
      tags: ['savings', 'emergency-fund'],
      status: 'completed',
    },

    // Historical transactions (Last Month)
    {
      user: userId,
      title: 'Previous Month Salary',
      amount: 5500,
      type: 'income',
      category: 'Salary',
      date: createDate(35),
      paymentMethod: 'Bank Transfer',
      notes: 'Last month payroll',
      tags: ['salary'],
      status: 'completed',
    },
    {
      user: userId,
      title: 'Apartment Rent (Previous Month)',
      amount: 1650,
      type: 'expense',
      category: 'Housing & Rent',
      date: createDate(34),
      paymentMethod: 'Bank Transfer',
      notes: 'Rent lease',
      tags: ['rent'],
      status: 'completed',
    },
    {
      user: userId,
      title: 'Monthly Supermarket Haul',
      amount: 490,
      type: 'expense',
      category: 'Food & Dining',
      date: createDate(32),
      paymentMethod: 'Credit Card',
      notes: 'Groceries and home stock',
      tags: ['groceries'],
      status: 'completed',
    },
    {
      user: userId,
      title: 'Electric & Gas Services',
      amount: 130,
      type: 'expense',
      category: 'Utilities',
      date: createDate(36),
      paymentMethod: 'Bank Transfer',
      notes: 'Winter heating bills',
      tags: ['utilities'],
      status: 'completed',
    },
    {
      user: userId,
      title: 'Index Fund Investment (Last Month)',
      amount: 1000,
      type: 'investment',
      category: 'Stocks',
      date: createDate(33),
      paymentMethod: 'Bank Transfer',
      notes: 'Vanguard automatic transfer',
      tags: ['investment'],
      status: 'completed',
    },
  ];
};

const generateDemoBudgets = (userId, currentMonthStr) => {
  return [
    {
      user: userId,
      category: 'Housing & Rent',
      amount: 1700,
      month: currentMonthStr,
      alertThreshold: 90,
      color: '#3b82f6', // blue
      notes: 'Strict lease limit',
    },
    {
      user: userId,
      category: 'Food & Dining',
      amount: 500,
      month: currentMonthStr,
      alertThreshold: 80,
      color: '#f59e0b', // amber
      notes: 'Groceries + weekend dining',
    },
    {
      user: userId,
      category: 'Utilities',
      amount: 250,
      month: currentMonthStr,
      alertThreshold: 85,
      color: '#06b6d4', // cyan
      notes: 'Electricity, water, fiber internet',
    },
    {
      user: userId,
      category: 'Transportation',
      amount: 200,
      month: currentMonthStr,
      alertThreshold: 80,
      color: '#8b5cf6', // purple
      notes: 'Metro pass and EV charging',
    },
    {
      user: userId,
      category: 'Entertainment',
      amount: 150,
      month: currentMonthStr,
      alertThreshold: 75,
      color: '#ec4899', // pink
      notes: 'Streaming services & leisure',
    },
    {
      user: userId,
      category: 'Shopping',
      amount: 400,
      month: currentMonthStr,
      alertThreshold: 80,
      color: '#10b981', // emerald
      notes: 'Discretionary items & gear',
    },
  ];
};

const generateDemoGoals = (userId) => {
  const now = new Date();
  const datePlusMonths = (months) => {
    const d = new Date(now);
    d.setMonth(d.getMonth() + months);
    return d.toISOString();
  };

  return [
    {
      user: userId,
      title: '6-Month Emergency Reserve Fund',
      targetAmount: 15000,
      currentAmount: 11250,
      targetDate: datePlusMonths(4),
      category: 'Emergency Fund',
      color: '#10b981',
      status: 'in-progress',
      notes: 'Stored in 5.1% APY High-Yield Savings Account',
    },
    {
      user: userId,
      title: 'Tokyo & Kyoto Vacation Adventure',
      targetAmount: 5000,
      currentAmount: 3400,
      targetDate: datePlusMonths(7),
      category: 'Travel',
      color: '#6366f1',
      status: 'in-progress',
      notes: 'Flights, Ryokan stay, and JR Rail Pass budget',
    },
    {
      user: userId,
      title: 'New High-End Workstation (M3 Max)',
      targetAmount: 3200,
      currentAmount: 2600,
      targetDate: datePlusMonths(2),
      category: 'Gadgets',
      color: '#f59e0b',
      status: 'in-progress',
      notes: 'Replacing 2019 Intel development laptop',
    },
    {
      user: userId,
      title: 'New Electric Car Down Payment',
      targetAmount: 10000,
      currentAmount: 4200,
      targetDate: datePlusMonths(12),
      category: 'Vehicle',
      color: '#ec4899',
      status: 'in-progress',
      notes: 'Down payment for Tesla Model 3 Long Range',
    },
  ];
};

module.exports = {
  generateDemoTransactions,
  generateDemoBudgets,
  generateDemoGoals,
};
