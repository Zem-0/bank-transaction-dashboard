/**
 * analyticsService.js
 *
 * Computes aggregate analytics over a list of transactions.
 * The whole computation is a single O(n) pass over the transactions,
 * returning every metric in one object.
 */

const { TRANSACTION_TYPES } = require('../utils/constants');

/**
 * Compute analytics for a list of transactions in O(n).
 *
 * @param {Array} transactions - List of transaction objects.
 * @returns {Object} An object containing all computed analytics.
 */
function computeAnalytics(transactions = []) {
  // Default/empty analytics shape so the frontend always gets a stable object.
  const analytics = {
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
    transactionCount: 0,
    categoryTotals: {},
    categoryPercentages: {},
    mostUsedCategory: null,
    highestExpense: null,
    highestIncome: null,
  };

  if (!Array.isArray(transactions) || transactions.length === 0) {
    return analytics;
  }

  // Track category counts to determine the most used category.
  const categoryCounts = {};

  // Single pass over the transactions (O(n)).
  for (const txn of transactions) {
    const { amount, category, type } = txn;

    // Income vs expense totals.
    if (type === TRANSACTION_TYPES.INCOME) {
      analytics.totalIncome += amount;

      // Track highest income (most positive amount).
      if (
        analytics.highestIncome === null ||
        amount > analytics.highestIncome.amount
      ) {
        analytics.highestIncome = txn;
      }
    } else {
      // Expense: amount is negative, so sum the absolute value.
      analytics.totalExpense += Math.abs(amount);

      // Track highest expense (most negative amount = largest spend).
      if (
        analytics.highestExpense === null ||
        amount < analytics.highestExpense.amount
      ) {
        analytics.highestExpense = txn;
      }
    }

    // Category totals accumulate the absolute spend/credit per category.
    analytics.categoryTotals[category] =
      (analytics.categoryTotals[category] || 0) + Math.abs(amount);

    // Category counts for "most used category".
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  }

  // Net balance = income - expense.
  analytics.netBalance = analytics.totalIncome - analytics.totalExpense;
  analytics.transactionCount = transactions.length;

  // Round monetary totals to 2 decimals for clean display.
  analytics.totalIncome = round2(analytics.totalIncome);
  analytics.totalExpense = round2(analytics.totalExpense);
  analytics.netBalance = round2(analytics.netBalance);

  // Compute the grand total across all categories to derive percentages.
  const grandTotal = Object.values(analytics.categoryTotals).reduce(
    (sum, value) => sum + value,
    0
  );

  // Category percentages relative to total volume.
  for (const [category, total] of Object.entries(analytics.categoryTotals)) {
    analytics.categoryTotals[category] = round2(total);
    analytics.categoryPercentages[category] =
      grandTotal > 0 ? round2((total / grandTotal) * 100) : 0;
  }

  // Most used category = the one with the highest transaction count.
  let mostUsedCategory = null;
  let maxCount = -1;
  for (const [category, count] of Object.entries(categoryCounts)) {
    if (count > maxCount) {
      maxCount = count;
      mostUsedCategory = category;
    }
  }
  analytics.mostUsedCategory = mostUsedCategory;

  return analytics;
}

/**
 * Round a number to 2 decimal places.
 * @param {number} value
 * @returns {number}
 */
function round2(value) {
  return Math.round(value * 100) / 100;
}

module.exports = {
  computeAnalytics,
};
