from datetime import datetime
from decimal import Decimal
from uuid import UUID
from zoneinfo import ZoneInfo

from sqlalchemy import case, func, select

from backend.app.db.db_engine import SessionLocal
from backend.app.models.tables import SavingGoals, SavingsMovements, Users
from backend.app.schemas.inside.saving_goals_models import (
    SavingGoalAllocation,
    SavingGoalCreate,
    SavingGoalRead,
)


class SavingGoalUserNotFoundError(LookupError):
    pass

# ==========================
# Create Saving Goal
# ==========================
def create_saving_goal(
    user_id: UUID,
    data: SavingGoalCreate,
) -> SavingGoalRead:
    with SessionLocal.begin() as session:
        user = session.get(Users, user_id)

        if user is None:
            raise SavingGoalUserNotFoundError("User not found.")

        goal = SavingGoals(
            user_id=user_id,
            name=data.name,
            target_amount=data.target_amount,
            current_amount=Decimal("0.00"),
            currency=user.currency,
            status="active",
            target_date=data.target_date,
        )

        session.add(goal)
        session.flush()
        session.refresh(goal)

        result = SavingGoalRead.model_validate(goal)

    return result

# ==========================
# Get all Saving Goals
# ==========================
def get_saving_goals(
    user_id: UUID,
) -> list[SavingGoalRead]:
    with SessionLocal() as session:
        user = session.get(Users, user_id)

        if user is None:
            raise SavingGoalUserNotFoundError("User not found.")

        statement = (
            select(SavingGoals)
            .where(
                SavingGoals.user_id == user_id,
                SavingGoals.currency == user.currency,
            )
            .order_by(
                SavingGoals.created_at.desc(),
                SavingGoals.id.desc(),
            )
        )

        goals = session.scalars(statement).all()

        return [
            SavingGoalRead.model_validate(goal)
            for goal in goals
        ]


class SavingGoalNotFoundError(LookupError):
    pass


def _change_goal_allocation(
    user_id: UUID,
    goal_id: UUID,
    data: SavingGoalAllocation,
    *,
    release: bool,
) -> SavingGoalRead:
    zero = Decimal("0.00")

    with SessionLocal.begin() as session:
        # Serialize allocation changes across all goals belonging to this user.
        user = session.scalar(
            select(Users)
            .where(Users.id == user_id)
            .with_for_update()
        )
        if user is None:
            raise SavingGoalUserNotFoundError("User not found.")

        goal = session.scalar(
            select(SavingGoals)
            .where(
                SavingGoals.id == goal_id,
                SavingGoals.user_id == user_id,
            )
            .with_for_update()
        )
        if goal is None:
            raise SavingGoalNotFoundError("Saving goal not found.")

        if goal.currency != user.currency:
            raise ValueError("The goal must use the user's current currency.")

        if release:
            if data.amount > goal.current_amount:
                raise ValueError(
                    "Cannot release more than the amount assigned to this goal."
                )
            goal.current_amount -= data.amount
        else:
            if goal.status == "cancelled":
                raise ValueError("Cannot assign money to a cancelled goal.")

            today = datetime.now(ZoneInfo("Europe/Berlin")).date()
            total_savings = session.scalar(
                select(
                    func.coalesce(
                        func.sum(
                            case(
                                (
                                    SavingsMovements.type == "deposit",
                                    SavingsMovements.amount,
                                ),
                                else_=-SavingsMovements.amount,
                            )
                        ),
                        zero,
                    )
                ).where(
                    SavingsMovements.user_id == user_id,
                    SavingsMovements.currency == user.currency,
                    SavingsMovements.movement_date <= today,
                )
            )
            assigned_savings = session.scalar(
                select(
                    func.coalesce(func.sum(SavingGoals.current_amount), zero)
                ).where(
                    SavingGoals.user_id == user_id,
                    SavingGoals.currency == user.currency,
                )
            )
            available_savings = total_savings - assigned_savings

            if data.amount > available_savings:
                raise ValueError("Not enough unassigned Savings.")

            new_amount = goal.current_amount + data.amount
            if new_amount > Decimal("9999999999.99"):
                raise ValueError(
                    "The assigned amount exceeds the supported maximum."
                )
            goal.current_amount = new_amount

        if goal.status != "cancelled":
            goal.status = (
                "completed"
                if goal.current_amount >= goal.target_amount
                else "active"
            )

        session.flush()
        session.refresh(goal)
        result = SavingGoalRead.model_validate(goal)

    return result


def assign_savings_to_goal(
    user_id: UUID,
    goal_id: UUID,
    data: SavingGoalAllocation,
) -> SavingGoalRead:
    return _change_goal_allocation(
        user_id=user_id,
        goal_id=goal_id,
        data=data,
        release=False,
    )


def release_savings_from_goal(
    user_id: UUID,
    goal_id: UUID,
    data: SavingGoalAllocation,
) -> SavingGoalRead:
    return _change_goal_allocation(
        user_id=user_id,
        goal_id=goal_id,
        data=data,
        release=True,
    )
