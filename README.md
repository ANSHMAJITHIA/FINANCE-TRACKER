# 🧾 SpendFlow — Advanced Personal Finance & Budget Tracker

[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20TailwindCSS-blue)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-MongoDB%20%2B%20Mongoose-emerald)](https://www.mongodb.com/)
[![Charts](https://img.shields.io/badge/Data%20Viz-Recharts-indigo)](https://recharts.org/)
[![Auth](https://img.shields.io/badge/Auth-JWT%20%2B%20Bcrypt-orange)](https://jwt.io/)

SpendFlow is an **enterprise-grade personal finance and wealth tracker** built with the modern MERN stack (MongoDB, Express, React, Node.js), Tailwind CSS, and Recharts. It empowers users to monitor income/expense streams, manage monthly category budgets with automated warning alerts, establish financial goals, and view visual analytics.

---

## 🎯 Key Features

### 1. 🔐 Secure Authentication & Personal Profile
- **JWT (JSON Web Token)** authentication with hashed passwords (`bcryptjs`).
- Complete registration, login, and protected route access.
- **1-Click Demo Login**: Immediate evaluation access without typing credentials (`demo@financetracker.com` / `demo123`).
- Multi-currency support: `$` USD, `€` EUR, `£` GBP, `₹` INR, `¥` JPY, `CA$` CAD, `A$` AUD, `S$` SGD, `AED`.
- Customizable monthly budget limits and yearly savings goals.

### 2. 💸 Advanced Transaction Management
- Categorized recording: **Income**, **Expenses**, and **Investments**.
- Standardized categories with color indicators and Lucide iconography.
- Multi-field filtering: Search query, category filter, transaction type, date range picker (`startDate` / `endDate`).
- Sort by date or amount with pagination controls.
- **Bulk CSV / JSON Export**: Download records directly for external spreadsheet analysis.
- **CSV Import Wizard**: Parse and preview CSV columns with one-click bulk ingestion.

### 3. 📊 Interactive Visual Analytics (Recharts)
- **6-Month Cash Flow Trends (Bar Chart)**: Dual-bar comparison of monthly earnings vs spending.
- **Category Expense Distribution (Donut / Pie Chart)**: Interactive segment highlighting with percentage breakdowns.
- **Daily Spending Velocity (Area Chart)**: Smooth cumulative spending curve tracking expenditure pacing throughout the month.
- **Top Categories Ranking**: Ranked distribution table showing highest expenditure shares.

### 4. 🎯 Budget Management & Real-time Alerts
- Set monthly spending ceilings per category.
- Automated calculation of **Spent vs Allocated** budget.
- Dynamic color indicators:
  - 🟢 **On Track** (`< 75%` utilized)
  - 🟡 **Warning Alert** (`75% - 99%` utilized)
  - 🔴 **Over Budget** (`>= 100%` utilized with pulse alert)
- **Budget vs Actual Comparison (Dual Bar Chart)**.

### 5. 💰 Financial Goals & Savings Tracker
- Set financial milestones (Emergency Fund, Vacation, Gadgets, Vehicle).
- Target date tracking, months remaining countdown, and monthly contribution calculator (`Save $X/mo to meet target`).
- Quick **"+ Contribute Funds"** modal with celebration **confetti animation** upon reaching 100%.

### 6. 🧠 50/30/20 Financial Equilibrium & Health Score
- Categorizes monthly spending into **Needs (50%)**, **Wants (30%)**, and **Savings / Investments (20%)**.
- Evaluates a **Financial Health Score** (0 to 100) with actionable recommendations.

### 7. 🌓 Dark / Light Mode & Modern Glassmorphism UI
- Responsive layout built with Tailwind CSS.
- Mobile drawer navigation sidebar.
- Toast notifications for create, edit, delete, and import operations.
- Built-in **Zero-Config Resilient Store**: Runs out of the box even without local MongoDB installation, while seamlessly connecting to MongoDB Atlas when `MONGODB_URI` is provided!

---

## 🧰 Tech Stack Architecture

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite | High-performance reactive client application |
| **Styling** | Tailwind CSS, Lucide React | Modern glassmorphism fintech design system |
| **Data Viz** | Recharts | Interactive SVG bar, pie, and area charts |
| **State** | Context API (Auth, Finance, Theme) | Unified global state management |
| **Backend** | Node.js, Express.js | High-throughput RESTful API |
| **Auth** | JWT, bcryptjs | Stateless token-based authentication |
| **Database** | MongoDB, Mongoose | Schema validation with dual fallback store |

---

## 📁 Project Directory Structure

```text
FINANCE TRACKER/
├── client/                      # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/          # Badge, StatCard, Modal, ConfirmDialog, Toast
│   │   │   ├── dashboard/       # MetricGrid, IncomeExpenseChart, CategoryPieChart, etc.
│   │   │   ├── transactions/    # TransactionModal, TransactionFilters, ImportExportModal
│   │   │   ├── budgets/         # BudgetList, BudgetModal, BudgetComparisonChart
│   │   │   ├── goals/           # GoalList, GoalModal, DepositModal
│   │   │   └── layout/          # Sidebar, Header, AppLayout, ProtectedRoute
│   │   ├── context/             # AuthContext, FinanceContext, ThemeContext
│   │   ├── pages/               # Dashboard, Transactions, Budgets, Goals, Analytics, Settings, Login, Register
│   │   ├── services/            # Axios API client with automatic JWT bearer interceptor
│   │   ├── utils/               # Currency, date formatters, category configurations
│   │   ├── App.jsx              # Routing & provider hierarchy
│   │   ├── main.jsx             # React DOM entry point
│   │   └── index.css            # Tailwind directives & glassmorphism classes
│   ├── tailwind.config.js       # Custom colors, glows, and dark mode
│   ├── vite.config.js           # Dev server with /api proxy to port 5000
│   └── package.json
│
├── server/                      # Node.js Express backend
│   ├── src/
│   │   ├── config/              # MongoDB connection manager (with graceful local fallback)
│   │   ├── controllers/         # Auth, Transaction, Budget, Goal, Analytics controllers
│   │   ├── middleware/          # JWT auth middleware, error handlers
│   │   ├── models/              # User, Transaction, Budget, Goal schemas
│   │   ├── routes/              # Express route routers
│   │   ├── utils/               # Realistic financial demo dataset generator
│   │   └── server.js            # Express server initialization & static asset hosting
│   ├── .env.example             # Environment template
│   └── package.json
│
├── package.json                 # Monorepo runner (concurrently start client + server)
└── README.md                    # Project documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher)

### 1. Run Both Client & Server Together (Recommended)
From the root directory:
```bash
npm run dev
```
- **Frontend App**: `http://localhost:3000` (or `http://localhost:5173`)
- **Backend API**: `http://localhost:5000`

---

### 2. Running Individually

#### Start Server:
```bash
cd server
npm run dev
```
*API runs on `http://localhost:5000`*

#### Start Client:
```bash
cd client
npm run dev
```
*Client runs on `http://localhost:3000`*

---

## 🔑 Demo Account Credentials

SpendFlow includes a pre-seeded showcase account packed with realistic transactions, monthly budgets, and savings goals across various categories:

- **Email**: `demo@financetracker.com`
- **Password**: `demo123`
- *Or simply click the **"1-Click Demo Evaluation Account"** button on the Login page.*

---

## ⚙️ Environment Variables

Create a `server/.env` file (or copy from `server/.env.example`):

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/finance_tracker
JWT_SECRET=supersecretfinancetrackerjwtkey2026_production_grade
```

> [!NOTE]
> If a local MongoDB instance is not running, SpendFlow automatically switches to its **zero-configuration resilient storage adapter** so you can immediately experience all features without setting up MongoDB first. To connect to **MongoDB Atlas**, simply paste your cloud URI in `MONGODB_URI`.

---

## 🌐 Production Deployment

### Option A: Full-Stack on Render / Railway
The server is configured to serve the production-built React client from `client/dist`:
1. Build the client: `cd client && npm run build`
2. Deploy the root repository to **Render** or **Railway**.
3. Set build command: `npm install && cd server && npm install && cd ../client && npm install && npm run build`
4. Set start command: `node server/src/server.js`
5. Configure environment variables (`MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`).

### Option B: Split Deployment (Vercel + Render)
1. **Frontend (Vercel)**:
   - Root directory: `client`
   - Build command: `npm run build`
   - Output directory: `dist`
   - Set environment variable `VITE_API_URL` pointing to your deployed backend URL.
2. **Backend (Render / Railway)**:
   - Root directory: `server`
   - Start command: `node src/server.js`
   - Configure `MONGODB_URI` and `JWT_SECRET`.

---

## 📜 License
MIT License. Built for modern financial wellness and intelligent portfolio management.
