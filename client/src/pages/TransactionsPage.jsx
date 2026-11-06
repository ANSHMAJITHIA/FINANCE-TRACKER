import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { transactionService } from '../services/api';
import TransactionFilters from '../components/transactions/TransactionFilters';
import TransactionModal from '../components/transactions/TransactionModal';
import ImportExportModal from '../components/transactions/ImportExportModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import CategoryIcon from '../components/common/CategoryIcon';
import Badge from '../components/common/Badge';
import {
  Plus,
  Download,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Tag,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

const TransactionsPage = () => {
  const { user } = useAuth();
  const currency = user?.currency || 'USD';
  const { transactions, txMeta, loadingTransactions, fetchTransactions, addToast, refreshAll } =
    useFinance();

  // Filters State
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    category: 'all',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 20,
    sortBy: 'date',
    sortOrder: 'desc',
  });

  // Modals State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [deleteTx, setDeleteTx] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchTransactions(filters);
  }, [filters, fetchTransactions]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      category: 'all',
      startDate: '',
      endDate: '',
      page: 1,
      limit: 20,
      sortBy: 'date',
      sortOrder: 'desc',
    });
  };

  const handleOpenAdd = () => {
    setEditingTx(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tx) => {
    setEditingTx(tx);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTx) return;
    setIsDeleting(true);
    try {
      await transactionService.delete(deleteTx._id);
      addToast('Transaction deleted successfully');
      setDeleteTx(null);
      refreshAll();
    } catch (err) {
      addToast('Failed to delete transaction', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Transactions & History
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Search, filter, categorize, and export your personal records
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsImportExportOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Import / Export</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-sm hover:shadow-glow transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      {txMeta?.summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="glass-card p-4">
            <span className="text-xs text-slate-400 font-medium">Income Filtered</span>
            <p className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
              +{formatCurrency(txMeta.summary.totalIncome, currency)}
            </p>
          </div>
          <div className="glass-card p-4">
            <span className="text-xs text-slate-400 font-medium">Expenses Filtered</span>
            <p className="text-lg font-bold font-mono text-rose-600 dark:text-rose-400 mt-0.5">
              -{formatCurrency(txMeta.summary.totalExpense, currency)}
            </p>
          </div>
          <div className="glass-card p-4">
            <span className="text-xs text-slate-400 font-medium">Investments Filtered</span>
            <p className="text-lg font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
              {formatCurrency(txMeta.summary.totalInvestment, currency)}
            </p>
          </div>
          <div className="glass-card p-4">
            <span className="text-xs text-slate-400 font-medium">Net Savings</span>
            <p
              className={`text-lg font-bold font-mono mt-0.5 ${
                txMeta.summary.netSavings >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {formatCurrency(txMeta.summary.netSavings, currency)}
            </p>
          </div>
        </div>
      )}

      {/* Filter Component */}
      <TransactionFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Transactions Table Card */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Transaction</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 hidden md:table-cell">Payment</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {loadingTransactions ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="text-xs">Loading transactions...</p>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <p className="font-semibold text-slate-500">No transactions match your criteria</p>
                    <p className="text-xs mt-1">Try clearing filters or add a new transaction record.</p>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const isIncome = tx.type === 'income';
                  const isInvestment = tx.type === 'investment';

                  return (
                    <tr
                      key={tx._id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Title & Tags */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-xl flex-shrink-0 ${
                              isIncome
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600'
                                : isInvestment
                                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600'
                                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600'
                            }`}
                          >
                            <CategoryIcon category={tx.category} className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                              {tx.title}
                            </p>
                            {tx.tags && tx.tags.length > 0 && (
                              <div className="flex items-center gap-1 mt-0.5">
                                {tx.tags.slice(0, 2).map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="py-3.5 px-4">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          {tx.category}
                        </span>
                      </td>

                      {/* Payment Method */}
                      <td className="py-3.5 px-4 hidden md:table-cell text-xs text-slate-500 dark:text-slate-400">
                        {tx.paymentMethod || 'Debit Card'}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(tx.date)}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`font-mono font-extrabold text-sm ${
                            isIncome
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : isInvestment
                              ? 'text-indigo-600 dark:text-indigo-400'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {isIncome ? '+' : '-'}
                          {formatCurrency(tx.amount, currency)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenEdit(tx)}
                            title="Edit"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTx(tx)}
                            title="Delete"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {txMeta && txMeta.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {(txMeta.currentPage - 1) * txMeta.limit + 1} to{' '}
              {Math.min(txMeta.currentPage * txMeta.limit, txMeta.totalCount)} of {txMeta.totalCount}{' '}
              records
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={txMeta.currentPage <= 1}
                onClick={() => handleFilterChange('page', txMeta.currentPage - 1)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {txMeta.currentPage} / {txMeta.totalPages}
              </span>
              <button
                disabled={txMeta.currentPage >= txMeta.totalPages}
                onClick={() => handleFilterChange('page', txMeta.currentPage + 1)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingTx}
      />

      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        currentTransactions={transactions}
      />

      <ConfirmDialog
        isOpen={!!deleteTx}
        onClose={() => setDeleteTx(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Transaction"
        message={`Are you sure you want to permanently delete "${deleteTx?.title}" (${formatCurrency(
          deleteTx?.amount,
          currency
        )})?`}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default TransactionsPage;
