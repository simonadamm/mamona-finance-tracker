"""Business-rule tests with an isolated in-memory database; no project DB access."""

import os
import unittest
from datetime import datetime, timedelta
from decimal import Decimal
from unittest.mock import patch
from uuid import uuid4
from zoneinfo import ZoneInfo

from sqlalchemy import CheckConstraint, MetaData, create_engine, func, select
from sqlalchemy.orm import sessionmaker

with patch.dict(os.environ, {"DATABASE_URL": "sqlite://"}):
    from backend.app.services import saving_goals as service
    from backend.app.services import savings as savings_service

from backend.app.models.tables import SavingGoals, SavingsMovements, Users
from backend.app.schemas.inside.saving_goals_models import SavingGoalAllocation


class SavingGoalAllocationTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite://")
        self.addCleanup(self.engine.dispose)
        metadata = MetaData()
        for model in (Users, SavingGoals, SavingsMovements):
            table = model.__table__.to_metadata(metadata)
            # Only the test copy omits PostgreSQL-specific CHECK expressions.
            for constraint in list(table.constraints):
                if isinstance(constraint, CheckConstraint):
                    table.constraints.remove(constraint)
        metadata.create_all(self.engine)
        self.sessions = sessionmaker(bind=self.engine)
        self.patcher = patch.object(service, "SessionLocal", self.sessions)
        self.patcher.start()
        self.addCleanup(self.patcher.stop)
        savings_patcher = patch.object(savings_service, "SessionLocal", self.sessions)
        savings_patcher.start()
        self.addCleanup(savings_patcher.stop)
        self.user_id, self.other_id = uuid4(), uuid4()
        self.goal_id, self.other_goal_id = uuid4(), uuid4()
        today = datetime.now(ZoneInfo("Europe/Berlin")).date()
        with self.sessions.begin() as session:
            session.add_all([
                Users(id=self.user_id, name="Test", currency="EUR"),
                Users(id=self.other_id, name="Other", currency="EUR"),
            ])
            session.flush()
            session.add_all([
                SavingGoals(id=self.goal_id, user_id=self.user_id, name="Holiday",
                            target_amount=Decimal("1000"), currency="EUR", target_date=today),
                SavingGoals(id=self.other_goal_id, user_id=self.other_id, name="Other",
                            target_amount=Decimal("1000"), currency="EUR", target_date=today),
            ])
            for user_id, currency, kind, amount, day in [
                (self.user_id, "EUR", "deposit", "2000", today),
                (self.user_id, "EUR", "withdrawal", "200", today),
                (self.user_id, "USD", "deposit", "10000", today),
                (self.other_id, "EUR", "deposit", "10000", today),
                (self.user_id, "EUR", "deposit", "10000", today + timedelta(days=1)),
            ]:
                session.add(SavingsMovements(user_id=user_id, currency=currency,
                                            type=kind, amount=Decimal(amount), movement_date=day))

    def assign(self, amount, goal_id=None):
        return service.assign_savings_to_goal(
            self.user_id, goal_id or self.goal_id,
            SavingGoalAllocation(amount=amount),
        )

    def release(self, amount):
        return service.release_savings_from_goal(
            self.user_id, self.goal_id, SavingGoalAllocation(amount=amount),
        )

    def current_goal(self):
        with self.sessions() as session:
            return session.get(SavingGoals, self.goal_id)

    def test_decimal_assignment_and_release(self):
        self.assertEqual(self.assign("500.25").current_amount, Decimal("500.25"))
        self.assertEqual(self.release("100.10").current_amount, Decimal("400.15"))

    def test_scope_filters_withdrawals_and_rollback(self):
        self.assign("1800")
        with self.assertRaisesRegex(ValueError, "Not enough"):
            self.assign("0.01")
        self.assertEqual(self.current_goal().current_amount, Decimal("1800"))

    def test_pool_shared_between_goals(self):
        self.assign("1000")
        second = service.create_saving_goal(self.user_id, service.SavingGoalCreate(
            name="Second", target_amount="1000", target_date="2027-12-01",
        ))
        with self.assertRaisesRegex(ValueError, "Not enough"):
            self.assign("800.01", second.id)
        self.assertEqual(self.assign("800", second.id).current_amount, Decimal("800"))

    def test_completion_and_reopening(self):
        self.assertEqual(self.assign("1200").status, "completed")
        self.assertEqual(self.release("201").status, "active")

    def test_release_limit_and_return_to_pool(self):
        self.assign("500")
        with self.assertRaisesRegex(ValueError, "Cannot release more"):
            self.release("500.01")
        self.assertEqual(self.current_goal().current_amount, Decimal("500"))
        self.assertEqual(self.release("500").current_amount, Decimal("0"))
        self.assertEqual(self.assign("1800").current_amount, Decimal("1800"))

    def test_other_users_goal_and_missing_goal(self):
        for goal_id in (self.other_goal_id, uuid4()):
            with self.assertRaises(service.SavingGoalNotFoundError):
                self.assign("1", goal_id)

    def test_missing_user(self):
        with self.assertRaises(service.SavingGoalUserNotFoundError):
            service.assign_savings_to_goal(uuid4(), self.goal_id, SavingGoalAllocation(amount="1"))

    def test_currency_mismatch(self):
        with self.sessions.begin() as session:
            session.get(SavingGoals, self.goal_id).currency = "USD"
        with self.assertRaisesRegex(ValueError, "currency"):
            self.assign("1")

    def test_cancelled_goals_keep_money_reserved_until_released(self):
        self.assign("500")
        with self.sessions.begin() as session:
            session.get(SavingGoals, self.goal_id).status = "cancelled"
        with self.assertRaisesRegex(ValueError, "cancelled"):
            self.assign("1")
        released = self.release("500")
        self.assertEqual(released.status, "cancelled")
        self.assertEqual(released.current_amount, Decimal("0"))

    def test_no_savings_and_no_new_movements(self):
        with self.assertRaisesRegex(ValueError, "Not enough"):
            service.assign_savings_to_goal(
                self.user_id, self.goal_id, SavingGoalAllocation(amount="1800.01"),
            )
        self.assign("500")
        self.release("100")
        with self.sessions() as session:
            self.assertEqual(session.scalar(select(func.count()).select_from(SavingsMovements)), 5)
            empty_user = Users(id=uuid4(), name="Empty", currency="EUR")
            session.add(empty_user)
            session.commit()
            empty_id = empty_user.id
        goal = service.create_saving_goal(empty_id, service.SavingGoalCreate(
            name="Empty", target_amount="100", target_date="2027-12-01",
        ))
        with self.assertRaisesRegex(ValueError, "Not enough"):
            service.assign_savings_to_goal(empty_id, goal.id, SavingGoalAllocation(amount="1"))

    def test_summary_tracks_assignment_and_release_without_changing_total(self):
        summary = savings_service.get_savings_summary(self.user_id)
        self.assertEqual(summary.total_deposits, Decimal("2000"))
        self.assertEqual(summary.total_withdrawals, Decimal("200"))
        self.assertEqual(summary.total_savings, Decimal("1800"))
        self.assertEqual(summary.assigned_savings, Decimal("0"))
        self.assertEqual(summary.available_savings, Decimal("1800"))
        self.assign("500.25")
        assigned = savings_service.get_savings_summary(self.user_id)
        self.assertEqual(assigned.total_savings, Decimal("1800"))
        self.assertEqual(assigned.assigned_savings, Decimal("500.25"))
        self.assertEqual(assigned.available_savings, Decimal("1299.75"))
        self.release("100.10")
        released = savings_service.get_savings_summary(self.user_id)
        self.assertEqual(released.total_savings, Decimal("1800"))
        self.assertEqual(released.assigned_savings, Decimal("400.15"))
        self.assertEqual(released.available_savings, Decimal("1399.85"))
        self.assertEqual(released.model_dump(mode="json")["available_savings"], "1399.85")

    def test_summary_counts_all_goal_statuses_and_filters_goal_scope(self):
        today = datetime.now(ZoneInfo("Europe/Berlin")).date()
        with self.sessions.begin() as session:
            for user_id, currency, status, amount in [
                (self.user_id, "EUR", "active", "10"),
                (self.user_id, "EUR", "completed", "20"),
                (self.user_id, "EUR", "cancelled", "30"),
                (self.user_id, "USD", "active", "999"),
                (self.other_id, "EUR", "active", "999"),
            ]:
                session.add(SavingGoals(user_id=user_id, name="Scope test", currency=currency,
                                       status=status, current_amount=Decimal(amount),
                                       target_amount=Decimal("100"), target_date=today))
        summary = savings_service.get_savings_summary(self.user_id)
        self.assertEqual(summary.assigned_savings, Decimal("60"))
        self.assertEqual(summary.available_savings, Decimal("1740"))

    def test_summary_empty_missing_and_negative_available(self):
        with self.assertRaises(savings_service.SavingsUserNotFoundError):
            savings_service.get_savings_summary(uuid4())
        empty_id = uuid4()
        with self.sessions.begin() as session:
            session.add(Users(id=empty_id, name="Empty", currency="EUR"))
            session.get(SavingGoals, self.goal_id).current_amount = Decimal("1900")
        empty = savings_service.get_savings_summary(empty_id)
        self.assertEqual((empty.total_savings, empty.assigned_savings, empty.available_savings),
                         (Decimal("0"), Decimal("0"), Decimal("0")))
        self.assertEqual(savings_service.get_savings_summary(self.user_id).available_savings,
                         Decimal("-100"))


if __name__ == "__main__":
    unittest.main()
