import React from 'react';
import CategoryIcon from '../common/CategoryIcon';
import Badge from '../common/Badge';
import { Edit2, Trash2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

const BudgetList = ({ budgets = [], onEdit, onDelete }) => {
  const { user } = useAuth();
  const currency = user?.currency || 'USD';

  if (budgets.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <p className="text-slate-400 text-sm">
          No monthly category budgets created yet. Click "Add Category Budget" to start planning!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {budgets.map((b) => {
        const isExceeded = b.percent >= 100;
        const isWarning = b.percent >= b.alertThreshold && !isExceeded;

        return (
          <div
            key={b._id}
            className={`glass-card p-5 transition-all duration-200 hover:-translate-y-0.5 relative overflow-hidden ${
              isExceeded
                ? 'border-rose-400/50 dark:border-rose-800/60 shadow-sm shadow-rose-500/10'
                : isWarning
                ? 'border-amber-400/50 dark:border-amber-800/60'
                : ''
            }`}
          >
            {/* Top Row: Category Icon & Actions */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="p-2.5 rounded-xl text-white shadow-sm"
                  style={{ backgroundColor: b.color || '#6366f1' }}
                >
                  <CategoryIcon category={b.category} className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {b.category}
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Limit: {formatCurrency(b.amount, currency)}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEdit(b)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDelete(b)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Spending Numbers */}
            <div className="flex items-baseline justify-between mb-2 mt-4">
              <div>
                <span className="text-xs text-slate-400">Spent: </span>
                <span className="text-base font-extrabold font-mono text-slate-900 dark:text-white">
                  {formatCurrency(b.spent, currency)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">
                  {isExceeded ? 'Over by: ' : 'Remaining: '}
                </span>
                <span
                  className={`text-sm font-bold font-mono ${
                    isExceeded
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {formatCurrency(Math.abs(b.remaining), currency)}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isExceeded
                    ? 'bg-rose-500 animate-pulse'
                    : isWarning
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, b.percent)}%` }}
              />
            </div>

            {/* Footer Status Pill */}
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500 font-mono">
                {b.percent}% utilized
              </span>
              {isExceeded && (
                <Badge variant="expense" size="sm">
                  <AlertCircle className="w-3 h-3" />
                  Over Budget
                </Badge>
              )}
              {isWarning && (
                <Badge variant="warning" size="sm">
                  Alert: &gt;{b.alertThreshold}%
                </Badge>
              )}
              {!isExceeded && !isWarning && (
                <Badge variant="income" size="sm">
                  On Track
                </Badge>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BudgetList;
