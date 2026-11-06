import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { CURRENCY_SYMBOLS, formatCurrency } from '../utils/formatters';
import { User, DollarSign, Target, Sparkles, Trash2, CheckCircle2, Shield } from 'lucide-react';

const SettingsPage = () => {
  const { user, updateProfile, seedDemoData, clearUserData } = useAuth();
  const { refreshAll, addToast } = useFinance();

  const [name, setName] = useState(user?.name || '');
  const [currency, setCurrency] = useState(user?.currency || 'USD');
  const [monthlyBudgetLimit, setMonthlyBudgetLimit] = useState(user?.monthlyBudgetLimit || '');
  const [savingsGoal, setSavingsGoal] = useState(user?.savingsGoal || '');
  const [saving, setSaving] = useState(false);

  const [isClearOpen, setIsClearOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        name,
        currency,
        monthlyBudgetLimit: Number(monthlyBudgetLimit) || 0,
        savingsGoal: Number(savingsGoal) || 0,
      });
      addToast('Preferences saved successfully!');
      refreshAll();
    } catch (err) {
      addToast('Failed to save profile settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSeed = async () => {
    try {
      await seedDemoData();
      refreshAll();
      addToast('Sample financial data populated successfully!');
    } catch (err) {
      addToast('Failed to populate demo data', 'error');
    }
  };

  const handleClear = async () => {
    setClearing(true);
    try {
      await clearUserData();
      refreshAll();
      setIsClearOpen(false);
      addToast('All financial data cleared successfully');
    } catch (err) {
      addToast('Failed to clear records', 'error');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Account & Financial Preferences
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure personal details, preferred currency, spending targets, and dataset controls
        </p>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveProfile} className="glass-card p-6 space-y-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-500" />
          <span>Profile Details</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 text-sm cursor-not-allowed opacity-75"
            />
          </div>
        </div>

        {/* Currency & Financial Targets */}
        <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 pt-2 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-indigo-500" />
          <span>Currency & Target Limits</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Currency Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Base Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              {Object.entries(CURRENCY_SYMBOLS).map(([code, symbol]) => (
                <option key={code} value={code}>
                  {code} ({symbol.trim()})
                </option>
              ))}
            </select>
          </div>

          {/* Monthly Budget Limit */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Monthly Budget Ceiling
            </label>
            <input
              type="number"
              step="1"
              placeholder="e.g. 3500"
              value={monthlyBudgetLimit}
              onChange={(e) => setMonthlyBudgetLimit(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          {/* Overall Savings Target */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Yearly Savings Target
            </label>
            <input
              type="number"
              step="1"
              placeholder="e.g. 20000"
              value={savingsGoal}
              onChange={(e) => setSavingsGoal(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </form>

      {/* Dataset & Showcase Controls */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span>Demo Data & Account Reset</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Load or reset sample data at any time to demonstrate charts, budgeting alerts, and savings goals.
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <button
            type="button"
            onClick={handleSeed}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 font-semibold text-xs sm:text-sm border border-indigo-200 dark:border-indigo-800/40 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Load Realistic Financial Demo Data</span>
          </button>

          <button
            type="button"
            onClick={() => setIsClearOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-semibold text-xs sm:text-sm border border-rose-200 dark:border-rose-800/40 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All My Records</span>
          </button>
        </div>
      </div>

      {/* Clear Data Dialog */}
      <ConfirmDialog
        isOpen={isClearOpen}
        onClose={() => setIsClearOpen(false)}
        onConfirm={handleClear}
        title="Reset All Financial Records"
        message="Are you sure you want to delete all transactions, category budgets, and savings goals for your account? This action cannot be reversed."
        confirmText="Clear All Data"
        isLoading={clearing}
      />
    </div>
  );
};

export default SettingsPage;
