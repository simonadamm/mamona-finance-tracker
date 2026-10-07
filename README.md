# Personal Finance AI

Personal Finance AI is a portfolio-oriented web application for tracking, analyzing, forecasting, and understanding personal finances using:

- Large Language Models,
- AI agents,
- a custom lightweight agent harness,
- machine learning,
- statistical analysis,
- deterministic financial logic,
- modern backend and frontend engineering.

The goal is not to build a production fintech platform or compete with commercial banking applications.

The primary goal is to demonstrate practical **AI Engineering and AI Systems Engineering** skills through a realistic end-to-end application.

The project focuses especially on:

- natural-language financial input,
- structured data extraction,
- agentic workflows,
- controlled tool calling,
- agent runtime design,
- financial analytics,
- machine-learning inference,
- forecasting,
- anomaly detection,
- evaluation,
- observability,
- reliability,
- interactive dashboards.

---

# 1. Core Idea

The application allows users to manually track and analyze their personal finances.

Unlike traditional finance applications, one of the primary input methods is natural language.

For example:

> "I spent 18.20 EUR on groceries yesterday."

The system should transform the input into structured financial data:

```json
{
  "type": "expense",
  "amount": 18.20,
  "currency": "EUR",
  "category": "groceries",
  "date": "2026-10-06",
  "description": "Groceries"
}
```

Another example:

> "I received my salary today, 3200 EUR."

may become:

```json
{
  "type": "income",
  "amount": 3200,
  "currency": "EUR",
  "category": "salary",
  "date": "2026-10-07"
}
```

The extracted information should be:

```text
Natural-language input
        ↓
Structured extraction
        ↓
Schema validation
        ↓
Business validation
        ↓
Database
```

Traditional forms should also be available as an alternative input mechanism and as a way to correct AI-generated results.

---

# 2. Product Scope and Assumptions

This project does **not** currently assume direct integration with:

- bank accounts,
- PSD2 / Open Banking,
- Apple Wallet,
- Google Wallet,
- credit cards,
- payment providers.

Financial information is primarily provided manually by the user.

The application should therefore never assume knowledge that the user has not provided.

For example:

> "I spent 40 EUR on groceries."

The application may know:

```text
amount = 40 EUR
category = groceries
```

but it must not invent:

```text
merchant = Lidl
```

unless the user explicitly provided the merchant.

Unknown data should remain:

```text
NULL
```

rather than being inferred without sufficient evidence.

---

# 3. Main System Principle

The application separates four different types of information:

```text
Known data
Derived data
Predicted data
Generated explanations
```

Example:

```text
User input:
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

Generated explanation:
"Your grocery spending is currently above your recent average."
```

These concepts must not be mixed.

The system should never present model predictions or LLM-generated explanations as confirmed financial facts.

---

# 4. Financial Data Input

The application may support three input mechanisms.

## Natural-Language Input

The main AI-oriented input method.

Example:

```text
"I spent 24 EUR on dinner yesterday."
```

The system should identify the user's intent and extract structured information.

Supported intents may include:

```text
transaction
income
recurring_payment
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

Forms act as:

- an alternative to AI input,
- a correction mechanism,
- a fallback when the AI cannot confidently understand input.

---

## CSV Import

CSV import may eventually be supported as an optional bulk-data feature.

This does not require integration with a real bank.

CSV files may contain:

- synthetic data,
- public datasets,
- manually prepared transactions.

CSV import is optional and is not a core requirement of the project.

---

# 5. Feature Stack

The planned system is divided into the following areas:

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
│   ├── Structured Financial Input
│   ├── Financial Copilot
│   └── Automated Insights
│
├── Agent Infrastructure
│   └── AI Harness
│
└── Simulation
    └── What-if Scenarios
```

---

# 6. Finance Features

## Transactions

Transactions represent individual financial events.

Main transaction types:

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

Merchant information should only be stored when explicitly provided or reliably available.

Transactions are one of the main sources of truth for the system.

---

## Categories

Transactions are organized into financial categories.

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

Categories are used by:

- analytics,
- budgets,
- forecasting,
- anomaly detection,
- financial insights.

---

## Budgets

Users can define spending limits.

Example:

```text
Groceries

Monthly budget:
500 EUR
```

The system compares actual transaction data against the configured limit.

Example:

```text
Budget:      500 EUR
Spent:       312 EUR
Remaining:   188 EUR

████████████░░░░░░░
62%
```

Values such as:

