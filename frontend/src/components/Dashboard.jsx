/**
 * Dashboard.jsx
 *
 * Container component that owns the data and the data-fetching logic.
 * It loads transactions + analytics on mount, handles category updates,
 * and passes everything down to the presentational components.
 */

import { useEffect, useState } from 'react';
import { Loader2, AlertCircle, Landmark } from 'lucide-react';
import {
  fetchTransactions,
  updateTransactionCategory,
  addTransaction,
  deleteTransaction,
} from '../api/transactionApi';
import AnalyticsSection from './AnalyticsSection';
import TransactionList from './TransactionList';
import AddTransactionModal from './AddTransactionModal';

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Tracks which transaction's category is currently being updated/deleted.
  const [updatingId, setUpdatingId] = useState(null);
  // Controls the Add Transaction modal + its submit state.
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load data on first render.
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTransactions();
      setTransactions(data.transactions);
      setAnalytics(data.analytics);
    } catch (err) {
      console.error(err);
      setError('Could not load transactions. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  // Handle a category change from a card's dropdown.
  async function handleCategoryChange(id, category) {
    try {
      setUpdatingId(id);
      // The backend recomputes analytics and returns the fresh dataset.
      const data = await updateTransactionCategory(id, category);
      setTransactions(data.transactions);
      setAnalytics(data.analytics);
    } catch (err) {
      console.error(err);
      setError('Could not update the category. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  }

  // Add a new transaction. Re-throws so the modal can show its own error.
  async function handleAddTransaction(payload) {
    try {
      setIsSubmitting(true);
      const data = await addTransaction(payload);
      setTransactions(data.transactions);
      setAnalytics(data.analytics);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Delete a transaction after a quick confirmation.
  async function handleDeleteTransaction(id) {
    if (!window.confirm('Delete this transaction? This cannot be undone.')) {
      return;
    }
    try {
      setUpdatingId(id);
      const data = await deleteTransaction(id);
      setTransactions(data.transactions);
      setAnalytics(data.analytics);
    } catch (err) {
      console.error(err);
      setError('Could not delete the transaction. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Blue gradient header */}
      <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 pb-20 pt-8 shadow-lg">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center gap-3 text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <Landmark className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">UPI Transaction Dashboard</h1>
              <p className="text-sm text-blue-100">
                Your spending summary &amp; smart categorization
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Body: pulled up to overlap the header for a modern look */}
      <main className="mx-auto -mt-12 max-w-6xl px-4">
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={loadData} />
        ) : (
          <div className="flex flex-col gap-6 animate-fade-in">
            <AnalyticsSection analytics={analytics} />
            <TransactionList
              transactions={transactions}
              onCategoryChange={handleCategoryChange}
              onDelete={handleDeleteTransaction}
              onAddClick={() => setIsModalOpen(true)}
              updatingId={updatingId}
            />
          </div>
        )}
      </main>

      {/* Add Transaction modal */}
      <AddTransactionModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddTransaction}
        submitting={isSubmitting}
      />
    </div>
  );
}

// Loading spinner shown while data is being fetched.
function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-white p-16 shadow-sm">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <p className="text-slate-500">Loading your transactions...</p>
    </div>
  );
}

// Error state with a retry button.
function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-white p-16 text-center shadow-sm">
      <AlertCircle className="h-8 w-8 text-rose-500" />
      <p className="font-medium text-slate-700">{message}</p>
      <button
        onClick={onRetry}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        Retry
      </button>
    </div>
  );
}
