/**
 * SavingsBadge.jsx
 *
 * Small green badge shown only when a transaction has expected savings.
 * Pure presentational component.
 */

import { formatCurrency } from '../utils/format';

export default function SavingsBadge({ expectedSavings }) {
  // Only render when there is something to show.
  if (!expectedSavings || expectedSavings <= 0) return null;

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
      🟢 Expected Savings {formatCurrency(expectedSavings)}
    </span>
  );
}
