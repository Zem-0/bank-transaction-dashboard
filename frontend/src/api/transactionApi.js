import axios from 'axios';

/**
 * transactionApi.js
 *
 * Thin API layer around axios. The frontend only fetches data and sends
 * requests here — no business logic. All endpoints are relative and are
 * proxied to the Express backend by Vite (see vite.config.js).
 */

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Fetch all transactions together with computed analytics.
 * @returns {Promise<{ transactions: Array, analytics: Object }>}
 */
export async function fetchTransactions() {
  const { data } = await api.get('/transactions');
  return data;
}

/**
 * Update a transaction's category and get back the refreshed data.
 * @param {number} id - Transaction id.
 * @param {string} category - The new category.
 * @returns {Promise<{ transactions: Array, analytics: Object }>}
 */
export async function updateTransactionCategory(id, category) {
  const { data } = await api.patch(`/transactions/${id}/category`, { category });
  return data;
}

/**
 * Add a new transaction. The amount can be positive (income) or negative
 * (expense). Returns the refreshed dataset + analytics.
 * @param {{ message: string, amount: number, date?: string, category?: string }} payload
 * @returns {Promise<{ transactions: Array, analytics: Object }>}
 */
export async function addTransaction(payload) {
  const { data } = await api.post('/transactions', payload);
  return data;
}

/**
 * Delete a transaction by id. Returns the refreshed dataset + analytics.
 * @param {number} id - Transaction id.
 * @returns {Promise<{ transactions: Array, analytics: Object }>}
 */
export async function deleteTransaction(id) {
  const { data } = await api.delete(`/transactions/${id}`);
  return data;
}
