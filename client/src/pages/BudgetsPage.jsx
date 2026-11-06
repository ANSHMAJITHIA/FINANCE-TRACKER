import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { budgetService } from '../services/api';
import BudgetList from '../components/budgets/BudgetList';
import BudgetComparisonChart from '../components/budgets/BudgetComparisonChart';
import BudgetModal from '../components/budgets/BudgetModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { Plus, ChevronLeft, ChevronRight, Calendar, PieChart } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const BudgetsPage = () => {
  const { user } = useAuth();
  const currency = user?.currency || 'USD';
  const { budgets, budgetSummary, selectedMonth, setSelectedMonth, fetchBudgets, addToast } =
    useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [deleteBudget, setDeleteBudget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchBudgets(selectedMonth);
  }, [selectedMonth, fetchBudgets]);

  // Month navigation helpers
  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const prevDate = new Date(year, month - 2, 1);
    setSelectedMonth(`${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const nextDate = new Date(year, month, 1);
    setSelectedMonth(`${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleOpenAdd = () => {
    setEditingBudget(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (budget) => {
    setEditingBudget(budget);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteBudget) return;
    setIsDeleting(true);
    try {
      await budgetService.delete(deleteBudget._id);
      addToast(`Deleted ${deleteBudget.category} budget`);
      setDeleteBudget(null);
      fetchBudgets(selectedMonth);
    } catch (err) {
      addToast('Failed to delete budget', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const [y, m] = selectedMonth.split('-');
  const displayMonthStr = new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Month Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Monthly Category Budgets
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Set and track spending boundaries across categories
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Month Navigator */}
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-sm">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-3 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              <span>{displayMonthStr}</span>
            </div>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-sm hover:shadow-glow transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Set Budget</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      {budgetSummary && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="glass-card p-4">
            <span className="text-xs text-slate-400 font-medium">Total Allocated</span>
            <p className="text-xl font-extrabold font-mono text-slate-900 dark:text-white mt-1">
              {formatCurrency(budgetSummary.totalBudgeted, currency)}
            </p>
          </div>
          <div className="glass-card p-4">
            <span className="text-xs text-slate-400 font-medium">Total Spent</span>
            <p className="text-xl font-extrabold font-mono text-rose-600 dark:text-rose-400 mt-1">
              {formatCurrency(budgetSummary.totalSpent, currency)}
            </p>
          </div>
          <div className="glass-card p-4">
            <span className="text-xs text-slate-400 font-medium">Remaining Budget</span>
            <p
              className={`text-xl font-extrabold font-mono mt-1 ${
                budgetSummary.remainingBudget >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {formatCurrency(budgetSummary.remainingBudget, currency)}
            </p>
          </div>
          <div className="glass-card p-4">
            <span className="text-xs text-slate-400 font-medium">Overall Utilization</span>
            <p className="text-xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400 mt-1">
              {budgetSummary.overallPercentage}%
            </p>
          </div>
        </div>
      )}

      {/* Budget vs Actual Visual Chart */}
      <BudgetComparisonChart budgets={budgets} />

      {/* Category Budget Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Category Breakdown ({budgets.length} Categories Active)
          </h3>
        </div>

        <BudgetList
          budgets={budgets}
          onEdit={handleOpenEdit}
          onDelete={(b) => setDeleteBudget(b)}
        />
      </div>

      {/* Modals */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingBudget}
      />

      <ConfirmDialog
        isOpen={!!deleteBudget}
        onClose={() => setDeleteBudget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Budget"
        message={`Are you sure you want to remove the budget for "${deleteBudget?.category}"?`}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default BudgetsPage;
