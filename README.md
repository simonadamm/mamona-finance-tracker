# Personal Finance AI

Personal Finance AI is a portfolio-oriented web application for tracking, analyzing, and understanding personal finances using AI, machine learning, statistical methods, and traditional software engineering.

The primary goal of the project is not to build a production-ready fintech product, but to demonstrate practical AI Engineering skills through a realistic end-to-end application.

The system combines:

- natural-language financial data input,
- structured financial data extraction,
- financial analytics,
- machine learning,
- statistical analysis,
- LLM agents and tool calling,
- forecasting,
- anomaly detection,
- interactive dashboards.

---

# 1. Core Idea

The application allows users to manually track their personal finances.

Unlike traditional finance applications, the primary input method is natural language.

For example:

> "I spent 18.20 EUR on groceries yesterday."

The system should transform this input into structured data such as:

```json
{
  "type": "expense",
  "amount": 18.20,
  "currency": "EUR",
  "category": "groceries",
  "date": "2026-10-05",
  "description": "Groceries"
}
```

Another example:

> "I received my salary today, 3200 EUR."

could become:

```json
{
  "type": "income",
  "amount": 3200,
  "currency": "EUR",
  "category": "salary",
  "date": "2026-10-06"
}
```

The extracted information is validated and persisted in the database.

Traditional forms may also be provided as an alternative input method and for editing existing data.

---

# 2. Important Product Assumptions

This project currently DOES NOT assume direct integration with:

- bank accounts,
- PSD2/Open Banking,
- Apple Wallet,
- Google Wallet,
- credit cards,
- payment providers.

Financial information is primarily provided manually by the user.

Therefore, the application must not assume that it knows information that the user has never provided.

For example, given:

> "I spent 40 EUR on groceries."

the application may know:

```text
amount = 40 EUR
category = groceries
```

but it must NOT invent:

```text
merchant = Lidl
```

unless the user explicitly provided this information.

Missing information should remain unknown/null rather than being hallucinated.

---

# 3. Financial Data Input

The application may support three input mechanisms.

## Natural Language Input

Primary AI-oriented input method.

Example:

```text
"I spent 24 EUR on dinner yesterday."
```

The system extracts structured financial information.

Potential intents include:

```text
transaction
income
subscription
budget
savings_goal
```

Example:

```text
"Netflix costs me 13.99 EUR every month."
```

may create a recurring payment.

Example:

```text
"I want to spend at most 400 EUR per month on groceries."
```

may create a budget.

Example:

```text
"I want to save 5000 EUR for a vacation."
```

may create a savings goal.

---

## Manual Forms

Users should also be able to manually:

- create transactions,
- edit transactions,
- create budgets,
- create recurring payments,
- create savings goals.

This acts as both an alternative input mechanism and a correction mechanism for AI-generated structured data.

---

## CSV Import

CSV import may eventually be supported as an optional bulk-data feature.

This does NOT require connection to a real bank.

CSV files may contain synthetic, public, or manually prepared transaction data.

---

# 4. Feature Stack

The planned feature stack is:

```text
PERSONAL FINANCE AI
│
├── Finance
│   ├── Transactions
│   ├── Categories
│   ├── Budgets
│   ├── Savings Goals
│   └── Recurring Payments
│
├── Analytics
│   ├── Cash Flow
│   ├── Spending Trends
│   ├── Category Analysis
│   └── Financial KPIs
│
├── ML
│   ├── Spending Forecasting
│   └── Anomaly Detection
│
├── AI
│   ├── Transaction / Input Classification
│   ├── Financial Copilot
│   └── Automated Insights
│
└── Simulation
    └── What-if Scenarios
```

---

# 5. Finance Features

## Transactions

Transactions represent individual financial events.

Examples:

```text
expense
income
```

A transaction may contain:

```text
amount
currency
category
date
description
optional merchant
```

Merchant information must only exist if explicitly provided or otherwise reliably available.

