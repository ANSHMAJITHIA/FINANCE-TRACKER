const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const { connectDB } = require('./config/db');
const { User, Transaction, Budget, Goal } = require('./models');
const {
  generateDemoTransactions,
  generateDemoBudgets,
  generateDemoGoals,
} = require('./utils/seedData');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route files
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const goalRoutes = require('./routes/goalRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Personal Finance Tracker API',
    version: '1.0.0',
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/analytics', analyticsRoutes);

// Serve static frontend build if dist exists
const clientDistPath = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api')) return next();
    res.sendFile(path.resolve(clientDistPath, 'index.html'));
  });
}

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Initialize Server & Seed Demo Account if not exists
const startServer = async () => {
  await connectDB();

  // Auto-seed demo user if store is fresh
  try {
    const demoEmail = 'demo@financetracker.com';
    let demoUser = await User.findOne({ email: demoEmail });

    if (!demoUser) {
      console.log('🌱 Seeding initial demo account (demo@financetracker.com)...');
      demoUser = await User.create({
        name: 'Alex Rivera',
        email: demoEmail,
        password: 'demo123',
        currency: 'USD',
        monthlyBudgetLimit: 3200,
        savingsGoal: 15000,
      });

      const now = new Date();
      const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      await Transaction.insertMany(generateDemoTransactions(demoUser._id));
      await Budget.insertMany(generateDemoBudgets(demoUser._id, currentMonthStr));
      await Goal.insertMany(generateDemoGoals(demoUser._id));

      console.log('✅ Demo account seeded successfully (demo@financetracker.com / demo123)');
    }
  } catch (seedErr) {
    console.error('Seed notice:', seedErr.message);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Finance Tracker API Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

startServer();
