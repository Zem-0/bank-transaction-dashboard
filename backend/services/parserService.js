/**
 * parserService.js
 *
 * Responsible for deriving a transaction's category and type from its
 * raw message and amount. This is pure business logic and lives entirely
 * in the backend so the frontend never has to know parsing rules.
 */

const {
  CATEGORIES,
  CATEGORY_KEYWORDS,
  TRANSACTION_TYPES,
} = require('../utils/constants');

/**
 * Categorize a transaction message using keyword matching.
 * Matching is case-insensitive. Falls back to Miscellaneous.
 *
 * @param {string} message - The raw transaction message.
 * @returns {string} The matched category.
 */
function categorize(message) {
  if (!message || typeof message !== 'string') {
    return CATEGORIES.MISCELLANEOUS;
  }

  const lowerMessage = message.toLowerCase();

  // Iterate over each category and its keyword list. The first category
  // that has a keyword present in the message wins.
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const isMatch = keywords.some((keyword) => lowerMessage.includes(keyword));
    if (isMatch) {
      return category;
    }
  }

  return CATEGORIES.MISCELLANEOUS;
}

/**
 * Derive the transaction type from the amount.
 * Positive amounts are Income, negative amounts are Expense.
 *
 * @param {number} amount - The signed transaction amount.
 * @returns {string} Income or Expense.
 */
function deriveType(amount) {
  return amount >= 0 ? TRANSACTION_TYPES.INCOME : TRANSACTION_TYPES.EXPENSE;
}

module.exports = {
  categorize,
  deriveType,
};
