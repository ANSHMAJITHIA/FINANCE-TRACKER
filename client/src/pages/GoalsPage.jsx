import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { goalService } from '../services/api';
import GoalList from '../components/goals/GoalList';
import GoalModal from '../components/goals/GoalModal';
import DepositModal from '../components/goals/DepositModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { Plus, Target, CheckCircle2, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const GoalsPage = () => {
  const { user } = useAuth();
  const currency = user?.currency || 'USD';
  const { goals, goalsSummary, fetchGoals, addToast } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [depositGoal, setDepositGoal] = useState(null);
  const [deleteGoal, setDeleteGoal] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleOpenAdd = () => {
    setEditingGoal(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (goal) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteGoal) return;
    setIsDeleting(true);
    try {
      await goalService.delete(deleteGoal._id);
      addToast(`Deleted "${deleteGoal.title}"`);
      setDeleteGoal(null);
      fetchGoals();
    } catch (err) {
      addToast('Failed to delete goal', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Savings Targets & Goals
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Define savings milestones and accelerate compounding wealth
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-sm hover:shadow-glow transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Savings Target</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      {goalsSummary && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="glass-card p-4">
            <span className="text-xs text-slate-400 font-medium">Total Target Sum</span>
            <p className="text-xl font-extrabold font-mono text-slate-900 dark:text-white mt-1">
              {formatCurrency(goalsSummary.totalTarget, currency)}
            </p>
          </div>
          <div className="glass-card p-4">
            <span className="text-xs text-slate-400 font-medium">Total Saved to Date</span>
            <p className="text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
              {formatCurrency(goalsSummary.totalSaved, currency)}
            </p>
          </div>
          <div className="glass-card p-4">
            <span className="text-xs text-slate-400 font-medium">Overall Progress</span>
            <p className="text-xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400 mt-1">
              {goalsSummary.overallPercentage}%
            </p>
          </div>
          <div className="glass-card p-4">
            <span className="text-xs text-slate-400 font-medium">Completed Milestones</span>
            <p className="text-xl font-extrabold font-mono text-slate-900 dark:text-white mt-1">
              {goalsSummary.completedCount} / {goalsSummary.totalGoals}
            </p>
          </div>
        </div>
      )}

      {/* Goals Cards List */}
      <GoalList
        goals={goals}
        onDeposit={(g) => setDepositGoal(g)}
        onEdit={handleOpenEdit}
        onDelete={(g) => setDeleteGoal(g)}
      />

      {/* Modals */}
      <GoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingGoal}
      />

      <DepositModal
        isOpen={!!depositGoal}
        onClose={() => setDepositGoal(null)}
        goal={depositGoal}
      />

      <ConfirmDialog
        isOpen={!!deleteGoal}
        onClose={() => setDeleteGoal(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Savings Goal"
        message={`Are you sure you want to delete the goal "${deleteGoal?.title}"?`}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default GoalsPage;
