# Mamona

### A monthly budget tracker with a financial AI copilot

Mamona brings transaction tracking, monthly analytics and Savings goals into one workspace. Add an expense in plain language, review the extracted details before saving, and ask a copilot questions about your recorded finances or current financial information.

I built this project to explore the engineering around a tool-using agent: structured inputs, deterministic financial calculations, controlled data access, conversation routing, tracing and evaluation against recorded evidence.

**Python · FastAPI · PostgreSQL · React / TypeScript · LangGraph · Ollama · Jev · LangSmith**

![Mamona overview with monthly income, expenses, remaining budget and Savings](docs/assets/overview.png)

[Features](#features) · [Architecture](#architecture-and-ai-harness) · [Evaluation](#evaluation) · [Run locally](#run-locally) · [Limitations](#current-limitations)

## Features

### Natural-language transaction input

Describe a transaction instead of completing every field manually:

> Yesterday I spent 24.50 EUR on dinner at Bella Italia.

Jev checks whether the input describes a transaction and classifies its category and type. A local LLM extracts the amount, currency, date, merchant and a short description into Pydantic models. Relative dates are resolved against the current date in `Europe/Berlin`.

The result is a **draft**, not an automatic database write. The user reviews and can edit the form, completes missing fields, and explicitly confirms the save. Inputs below the relevance threshold return an empty draft.

![AI Input: describe a transaction, review the recognized fields and save](docs/assets/ai-input.gif)

### Transactions and manual entry

- Create transactions manually or from an AI-generated draft.
- Edit and delete existing transactions.
- Browse the 50 most recent transactions or filter by year, month and category.
- Record positive amounts with a separate transaction type and three-letter currency code.
- Keep merchant names, descriptions and transaction dates alongside each record.

The schema currently accepts `income`, `expense` and `transfer`. Transfers are excluded from income/expense analytics. The supplied synthetic dataset contains only income and expenses.

### Overview and monthly analysis

The Overview page shows the current month; Analysis lets the user select another month. Both show income, expenses, monthly balance, net Savings transfers and the remaining budget after Savings. Category charts and average daily expenses provide more detail. The Overview also includes a historical chart with 6-, 12-, 24- and 60-month views.

These values come from deterministic Python/SQL calculations, not LLM-generated arithmetic.

![Overview and Analysis: inspect monthly cash flow and category spending](docs/assets/overview.gif)

### Savings and goals

Record a Savings deposit from Overview or Analysis, then manage the accumulated pool on the Savings page:

- See total Savings, money assigned to goals and the unassigned amount.
- Create a goal with a target amount and target date.
- Assign existing Savings to a goal or release money back to the available pool.
- Follow goal progress and browse paginated Savings movements.

Assigning money to a goal reserves existing Savings; it does not create another expense or another deposit. Allocation limits and goal updates are handled within database transactions. The API currently creates deposits; withdrawal totals are supported in calculations, but a withdrawal-entry flow is not implemented.

### Financial Copilot

Ask questions such as:

```text
How much did I spend on groceries in August 2025?
Show my five most recent expenses from September 2026.
Compare my income and expenses in July 2026 and August 2026.
Search the web for the latest euro-area inflation rate and cite official sources.
```

The copilot selects from four registered tools, uses their results to answer, and supports follow-up questions within the conversation. Ambiguous requests can be routed to clarification; unrelated requests receive a brief scope response.

The chat renders Markdown and tables in a fixed-height conversation panel. The beginning of a new answer stays visible, with history scrolling inside the panel. Starting a new chat or leaving the page resets the browser's conversation state.

![Financial Copilot: ask questions about recorded finances and follow up](docs/assets/copilot.gif)

The recordings use fictional demo data. Their figures may include manual demo entries in addition to the checked-in dataset. [Media details](docs/assets/README.md).

## Financial rules

Mamona tracks monthly budgets rather than a bank-account balance. Each month is independent; unallocated money is not carried forward as next month's income. Savings, however, accumulate across months.

```text
Monthly balance          = income − expenses
Net Savings              = Savings deposits − Savings withdrawals
Remaining monthly budget = monthly balance − net Savings
Available Savings        = total Savings − amounts assigned to goals
```

Savings deposits are not expenses, and the remaining monthly budget can be negative. A deposit can be recorded during the month without being limited to the current surplus.

Analytics use the user's configured currency and exclude other currencies, transaction transfers and future-dated entries. Other-currency transactions may still be stored and retrieved; automatic conversion is not implemented. Current-month statistics stop at today in `Europe/Berlin`.

## Tech stack and models

| Area | Technology and role |
| --- | --- |
| Backend | Python 3.11+, FastAPI and Pydantic request/response validation |
| Persistence | PostgreSQL 17, SQLAlchemy, psycopg and Alembic migrations |
| Frontend | React 19, TypeScript 6, Vite 8, React Router and Material UI |
| Agent runtime | LangChain `create_agent`, structured tools and LangGraph workflow/checkpointing |
| Local inference | Ollama with `qwen3.5:9b` |
| Classification and routing | Jev through `typesafe-sdk`, using `Choice` and `Noul` |
| External retrieval | Tavily web search |
| Observability / LLMOps | LangSmith tracing for request flow, model calls, tool inputs/outputs, timing and failures |
| Evaluation | Python callback collector, deterministic tool checks, Jev answer judging and manual review |
| Development | uv and `uv.lock`, npm and `package-lock.json`, Docker Compose, ESLint and unittest |

LangSmith is the project's tracing and debugging layer. The evaluation runner and result files live in this repository; a hosted evaluation pipeline, model registry and automated deployment pipeline are not implemented.

### Inference configuration

| Component | Model / service | Context window | Temperature | Reasoning |
| --- | --- | --- | --- | --- |
| Financial Copilot | `qwen3.5:9b` via Ollama | 16,384 | 0.0 | Enabled |
| Transaction detail extraction | `qwen3.5:9b` via Ollama | 4,096 | 0.0 | Disabled |
| Clarification / out-of-scope responses | `qwen3.5:9b` via Ollama | 4,096 | 0.0 | Disabled |
| Routing, transaction classification and evaluation judging | Jev API | Service-managed | — | — |

The development machine is a MacBook Pro with an M5 Pro and 48 GB RAM. This is a reference environment, not a minimum hardware specification. Local response time depends on hardware, model loading, context length and generated output.

## Architecture and AI harness

### Application boundaries

```mermaid
flowchart LR
    UI[React application] --> API[FastAPI]
    API --> Services[Finance services]
    Services --> DB[(PostgreSQL)]
    API --> Draft[AI transaction draft]
    Draft --> Jev[Jev classification]
    Draft --> Ollama[Ollama extraction]
    API --> Harness[LangGraph Copilot workflow]
    Harness --> Tools[Registered tools]
    Tools --> Services
    Tools --> Web[Tavily web search]
    Harness -. Traces .-> Smith[LangSmith]
```

The UI calls FastAPI. Finance services validate business rules and access PostgreSQL through SQLAlchemy. Agent database tools wrap those same services, so the application and copilot share the calculation logic.

### Copilot workflow

```mermaid
flowchart TD
    Request[Question and optional thread UUID] --> Context[Server user context and conversation history]
    Context --> Router[Jev router]
    Router -->|financial| Agent[Financial Copilot]
    Router -->|clarification| Clarify[Single model response]
    Router -->|out_of_scope| Scope[Single model response]
    Agent --> Model[Local model]
    Model -->|tool calls| Execute[LangChain tool execution]
    Execute -->|tool results| Model
    Model -->|final answer| Response[Route, thread UUID and answer]
    Clarify --> Response
    Scope --> Response
```

The harness is a small application layer built on LangGraph and LangChain. Their runtime supplies the agent loop and tool execution; this project configures the routing, context, tool boundaries, memory, tracing and API integration.

| Responsibility | Current implementation |
| --- | --- |
| Routing | `financial`, `clarification` or `out_of_scope`, with conversation history available to the router |
| Identity context | Server-provided `UserContext` accessed inside tools through `ToolRuntime`; the model does not supply the user ID |
| Tool boundary | Four explicitly registered tools; database tools expose service functions rather than arbitrary SQL |
| Argument validation | Typed tool schemas plus service-level validation |
| Financial authority | Monthly totals and category aggregates calculated by application code |
| Date context | Current Berlin date supplied dynamically on financial-node invocation |
| Memory | `InMemorySaver`, keyed by user ID and thread UUID |
| Execution limit | `recursion_limit=30`, with API handling for a reached graph limit; not a dedicated tool-call or wall-clock budget |
| Errors | Validation and selected workflow errors mapped to API responses; comprehensive provider timeout/retry policies remain future work |
| Tracing | A `financial_copilot.request` root trace with workflow, model and tool activity |

The financial node retains the final assistant answer in the outer conversation history. Detailed tool activity remains visible in traces and evaluation callbacks.

### Registered tools

| Tool | Purpose | Important boundary |
| --- | --- | --- |
| `get_monthly_summary(year, month)` | Income, expenses, Savings, remaining budget and complete category totals for one month | Uses the user's currency and reports its date scope; comparisons need a call per month |
| `search_transactions(start_date, end_date, …)` | Individual records, optionally filtered by type and category | Maximum 50 records per page; includes `has_more` and `next_offset`; may include other currencies |
| `list_categories()` | Category names and UUIDs | Resolves identifiers for transaction filtering; unnecessary for category totals already in a summary |
| `web_search(query)` | Public financial and economic information | Returns titles, URLs and excerpts; source recency and release status still need verification |

The Copilot has no write tool and no arbitrary-SQL execution tool. AI-assisted transaction entry is a separate draft-and-confirm flow.

Prompt instructions ask the agent to keep private data out of web queries and treat retrieved text as evidence rather than instructions. These are behavioral controls, not a complete data-loss-prevention or prompt-injection defense.

### Observability and data flow

With tracing enabled, LangSmith helps inspect routing decisions, tool arguments/results, model activity, latency and errors. This made it possible to investigate unexpected retrieval choices and distinguish tool execution from answer-quality failures.

Ollama inference runs locally, but the full application is not offline: Jev receives classification inputs and router history, Tavily handles public web queries, and enabled LangSmith tracing can capture conversation and tool content. The evaluation judge also receives answers and recorded tool evidence. Demonstrations and checked-in evaluation artifacts use synthetic data.

## Evaluation

I ran three iterations of the same ten-question evaluation on October 31, 2026, using `qwen3.5:9b`, a 16,384-token context window, temperature 0.0 and reasoning enabled.

The dataset covers monthly totals, category totals/rankings, transaction retrieval, Savings semantics, month comparisons, clarification, out-of-scope requests and current-information search.

The evaluator combines:

1. **Deterministic tool checks:** compare executed tool names and call counts with expected calls.
2. **Jev judging:** rate answer correctness, completeness and relevance against expected context and captured tool evidence.
3. **Manual review:** inspect answers and traces, recalculate values where needed, and check whether judge labels are warranted.

| Run | Main changes | `full answer` | `partly answer` | `wrong answer` | Exact tool match |
| --- | --- | --- | --- | --- | --- |
| 001 | Initial baseline | 8/10 | 1/10 | 1/10 | 9/10 |
| 002 | Revised system prompt, tool descriptions and date context | 8/10 | 2/10 | 0/10 | 10/10 |
| 003 | More specific web-search and citation guidance | 9/10 | 1/10 | 0/10 | 10/10 |

All three runs recorded no case-level or tool errors. These are **judge ratings on a small development dataset, not a claim of 90% verified accuracy**.

### What the experiments showed

- **A retrieval failure was corrected.** In `se-2`, the initial agent fetched raw grocery transactions and added an incorrect merchant breakdown. Later runs used `get_monthly_summary` and returned the correct EUR 652.33 total directly.
- **A small regression was visible.** `se-4` temporarily omitted a pagination disclosure in run 002; run 003 restored it.
- **The judge missed an internal contradiction.** In run 003, `se-6` showed the correct values `-432.51`, `0.00` and `-432.51`, but concluded that all three were identical. Jev still rated it `full answer`.
- **Web verification remains a limitation.** `se-10` improved its citations but continued to overstate what excerpts established about release status and recency.

One run per version cannot establish repeatability. Several prompts changed together, live web evidence varied, tool arguments are not automatically scored, and latency/cost were not recorded in these result files. These questions guided development rather than forming a held-out benchmark.

| Experiment | Recorded results | Analysis |
| --- | --- | --- |
| 001 | [JSON](intelligence/evaluation/baseline_results_1.json) | [Findings](intelligence/evaluation/analysis_baseline_1.md) |
| 002 | [JSON](intelligence/evaluation/baseline_results_2.json) | [Findings](intelligence/evaluation/analysis_baseline_2.md) |
| 003 | [JSON](intelligence/evaluation/baseline_results_3.json) | [Findings](intelligence/evaluation/analysis_baseline_3.md) |

[Evaluation dataset](intelligence/evaluation/small_eval_dataset.json) · [Runner](intelligence/evaluation/small_evaluation.py) · [Agent prompt](intelligence/agents/prompts/financial_copilot_prompt.md)

## Run locally

### Prerequisites

- Python 3.11+ and [uv](https://docs.astral.sh/uv/getting-started/installation/).
- Node.js 22.12+ and npm; the current Vite version also supports Node.js 20.19+.
- Docker with Docker Compose for PostgreSQL.
- [Ollama](https://ollama.com/download), running locally with `qwen3.5:9b`.
- A Typesafe/Jev API key and a Tavily API key. The current backend initializes the web-search client at startup, so configure both for the full application.
- An optional LangSmith account/key for tracing.

Docker Compose currently runs **PostgreSQL only**. The backend, frontend and Ollama run on the host.

### 1. Install dependencies

```bash
git clone https://github.com/simonadamm/mamona-finance-tracker.git
cd mamona-finance-tracker
uv sync --locked
npm --prefix frontend ci
cp .env.example .env
```

### 2. Configure the environment

Edit the root `.env`:

```dotenv
DATABASE_URL=postgresql+psycopg://mamonaadmin:mamona123@127.0.0.1:5432/mamona
TYPESAFE_API_KEY=your-typesafe-api-key
TAVILY_API_KEY=your-tavily-api-key

# Optional LangSmith tracing
LANGSMITH_API_KEY=
LANGSMITH_PROJECT=mamona-dev
LANGSMITH_TRACING=false
LANGSMITH_ENDPOINT=https://api.smith.langchain.com
```

The database credentials match the local Compose configuration and are intended for local demonstration. `.env` files are ignored by Git; keep real credentials out of source files and media.

For tracing, add a LangSmith key and set `LANGSMITH_TRACING=true`. Use the endpoint for the account's region: `https://api.smith.langchain.com` for US or `https://eu.api.smith.langchain.com` for EU. Restart the backend after changing environment settings.

### 3. Start PostgreSQL and create the schema

From the repository root:

```bash
docker compose -f infrastructure/docker/compose.yaml up -d postgres
docker compose -f infrastructure/docker/compose.yaml exec postgres pg_isready -U mamonaadmin -d mamona
uv run alembic upgrade head
```

If PostgreSQL is still starting, repeat the readiness check before applying migrations.

### 4. Load the demo workspace

```bash
uv run python -m backend.app.db.seed_categories
uv run python -m backend.app.db.seed_demo_user
uv run python -m backend.app.db.seed_demo_history --end-date 2026-10-26
```

The fixed end date reproduces the checked-in synthetic snapshot: **1,312 transactions across 23 categories**, from April 26, 2025 through October 26, 2026, all in EUR with English labels. The first and last months are partial.

Re-running the history seed skips existing generated records and preserves manual transactions and edits. It does not create Savings deposits or goals. Record a deposit and create a goal through the UI to explore those features. Extra manual entries and Savings activity can make totals differ from the archived evaluation runs.

To generate a rolling 18-month history ending today instead, omit `--end-date`. This produces a different snapshot and is not an exact reproduction of the checked-in CSV.

[Demo dataset and export options](data/demo/README.md) · [CSV](data/demo/transactions.csv) · [Manifest](data/demo/manifest.json)

### 5. Start Ollama and the backend

With Ollama running:

```bash
ollama pull qwen3.5:9b
uv run uvicorn backend.app.main:app --reload
```

If using Ollama's CLI without its desktop service, start `ollama serve` in another terminal first. Initial model loading can make the first AI request slower.

### 6. Start the frontend

In another terminal:

```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Interactive API documentation is available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

The Vite development server proxies `/api` to port 8000. A separately hosted production frontend needs an equivalent API routing configuration; `npm run build` alone does not deploy the backend.

To stop the local database while retaining its data:

```bash
docker compose -f infrastructure/docker/compose.yaml stop postgres
```

### Troubleshooting

| Symptom | Check |
| --- | --- |
| Database connection refused | Docker service, readiness check, port 5432 and `DATABASE_URL` |
| Empty transactions page | Migrations and demo seeds; select a seeded month on Analysis if the current month lies outside the snapshot |
| AI model unavailable | Ollama is running and `qwen3.5:9b` has been pulled |
| Missing API-key error at startup | Root `.env` includes Typesafe and Tavily credentials; restart after editing |
| LangSmith returns 403 | API key permissions and US/EU endpoint match the workspace |
| AI request takes longer than expected | Cold model loading, local hardware, context/output length; inspect traces before attributing the delay to a tool |

## API overview

| Endpoint | Purpose |
| --- | --- |
| `GET /categories` | List category names and UUIDs |
| `GET /transactions` | Latest transactions or year/month/category filters |
| `POST /transactions` | Create a confirmed transaction |
| `PUT /transactions/{transaction_id}` | Edit a transaction |
| `DELETE /transactions/{transaction_id}` | Delete a transaction |
| `POST /transactions/draft` | Generate a reviewable AI draft |
| `GET /analytics/monthly` | Deterministic monthly statistics |
| `GET /analytics/history` | Monthly history, up to 60 months |
| `GET /savings` | Total, assigned and available Savings |
| `GET /savings/movements` | Paginated Savings history |
| `POST /savings/deposits` | Record a Savings deposit |
| `GET /saving-goals` / `POST /saving-goals` | List or create goals |
| `POST /saving-goals/{goal_id}/assign` | Allocate existing Savings |
| `POST /saving-goals/{goal_id}/release` | Return goal allocation to available Savings |
| `POST /financial_copilot` | Ask a question; optionally continue a thread |

Example Copilot request:

```bash
curl http://127.0.0.1:8000/financial_copilot \
  -H 'Content-Type: application/json' \
  -d '{"query":"How much did I spend on groceries in August 2025?"}'
```

The response contains `thread_id`, `route` and `answer`. Reuse the returned UUID in a subsequent request's `thread_id` field to continue the conversation. Identity comes from the server's current demo-user dependency, not the request body.

## Tests and evaluation commands

Run the deterministic test suite without PostgreSQL or AI-provider calls:

```bash
uv run python -m unittest discover -s tests
```

The current suite contains **21 tests**, covering Savings allocation/release rules, user/currency scope, summaries, dataset generation and non-destructive seeding. It uses isolated SQLite databases and omits PostgreSQL-specific checks in test copies of the tables; it does not replace PostgreSQL integration or concurrency testing.

Check the frontend:

```bash
npm --prefix frontend run lint
npm --prefix frontend run build
```

Run the ten-case agent evaluation after configuring PostgreSQL, demo data, Ollama and provider credentials:

```bash
uv run python -m intelligence.evaluation.small_evaluation
```

This command makes real Jev, local-model and web-search calls and writes `intelligence/evaluation/small_eval_results.json` after each case. That file is overwritten by the next run; archive results under another name before rerunning. The three checked-in baseline files are preserved separately. The judge sends the answer and tool evidence to Jev, so use synthetic data for reproduction.

## Repository structure

```text
mamona-finance-tracker/
├── backend/
│   ├── app/
│   │   ├── api/                  # FastAPI routers and demo identity
│   │   ├── db/                   # Engine, demo seeds and dataset generator
│   │   ├── models/               # SQLAlchemy tables
│   │   ├── schemas/              # Pydantic input/output models
│   │   ├── services/             # Business rules and database operations
│   │   └── main.py
│   └── migrations/               # Alembic migration history
├── intelligence/
│   ├── agents/                   # Copilot, user context and prompt
│   ├── agent_tools/              # Database-service tools and web search
│   ├── ai_tools/                 # Transaction extraction, router, response nodes
│   ├── harness/                  # LangGraph workflow and memory
│   ├── statistics/               # Deterministic financial calculations
│   └── evaluation/               # Dataset, runner, archived results and analyses
├── frontend/src/
│   ├── app/                      # Pages, routes, layout and theme
│   ├── components/               # Finance and Copilot UI
│   ├── services/                 # API client functions
│   ├── types/                    # TypeScript contracts
│   ├── styles/                   # Shared styling
│   └── utils/                    # Formatting helpers
├── data/demo/                    # Synthetic CSV and expected dataset totals
├── docs/assets/                  # Demo GIFs and overview still
├── infrastructure/docker/        # Local PostgreSQL Compose setup
├── tests/                        # Deterministic business-rule and seed tests
├── .env.example
├── alembic.ini
├── pyproject.toml
├── uv.lock
└── README.md
```

## Current limitations

- **Demo identity:** the application uses a fixed demo user. Full authentication and production authorization are not implemented.
- **Temporary, process-local memory:** `InMemorySaver` is not durable across backend restarts or shared between workers. Leaving the page clears browser state; it does not immediately delete backend checkpoints. Use a single backend worker for the local demo.
- **External-evidence reliability:** the copilot can misinterpret release dates/status or make unsupported claims despite relevant search results. Known examples remain documented in the evaluation reports.
- **Judge reliability:** Jev labels can miss contradictions. Manual findings are kept separate from the original ratings.
- **Incomplete execution controls:** the graph limit is not a full request deadline, tool-call budget, retry policy or memory-retention policy. Cancelling a browser request does not guarantee cancellation of backend inference.
- **Currency and Savings scope:** no FX conversion, bank synchronization or Savings withdrawal-entry flow.
- **Future features:** forecasting, anomaly detection, recurring-payment automation, CSV import and persistent conversation history are not implemented, even where database tables were prepared in advance.

## Further development

The next engineering work is broader evaluation with follow-up and failure scenarios, evidence-based judge explanations, automatic argument checks and measured response latency. Replayable web-search fixtures would help compare models and prompts against the same evidence.

Persistent memory with retention controls, authentication and tighter execution budgets are later runtime improvements. These are future directions rather than claims about the current portfolio version.

## Author and license

Built by **Szymon Adamczyk** as an AI engineering portfolio project.

Released under the [MIT License](LICENSE).