---

## Categories

Transactions are assigned to financial categories.

Example categories:

```text
Groceries
Restaurants
Transport
Housing
Entertainment
Shopping
Health
Subscriptions
Salary
Other
```

Categories are used throughout analytics, budgeting, forecasting, and anomaly detection.

---

## Budgets

Users can define spending limits.

Example:

```text
Groceries
Monthly budget: 500 EUR
```

The system compares actual spending against the configured budget.

Example UI:

```text
Groceries

Budget:      500 EUR
Spent:       312 EUR

████████████░░░░░░░
62%
```

Budget usage should generally be calculated from transactions rather than stored as duplicated financial state.

---

## Savings Goals

Users may define financial goals.

Example:

```text
Emergency Fund

Target:
10,000 EUR

Current:
6,200 EUR

Target date:
December 2027
```

The application tracks progress and may later combine savings goals with forecasting and simulations.

---

## Recurring Payments

Recurring payments are manually declared by the user.

Example:

```text
Netflix
13.99 EUR
monthly
payment day: 15
```

Because the application does not automatically observe bank accounts, it should not claim to detect subscriptions that were never provided.

Recurring payments can be used by analytics and forecasting.

---

# 6. Analytics

## Cash Flow

Cash flow represents the relationship between income and expenses.

Basic concept:

```text
cash_flow = income - expenses
```

The dashboard should allow analysis across different time periods.

---

## Spending Trends

The application analyzes how spending changes over time.

Examples:

```text
Restaurant spending increased during the last three months.

Transport spending decreased compared with the previous month.

Total spending is trending upward.
```

These calculations should primarily come from deterministic analytics/statistical methods rather than LLM guesses.

---

## Category Analysis

The application analyzes spending distribution between categories.

Example:

```text
Groceries        28%
Housing          25%
Transport        14%
Entertainment    10%
Other            23%
```

Users should be able to inspect categories over different time periods.

---

## Financial KPIs

The dashboard may expose metrics such as:

```text
Total income
Total expenses
Net cash flow
Savings
Savings rate
Average monthly spending
Budget utilization
Largest spending category
```

---

# 7. Machine Learning

Machine learning should only be used where it provides meaningful value.

The project should avoid using ML simply for the purpose of claiming that ML is present.

Two main ML areas are currently planned.

---

## Spending Forecasting

The system should attempt to predict future spending based on historical data.

Example:

```text
Groceries

Budget:              500 EUR
Spent so far:         312 EUR
Predicted month-end:  548 EUR

Expected budget difference:
+48 EUR
```

Potential features may include:

```text
historical spending
category
day of month
day of week
month
recurring payments
income
recent spending velocity
```

Potential models may include:

```text
baseline statistical models
Linear Regression
Random Forest
XGBoost
LightGBM
time-series models
```

Model choice should be determined experimentally.

The project should compare ML against a simple baseline.

Evaluation may include:

```text
MAE
RMSE
MAPE
backtesting
```

Cold-start behavior must be considered because new users will have little historical data.

Synthetic or public datasets may be used for initial experimentation and model training.

---

## Anomaly Detection

The application may detect transactions that differ significantly from the user's historical behavior.

Example:

```text
Typical restaurant transaction:
20-50 EUR

New transaction:
247 EUR

Anomaly score:
0.91

Result:
Potential unusual expense
```

Possible approaches:

```text
statistical thresholds
z-score
IQR
Isolation Forest
Local Outlier Factor
Autoencoder
```

The model should consider contextual information rather than simply marking every large transaction as anomalous.

Possible features include:

```text
amount
category
time
historical category behavior
transaction frequency
relative amount
```

---

# 8. AI Layer

## Structured Financial Input Extraction

AI is responsible for converting natural-language input into structured financial information.

Example:

```text
"I spent 27 EUR on dinner yesterday."
```

becomes:

