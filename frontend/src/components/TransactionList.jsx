/**
 * TransactionList.jsx
 *
 * Renders the scrollable transaction feed plus the search / filter / sort
 * controls. The filtering and sorting here are purely view-level concerns
 * (how the already-computed data is displayed) — no business logic such as
 * categorization or analytics happens in the frontend.
 */

import { useMemo, useState } from 'react';
import { Search, Inbox, Plus } from 'lucide-react';
import TransactionCard from './TransactionCard';
import { CATEGORIES } from '../utils/format';

// Sort options for the dropdown.
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'highest', label: 'Highest Amount' },
  { value: 'lowest', label: 'Lowest Amount' },
];

export default function TransactionList({
  transactions,
  onCategoryChange,
  onDelete,
  onAddClick,
  updatingId,
}) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Derive the visible list from the source data + UI controls.
  const visibleTransactions = useMemo(() => {
    let result = [...transactions];

    // Search by message text.
    if (search.trim()) {
      const term = search.trim().toLowerCase();
      result = result.filter((t) => t.message.toLowerCase().includes(term));
    }

    // Filter by category.
    if (categoryFilter !== 'All') {
      result = result.filter((t) => t.category === categoryFilter);
    }

    // Sort by the chosen criterion.
    result.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.date) - new Date(b.date);
        case 'highest':
          return Math.abs(b.amount) - Math.abs(a.amount);
        case 'lowest':
          return Math.abs(a.amount) - Math.abs(b.amount);
        case 'newest':
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });

    return result;
  }, [transactions, search, categoryFilter, sortBy]);

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-800">Transactions</h2>
          {/* Add button (also visible on mobile next to the title) */}
          <button
            onClick={onAddClick}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 lg:hidden"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full rounded-lg border border-slate-300 py-1.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:w-44"
            />
          </div>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Add button (desktop) */}
          <button
            onClick={onAddClick}
            className="hidden items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 lg:inline-flex"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>

      {/* Feed */}
      {visibleTransactions.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="custom-scrollbar flex max-h-[32rem] flex-col gap-3 overflow-y-auto pr-1">
          {visibleTransactions.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              onCategoryChange={onCategoryChange}
              onDelete={onDelete}
              isUpdating={updatingId === transaction.id}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// Friendly empty state shown when no transactions match.
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-slate-400">
      <Inbox className="h-10 w-10" />
      <p className="font-medium">No transactions found</p>
      <p className="text-sm">Try adjusting your search or filters.</p>
    </div>
  );
}
