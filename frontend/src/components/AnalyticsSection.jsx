/**
 * AnalyticsSection.jsx
 *
 * Renders the top analytics cards (income, expense, net balance, count)
 * and the per-category progress section. All numbers come pre-computed
 * from the backend analytics object — the frontend only displays them.
 */

import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ListChecks,
} from 'lucide-react';
import { getCategoryMeta, formatCurrency, CATEGORIES } from '../utils/format';

export default function AnalyticsSection({ analytics }) {
  const {
    totalIncome = 0,
    totalExpense = 0,
    netBalance = 0,
    transactionCount = 0,
    categoryTotals = {},
    categoryPercentages = {},
  } = analytics || {};

  // Configuration for the four summary cards.
  const cards = [
    {
      label: 'Total Income',
      value: formatCurrency(totalIncome),
      icon: TrendingUp,
      accent: 'text-emerald-600',
      iconBg: 'bg-emerald-100',
    },
    {
      label: 'Total Expense',
      value: formatCurrency(totalExpense),
      icon: TrendingDown,
      accent: 'text-rose-600',
      iconBg: 'bg-rose-100',
    },
    {
      label: 'Net Balance',
      value: formatCurrency(netBalance),
      icon: Wallet,
      accent: netBalance >= 0 ? 'text-blue-600' : 'text-rose-600',
      iconBg: 'bg-blue-100',
    },
    {
      label: 'Transactions',
      value: transactionCount,
      icon: ListChecks,
      accent: 'text-purple-600',
      iconBg: 'bg-purple-100',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.iconBg}`}>
                <Icon className={`h-6 w-6 ${card.accent}`} />
              </div>
              <div>
                <p className="text-sm text-slate-500">{card.label}</p>
                <p className={`text-xl font-bold ${card.accent}`}>{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Category progress */}
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-slate-800">Spending by Category</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {CATEGORIES.map((category) => {
            const total = categoryTotals[category] || 0;
            const percent = categoryPercentages[category] || 0;
            const meta = getCategoryMeta(category);
            const Icon = meta.icon;

            return (
              <div key={category} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-medium text-slate-700">
                    <Icon className={`h-4 w-4 ${meta.color}`} />
                    {category}
                  </span>
                  <span className="text-slate-500">
                    {formatCurrency(total)} · {percent}%
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${meta.bar} transition-all duration-500`}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