```text
spent
remaining
percentage_used
```

should normally be derived dynamically from transactions instead of stored as independent financial facts.

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

Savings goals may later interact with:

- forecasting,
- what-if simulations,
- automated insights.

---

## Recurring Payments

Recurring payments are explicitly declared by the user.

Example:

```text
Netflix
13.99 EUR
monthly
payment day: 15
```

Because the application does not automatically observe bank accounts, it must not claim that it detected a subscription unless enough information exists.

Recurring payments can be used by:

- forecasting,
- cash-flow analysis,
- upcoming-payment views,
- simulations.

---

# 7. Analytics

Analytics should primarily rely on deterministic calculations and statistics.

LLMs should not be responsible for calculating financial metrics.

---

## Cash Flow

Cash flow represents the relationship between income and expenses.

```text
cash_flow = income - expenses
```

The dashboard should support multiple periods:

```text
week
month
quarter
year
custom range
```

---

## Spending Trends

The application analyzes how user spending changes over time.

Examples:

```text
Restaurant spending increased during the last three months.

Transport spending decreased compared with the previous month.

Total spending is trending upward.
```

Trend calculations should come from deterministic or statistical components.

An LLM may explain the result but should not calculate it independently.

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

Users should be able to compare category spending across different periods.

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

These values should be calculated by backend analytics.

---

# 8. Machine Learning

Machine learning should only be used where it provides measurable value.

The project should avoid using ML simply to claim that ML is present.

Two main ML problems are planned:

```text
Spending Forecasting
Anomaly Detection
```

---

# 9. Spending Forecasting

The system should predict future spending based on historical behavior.

Example:

```text
Groceries

Budget:              500 EUR
Spent so far:         312 EUR
Predicted month-end:  548 EUR

Expected difference:
+48 EUR
```

Possible features:

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

Potential approaches:

```text
Statistical baseline
Linear Regression
Random Forest
XGBoost
LightGBM
Time-series models
```

Model choice should be based on experiments rather than predetermined.

The ML model must be compared against a simple baseline.

Evaluation may include:

```text
MAE
RMSE
MAPE
time-series backtesting
```

Cold-start behavior should also be considered because new users will initially have very little financial history.

Synthetic or public data may therefore be used during model experimentation and training.

---

# 10. Anomaly Detection

The application should identify transactions that differ significantly from the user's historical behavior.

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

Potential approaches:

```text
statistical thresholds
z-score
IQR
Isolation Forest
Local Outlier Factor
Autoencoder
```

The final solution should be chosen experimentally.

Possible features:

```text
amount
category
time
historical category behavior
relative amount
transaction frequency
```

The system should avoid simply treating every large transaction as anomalous.

Anomaly results should remain model outputs rather than confirmed financial facts.

---

# 11. Structured Financial Input

AI is responsible for transforming natural-language input into structured financial data.

Example:

```text
"I spent 27 EUR on dinner yesterday."
```

may become:

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

The project currently plans to use Jev and/or an LLM for this type of extraction rather than training a dedicated ML classifier.

Structured output must always go through validation before persistence.

Conceptually:

```text
Natural language
      ↓
LLM / Jev
      ↓
Structured schema
      ↓
Validation
      ↓
Business rules
      ↓
Database
```

---

# 12. Financial Copilot

The Financial Copilot is an AI agent that allows users to query their financial information through natural language.

Example:

> "Why did I spend more money this month?"

The model should not receive unrestricted database access.

Instead, the agent should interact with controlled tools.

Conceptually:

```text
User
  │
  ▼
Financial Copilot
  │
  ▼
AI Harness
  │
  ├── get_transactions()
  ├── calculate_spending()
  ├── compare_periods()
  ├── get_category_breakdown()
  ├── get_budget_status()
  ├── get_financial_kpis()
  ├── predict_spending()
  ├── get_anomalies()
  └── run_what_if_scenario()
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

# 13. Automated Insights

The system may automatically identify noteworthy changes or patterns.

Examples:

```text
Restaurant spending increased 24% compared with last month.

You have used 87% of your entertainment budget.

Your current spending trajectory suggests that you may exceed
your groceries budget by approximately 48 EUR.

A 247 EUR restaurant transaction is unusually high compared
with your historical spending.
```

The preferred architecture is:

```text
Database / Analytics / ML
            ↓
     structured result
            ↓
      Insights Agent
            ↓
        AI Harness
            ↓
     LLM explanation
```

rather than:

```text
raw transactions
       ↓
