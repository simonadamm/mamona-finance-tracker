from datetime import date, datetime
from decimal import Decimal
from uuid import UUID
from zoneinfo import ZoneInfo

from sqlalchemy import case, func, select

from backend.app.db.db_engine import SessionLocal
from backend.app.models.tables import SavingGoals, SavingsMovements, Users
from backend.app.schemas.inside.savings_models import (
    SavingsDepositCreate,
    SavingsMovementRead,
    SavingsPeriodTotals,
    SavingsSummaryRead,
    SavingsMovementPage,
)


class SavingsUserNotFoundError(LookupError):
    pass


def create_savings_deposit(
    user_id: UUID,
    data: SavingsDepositCreate,
) -> SavingsMovementRead:
    today = datetime.now(ZoneInfo("Europe/Berlin")).date()

    if data.movement_date > today:
        raise ValueError(
            "A savings deposit cannot have a future date."
        )

    with SessionLocal.begin() as session:
        user = session.get(Users, user_id)

        if user is None:
            raise SavingsUserNotFoundError("User not found.")

        movement = SavingsMovements(
            user_id=user_id,
            type="deposit",
            amount=data.amount,
            currency=user.currency,
            movement_date=data.movement_date,
            description=(
                data.description.strip() or None
                if data.description is not None
                else None
            ),
        )

        session.add(movement)
        session.flush()
        session.refresh(movement)

        result = SavingsMovementRead.model_validate(movement)

    return result


def get_savings_totals_for_period(
    user_id: UUID,
    currency: str,
    start_date: date,
    end_date: date,
) -> SavingsPeriodTotals:
    if end_date < start_date:
        raise ValueError("End date cannot precede start date.")

    zero = Decimal("0.00")

    statement = select(
        func.coalesce(
            func.sum(
                case(
                    (SavingsMovements.type == "deposit", SavingsMovements.amount),
                    else_=zero,
                )
            ),
            zero,
        ).label("total_deposits"),
        func.coalesce(
            func.sum(
                case(
                    (SavingsMovements.type == "withdrawal", SavingsMovements.amount),
                    else_=zero,
                )
            ),
            zero,
        ).label("total_withdrawals"),
    ).where(
        SavingsMovements.user_id == user_id,
        SavingsMovements.currency == currency,
        SavingsMovements.movement_date >= start_date,
        SavingsMovements.movement_date <= end_date,
    )

    with SessionLocal() as session:
        total_deposits, total_withdrawals = session.execute(statement).one()

    return SavingsPeriodTotals(
        total_deposits=total_deposits,
        total_withdrawals=total_withdrawals,
        net_savings=total_deposits - total_withdrawals,
    )


def get_savings_summary(user_id: UUID) -> SavingsSummaryRead:
    today = datetime.now(ZoneInfo("Europe/Berlin")).date()
    zero = Decimal("0.00")

    def movement_total(kind: str):
        return (
            select(func.coalesce(func.sum(SavingsMovements.amount), zero))
            .where(
                SavingsMovements.user_id == Users.id,
                SavingsMovements.currency == Users.currency,
                SavingsMovements.type == kind,
                SavingsMovements.movement_date <= today,
            )
            .correlate(Users)
            .scalar_subquery()
        )

    # All statuses reserve their assigned money until it is explicitly released.
    assigned_total = (
        select(func.coalesce(func.sum(SavingGoals.current_amount), zero))
        .where(
            SavingGoals.user_id == Users.id,
            SavingGoals.currency == Users.currency,
        )
        .correlate(Users)
        .scalar_subquery()
    )

    # One SQL statement keeps all totals in the same database snapshot.
    with SessionLocal() as session:
        row = session.execute(
            select(
                Users.currency,
                movement_total("deposit").label("total_deposits"),
                movement_total("withdrawal").label("total_withdrawals"),
                assigned_total.label("assigned_savings"),
            ).where(Users.id == user_id)
        ).one_or_none()
        if row is None:
            raise SavingsUserNotFoundError("User not found.")

    total_savings = row.total_deposits - row.total_withdrawals
    return SavingsSummaryRead(
        currency=row.currency,
        as_of=today,
        total_deposits=row.total_deposits,
        total_withdrawals=row.total_withdrawals,
        total_savings=total_savings,
        assigned_savings=row.assigned_savings,
        available_savings=total_savings - row.assigned_savings,
    )


def get_savings_movements(
    user_id: UUID,
    limit: int = 25,
    offset: int = 0,
) -> SavingsMovementPage:
    if not 1 <= limit <= 100:
        raise ValueError("Limit must be between 1 and 100.")
    if offset < 0:
        raise ValueError("Offset cannot be negative.")

    today = datetime.now(ZoneInfo("Europe/Berlin")).date()

    with SessionLocal() as session:
        user = session.get(Users, user_id)
        if user is None:
            raise SavingsUserNotFoundError("User not found.")
        currency = user.currency

        conditions = (
            SavingsMovements.user_id == user_id,
            SavingsMovements.currency == currency,
            SavingsMovements.movement_date <= today,
        )
        total = session.scalar(
            select(func.count()).select_from(SavingsMovements).where(*conditions)
        )
        movements = session.scalars(
            select(SavingsMovements)
            .where(*conditions)
            .order_by(
                SavingsMovements.movement_date.desc(),
                SavingsMovements.created_at.desc(),
                SavingsMovements.id.desc(),
            )
            .limit(limit)
            .offset(offset)
        ).all()
        items = [SavingsMovementRead.model_validate(movement) for movement in movements]

    return SavingsMovementPage(
        currency=currency,
        as_of=today,
        items=items,
        total=total,
        limit=limit,
        offset=offset,
    )
