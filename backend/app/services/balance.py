from uuid import UUID

from datetime import datetime
from decimal import Decimal
from zoneinfo import ZoneInfo

from sqlalchemy import case, func, select

from backend.app.db.db_engine import SessionLocal
from backend.app.models.tables import Users, Transactions
from backend.app.schemas.inside.balance_models import (
    OpeningBalanceRead,
    OpeningBalanceUpdate,
    BalanceRead
)


class UserNotFoundError(LookupError):
    pass


# =======================================
# Get Opening Balance
# =======================================

def get_opening_balance(user_id: UUID) -> OpeningBalanceRead:
    with SessionLocal() as session:
        user = session.get(Users, user_id)

        if user is None:
            raise UserNotFoundError("User not found.")

        return OpeningBalanceRead.model_validate(user)


# =======================================
# Update Opening Balance
# =======================================

def update_opening_balance(
    user_id: UUID,
    data: OpeningBalanceUpdate,
) -> OpeningBalanceRead:
    with SessionLocal.begin() as session:
        user = session.get(Users, user_id)

        if user is None:
            raise UserNotFoundError("User not found.")

        user.opening_balance = data.opening_balance
        user.opening_date = data.opening_date

        session.flush()
        session.refresh(user)

        result = OpeningBalanceRead.model_validate(user)

    return result

# =======================================
# Get Current Balance
# =======================================
def get_current_balance(user_id: UUID) -> BalanceRead:
    today = datetime.now(ZoneInfo("Europe/Berlin")).date()

    with SessionLocal() as session:
        user = session.get(Users, user_id)

        if user is None:
            raise UserNotFoundError("User not found.")

        if user.opening_balance is None or user.opening_date is None:
            return BalanceRead(
                currency=user.currency,
                opening_balance=user.opening_balance,
                opening_date=user.opening_date,
                as_of=today,
            )

        if user.opening_date > today:
            raise ValueError(
                "The opening date is in the future. "
                "A current balance cannot be calculated yet."
            )

        zero = Decimal("0.00")

        statement = select(
            func.coalesce(
                func.sum(
                    case(
                        (
                            Transactions.type == "income",
                            Transactions.amount,
                        ),
                        else_=zero,
                    )
                ),
                zero,
            ).label("total_income"),

            func.coalesce(
                func.sum(
                    case(
                        (
                            Transactions.type == "expense",
                            Transactions.amount,
                        ),
                        else_=zero,
                    )
                ),
                zero,
            ).label("total_expenses"),
        ).where(
            Transactions.user_id == user_id,
            Transactions.currency == user.currency,
            Transactions.transaction_date >= user.opening_date,
            Transactions.transaction_date <= today,
        )

        total_income, total_expenses = session.execute(statement).one()

        current_balance = (
            user.opening_balance
            + total_income
            - total_expenses
        )

        return BalanceRead(
            currency=user.currency,
            opening_balance=user.opening_balance,
            opening_date=user.opening_date,
            as_of=today,
            total_income=total_income,
            total_expenses=total_expenses,
            current_balance=current_balance,
        )