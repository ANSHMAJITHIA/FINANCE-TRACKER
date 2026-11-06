import React from 'react';
import StatCard from '../common/StatCard';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

const MetricGrid = ({ kpis }) => {
  const { user } = useAuth();
  const currency = user?.currency || 'USD';

  if (!kpis) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {/* Total Balance / Net Worth */}
      <StatCard
        title="Total Net Worth"
        value={formatCurrency(kpis.netWorth, currency)}
        subtitle="Lifetime assets minus expenses"
        icon={Wallet}
        colorScheme="indigo"
      />

      {/* Monthly Income */}
      <StatCard
        title="Monthly Income"
        value={formatCurrency(kpis.currentMonthIncome, currency)}
        subtitle="Received this month"
        icon={TrendingUp}
        colorScheme="emerald"
        trend="Active"
        trendPositive={true}
      />

      {/* Monthly Expenses */}
      <StatCard
        title="Monthly Expenses"
        value={formatCurrency(kpis.currentMonthExpense, currency)}
        subtitle="Total spent this month"
        icon={TrendingDown}
        colorScheme="rose"
      />

      {/* Monthly Savings & Rate */}
      <StatCard
        title="Monthly Net Savings"
        value={formatCurrency(kpis.currentMonthSavings, currency)}
        subtitle={`${kpis.savingsRate}% of income saved`}
        icon={PiggyBank}
        colorScheme={kpis.currentMonthSavings >= 0 ? 'emerald' : 'rose'}
        trend={`${kpis.savingsRate}%`}
        trendPositive={kpis.currentMonthSavings >= 0}
      />
    </div>
  );
};

export default MetricGrid;
