import React, { useState } from 'react';
import MetricGrid from '../components/dashboard/MetricGrid';
import IncomeExpenseChart from '../components/dashboard/IncomeExpenseChart';
import CategoryPieChart from '../components/dashboard/CategoryPieChart';
import CashFlowAreaChart from '../components/dashboard/CashFlowAreaChart';
import FinancialHealthCard from '../components/dashboard/FinancialHealthCard';
import RecentTransactionsCard from '../components/dashboard/RecentTransactionsCard';
import TransactionModal from '../components/transactions/TransactionModal';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Sparkles, RefreshCw } from 'lucide-react';

const DashboardPage = () => {
  const { dashboardData, loadingDashboard, refreshAll } = useFinance();
  const { user } = useAuth();
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);

  const now = new Date();
  const greetingDate = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Banner Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] || 'Member'}! 👋
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {greetingDate} • Here is your latest personal financial summary
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshAll}
            disabled={loadingDashboard}
            title="Refresh Metrics"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loadingDashboard ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsAddTxOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-sm hover:shadow-glow transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Record Transaction</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <MetricGrid kpis={dashboardData?.kpis} />

      {/* Primary Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <IncomeExpenseChart data={dashboardData?.monthlySeries || []} />
        </div>
        <div className="lg:col-span-5">
          <CategoryPieChart data={dashboardData?.categoryBreakdown || []} />
        </div>
      </div>

      {/* Spending Velocity & Financial Health Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <CashFlowAreaChart data={dashboardData?.dailyTrend || []} />
        </div>
        <div className="lg:col-span-6">
          <FinancialHealthCard ruleData={dashboardData?.rule503020} />
        </div>
      </div>

      {/* Recent Activity Table */}
      <RecentTransactionsCard
        transactions={dashboardData?.recentTransactions || []}
        onOpenAddModal={() => setIsAddTxOpen(true)}
      />

      {/* Quick Add Modal */}
      <TransactionModal
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
      />
    </div>
  );
};

export default DashboardPage;
