import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { budgetService } from '../../services/api';
import { useFinance } from '../../context/FinanceContext';
import { CATEGORIES } from '../../utils/formatters';

const BudgetModal = ({ isOpen, onClose, initialData = null }) => {
  const { refreshAll, addToast, selectedMonth } = useFinance();
  const isEdit = !!initialData;

  const [category, setCategory] = useState('Food & Dining');
  const [amount, setAmount] = useState('');
  const [alertThreshold, setAlertThreshold] = useState(80);
  const [color, setColor] = useState('#6366f1');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setCategory(initialData.category || 'Food & Dining');
      setAmount(initialData.amount || '');
      setAlertThreshold(initialData.alertThreshold || 80);
      setColor(initialData.color || '#6366f1');
      setNotes(initialData.notes || '');
    } else {
      setCategory('Food & Dining');
      setAmount('');
      setAlertThreshold(80);
      setColor('#6366f1');
      setNotes('');
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category || !amount) {
      addToast('Please enter both category and budget amount', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        category,
        amount: Number(amount),
        month: selectedMonth,
        alertThreshold: Number(alertThreshold),
        color,
        notes,
      };

      if (isEdit) {
        await budgetService.update(initialData._id, payload);
        addToast('Budget updated successfully');
      } else {
        await budgetService.create(payload);
        addToast(`Budget set for ${category}`);
      }

      refreshAll();
      onClose();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save budget', 'error');
    } finally {
      setLoading(false);
    }
  };

  const presetColors = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#ef4444'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit ${initialData.category} Budget` : 'Set Monthly Category Budget'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Expense Category <span className="text-rose-500">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isEdit}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm disabled:opacity-60"
          >
            {CATEGORIES.expense.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Amount Limit */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Monthly Limit Amount <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            step="1"
            min="1"
            required
            placeholder="e.g. 500"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>

        {/* Alert Threshold Slider */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            <span>Warning Alert Threshold</span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400">{alertThreshold}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="100"
            step="5"
            value={alertThreshold}
            onChange={(e) => setAlertThreshold(e.target.value)}
            className="w-full accent-indigo-600 cursor-pointer"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            We will flag this budget as a warning when your spending reaches {alertThreshold}% of limit.
          </p>
        </div>

        {/* Color Palette */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Category Color Tag
          </label>
          <div className="flex items-center gap-2">
            {presetColors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-transform ${
                  color === c ? 'scale-125 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Budget Objective / Notes
          </label>
          <textarea
            rows="2"
            placeholder="e.g. Limit takeout meals to twice per week"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
          />
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
            {loading ? 'Saving...' : isEdit ? 'Update Budget' : 'Set Budget'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default BudgetModal;