LLM guesses patterns
```

---

# 14. What-if Simulation

Users should be able to simulate financial decisions without modifying real financial records.

Example:

> "What if I reduce restaurant spending by 100 EUR per month?"

Possible result:

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

The simulation engine should primarily use:

- deterministic calculations,
- financial business rules,
- statistics,
- optionally forecasting models.

The LLM may act as the natural-language interface to the simulator.

---

# 15. AI Harness

A central AI Engineering component of the project is a custom lightweight **AI Harness**.

The harness is infrastructure surrounding the agents and LLM.

Agents define **what they want to achieve**.

The harness controls **how agent execution happens**.

Conceptually:

```text
                  Agent
                    │
                    ▼
          ┌──────────────────┐
          │    AI Harness    │
          │                  │
          │ Runtime          │
          │ Tool Registry    │
          │ Tool Executor    │
          │ Context          │
          │ State            │
          │ Permissions      │
          │ Retries          │
          │ Tracing          │
          │ Evaluation hooks │
          └────────┬─────────┘
                   │
          ┌────────┼───────────┐
          ▼        ▼           ▼
         DB       ML       Statistics
```

The goal is not to build a general-purpose competitor to LangGraph or other agent frameworks.

The harness should remain small, understandable, testable, and directly useful to this application.

---

# 16. Harness Responsibilities

## Agent Runtime

The runtime controls the agent execution loop.

Typical execution:

```text
User request
    ↓
LLM call
    ↓
Tool request
    ↓
Tool execution
    ↓
Tool result
    ↓
LLM call
    ↓
...
    ↓
Final answer
```

The runtime should support concepts such as:

```text
max_steps
run timeout
termination conditions
tool call limits
controlled errors
```

This prevents agents from executing indefinitely.

---

## Tool Registry

Tools exposed to agents should be registered centrally.

Example tools:

```text
get_transactions
get_category_spending
compare_periods
get_budget_status
get_financial_kpis
predict_spending
detect_anomalies
run_what_if_scenario
```

A tool definition may include:

```text
name
description
input schema
output schema
permissions
handler
timeout
```

Agents should only see tools they are allowed to use.

---

## Tool Executor

The executor is responsible for safely executing tool calls.

Responsibilities may include:

```text
argument validation
schema validation
authorization
execution
timeouts
error handling
response normalization
tracing
```

The LLM must never directly execute database queries.

---

## Context Management

The harness controls what information is sent to the model.

Possible context:

```text
system instructions
conversation history
current request
tool definitions
tool results
relevant financial state
```

The harness should avoid blindly sending:

```text
entire database
entire conversation history
unnecessary previous tool outputs
```

Context management may later include:

```text
history truncation
summarization
token budgeting
tool-result pruning
```

---

## State Management

Every agent run should have structured state.

Example:

```text
run_id
trace_id
user_id
agent
current_step
tool_calls
conversation_id
created_at
```

Conversation state and temporary execution state should remain conceptually separate.

---

## Permissions and Security

The harness should enforce access control.

For example, an agent tool may expose:

```text
get_transactions(start_date, end_date)
```

rather than:

```text
get_transactions(user_id, start_date, end_date)
```

The authenticated `user_id` should be injected internally by trusted backend code.

The LLM should not be able to request arbitrary user IDs.

Conceptually:

```text
JWT / Session
     ↓
Authenticated User
     ↓
Harness Context
     ↓
Tool Executor
     ↓
Database
```

---

## Retries and Error Handling

The harness should distinguish between:

```text
temporary failure
invalid arguments
tool failure
model failure
authorization failure
business validation failure
```

Retry should only be used when appropriate.

Example:

```text
Tool timeout
     ↓
Retry once
     ↓
Still fails
     ↓
Controlled error returned to agent
```

Infinite retries must not be allowed.

---

## Tracing and Observability

Each agent execution should produce a trace.

Example:

```text
trace_id: abc123

User request
    ↓
LLM call
    latency: 680 ms
    input tokens: 620
    output tokens: 140
    ↓
Tool call
    get_category_spending
    ↓
Tool execution
    latency: 31 ms
    ↓
Tool result
    ↓
LLM call
    latency: 430 ms
    ↓
Final response

Total latency: 1.14 s
LLM calls: 2
Tool calls: 1
Total tokens: 1,420
```

Useful metrics include:

```text
latency
token usage
estimated cost
number of model calls
number of tool calls
tool failures
retries
agent steps
```

---

# 17. Agent Evaluation

Agent behavior should be evaluated rather than judged only manually.

Example evaluation case:

```text
Question:
"How much did I spend on groceries last month?"

