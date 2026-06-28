/**
 * server.js
 *
 * Application entry point. Sets up the Express app, middleware,
 * routes and a small global error handler, then starts listening.
 */

const express = require('express');
const cors = require('cors');

const transactionRoutes = require('./routes/transactionRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors()); // Allow the Vite dev server (different origin) to call the API.
app.use(express.json()); // Parse JSON request bodies.

// --- Health check ---
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Bank Transaction Dashboard API' });
});

// --- Routes ---
app.use('/api/transactions', transactionRoutes);

// --- 404 handler for unknown routes ---
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// --- Global error handler (last resort) ---
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
