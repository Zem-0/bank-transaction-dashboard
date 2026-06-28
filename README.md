# 💳 Bank Transaction UPI Summary & Categorization Dashboard

A modern, fintech-style banking dashboard that ingests UPI transaction
messages, **auto-categorizes** them, computes **analytics**, and highlights
**expected savings** from cashback/reward transactions.

All business logic (parsing, categorization, savings, analytics) lives in the
**backend**. The **frontend** only fetches data, renders the UI, and sends
requests.

---

## 📖 What It Does (In Plain English)

Think of it as a mini banking app for your UPI payments. It reads short
payment messages like _"Paid Rs.250 to Zomato"_ and turns them into a clean,
visual money dashboard.

When you open the app you can:

1. **See your money at a glance** — total income, total expense, net balance
   and transaction count as cards at the top.
2. **Understand where money goes** — a progress bar per category (Food,
   Travel, Shopping, Bills, Entertainment, Salary, Miscellaneous) showing the
   amount and percentage of your spending.
3. **Browse every transaction** — a scrollable feed where each card shows an
   icon, the merchant, the message, the amount, the date and a colour-coded
   category label.
4. **Add a transaction** — a form to record any income (positive) or expense
   (negative) yourself; it's saved to the data file.
5. **Fix mistakes** — change a transaction's category from a dropdown, or
   delete an entry you added by mistake.
6. **Spot savings** — cashback/reward expenses show a green
   **Expected Savings** badge (5% of the amount).
7. **Find things fast** — search by text, filter by category, and sort by
   date or amount.

The important idea: **the React app never does any maths or logic.** It only
asks the backend for data and shows it. Every calculation (categorizing,
totals, percentages, savings) happens on the Node/Express server.

---

## 📖 Project Overview

- Preloaded with ~19 realistic UPI transactions (Zomato, Swiggy, Uber, Amazon,
  Salary, etc.).
- The backend categorizes each transaction using keyword matching and computes
  a single analytics object in **O(n)**.
- Users can add, re-categorize and delete transactions; analytics recompute
  instantly and changes are saved to the JSON file.
- Cashback/reward expenses display a green **Expected Savings** badge
  (5% of the expense amount).

---

## 🏗️ Architecture

Clean, layered architecture with a clear separation of concerns:

```
Request ─▶ Routes ─▶ Controller ─▶ Services ─▶ JSON store
                         │             ├─ parserService     (categorization)
                         │             ├─ savingsService    (expected savings)
                         │             └─ analyticsService  (aggregates, O(n))
                         ▼
                     JSON response  ─▶  React (fetch + display only)
```

- **Routes** — declare the API surface.
- **Controller** — thin coordination layer (I/O + delegation, no rules).
- **Services** — all business logic, framework-agnostic and unit-testable.
- **Utils/constants** — single source of truth for categories, keywords, rules.
- **Frontend** — container component owns data; presentational components render.

---

## ⚙️ How It Works (Under the Hood)

Here's the journey of the data, end to end.

### 1. When the page loads

```
Browser → GET /api/transactions
        → Controller reads backend/data/transactions.json
        → For each transaction, services recompute derived fields:
              • parserService.deriveType(amount)        → "Income" / "Expense"
              • savingsService.calculateExpectedSavings → 5% if cashback expense
        → analyticsService.computeAnalytics(...)        → one O(n) pass
        → responds with { transactions, analytics }
React stores both in state and renders the cards, bars and feed.
```

### 2. How a transaction gets its category (example)

Message: `"Paid Rs.250 to Zomato"` → lower-cased → contains **"zomato"** →
matched against the keyword map → category becomes **Food**. If nothing
matches, it falls back to **Miscellaneous**. This is the only place
categorization happens — `parserService.categorize()` on the server.

### 3. How "Expected Savings" is calculated (example)

Message: `"Mobile recharge Rs.299 with PhonePe cashback"`, amount `-299`.
The amount is negative **and** the message contains the keyword `cashback`,
so `expectedSavings = round(299 × 5%, 2) = 14.95`. The frontend then shows the
green badge **only because** that number is greater than 0.

