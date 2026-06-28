/**
 * savingsService.js
 *
 * Computes the "expected savings" for a transaction. Savings are only
 * generated for expenses whose message references a cashback/reward
 * program. The rule is 5% of the expense amount, rounded to 2 decimals.
 */

const { SAVINGS_KEYWORDS, SAVINGS_RATE } = require('../utils/constants');

/**
 * Calculate expected savings for a single transaction.
 *
 * Rule:
 *   - amount must be < 0 (an expense)
 *   - message must contain a savings keyword (cashback, reward, etc.)
 *   - result = 5% of the absolute expense amount, rounded to 2 decimals
 *
 * @param {string} message - The raw transaction message.
 * @param {number} amount - The signed transaction amount.
 * @returns {number} The expected savings (0 if not eligible).
 */
function calculateExpectedSavings(message, amount) {
  if (typeof amount !== 'number' || amount >= 0) {
    return 0;
  }

  if (!message || typeof message !== 'string') {
    return 0;
  }

  const lowerMessage = message.toLowerCase();
  const isEligible = SAVINGS_KEYWORDS.some((keyword) =>
    lowerMessage.includes(keyword)
  );

  if (!isEligible) {
    return 0;
  }

  // 5% of the expense amount (use absolute value so savings are positive).
  const savings = Math.abs(amount) * SAVINGS_RATE;

  // Round to 2 decimal places.
  return Math.round(savings * 100) / 100;
}

module.exports = {
  calculateExpectedSavings,
};