Expected tool:
get_category_spending

Expected arguments:
category = groceries
period = previous_month

Must not:
invent transaction values
```

Potential metrics:

```text
tool selection accuracy
tool argument accuracy
answer correctness
hallucination rate
average number of steps
latency
token usage
cost
task completion rate
```

Evaluation should include:

```text
happy paths
ambiguous requests
missing information
invalid inputs
tool failures
incorrect tool arguments
adversarial inputs
```

Agent evaluation belongs to the harness/evaluation layer rather than the frontend.

---

# 18. Agents

The harness may support multiple application-specific agents.

Potential agents:

```text
Financial Copilot Agent
Automated Insights Agent
Input / Classification Agent
```

Not every feature needs to become a separate agent.

Agents should only be introduced when they provide a meaningful separation of responsibility.

---

## Financial Copilot Agent

Responsible for answering user questions about their finances.

Typical tools:

```text
get_transactions
compare_periods
get_category_spending
get_budget_status
get_financial_kpis
predict_spending
get_anomalies
run_what_if_scenario
```

---

## Automated Insights Agent

Responsible for turning structured financial signals into understandable insights.

Input may come from:

```text
analytics
statistics
forecasting
anomaly detection
budget monitoring
```

It should not independently calculate financial values using the LLM.

---

## Input Agent

An optional agent responsible for interpreting natural-language financial commands.

Examples:

```text
Add transaction
Create budget
Create recurring payment
Create savings goal
```

This may remain a simpler structured-extraction pipeline rather than a full autonomous agent if an agent architecture is unnecessary.

---

# 19. Intelligence Architecture

The planned intelligence layer is approximately:

```text
intelligence/
│
├── harness/
│   ├── runtime.py
│   ├── context.py
│   ├── state.py
│   ├── tool_registry.py
│   ├── tool_executor.py
│   ├── permissions.py
│   ├── tracing.py
│   └── errors.py
│
├── agents/
│   ├── financial_copilot.py
│   ├── insights_agent.py
│   └── subagents/
│
├── tools/
│   ├── transactions.py
│   ├── budgets.py
│   ├── analytics.py
│   ├── forecasting.py
│   ├── anomalies.py
│   └── simulation.py
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
│   ├── agents/
│   ├── ml/
│   └── extraction/
│
├── experiments/
│
└── utils/
```

---

# 20. Responsibility Boundaries

## `harness/`

Contains reusable infrastructure controlling agent execution.

It should not contain finance-specific business logic.

Examples:

```text
agent execution loop
tool execution
context handling
state
permissions
retries
tracing
```

---

## `agents/`

Contains application-specific agent behavior.

Agents decide:

```text
what information is needed
which tools should be used
when enough information has been collected
how structured results should be interpreted
```

Agents should not implement database queries or ML algorithms directly.

---

## `tools/`

Contains controlled capabilities available to agents.

Tools provide a stable boundary between the LLM and application internals.

A tool may internally use:

```text
database
backend services
statistics
ML models
Jev
deterministic logic
```

Example:

```text
Financial Copilot
       ↓
predict_spending()
       ↓
forecasting inference pipeline
       ↓
ML model
```

The agent does not need to know how the model is implemented.

---

## `ml/`

Contains machine-learning-related code.

Example structure:

```text
ml/
├── models/
├── training/
└── artifacts/
```

Artifacts may contain:

```text
trained model weights
scalers
encoders
model configuration
metadata
```

---

## `statistics/`

Contains statistical and deterministic analytical methods.

Examples:

```text
moving averages
z-scores
IQR
trend calculations
descriptive statistics
period comparisons
spending distributions
```

---

## `pipelines/`

Contains reusable preprocessing and inference pipelines.

Examples:

```text
transaction preprocessing
forecast preprocessing
forecast inference
anomaly inference
```

---

## `prompts/`

Contains:

```text
system prompts
agent instructions
structured extraction prompts
insight-generation prompts
```

Prompts should be version-controlled.

---

## `evaluation/`

Contains evaluation logic for:

```text
ML models
agent behavior
tool selection
tool arguments
LLM outputs
structured extraction
```

---

## `experiments/`

Contains experimental work that is not yet part of the application.

Experiments should not become production dependencies accidentally.

---

# 21. High-Level System Architecture

Conceptually:

```text
                   ┌──────────────────────┐
                   │       Frontend       │
                   │                      │
                   │ Dashboard / Chat /   │
                   │ Forms / Analytics    │
                   └──────────┬───────────┘
                              │
                              ▼
                   ┌──────────────────────┐
                   │       FastAPI        │
                   │                      │
                   │ Auth / Validation /  │
                   │ Business Logic       │
                   └───────┬───────┬──────┘
                           │       │
                           │       │
                           ▼       ▼
                  ┌───────────┐   ┌────────────────────┐
                  │PostgreSQL │   │   Intelligence     │
                  └───────────┘   │                    │
                                  │   AI Harness       │
                                  └─────────┬──────────┘
                                            │
                              ┌─────────────┼──────────────┐
                              ▼             ▼              ▼
                           Agents         Tools           Evals
                                            │
                              ┌─────────────┼──────────────┐
                              ▼             ▼              ▼
                             DB             ML         Statistics
                                            │
                                      ┌─────┴─────┐
                                      ▼           ▼
                                 Forecasting   Anomalies
