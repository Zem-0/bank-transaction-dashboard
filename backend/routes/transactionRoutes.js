/**
 * transactionRoutes.js
 *
 * Declares the REST routes for transactions and wires them to the
 * controller handlers. Keeping routing separate from controllers keeps
 * the API surface easy to scan.
 */

const express = require('express');
const router = express.Router();

const transactionController = require('../controllers/transactionController');

// GET /api/transactions -> list transactions + analytics
router.get('/', transactionController.getTransactions);

// POST /api/transactions -> add a new transaction (income or expense)
router.post('/', transactionController.addTransaction);

// PATCH /api/transactions/:id/category -> update a transaction's category
router.patch('/:id/category', transactionController.updateCategory);

// DELETE /api/transactions/:id -> remove a transaction
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router;
