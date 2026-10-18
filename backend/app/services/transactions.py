from uuid import UUID
from sqlalchemy import select
from datetime import date

from backend.app.db.db_engine import SessionLocal
from backend.app.models.tables import Categories, Transactions, Users
from backend.app.schemas.inside.transactions_models import (
    TransactionCreate,
    TransactionRead,
)
# List of months
MONTHS = {
    "JANUARY": 1,
    "FEBRUARY": 2,
    "MARCH": 3,
    "APRIL": 4,
    "MAY": 5,
    "JUNE": 6,
    "JULY": 7,
    "AUGUST": 8,
    "SEPTEMBER": 9,
    "OCTOBER": 10,
    "NOVEMBER": 11,
    "DECEMBER": 12,
}
# List of years (so far...)
YEARS = [2025, 2026, 2027]

# ==========================
# UTILS Functions
# ==========================

# Helper function for date period filtering (months, years)
def _get_transactions_for_period(user_id: UUID, year: int, month: int | None = None, category_id: UUID | None = None) -> list[TransactionRead]:

    if not 1 <= year <= 9998:
        raise ValueError("Year must be between 1 and 9998.")

    # Only a year
    if month is None:
        start_date = date(year, 1, 1)
        end_date = date(year + 1, 1, 1)
    # Month
    else:
        if not 1 <= month <= 12:
            raise ValueError("Month must be between 1 and 12.")

        start_date = date(year, month, 1)

        if month == 12:
            end_date = date(year + 1, 1, 1)
        else:
            end_date = date(year, month + 1, 1)

    statement = select(Transactions).where(
        Transactions.user_id == user_id,
        Transactions.transaction_date >= start_date,
        Transactions.transaction_date < end_date,
    )

    # If there is a specific category
    if category_id is not None:
        statement = statement.where(
            Transactions.category_id == category_id
        )

    statement = statement.order_by(
        Transactions.transaction_date.desc(),
        Transactions.created_at.desc(),
        Transactions.id.desc(),
    )

    with SessionLocal() as session:
        transactions = session.scalars(statement).all()

        return [
            TransactionRead.model_validate(transaction)
            for transaction in transactions
        ]



# ==========================
# Create Transaction
# ==========================
def create_transaction(data: TransactionCreate, user_id: UUID) -> UUID:

    with SessionLocal.begin() as session:
        if session.get(Users, user_id) is None:
            raise ValueError("User doesn't exist.")

        if session.get(Categories, data.category_id) is None:
            raise ValueError("Category doesn't exist")

        transaction = Transactions(
            user_id=user_id,
            category_id=data.category_id,
            type=data.type,
            amount=data.amount,
            currency=data.currency,
            transaction_date=data.transaction_date,
            merchant_name=data.merchant_name,
            description=data.description,
        )

        session.add(transaction)
        session.flush()
        transaction_id = transaction.id

    return transaction_id

# ==========================
# Get/Read Transaction
# ==========================
def get_transaction(transaction_id: UUID, user_id: UUID) -> TransactionRead:

    with SessionLocal() as session:
        transaction = session.scalar(
            select(Transactions).where(
                Transactions.id == transaction_id,
                Transactions.user_id == user_id,
            )
        )

        if transaction is None:
            raise ValueError("Transaction not found.")

        return TransactionRead.model_validate(transaction)  #validation to pydantic object

# ======================================================
# Get/Read List of Transaction (50 newest transactions)
# ======================================================
def get_transactions(user_id: UUID) -> list[TransactionRead]:

    with SessionLocal() as session:
        transactions = session.scalars(
            select(Transactions)
            .where(Transactions.user_id == user_id)
            .order_by(
                Transactions.transaction_date.desc(),
                Transactions.created_at.desc(),
                Transactions.id.desc(),
            )
            .limit(50)
        ).all()

        return [
            TransactionRead.model_validate(transaction)
            for transaction in transactions
        ]

# ======================================================
# Get/Read List of Transaction (specific month)
# ======================================================
def get_transactions_by_month(user_id: UUID, year: int, month: int) -> list[TransactionRead]:
    return _get_transactions_for_period(
        user_id=user_id,
        year=year,
        month=month
    )

# ======================================================
# Get/Read List of Transaction (specific year)
# ======================================================
def get_transactions_by_year(user_id: UUID, year: int,) -> list[TransactionRead]:
    return _get_transactions_for_period(
        user_id=user_id,
        year=year,
    )

# ======================================================
# Get/Read List of Transaction (specific month and category)
# ======================================================
def get_transactions_by_month_and_category(user_id: UUID, year: int, month: int, category_id: UUID,) -> list[TransactionRead]:
    return _get_transactions_for_period(
        user_id=user_id,
        year=year,
        month=month,
        category_id=category_id,
    )

# ======================================================
# Get/Read List of Transaction (specific year and category)
# ======================================================
def get_transactions_by_year_and_category(user_id: UUID, year: int, category_id: UUID,) -> list[TransactionRead]:
    return _get_transactions_for_period(
        user_id=user_id,
        year=year,
        category_id=category_id,
    )

# ==========================
# Transaction errors
# ==========================
class TransactionNotFoundError(LookupError):
    pass

# ==========================
# Update Transaction
# ==========================
def update_transaction(transaction_id: UUID, data: TransactionCreate, user_id: UUID) -> TransactionRead:

    with SessionLocal.begin() as session:
        transaction = session.scalar(
            select(Transactions).where(
                Transactions.id == transaction_id,
                Transactions.user_id == user_id,
            )
        )

        if transaction is None:
            raise TransactionNotFoundError("Transaction not found.")

        if session.get(Categories, data.category_id) is None:
            raise ValueError("Category doesn't exist.")

        for field, value in data.model_dump().items():
            setattr(transaction, field, value)

        session.flush()
        session.refresh(transaction)

        result = TransactionRead.model_validate(transaction)

    return result

# ==========================
# Delete Transaction
# ==========================
def delete_transaction(transaction_id: UUID, user_id: UUID) -> None:
    
    with SessionLocal.begin() as session:
        transaction = session.scalar(
            select(Transactions).where(
                Transactions.id == transaction_id,
                Transactions.user_id == user_id,
            )
        )

        if transaction is None:
            raise TransactionNotFoundError("Transaction not found.")

        session.delete(transaction)