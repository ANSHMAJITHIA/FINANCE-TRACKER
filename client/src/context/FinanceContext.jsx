import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  analyticsService,
  transactionService,
  budgetService,
  goalService,
} from '../services/api';
import { useAuth } from './AuthContext';

const FinanceContext = createContext();

export const FinanceProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  // State
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  const [transactions, setTransactions] = useState([]);
  const [txMeta, setTxMeta] = useState(null);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  const [budgets, setBudgets] = useState([]);
  const [budgetSummary, setBudgetSummary] = useState(null);
  const [loadingBudgets, setLoadingBudgets] = useState(false);

  const [goals, setGoals] = useState([]);
  const [goalsSummary, setGoalsSummary] = useState(null);
  const [loadingGoals, setLoadingGoals] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  // Toast notification state
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 4);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch Dashboard Analytics
  const fetchDashboard = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingDashboard(true);
    try {
      const res = await analyticsService.getDashboard();
      if (res.data.success) {
        setDashboardData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard analytics:', err);
    } finally {
      setLoadingDashboard(false);
    }
  }, [isAuthenticated]);

  // Fetch Transactions with custom filters
  const fetchTransactions = useCallback(
    async (params = {}) => {
      if (!isAuthenticated) return;
      setLoadingTransactions(true);
      try {
        const res = await transactionService.getAll(params);
        if (res.data.success) {
          setTransactions(res.data.data);
          setTxMeta(res.data.meta);
        }
      } catch (err) {
        console.error('Error fetching transactions:', err);
        addToast('Failed to load transactions', 'error');
      } finally {
        setLoadingTransactions(false);
      }
    },
    [isAuthenticated, addToast]
  );

  // Fetch Budgets for current selected month
  const fetchBudgets = useCallback(
    async (monthStr) => {
      if (!isAuthenticated) return;
      setLoadingBudgets(true);
      const m = monthStr || selectedMonth;
      try {
        const res = await budgetService.getAll(m);
        if (res.data.success) {
          setBudgets(res.data.data);
          setBudgetSummary(res.data.summary);
        }
      } catch (err) {
        console.error('Error fetching budgets:', err);
      } finally {
        setLoadingBudgets(false);
      }
    },
    [isAuthenticated, selectedMonth]
  );

  // Fetch Goals
  const fetchGoals = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingGoals(true);
    try {
      const res = await goalService.getAll();
      if (res.data.success) {
        setGoals(res.data.data);
        setGoalsSummary(res.data.summary);
      }
    } catch (err) {
      console.error('Error fetching goals:', err);
    } finally {
      setLoadingGoals(false);
    }
  }, [isAuthenticated]);

  // Refresh all core metrics
  const refreshAll = useCallback(() => {
    fetchDashboard();
    fetchTransactions();
    fetchBudgets();
    fetchGoals();
  }, [fetchDashboard, fetchTransactions, fetchBudgets, fetchGoals]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshAll();
    } else {
      setDashboardData(null);
      setTransactions([]);
      setBudgets([]);
      setGoals([]);
    }
  }, [isAuthenticated, refreshAll]);

  return (
    <FinanceContext.Provider
      value={{
        dashboardData,
        loadingDashboard,
        fetchDashboard,

        transactions,
        txMeta,
        loadingTransactions,
        fetchTransactions,

        budgets,
        budgetSummary,
        loadingBudgets,
        fetchBudgets,
        selectedMonth,
        setSelectedMonth,

        goals,
        goalsSummary,
        loadingGoals,
        fetchGoals,

        refreshAll,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => useContext(FinanceContext);
