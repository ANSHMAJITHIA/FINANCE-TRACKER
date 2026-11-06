import React from 'react';
import Badge from '../common/Badge';
import { Target, Plus, Edit2, Trash2, Calendar, CheckCircle2, Sparkles } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

const GoalList = ({ goals = [], onDeposit, onEdit, onDelete }) => {
  const { user } = useAuth();
  const currency = user?.currency || 'USD';

  if (goals.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <Target className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400 text-sm">
          No savings goals created yet. Set a financial target to start compounding your wealth!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {goals.map((g) => {
        const isCompleted = g.isAchieved;

        return (
          <div
            key={g._id}
            className={`glass-card p-5 sm:p-6 transition-all duration-200 hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between ${
              isCompleted
                ? 'border-emerald-400/50 dark:border-emerald-800/60 shadow-sm shadow-emerald-500/10'
                : ''
            }`}
          >
            {/* Top Row: Category, Status, Actions */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Badge variant={isCompleted ? 'income' : 'purple'} size="sm">
                  {g.category}
                </Badge>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEdit(g)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(g)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Title */}
              <h4 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 mb-1">
                {g.title}
              </h4>

              {/* Target Date */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
                <Calendar className="w-3.5 h-3.5" />
                <span>Target: {formatDate(g.targetDate)}</span>
                <span>•</span>
                <span>{g.monthsLeft} mo left</span>
              </div>

              {/* Progress Bar & Percent */}
              <div className="space-y-1.5 mb-4">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="font-extrabold font-mono text-base text-slate-900 dark:text-white">
                    {formatCurrency(g.currentAmount, currency)}
                  </span>
                  <span className="text-slate-400">
                    of {formatCurrency(g.targetAmount, currency)} ({g.percentage}%)
                  </span>
                </div>

                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isCompleted ? 'bg-emerald-500' : 'bg-indigo-600'
                    }`}
                    style={{ width: `${Math.min(100, g.percentage)}%` }}
                  />
                </div>
              </div>

              {/* Strategy / Monthly contribution needed pill */}
              {!isCompleted && g.monthlyNeeded > 0 && (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between mb-4">
                  <span className="text-slate-400">Monthly needed:</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(g.monthlyNeeded, currency)}/mo
                  </span>
                </div>
              )}

              {isCompleted && (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <span className="font-semibold">Goal 100% Fully Funded!</span>
                </div>
              )}
            </div>

            {/* Bottom Deposit Action */}
            <button
              onClick={() => onDeposit(g)}
              className="w-full py-2 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Contribute Funds</span>
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default GoalList;
