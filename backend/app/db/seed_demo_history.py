"""Seed synthetic history without overwriting existing transactions.

Run: uv run python -m backend.app.db.seed_demo_history
Preview/export without PostgreSQL: add --dry-run --export-dir data/demo
"""

import argparse
import csv
import json
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import date, datetime
from decimal import Decimal
from pathlib import Path
from uuid import UUID

from sqlalchemy import insert, select
from sqlalchemy.orm import Session

from backend.app.db.demo_history import (
    BERLIN, DATASET_VERSION, DEMO_USER_ID, DemoTransaction,
    eighteen_months_before, generate_transactions,
)
from backend.app.models.tables import Categories, Transactions, Users
from backend.app.schemas.inside.transactions_models import TransactionCreate


@dataclass(frozen=True)
class SeedResult:
    inserted: int
    skipped: int
    created_categories: int


def seed_transactions(session: Session, rows: list[DemoTransaction]) -> SeedResult:
    """Use the caller's transaction; only add missing rows, never update or delete."""
    if not rows:
        return SeedResult(0, 0, 0)
    user_id = rows[0].user_id
    if any(row.user_id != user_id for row in rows):
        raise ValueError("A seed batch must belong to one user.")
    if len({row.id for row in rows}) != len(rows):
        raise ValueError("Duplicate dataset identifiers.")
    if any(row.currency != "EUR" or row.type not in ("income", "expense") for row in rows):
        raise ValueError("Demo history supports only EUR income and expenses.")

    user = session.scalar(select(Users).where(Users.id == user_id).with_for_update())
    if user is None:
        user = Users(id=user_id, name="Demo", currency="EUR")
        session.add(user)
        session.flush()
    elif user.currency != "EUR":
        raise ValueError("The selected user must use EUR; their settings were not changed.")

    required_names = {row.category for row in rows}
    categories = {category.name: category.id for category in session.scalars(
        select(Categories).where(Categories.name.in_(required_names))
    )}
    missing_names = sorted(required_names - categories.keys())
    for name in missing_names:
        category = Categories(name=name)
        session.add(category)
        session.flush()
        categories[name] = category.id

    expected_ids = [row.id for row in rows]
    existing_ids = set()
    for start in range(0, len(expected_ids), 500):
        existing_ids.update(session.scalars(
            select(Transactions.id).where(Transactions.id.in_(expected_ids[start:start + 500]))
        ))

    payloads = []
    for row in rows:
        if row.id in existing_ids:
            continue
        data = TransactionCreate(
            category_id=categories[row.category], type=row.type, amount=row.amount,
            currency=row.currency, transaction_date=row.transaction_date,
            merchant_name=row.merchant_name, description=row.description,
        )
        payloads.append({
            **data.model_dump(), "id": row.id, "user_id": user_id,
            "classification_source": "manual", "created_at": row.created_at,
            "updated_at": row.created_at,
        })
    if payloads:
        session.execute(insert(Transactions), payloads)
    session.flush()
    return SeedResult(len(payloads), len(existing_ids), len(missing_names))


def build_manifest(rows: list[DemoTransaction], start: date, end: date) -> dict:
    zero = Decimal("0.00")
    monthly = defaultdict(lambda: {"count": 0, "income": zero, "expense": zero, "expenses_by_category": defaultdict(lambda: zero)})
    for row in rows:
        month = monthly[row.transaction_date.strftime("%Y-%m")]
        month["count"] += 1
        month[row.type] += row.amount
        if row.type == "expense":
            month["expenses_by_category"][row.category] += row.amount
    return {
        "dataset": DATASET_VERSION,
        "synthetic": True,
        "user_id": str(rows[0].user_id) if rows else None,
        "currency": "EUR",
        "start_date": start.isoformat(), "end_date": end.isoformat(),
        "transaction_count": len(rows),
        "types": dict(Counter(row.type for row in rows)),
        "categories": dict(sorted(Counter(row.category for row in rows).items())),
        "scope": "Expected totals cover this dataset only, excluding pre-existing transactions and Savings movements.",
        "monthly_totals": {
            key: {
                "transaction_count": value["count"],
                "income": f'{value["income"]:.2f}',
                "expense": f'{value["expense"]:.2f}',
                "balance": f'{value["income"] - value["expense"]:.2f}',
                "expenses_by_category": {name: f"{amount:.2f}" for name, amount in sorted(value["expenses_by_category"].items())},
            }
            for key, value in sorted(monthly.items())
        },
    }


def export_dataset(rows: list[DemoTransaction], manifest: dict, directory: Path) -> None:
    directory.mkdir(parents=True, exist_ok=True)
    with (directory / "transactions.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(["id", "user_id", "transaction_date", "type", "amount", "currency", "category", "merchant_name", "description", "created_at"])
        for row in rows:
            writer.writerow([str(row.id), str(row.user_id), row.transaction_date.isoformat(), row.type,
                             f"{row.amount:.2f}", row.currency, row.category, row.merchant_name,
                             row.description, row.created_at.isoformat()])
    (directory / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--end-date", type=date.fromisoformat, default=None)
    parser.add_argument("--start-date", type=date.fromisoformat, default=None)
    parser.add_argument("--user-id", type=UUID, default=DEMO_USER_ID)
    parser.add_argument("--dry-run", action="store_true", help="Generate and optionally export without connecting to PostgreSQL.")
    parser.add_argument("--export-dir", type=Path, help="Save transactions.csv and manifest.json.")
    args = parser.parse_args()
    today = datetime.now(BERLIN).date()
    end = args.end_date or today
    if end > today:
        parser.error("End date cannot be in the future.")
    start = args.start_date or eighteen_months_before(end)
    if start > end:
        parser.error("Start date cannot follow end date.")
    rows = generate_transactions(start, end, args.user_id)
    manifest = build_manifest(rows, start, end)
    print(f"Synthetic EUR history: {start} to {end}, inclusive")
    print(f"Transactions: {len(rows)}; categories: {len(manifest['categories'])}")
    print("Types:", ", ".join(f"{kind}={count}" for kind, count in manifest["types"].items()))
    if args.export_dir:
        export_dataset(rows, manifest, args.export_dir)
        print(f"Exported CSV and monthly totals to {args.export_dir}")
    if args.dry_run:
        print("Preview only. Database was not accessed.")
        return

    # Import lazily so preview/export does not require DATABASE_URL or PostgreSQL.
    from backend.app.db.db_engine import SessionLocal
    with SessionLocal.begin() as session:
        result = seed_transactions(session, rows)
    print(f"Inserted: {result.inserted}; already present: {result.skipped}; categories created: {result.created_categories}")
    print("Existing rows and user settings were preserved. No Savings movements were created.")


if __name__ == "__main__":
    main()
