/**
 * CategoryDropdown.jsx
 *
 * Lets the user manually change a transaction's category. It only emits
 * the selected value upward; the actual PATCH request is handled by the
 * parent/Dashboard so all data flow stays in one place.
 */

import { CATEGORIES } from '../utils/format';

export default function CategoryDropdown({ value, onChange, disabled }) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {CATEGORIES.map((category) => (
        <option key={category} value={category}>
          {category}
        </option>
      ))}
    </select>
  );
}