```json
{
  "intent": "transaction",
  "type": "expense",
  "amount": 27,
  "currency": "EUR",
  "category": "restaurants",
  "date": "resolved-date"
}
```

The project currently plans to use Jev for this type of classification/extraction rather than training a dedicated ML classifier.

The output must be validated before database persistence.

---

# 9. Financial Copilot

The Financial Copilot is an AI agent that allows users to query their financial data using natural language.

Example:

> "Why did I spend more money this month?"

The LLM should NOT receive arbitrary raw database access.

Instead, it should interact with controlled tools.

Conceptually:

```text
User
  │
  ▼
Financial Agent
  │
  ├── get_transactions()
  ├── calculate_spending()
  ├── compare_periods()
  ├── get_category_breakdown()
  ├── get_budget_status()
  ├── get_forecast()
  └── get_anomalies()
  │
  ▼
Structured results
  │
  ▼
LLM
  │
  ▼
Natural-language explanation
```

The LLM should primarily reason over verified structured results.

It should not invent financial values.

---

# 10. Automated Insights

The system may automatically identify noteworthy patterns and present them on the dashboard.

Examples:

```text
Restaurant spending increased 24% compared with last month.

You have used 87% of your entertainment budget.

Your current spending trajectory suggests that you may exceed
your groceries budget by approximately 48 EUR.

A 247 EUR restaurant transaction is unusually high compared
with your historical spending.
```

Whenever possible:

```text
analytics / ML
        ↓
structured result
        ↓
LLM explanation
```

should be preferred over:

```text
raw transactions
        ↓
LLM guessing patterns
```

---

# 11. What-if Simulation

Users should be able to simulate financial decisions without modifying their real data.

Example:

> "What if I reduce restaurant spending by 100 EUR per month?"

The system may calculate the effect after:

```text
3 months
6 months
12 months
24 months
```

Example:

```text
Current expected savings after 12 months:
3,800 EUR

Scenario:
Reduce restaurant spending by 100 EUR/month

Expected savings:
5,000 EUR

Difference:
+1,200 EUR
```

The simulation should primarily rely on deterministic calculations or statistical models.

An LLM may be used as the natural-language interface to the simulation engine.

---

# 12. Intelligence Architecture

The current planned structure is approximately:

```text
intelligence/
│
├── agents/
│   └── subagents/
│
├── tools/
│
├── ml/
│   ├── models/
│   ├── training/
│   └── artifacts/
│
├── statistics/
│
├── pipelines/
│   ├── preprocessing/
│   └── inference/
│
├── prompts/
│
├── evaluation/
│
├── experiments/
│
└── utils/
```

Responsibilities:

### `agents/`

Contains agent orchestration and decision-making logic.

Agents decide which tools should be called.

Agents should not contain low-level analytics implementations.

### `tools/`

Contains controlled capabilities exposed to agents.

Examples:

```text
get_transactions
calculate_spending
compare_periods
get_budget_status
predict_spending
detect_anomalies
run_what_if_scenario
```

A tool may internally call:

```text
database queries
ML models
statistical models
Jev
business logic
```

The agent should not need to know how a tool is internally implemented.

### `ml/`

Contains machine-learning-related code.

Potential structure:

```text
ml/
├── models/
├── training/
└── artifacts/
```

`artifacts/` may contain:

```text
trained model weights
scalers
encoders
model configuration
other inference artifacts
```

### `statistics/`

Contains statistical analysis used by the application.

Examples:

```text
moving averages
z-scores
IQR
trend calculations
descriptive statistics
spending comparisons
```

### `pipelines/`

Contains reusable preprocessing and inference pipelines.

### `prompts/`

Contains LLM prompts and agent instructions.

### `evaluation/`

Contains evaluation logic for:

```text
ML models
LLM outputs
agent behavior
structured extraction
```

### `experiments/`

Contains experimental work that has not yet become part of the production application.

---

# 13. High-Level System Architecture

