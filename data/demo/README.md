# Synthetic transaction history

A fictional EUR transaction history for the existing Mamona demo user. It is intended for UI screenshots, agent/tool development, pagination, category filters, monthly comparisons and regression checks. No personal financial data or API calls are used to generate it.

## Included snapshot

- **Dates:** 26 April 2025 through 26 October 2026, inclusive (18 calendar months).
- **Transactions:** 1,312 — 31 income and 1,281 expense records; no transfers.
- **Categories:** 23 existing category names.
- **Currency and language:** EUR; English descriptions and merchant labels.
- **User:** `00000000-0000-0000-0000-000000000001`.
- **Files:** `transactions.csv` contains every generated transaction; `manifest.json` contains counts and expected monthly/category totals for these rows.

The history follows a fictional employed person: a regular salary with a raise in January 2026, rent rising in April 2026, utility bills, subscriptions, groceries, cafes, restaurants, commuting, health and leisure spending. Quarterly dividends and occasional freelance income add variation. Spring trips, summer holidays, a replacement laptop, home repairs and seasonal gifts create spending peaks. Some months have deficits. Merchant names repeat and amounts vary.

April 2025 and October 2026 are partial months. The first month intentionally has no salary on its first day because that day precedes the requested start date.

## Load into PostgreSQL

Start the existing project PostgreSQL container and apply the usual migrations first. From the repository root:

```bash
uv run python -m backend.app.db.seed_demo_history --end-date 2026-10-26
```

The seed uses the project's existing `DATABASE_URL`. Missing categories and the demo user are created if necessary. An existing user's currency must be EUR; the seed never changes user settings.

Each transaction has a stable UUID based on dataset version, user, date and event. Repeating this command skips existing records. It never deletes, overwrites or resets transactions, including edits made to a previously seeded row. All database writes happen in a single transaction.

**Existing manual transactions remain.** The CSV and manifest describe only this synthetic dataset, so live application totals may also include those older entries. No Savings movements, SavingGoals, budgets or opening balances are created or changed. Monthly *remaining budget* may therefore differ from the manifest's income-minus-expenses *balance* when existing Savings movements apply.

## Preview or export without a database

```bash
uv run python -m backend.app.db.seed_demo_history \
  --end-date 2026-10-26 --dry-run --export-dir data/demo
```

This regenerates the checked-in CSV and manifest without accessing PostgreSQL or requiring `DATABASE_URL`.

Without `--end-date`, the script ends on today's date in Europe/Berlin and starts 18 calendar months earlier. Existing records outside that rolling window are retained. You can also supply `--start-date YYYY-MM-DD`. Overlapping dates always generate the same transactions for a given user and dataset version.

For a separate test user, supply `--user-id UUID` and pass that user through `AgentContext` when testing the agent. This keeps expected dataset totals separate from your existing manual data.

## Tests

```bash
uv run python -m unittest discover -s tests -p 'test_demo_history.py' -v
```

Tests cover date boundaries, currencies/types, category names, deterministic generation, stable IDs across date ranges, realistic coverage, repeated seeding, preserved user edits and transaction rollback. They use an isolated SQLite database, not the project PostgreSQL database.

For the README or screenshots, label these figures as **synthetic demo data**. This is a development fixture, not an independently collected benchmark or a statistical model of spending.