```

---

# 22. Agent Execution Architecture

A typical Financial Copilot request should follow this path:

```text
User
 ↓
Frontend
 ↓
FastAPI
 ↓
Authenticated request context
 ↓
Financial Copilot Agent
 ↓
AI Harness
 ↓
LLM
 ↓
Tool selection
 ↓
Harness validates call
 ↓
Tool Executor
 ↓
Backend / DB / ML / Statistics
 ↓
Structured tool result
 ↓
Harness updates context
 ↓
LLM
 ↓
Final answer
 ↓
Trace + evaluation data
```

This means the LLM does not directly control infrastructure.

The harness acts as the execution boundary between the model and the application.

---

# 23. Database Direction

The database is centered around the user.

Conceptually:

```text
users
│
├── transactions
├── budgets
├── savings_goals
├── recurring_payments
├── forecasts
├── anomaly_results
└── ai_conversations
      └── ai_messages
```

The exact schema should evolve alongside implementation.

Financial values that can be derived from primary data should generally not be duplicated.

Examples:

```text
monthly_spending
budget_used
category_total
cash_flow
```

should normally be calculated from transactions.

---

# 24. Data Reliability Rules

The project follows several reliability rules.

## Rule 1 — Never invent unknown financial facts

If merchant information is unknown:

```text
merchant = NULL
```

not:

```text
merchant = guessed value
```

---

## Rule 2 — LLMs do not calculate authoritative financial metrics

Bad:

```text
Transactions
     ↓
LLM
     ↓
"Your total spending was 812.44 EUR"
```

Preferred:

```text
Transactions
     ↓
SQL / analytics
     ↓
812.44 EUR
     ↓
LLM
     ↓
Explanation
```

---

## Rule 3 — Predictions are not facts

Forecast:

```text
Predicted spending:
548 EUR
```

must be clearly distinguishable from:

```text
Actual spending:
312 EUR
```

---

## Rule 4 — Tools are the boundary between agents and application data

Agents should not receive unrestricted:

```text
database access
filesystem access
arbitrary Python execution
user IDs
```

without explicit architectural justification.

---

## Rule 5 — Authenticated identity comes from trusted application state

The LLM should not choose the active user.

```text
Authentication
      ↓
Backend
      ↓
Harness Context
      ↓
Tools
```

---

# 25. Testing Strategy

The project should include several categories of tests.

## Backend

```text
unit tests
integration tests
API tests
database tests
authorization tests
```

## Tools

```text
input validation
permissions
correctness
failure handling
timeout behavior
```

## Harness

```text
control-loop termination
max-step handling
tool execution
retry logic
error propagation
context management
permissions
tracing
```

## Agents

```text
tool selection
argument generation
task completion
hallucination tests
ambiguous inputs
missing data
failure recovery
```

## ML

```text
baseline comparison
backtesting
MAE
RMSE
MAPE
anomaly evaluation
false positives
false negatives
```

---

# 26. Observability

The project should expose enough information to inspect AI behavior.

Important observability dimensions:

```text
agent runs
LLM calls
tool calls
latency
tokens
cost
errors
retries
ML model version
prompt version
```

A development/debug interface may later show complete traces.

Example:

```text
Trace #42

User:
"Why did I spend more in September?"

Agent:
FinancialCopilot

Step 1:
compare_periods()

Step 2:
get_category_spending()

Step 3:
get_anomalies()

