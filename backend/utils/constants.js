/**
 * constants.js
 *
 * Centralized constants for the application.
 * Keeping these in one place avoids magic strings/numbers being
 * duplicated across services and makes the business rules easy to read.
 */

// The canonical list of categories supported by the application.
// Used both for parsing (keyword matching) and for validation.
const CATEGORIES = {
  FOOD: 'Food',
  TRAVEL: 'Travel',
  SALARY: 'Salary',
  SHOPPING: 'Shopping',
  BILLS: 'Bills',
  ENTERTAINMENT: 'Entertainment',
  MISCELLANEOUS: 'Miscellaneous',
};

// Flat array of valid category values, used for validation in the controller.
const VALID_CATEGORIES = Object.values(CATEGORIES);

// Transaction types.
const TRANSACTION_TYPES = {
  INCOME: 'Income',
  EXPENSE: 'Expense',
};

/**
 * Keyword mapping used by the parser to auto-categorize a transaction
 * based on the message text. Matching is case-insensitive.
 * If no keyword matches, the parser falls back to Miscellaneous.
 */
const CATEGORY_KEYWORDS = {
  [CATEGORIES.FOOD]: ['zomato', 'swiggy', 'dominos', 'pizza hut', 'kfc', 'mcdonald'],
  [CATEGORIES.TRAVEL]: ['uber', 'ola', 'rapido', 'irctc'],
  [CATEGORIES.SALARY]: ['salary', 'payroll', 'company', 'employer'],
  [CATEGORIES.SHOPPING]: ['amazon', 'flipkart', 'myntra'],
  [CATEGORIES.BILLS]: ['electricity', 'water', 'gas', 'recharge'],
  [CATEGORIES.ENTERTAINMENT]: ['netflix', 'prime', 'movie', 'bookmyshow'],
};

/**
 * Keywords that mark a transaction as savings/cashback eligible.
 * If an expense message contains any of these, expected savings are computed.
 */
const SAVINGS_KEYWORDS = [
  'cashback',
  'reward',
  'supercoins',
  'points',
  'phonepe cashback',
  'gpay cashback',
  'amazon pay reward',
];

// Expected savings is calculated as 5% of the expense amount.
const SAVINGS_RATE = 0.05;

module.exports = {
  CATEGORIES,
  VALID_CATEGORIES,
  TRANSACTION_TYPES,
  CATEGORY_KEYWORDS,
  SAVINGS_KEYWORDS,
  SAVINGS_RATE,
};