### 4. When you add / change / delete

Every write goes to the backend, which updates the JSON file and returns the
**freshly recomputed** `{ transactions, analytics }`. React just swaps its
state with the response — so the totals and category bars always stay in sync
without the frontend doing any maths.

```
Add    → POST   /api/transactions          → append to JSON  → recompute → return
Change → PATCH  /api/transactions/:id/category → edit JSON    → recompute → return
Delete → DELETE /api/transactions/:id       → remove from JSON → recompute → return
```

### 5. Why analytics is O(n)

`computeAnalytics()` walks the list **once**, accumulating income, expense,
per-category totals/counts and the highest income/expense as it goes.
Percentages and the most-used category are then derived from those running
totals — no nested loops, so it scales linearly with the number of
transactions.

---

## ✨ Features

- ✅ Keyword-based auto-categorization (case-insensitive)
- ✅ Expected savings calculation for cashback/reward expenses (5%)
- ✅ Full analytics: income, expense, net balance, category totals/percentages,
  most-used category, highest expense/income, transaction count
- ✅ Add a transaction (income or expense) via a modal form (POST + persist)
- ✅ Delete a transaction added by mistake (DELETE + persist)
- ✅ Manual category override via dropdown (PATCH + recompute)
- ✅ Modern UI: blue gradient header, rounded cards, soft shadows, hover
  animations, responsive/mobile-friendly
- ✅ Bonus: search, category filter, sorting (newest/oldest/highest/lowest)
- ✅ Loading spinner, empty state, and error handling with retry

---

## 📁 Folder Structure

```
bank-transaction-dashboard/
├── backend/
│   ├── server.js
│   ├── routes/
│   │   └── transactionRoutes.js
│   ├── controllers/
│   │   └── transactionController.js
│   ├── services/
│   │   ├── parserService.js
│   │   ├── analyticsService.js
│   │   └── savingsService.js
│   ├── data/
│   │   └── transactions.json
│   └── utils/
│       └── constants.js
└── frontend/
    └── src/
        ├── api/
        │   └── transactionApi.js
        ├── components/
        │   ├── Dashboard.jsx
        │   ├── AnalyticsSection.jsx
        │   ├── TransactionList.jsx
        │   ├── TransactionCard.jsx
        │   ├── AddTransactionModal.jsx
        │   ├── CategoryDropdown.jsx
        │   ├── CategoryBadge.jsx
        │   └── SavingsBadge.jsx
        ├── pages/
        │   └── Home.jsx
        ├── utils/
        │   └── format.js
        └── App.jsx
```

---

## 🚀 How to Run the Project

> **Prerequisite:** Node.js **18 or newer** installed. Check with `node -v`.

This project has **two parts** — the backend (API server) and the frontend
(React app). You need to run **both at the same time**, each in its **own
terminal**. Always start the **backend first**.

### Step 1 — Start the Backend (Terminal 1)

```bash
cd backend
npm install        # one-time: installs express + cors
npm run dev        # starts the API on http://localhost:5000
```

You should see: `Server running on http://localhost:5000`.
Leave this terminal running.

### Step 2 — Start the Frontend (Terminal 2)

```bash
cd frontend
npm install        # one-time: installs react, vite, tailwind, axios, lucide
npm run dev        # starts the app on http://localhost:5173
```

### Step 3 — Open the App

Open **http://localhost:5173** in your browser. That's it. 🎉

> **How they talk to each other:** the React app calls relative URLs like
> `/api/transactions`. The Vite dev server **proxies** those calls to the
> backend on port `5000` (configured in `frontend/vite.config.js`), so you
> don't deal with CORS or hard-coded URLs.

### Common issues

| Problem                                   | Fix                                                        |
| ----------------------------------------- | ---------------------------------------------------------- |
| "Could not load transactions" in the UI   | The backend isn't running — start Terminal 1 first.        |
| Port 5000 already in use                  | Run with a different port: `PORT=5001 npm run dev`.        |
| Changes to data not showing               | The data lives in `backend/data/transactions.json`; refresh. |

---

## 📡 API Documentation

### `GET /api/transactions`

