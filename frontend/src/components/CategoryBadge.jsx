/**
 * CategoryBadge.jsx
 *
 * A small, color-coded pill that clearly labels a transaction's category
 * with its icon + name. Purely presentational — colors and icon come from
 * the shared category metadata so every category looks consistent.
 */

import { getCategoryMeta } from '../utils/format';

export default function CategoryBadge({ category }) {
  const meta = getCategoryMeta(category);
  const Icon = meta.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${meta.bg} ${meta.color}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {category}
    </span>
  );
}
