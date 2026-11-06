import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PlusCircle } from 'lucide-react';
import CategoryIcon from '../common/CategoryIcon';
import Badge from '../common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

const RecentTransactionsCard = ({ transactions = [], onOpenAddModal }) => {
  const { user } = useAuth();
  const currency = user?.currency || 'USD';

  return (
    <div className="glass-card p-5 sm:p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Recent Transactions
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Latest financial activities recorded
          </p>
        </div>

        <Link
          to="/transactions"
          className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <p className="text-sm text-slate-400 mb-3">No transactions recorded yet</p>
          {onOpenAddModal && (
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Record First Transaction</span>
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {transactions.map((tx) => {
            const isIncome = tx.type === 'income';
            const isInvestment = tx.type === 'investment';

            return (
              <div
                key={tx._id}
                className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 px-2 rounded-xl transition-colors"
              >
                {/* Left: Icon & Title */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-2.5 rounded-xl flex-shrink-0 ${
                      isIncome
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                        : isInvestment
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    <CategoryIcon category={tx.category} className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {tx.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{formatDate(tx.date)}</span>
                      <span>•</span>
                      <span>{tx.category}</span>
                      {tx.paymentMethod && (
                        <>
                          <span className="hidden sm:inline">•</span>
                          <span className="hidden sm:inline">{tx.paymentMethod}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Badge */}
                <div className="text-right flex-shrink-0">
                  <p
                    className={`text-sm font-extrabold font-mono ${
                      isIncome
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : isInvestment
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {isIncome ? '+' : '-'}
                    {formatCurrency(tx.amount, currency)}
                  </p>
                  <Badge variant={tx.type} size="sm" className="mt-0.5">
                    {tx.type}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentTransactionsCard;
