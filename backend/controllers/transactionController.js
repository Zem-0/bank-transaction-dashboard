/**
 * transactionController.js
 *
 * Orchestrates the request/response cycle for transactions.
 * It reads/writes the JSON store, delegates business logic to the
 * services (parser, savings, analytics) and shapes the HTTP response.
 *
 * Controllers stay thin: no business rules live here, only coordination.
 */

const fs = require('fs/promises');
const path = require('path');

const parserService = require('../services/parserService');
const savingsService = require('../services/savingsService');
const analyticsService = require('../services/analyticsService');
const { VALID_CATEGORIES } = require('../utils/constants');

// Absolute path to the JSON data store.
const DATA_FILE = path.join(__dirname, '..', 'data', 'transactions.json');

/**
 * Read all transactions from the JSON file.
 * @returns {Promise<Array>} Parsed transactions.
 */
async function readTransactions() {
  const raw = await fs.readFile(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

/**
 * Persist transactions back to the JSON file.
 * @param {Array} transactions
 */
async function writeTransactions(transactions) {
  await fs.writeFile(DATA_FILE, JSON.stringify(transactions, null, 2), 'utf-8');
}

/**
 * Normalize a stored transaction by recomputing its derived fields.
 * - type is derived from the amount
 * - expectedSavings is derived from the message + amount
 * The category is taken from storage (auto-seeded by the parser and
 * overridable by the user), so it is never overwritten here.
 *
 * @param {Object} txn
 * @returns {Object} A normalized transaction.
 */
function normalizeTransaction(txn) {
  return {
    ...txn,
    type: parserService.deriveType(txn.amount),
    expectedSavings: savingsService.calculateExpectedSavings(
      txn.message,
      txn.amount
    ),
  };
}

/**
 * Build the standard response payload: normalized transactions + analytics.
 * Shared by every handler so the frontend always receives the same shape.
 * @param {Array} stored - Raw transactions from the store.
 */
function buildPayload(stored) {
  const transactions = stored.map(normalizeTransaction);
  const analytics = analyticsService.computeAnalytics(transactions);
  return { transactions, analytics };
}

/**
 * Today's date as an ISO `YYYY-MM-DD` string (used as a default date).
 */
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * GET /api/transactions
 * Returns the full list of transactions along with computed analytics.
 */
async function getTransactions(req, res) {
  try {
    const stored = await readTransactions();
    // Recompute derived fields so the response is always consistent.
    return res.status(200).json(buildPayload(stored));
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return res
      .status(500)
      .json({ error: 'Failed to fetch transactions.' });
  }
}

/**
 * PATCH /api/transactions/:id/category
 * Manually updates a transaction's category, then recomputes analytics.
 * Body: { category: "Food" }
 */
async function updateCategory(req, res) {
  try {
    const id = Number(req.params.id);
    const { category } = req.body;

    // Validate the requested category against the allowed list.
    if (!category || !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        error: 'Invalid category.',
        validCategories: VALID_CATEGORIES,
      });
    }

    const stored = await readTransactions();
    const index = stored.findIndex((txn) => txn.id === id);

    // Handle a non-existent transaction id.
    if (index === -1) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    // Apply the manual category override and persist.
    stored[index].category = category;
    await writeTransactions(stored);

    return res.status(200).json(buildPayload(stored));
  } catch (error) {
    console.error('Error updating category:', error);
    return res
      .status(500)
      .json({ error: 'Failed to update category.' });
  }
}

/**
 * POST /api/transactions
 * Adds a new transaction. The amount may be positive (income) or negative
 * (expense). The category is auto-detected by the parser unless a valid
 * category is explicitly provided. Persists the new entry to the JSON file.
 *
 * Body: { message, amount, date?, category? }
 */
async function addTransaction(req, res) {
  try {
    const { message, amount, date, category } = req.body;

    // Validate the message.
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'A non-empty message is required.' });
    }

    // Validate the amount: must be a non-zero number.
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount === 0) {
      return res
        .status(400)
        .json({ error: 'Amount must be a non-zero number.' });
    }

    // If a category is supplied, it must be valid; otherwise auto-detect it.
    if (category && !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        error: 'Invalid category.',
        validCategories: VALID_CATEGORIES,
      });
    }

    const stored = await readTransactions();

    // Generate the next id (max existing id + 1).
    const nextId = stored.reduce((max, txn) => Math.max(max, txn.id), 0) + 1;

    // Build the new transaction. Derived fields (type, expectedSavings) are
    // recomputed on read, so we just store sensible values here.
    const newTransaction = {
      id: nextId,
      message: message.trim(),
      amount: numericAmount,
      date: date || todayISO(),
      category: category || parserService.categorize(message),
      type: parserService.deriveType(numericAmount),
      expectedSavings: savingsService.calculateExpectedSavings(
        message,
        numericAmount
      ),
    };

    stored.push(newTransaction);
    await writeTransactions(stored);

    // 201 Created.
    return res.status(201).json(buildPayload(stored));
  } catch (error) {
    console.error('Error adding transaction:', error);
    return res.status(500).json({ error: 'Failed to add transaction.' });
  }
}

/**
 * DELETE /api/transactions/:id
 * Removes a transaction by id from the JSON file and returns the refreshed
 * dataset + analytics.
 */
async function deleteTransaction(req, res) {
  try {
    const id = Number(req.params.id);

    const stored = await readTransactions();
    const index = stored.findIndex((txn) => txn.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    // Remove the entry and persist.
    stored.splice(index, 1);
    await writeTransactions(stored);

    return res.status(200).json(buildPayload(stored));
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return res.status(500).json({ error: 'Failed to delete transaction.' });
  }
}

module.exports = {
  getTransactions,
  updateCategory,
  addTransaction,
  deleteTransaction,
};
