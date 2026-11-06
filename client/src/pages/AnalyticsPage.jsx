import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import IncomeExpenseChart from '../components/dashboard/IncomeExpenseChart';
import CategoryPieChart from '../components/dashboard/CategoryPieChart';
import CashFlowAreaChart from '../components/dashboard/CashFlowAreaChart';
import FinancialHealthCard from '../components/dashboard/FinancialHealthCard';
import { formatCurrency } from '../utils/formatters';
import { BarChart3, TrendingUp, DollarSign, Award, ArrowUpRight } from 'lucide-react';

const AnalyticsPage = () => {
  const { dashboardData } = useFinance();
  const { user } = useAuth();
  const currency = user?.currency || 'USD';

  const kpis = dashboardData?.kpis;
  const categories = dashboardData?.categoryBreakdown || [];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Visual Analytics & Spending Trends
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Deep-dive analysis of your income, expenses, category distribution and financial velocity
        </p>
      </div>

      {/* Analytical KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Savings Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
            {kpis?.savingsRate || 0}%
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Percentage of this month's earnings retained as net savings
          </p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Lifetime Total Inflow</span>
            <DollarSign className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
            {formatCurrency(kpis?.lifetimeIncome, currency)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Cumulative earned income logged in SpendFlow
          </p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Financial Equilibrium</span>
            <Award className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400">
            {dashboardData?.rule503020?.status || 'Analyzing'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            50/30/20 balanced budget rule rating
          </p>
        </div>
      </div>

      {/* Primary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <IncomeExpenseChart data={dashboardData?.monthlySeries || []} />
        </div>
        <div className="lg:col-span-5">
          <CategoryPieChart data={categories} />
        </div>
      </div>

      {/* Cumulative Velocity & Financial Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <CashFlowAreaChart data={dashboardData?.dailyTrend || []} />
        </div>
        <div className="lg:col-span-6">
          <FinancialHealthCard ruleData={dashboardData?.rule503020} />
        </div>
      </div>

      {/* Top Categories Ranking Table */}
      <div className="glass-card p-5 sm:p-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Top Expense Categories This Month
        </h3>

        {categories.length === 0 ? (
          <p className="text-xs text-slate-400">No expense categories available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Amount Spent</th>
                  <th className="py-2.5 px-3">Share of Total</th>
                  <th className="py-2.5 px-3">Distribution Bar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {categories.map((cat, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-bold text-slate-400">#{idx + 1}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span>{cat.name}</span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                      {formatCurrency(cat.value, currency)}
                    </td>
                    <td className="py-3 px-3 font-semibold text-indigo-600 dark:text-indigo-400">
                      {cat.percentage}%
                    </td>
                    <td className="py-3 px-3 w-1/3">
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, cat.percentage)}%`,
                            backgroundColor: cat.color || '#6366f1',
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
