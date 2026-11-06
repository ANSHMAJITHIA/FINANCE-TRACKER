import React, { useState } from 'react';
import Modal from '../common/Modal';
import { goalService } from '../../services/api';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import confetti from 'canvas-confetti';

const DepositModal = ({ isOpen, onClose, goal = null }) => {
  const { refreshAll, addToast } = useFinance();
  const { user } = useAuth();
  const currency = user?.currency || 'USD';

  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  if (!goal) return null;

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      addToast('Please enter a valid deposit amount', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await goalService.deposit(goal._id, Number(amount));
      const isCompleted = res.data.data.status === 'completed';

      if (isCompleted) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        addToast(`🎉 Milestone Reached! "${goal.title}" is 100% funded!`);
      } else {
        addToast(`Contributed ${formatCurrency(amount, currency)} towards "${goal.title}"`);
      }

      refreshAll();
      setAmount('');
      onClose();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to deposit funds', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Contribute to "${goal.title}"`}>
      <form onSubmit={handleDeposit} className="space-y-4">
        {/* Current status summary */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Target Goal:</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              {formatCurrency(goal.targetAmount, currency)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Currently Saved:</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(goal.currentAmount, currency)} ({goal.percentage}%)
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Remaining to Goal:</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              {formatCurrency(goal.remainingAmount, currency)}
            </span>
          </div>
        </div>

        {/* Deposit Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Contribution Amount ({currency}) <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            step="1"
            min="1"
            required
            autoFocus
            placeholder="e.g. 250"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>

        {/* Quick Amount Buttons */}
        <div className="flex items-center gap-2">
          {[50, 100, 250, 500].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAmount(preset)}
              className="px-3 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            >
              +{preset}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Confirm Contribution'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default DepositModal;