Returns all transactions and the computed analytics.

**Response `200`**

```json
{
  "transactions": [
    {
      "id": 1,
      "message": "Paid Rs.250 to Zomato",
      "amount": -250,
      "date": "2026-06-28",
      "category": "Food",
      "type": "Expense",
      "expectedSavings": 0
    }
  ],
  "analytics": {
    "totalIncome": 74560,
    "totalExpense": 18342,
    "netBalance": 56218,
    "transactionCount": 19,
    "categoryTotals": { "Food": 1030, "Travel": 645 },
    "categoryPercentages": { "Food": 1.11, "Travel": 0.69 },
    "mostUsedCategory": "Travel",
    "highestExpense": { "id": 17 },
    "highestIncome": { "id": 10 }
  }
}
```

### `POST /api/transactions`

Adds a new transaction (income or expense) and persists it to the JSON file.
The amount may be positive (income) or negative (expense). The category is
auto-detected from the message unless a valid `category` is supplied.

**Body**

```json
{ "message": "Paid Rs.250 to Zomato", "amount": -250, "date": "2026-06-28", "category": "Food" }
```

`date` and `category` are optional (`date` defaults to today, `category` is
auto-detected by the parser).

**Responses**

| Status | Meaning                                        |
| ------ | ---------------------------------------------- |
| `201`  | Created; returns `{ transactions, analytics }` |
| `400`  | Missing message or non-zero amount / invalid category |
| `500`  | Server error                                   |

### `PATCH /api/transactions/:id/category`

Updates a transaction's category and recomputes analytics.

**Body**

```json
{ "category": "Food" }
```

**Responses**

| Status | Meaning                                  |
| ------ | ---------------------------------------- |
| `200`  | Updated; returns `{ transactions, analytics }` |
| `400`  | Invalid category                         |
| `404`  | Transaction not found                    |
| `500`  | Server error                             |

### `DELETE /api/transactions/:id`

Removes a transaction from the JSON file and recomputes analytics.

**Responses**

| Status | Meaning                                        |
| ------ | ---------------------------------------------- |
| `200`  | Deleted; returns `{ transactions, analytics }` |
| `404`  | Transaction not found                          |
| `500`  | Server error                                   |

---

## 🧠 Business Rules

**Categorization keywords** (case-insensitive, first match wins, else
`Miscellaneous`):

| Category      | Keywords                                        |
| ------------- | ----------------------------------------------- |
| Food          | zomato, swiggy, dominos, pizza hut, kfc, mcdonald |
| Travel        | uber, ola, rapido, irctc                        |
| Salary        | salary, payroll, company, employer              |
| Shopping      | amazon, flipkart, myntra                        |
| Bills         | electricity, water, gas, recharge               |
| Entertainment | netflix, prime, movie, bookmyshow               |

**Expected savings**: if `amount < 0` **and** the message contains any of
`cashback, reward, supercoins, points, phonepe cashback, gpay cashback,
amazon pay reward`, then `expectedSavings = round(5% of |amount|, 2)`.

---

## 🖼️ Screenshots

_Add screenshots here after running the app:_

- `screenshots/dashboard.png` — full dashboard
- `screenshots/transactions.png` — transaction feed with savings badge

---

## 🔮 Future Improvements

- Persist manual category overrides separately from auto-categorization.
- Swap the JSON store for a real database (SQLite/Mongo) behind the same
  service interface.
- Date-range filtering and monthly trend charts.
- Unit tests for the services (parser, savings, analytics).
- Authentication and multi-user support.

---

## 🗂️ Suggested Git Commits

```
1.  Initial project setup
2.  Backend Express setup
3.  Transaction parser service
4.  Savings service
5.  Analytics service
6.  REST APIs (routes + controller)
7.  Sample transaction data
8.  Frontend setup (Vite + Tailwind)
9.  Dashboard layout & header
10. Analytics cards & category progress
11. Transaction cards & list
12. Category dropdown & savings badge
13. Search, filter & sort
14. Loading/empty/error states
15. README & final cleanup
```

---

Built with React 19, Vite, TailwindCSS, Axios, Node.js & Express.