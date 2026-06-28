/**
 * AddTransactionModal.jsx
 *
 * A modal form for adding a new transaction. The user chooses a type
 * (Expense/Income), enters a positive amount, a message, a date and an
 * optional category. The component only collects input and emits a payload;
 * the backend handles signing, categorization, savings and persistence.
 */

import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { CATEGORIES } from '../utils/format';

// Today's date as YYYY-MM-DD for the default date input value.
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function AddTransactionModal({ open, onClose, onAdd, submitting }) {
  const [type, setType] = useState('Expense');
  const [message, setMessage] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayISO());
  const [category, setCategory] = useState('Auto'); // "Auto" => let backend detect
  const [error, setError] = useState('');

  if (!open) return null;

  // Reset fields back to defaults.
  function resetForm() {
    setType('Expense');
    setMessage('');
    setAmount('');
    setDate(todayISO());
    setCategory('Auto');
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const numericAmount = Number(amount);
    if (!message.trim()) return setError('Please enter a message.');
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return setError('Please enter an amount greater than 0.');
    }

    // Expenses are stored as negative amounts, income as positive.
    const signedAmount = type === 'Expense' ? -numericAmount : numericAmount;

    const payload = {
      message: message.trim(),
      amount: signedAmount,
      date: date || todayISO(),
    };
    // Only send a category when the user picked one explicitly.
    if (category !== 'Auto') payload.category = category;

    try {
      setError('');
      await onAdd(payload);
      resetForm();
      onClose();
    } catch (err) {
      console.error(err);
      setError('Could not add the transaction. Please try again.');
    }
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 animate-fade-in"
      onClick={onClose}
    >
      {/* Dialog (stop click propagation so clicks inside don't close it) */}
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Add Transaction</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Type toggle */}
          <div className="grid grid-cols-2 gap-2">
            {['Expense', 'Income'].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setType(option)}
                className={`rounded-lg border py-2 text-sm font-semibold transition ${
                  type === option
                    ? option === 'Expense'
                      ? 'border-rose-500 bg-rose-50 text-rose-600'
                      : 'border-emerald-500 bg-emerald-50 text-emerald-600'
                    : 'border-slate-300 text-slate-500 hover:bg-slate-50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          {/* Message */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              Message
            </label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Paid Rs.250 to Zomato"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Amount + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">
                Amount (₹)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="250"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              <option value="Auto">Auto-detect from message</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Inline error */}
          {error && <p className="text-sm font-medium text-rose-600">{error}</p>}

          {/* Actions */}
          <div className="mt-1 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              {submitting ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
