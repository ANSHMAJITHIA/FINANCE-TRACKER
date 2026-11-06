export const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  JPY: '¥',
  CAD: 'CA$',
  AUD: 'A$',
  SGD: 'S$',
  AED: 'AED ',
};

export const formatCurrency = (amount, currency = 'USD') => {
  const symbol = CURRENCY_SYMBOLS[currency] || '$';
  const num = Number(amount) || 0;
  return `${symbol}${num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const CATEGORIES = {
  income: [
    { name: 'Salary', color: '#22c55e', icon: 'Briefcase' },
    { name: 'Freelance', color: '#38bdf8', icon: 'Laptop' },
    { name: 'Investments', color: '#84cc16', icon: 'TrendingUp' },
    { name: 'Business', color: '#6366f1', icon: 'Building' },
    { name: 'Gifts', color: '#ec4899', icon: 'Gift' },
    { name: 'Other Income', color: '#94a3b8', icon: 'PlusCircle' },
  ],
  expense: [
    { name: 'Food & Dining', color: '#f59e0b', icon: 'Utensils' },
    { name: 'Housing & Rent', color: '#3b82f6', icon: 'Home' },
    { name: 'Utilities', color: '#06b6d4', icon: 'Zap' },
    { name: 'Transportation', color: '#8b5cf6', icon: 'Car' },
    { name: 'Shopping', color: '#10b981', icon: 'ShoppingBag' },
    { name: 'Entertainment', color: '#ec4899', icon: 'Film' },
    { name: 'Health & Medical', color: '#ef4444', icon: 'HeartPulse' },
    { name: 'Education', color: '#6366f1', icon: 'GraduationCap' },
    { name: 'Travel', color: '#14b8a6', icon: 'Plane' },
    { name: 'General Expense', color: '#94a3b8', icon: 'CreditCard' },
  ],
  investment: [
    { name: 'Stocks', color: '#84cc16', icon: 'TrendingUp' },
    { name: 'Savings', color: '#10b981', icon: 'PiggyBank' },
    { name: 'Crypto', color: '#f97316', icon: 'Coins' },
    { name: 'Real Estate', color: '#3b82f6', icon: 'Landmark' },
    { name: 'Retirement', color: '#6366f1', icon: 'ShieldCheck' },
  ],
};

export const getCategoryColor = (categoryName) => {
  for (const type in CATEGORIES) {
    const found = CATEGORIES[type].find(
      (c) => c.name.toLowerCase() === (categoryName || '').toLowerCase()
    );
    if (found) return found.color;
  }
  return '#64748b';
};
