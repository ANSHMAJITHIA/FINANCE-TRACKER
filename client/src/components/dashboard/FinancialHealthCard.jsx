import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

const FinancialHealthCard = ({ ruleData }) => {
  const { user } = useAuth();
  const currency = user?.currency || 'USD';

  if (!ruleData) return null;

  const { needs, wants, savings, healthScore, status } = ruleData;

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/40';
    if (score >= 60) return 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/40';
    return 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/40';
  };

  return (
    <div className="glass-card p-5 sm:p-6 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              50/30/20 Financial Health
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Budget adherence to standard financial equilibrium
          </p>
        </div>

        {/* Health Score Pill */}
        <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-bold text-xs ${getScoreColor(healthScore)}`}>
          <span>Score:</span>
          <span className="text-sm font-extrabold">{healthScore}/100</span>
          <span>({status})</span>
        </div>
      </div>

      {/* Progress Bars for Needs, Wants, Savings */}
      <div className="space-y-4">
        {/* Needs (50%) */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Needs (Target: 50%)
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-slate-900 dark:text-white font-bold">
                {formatCurrency(needs.amount, currency)}
              </span>
              <span className={`font-semibold ${needs.percentage <= 55 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {needs.percentage}%
              </span>
            </div>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                needs.percentage <= 50 ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(100, needs.percentage)}%` }}
            />
          </div>
        </div>

        {/* Wants (30%) */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Wants (Target: 30%)
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-slate-900 dark:text-white font-bold">
                {formatCurrency(wants.amount, currency)}
              </span>
              <span className={`font-semibold ${wants.percentage <= 35 ? 'text-indigo-600' : 'text-rose-600'}`}>
                {wants.percentage}%
              </span>
            </div>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                wants.percentage <= 30 ? 'bg-indigo-500' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, wants.percentage)}%` }}
            />
          </div>
        </div>

        {/* Savings (20%) */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Savings & Investments (Target: 20%)
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-slate-900 dark:text-white font-bold">
                {formatCurrency(savings.amount, currency)}
              </span>
              <span className={`font-semibold ${savings.percentage >= 20 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {savings.percentage}%
              </span>
            </div>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${Math.min(100, savings.percentage * 2)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Smart Advice Box */}
      <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
        <Info className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
        <p>
          {savings.percentage >= 20
            ? 'Great job! You are hitting your 20% savings & investment benchmark, steadily compounding wealth.'
            : 'Consider trimming discretionary "Wants" by 5-10% to boost your automated savings reserve.'}
        </p>
      </div>
    </div>
  );
};

export default FinancialHealthCard;