Conceptually:

```text
                     ┌────────────────────┐
                     │      Frontend      │
                     │                    │
                     │ Dashboard / Chat   │
                     └─────────┬──────────┘
                               │
                               ▼
                     ┌────────────────────┐
                     │      Backend       │
                     │                    │
                     │ API / Validation   │
                     │ Business Logic     │
                     └──────┬──────┬──────┘
                            │      │
                  ┌─────────┘      └──────────┐
                  ▼                           ▼
          ┌──────────────┐            ┌──────────────┐
          │  PostgreSQL  │            │ Intelligence │
          └──────────────┘            └───────┬──────┘
                                              │
                        ┌─────────────────────┼─────────────────┐
                        ▼                     ▼                 ▼
                      Agents                  ML            Statistics
                        │
                        ▼
                      Tools
                        │
               ┌────────┼────────┐
               ▼        ▼        ▼
              DB       ML     Analytics
```

---

# 14. Database Direction

The database should be centered around the user.

Conceptually:

```text
users
│
├── transactions
├── budgets
├── savings_goals
├── recurring_payments
├── forecasts
└── ai_conversations
```

The exact schema should evolve alongside implementation.

Important principle:

Financial facts that can be derived from transactions should generally not be duplicated unnecessarily.

For example:

```text
monthly_spending
budget_used
category_total
```

should normally be calculated from transactions rather than treated as independent sources of truth.

---

# 15. Data Reliability Rules

This project should distinguish between:

```text
known data
derived data
predicted data
AI-generated explanations
```

Example:

```text
User entered:
"I spent 50 EUR on groceries."

Known:
amount = 50 EUR
category = groceries

Unknown:
merchant

Derived:
monthly grocery spending = 312 EUR

Predicted:
month-end grocery spending = 480 EUR

AI explanation:
"Groceries currently represent one of your largest spending categories."
```

These concepts should not be mixed.

The application should never present predicted or generated information as confirmed financial facts.

---

# 16. AI Engineering Goals

The purpose of the project is to demonstrate competence across multiple AI Engineering areas.

These include:

```text
LLM integration
structured outputs
agent orchestration
tool calling
prompt engineering
ML training
ML inference
model evaluation
time-series / forecasting
anomaly detection
statistical analysis
data pipelines
AI/backend integration
human validation
AI reliability
```

The project should favor technically justified solutions over adding AI unnecessarily.

A useful design principle is:

```text
Can deterministic code solve it reliably?
        │
       YES ──► use deterministic code
        │
        NO
        ▼
Can statistics / ML solve it?
        │
       YES ──► use statistics / ML
        │
        NO
        ▼
Does it require language understanding/reasoning?
        │
       YES ──► use LLM / agent
```

---

# 17. Portfolio Scope

This is a portfolio project.

It does NOT need to solve every problem expected from a commercial personal-finance platform.

Priority should be given to features that demonstrate:

1. good software architecture,
2. meaningful AI usage,
3. measurable ML performance,
4. correct separation between AI and deterministic logic,
5. production-style model inference,
6. evaluation and observability,
7. good UX,
8. clear technical decision-making.

A smaller number of deeply implemented features is preferable to many shallow features.

The most important AI-oriented features are currently:

```text
1. Natural-language financial input
2. Financial Copilot with tool calling
3. Spending forecasting
4. Anomaly detection
5. Automated financial insights
6. What-if simulation
```

---

# 18. Guiding Principle

The central application flow should remain:

```text
Natural-language input
        ↓
Structured financial data
        ↓
Validation
        ↓
Database
        ↓
Analytics / Statistics / ML
        ↓
Agent tools
        ↓
LLM interpretation
        ↓
Dashboard / Financial Copilot
```

The LLM is not the source of financial truth.

The database, deterministic calculations, statistical models, and ML models provide structured information.

The LLM acts primarily as an interface, reasoning layer, and explanation layer on top of those systems.