Final answer:
...

Latency:
1.8 s

Tool calls:
3

LLM calls:
2
```

---

# 27. AI Engineering Goals

The project aims to demonstrate competence in:

```text
LLM integration
structured outputs
agent orchestration
agent runtime design
tool calling
tool execution
context management
state management
AI permissions
tracing
observability
agent evaluation
prompt engineering
ML training
ML inference
model evaluation
forecasting
anomaly detection
statistical analysis
data pipelines
AI/backend integration
human validation
AI reliability
Dockerized deployment
```

---

# 28. Technology Selection Principle

The project should not use AI unnecessarily.

Use the simplest reliable solution.

Conceptually:

```text
Can deterministic code solve the problem reliably?
        │
       YES
        │
        ▼
Use deterministic code
        │
        NO
        ▼
Can statistics solve it?
        │
       YES
        │
        ▼
Use statistics
        │
        NO
        ▼
Does it require prediction from data?
        │
       YES
        │
        ▼
Use ML
        │
        NO
        ▼
Does it require language understanding,
tool orchestration or reasoning?
        │
       YES
        │
        ▼
Use LLM / Agent
```

Examples:

```text
Monthly total
→ SQL

Savings rate
→ deterministic calculation

Spending trend
→ statistics

Future spending
→ ML forecasting

Unusual transaction
→ statistics / ML

"Why did my spending increase?"
→ agent + tools + LLM explanation
```

---

# 29. Portfolio Scope

This is a portfolio project.

It does not need to solve every problem expected from a commercial fintech platform.

Priority should be given to features that demonstrate:

1. strong software architecture,
2. meaningful AI usage,
3. controlled agent execution,
4. measurable ML performance,
5. agent evaluation,
6. observability,
7. reliability,
8. correct separation of AI and deterministic logic,
9. production-style inference,
10. good UX,
11. clear technical decision-making.

A smaller number of deeply implemented features is preferable to a large number of shallow features.

---

# 30. Most Important Portfolio Features

The highest-priority AI Engineering features are:

```text
1. Natural-language financial input

2. Financial Copilot
   └── controlled tool calling through the harness

3. Custom lightweight AI Harness
   ├── runtime
   ├── tool registry
   ├── executor
   ├── context
   ├── permissions
   ├── retries
   └── tracing

4. Agent evaluation suite

5. Spending Forecasting

6. Anomaly Detection

7. Automated Financial Insights

8. What-if Simulation
```

These features should receive significantly more attention than optional application functionality.

---

# 31. Portfolio Story

The project should demonstrate more than:

> "I connected an LLM to a React application."

The intended technical story is:

> I built an end-to-end personal-finance AI system combining deterministic analytics, statistical methods, machine-learning models and LLM agents. I implemented a lightweight agent harness responsible for controlled tool execution, context and state management, permissions, retries, tracing and evaluation. The system uses specialized components based on the nature of the problem rather than treating an LLM as the solution to every task.

This distinction is important.

The Financial Copilot is an **application agent**.

The AI Harness is the **runtime and infrastructure used to execute the agent reliably**.

---

# 32. Guiding Architecture

The central application flow should remain:

```text
Natural-language input
        ↓
Structured extraction
        ↓
Validation
        ↓
Database
        ↓
Analytics / Statistics / ML
        ↓
Tools
        ↓
AI Harness
        ↓
Agent
        ↓
LLM interpretation
        ↓
Dashboard / Financial Copilot
```

For conversational queries:

```text
User
 ↓
Agent
 ↓
Harness
 ↓
LLM
 ↓
Tool request
 ↓
Harness validation
 ↓
Tool
 ↓
DB / Analytics / ML
 ↓
Structured result
 ↓
Harness
 ↓
LLM
 ↓
Final answer
```

The LLM is not the source of financial truth.

The database, deterministic calculations, statistical methods and ML models produce the authoritative or computational results.

The harness controls interaction between the model and those systems.

The agent decides how to solve the user's task.

The LLM acts primarily as:

- a natural-language interface,
- a reasoning layer,
- a tool-selection mechanism,
- an explanation layer.

---

# 33. Final Design Principle

The project should optimize for:

```text
correctness
    >
reliability
    >
observability
    >
measurability
    >
complexity
```

AI should not be added merely because it is possible.

The strongest version of this project is not the one with the largest number of agents or models.

It is the version where every component has a clear responsibility, its behavior can be inspected and evaluated, and the complete system can be explained from user input to final output.