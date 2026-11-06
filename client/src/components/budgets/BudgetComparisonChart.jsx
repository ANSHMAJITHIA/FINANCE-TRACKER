import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

const BudgetComparisonChart = ({ budgets = [] }) => {
  const { user } = useAuth();
  const currency = user?.currency || 'USD';

  const chartData = budgets.map((b) => ({
    category: b.category,
    budgeted: b.amount,
    spent: b.spent,
    remaining: b.remaining,
  }));

  return (
    <div className="glass-card p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Budget vs Actual Spending
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time allocation comparison for the selected month
          </p>
        </div>
      </div>

      <div className="h-72 w-full">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            No budgets defined for this month
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
              <XAxis
                dataKey="category"
                axisLine={false}
                tickLine={false}
                interval={0}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                angle={-20}
                textAnchor="end"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                formatter={(val, name) => [
                  formatCurrency(val, currency),
                  name === 'budgeted' ? 'Budget Limit' : 'Actual Spent',
                ]}
                contentStyle={{
                  backgroundColor: 'rgba(17, 24, 39, 0.95)',
                  borderRadius: '12px',
                  borderColor: 'rgba(55, 65, 81, 0.6)',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 10, fontSize: 12 }}
              />
              <Bar name="Budget Limit" dataKey="budgeted" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar name="Actual Spent" dataKey="spent" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default BudgetComparisonChart;
