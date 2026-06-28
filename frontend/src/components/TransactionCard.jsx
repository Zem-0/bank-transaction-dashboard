/**
 * TransactionCard.jsx
 *
 * Displays a single transaction: icon, merchant/message, amount, date,
 * a category dropdown and an optional savings badge.
 */

import { Trash2 } from 'lucide-react';
import {
  getCategoryMeta,
  formatCurrency,
  formatDate,
  formatTime,
} from '../utils/format';
import CategoryDropdown from './CategoryDropdown';
import CategoryBadge from './CategoryBadge';
import SavingsBadge from './SavingsBadge';

/**
 * Derive a short "merchant" name from the message for the card title.
 * This is a display nicety only (first few words of the message).
 */
function getMerchantName(message) {
  return message.split(' ').slice(0, 3).join(' ');
}

export default function TransactionCard({
  transaction,
  onCategoryChange,
  onDelete,
  isUpdating,
}) {
  const { id, message, amount, date, category, type, expectedSavings, createdAt } =
    transaction;

  const meta = getCategoryMeta(category);
  const Icon = meta.icon;
  const isIncome = type === 'Income';

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
      {/* Left: icon + details */}
      <div className="flex items-start gap-3">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${meta.bg}`}>
          <Icon className={`h-5 w-5 ${meta.color}`} />
        </div>

        <div className="min-w-0">
          <p className="font-semibold text-slate-800">{getMerchantName(message)}</p>
          <p className="truncate text-sm text-slate-500">{message}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <CategoryBadge category={category} />
            <span className="text-xs text-slate-400">
              {formatDate(date)} · {formatTime(createdAt)} IST
            </span>
            <SavingsBadge expectedSavings={expectedSavings} />
          </div>
        </div>
      </div>

      {/* Right: amount + category control */}
      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
        <span
          className={`text-lg font-bold ${
            isIncome ? 'text-emerald-600' : 'text-rose-600'
          }`}
        >
          {isIncome ? '+' : '-'}
          {formatCurrency(Math.abs(amount))}
        </span>

        <div className="flex items-center gap-2">
          <CategoryDropdown
            value={category}
            disabled={isUpdating}
            onChange={(newCategory) => onCategoryChange(id, newCategory)}
          />
          <button
            onClick={() => onDelete(id)}
            disabled={isUpdating}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Delete transaction"
            title="Delete transaction"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
