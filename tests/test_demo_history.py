"""Synthetic dataset and non-destructive seed checks; never connect to PostgreSQL."""

import unittest
from dataclasses import replace
from datetime import date
from decimal import Decimal
from uuid import uuid4

from pydantic import ValidationError
from sqlalchemy import CheckConstraint, MetaData, Uuid, create_engine, func, select
from sqlalchemy.dialects.postgresql import UUID as PostgreSQLUUID
from sqlalchemy.orm import sessionmaker

from backend.app.db.demo_history import (
    DEMO_USER_ID, eighteen_months_before, generate_transactions,
)
from backend.app.db.seed_demo_history import build_manifest, seed_transactions
from backend.app.models.tables import Categories, Transactions, Users
from backend.app.schemas.categories import CATEGORIES


class DatasetTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.start, cls.end = date(2025, 4, 26), date(2026, 10, 26)
        cls.rows = generate_transactions(cls.start, cls.end)

    def test_dates_types_currency_and_amounts(self):
        self.assertGreater(len(self.rows), 1000)
        self.assertEqual({row.type for row in self.rows}, {"income", "expense"})
        for row in self.rows:
            self.assertLessEqual(self.start, row.transaction_date)
            self.assertLessEqual(row.transaction_date, self.end)
            self.assertEqual(row.currency, "EUR")
            self.assertGreater(row.amount, 0)
            self.assertEqual(row.amount, row.amount.quantize(Decimal("0.01")))
            self.assertEqual(row.created_at.date(), row.transaction_date)
            self.assertTrue(row.description.isascii())
            self.assertIn(row.category, CATEGORIES)

    def test_deterministic_unique_and_overlap_stable(self):
        self.assertEqual(self.rows, generate_transactions(self.start, self.end))
        self.assertEqual(len(self.rows), len({row.id for row in self.rows}))
        start, end = date(2026, 6, 1), date(2026, 6, 30)
        self.assertEqual(generate_transactions(start, end),
                         [row for row in self.rows if start <= row.transaction_date <= end])
        other = generate_transactions(start, end, uuid4())
        self.assertTrue({row.id for row in other}.isdisjoint({row.id for row in self.rows}))

    def test_month_coverage_salary_and_variation(self):
        manifest = build_manifest(self.rows, self.start, self.end)
        self.assertEqual(len(manifest["monthly_totals"]), 19)
        self.assertGreaterEqual(len(manifest["categories"]), 20)
        salaries = [row for row in self.rows if row.description == "Monthly salary"]
        self.assertEqual(len(salaries), 18)
        self.assertEqual({row.amount for row in salaries}, {Decimal("3250"), Decimal("3550")})
        self.assertEqual(sum(value["transaction_count"] for value in manifest["monthly_totals"].values()), len(self.rows))
        self.assertGreater(len({row.amount for row in self.rows}), 300)

    def test_calendar_month_subtraction_and_invalid_range(self):
        self.assertEqual(eighteen_months_before(self.end), self.start)
        self.assertEqual(eighteen_months_before(date(2026, 8, 31)), date(2025, 2, 28))
        with self.assertRaises(ValueError):
            generate_transactions(self.end, self.start)


class SeedTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite://")
        self.addCleanup(self.engine.dispose)
        with self.engine.connect() as connection:
            connection.exec_driver_sql("PRAGMA foreign_keys=ON")
        metadata = MetaData()
        for model in (Users, Categories, Transactions):
            table = model.__table__.to_metadata(metadata)
            # SQLite otherwise gives PostgreSQL UUID columns numeric affinity,
            # turning the all-numeric demo UUID into an integer.
            for column in table.columns:
                if isinstance(column.type, PostgreSQLUUID):
                    column.type = Uuid(as_uuid=True)
            for constraint in list(table.constraints):
                if isinstance(constraint, CheckConstraint):
                    table.constraints.remove(constraint)
        metadata.create_all(self.engine)
        self.sessions = sessionmaker(bind=self.engine)
        self.rows = generate_transactions(date(2026, 10, 1), date(2026, 10, 7))

    def test_seed_repeat_and_preserve_existing_data(self):
        existing_id = uuid4()
        with self.sessions.begin() as session:
            session.add(Users(id=DEMO_USER_ID, name="Existing name", currency="EUR"))
            category = Categories(name="Groceries")
            session.add(category)
            session.flush()
            session.add(Transactions(id=existing_id, user_id=DEMO_USER_ID, category_id=category.id,
                                     type="expense", amount=Decimal("9.99"), currency="EUR",
                                     transaction_date=date(2026, 1, 1), description="Existing transaction"))
        with self.sessions.begin() as session:
            first = seed_transactions(session, self.rows)
        self.assertEqual(first.inserted, len(self.rows))
        with self.sessions.begin() as session:
            second = seed_transactions(session, self.rows)
        self.assertEqual((second.inserted, second.skipped, second.created_categories), (0, len(self.rows), 0))
        with self.sessions() as session:
            self.assertEqual(session.scalar(select(func.count()).select_from(Transactions)), len(self.rows) + 1)
            self.assertEqual(session.get(Transactions, existing_id).amount, Decimal("9.99"))
            self.assertEqual(session.get(Users, DEMO_USER_ID).name, "Existing name")
            for row in self.rows:
                saved = session.get(Transactions, row.id)
                self.assertEqual(saved.amount, row.amount)
                self.assertEqual(saved.description, row.description)

    def test_user_edits_to_seeded_rows_are_not_overwritten(self):
        with self.sessions.begin() as session:
            seed_transactions(session, self.rows)
            session.get(Transactions, self.rows[0].id).amount = Decimal("123.45")
        with self.sessions.begin() as session:
            seed_transactions(session, self.rows)
        with self.sessions() as session:
            self.assertEqual(session.get(Transactions, self.rows[0].id).amount, Decimal("123.45"))

    def test_currency_mismatch_is_refused_without_mutations(self):
        with self.sessions.begin() as session:
            session.add(Users(id=DEMO_USER_ID, name="Existing", currency="USD"))
        with self.assertRaises(ValueError):
            with self.sessions.begin() as session:
                seed_transactions(session, self.rows)
        with self.sessions() as session:
            self.assertEqual(session.get(Users, DEMO_USER_ID).currency, "USD")
            self.assertEqual(session.scalar(select(func.count()).select_from(Transactions)), 0)

    def test_failed_validation_rolls_back_entire_batch(self):
        invalid = [*self.rows[:-1], replace(self.rows[-1], amount=Decimal("0"))]
        with self.assertRaises(ValidationError):
            with self.sessions.begin() as session:
                seed_transactions(session, invalid)
        with self.sessions() as session:
            self.assertIsNone(session.get(Users, DEMO_USER_ID))
            self.assertEqual(session.scalar(select(func.count()).select_from(Transactions)), 0)
            self.assertEqual(session.scalar(select(func.count()).select_from(Categories)), 0)


if __name__ == "__main__":
    unittest.main()
