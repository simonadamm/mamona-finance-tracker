from uuid import UUID
from sqlalchemy import select

from backend.app.db.db_engine import SessionLocal
from backend.app.models.tables import Categories, Transactions, Users
from backend.app.schemas.inside.transactions_models import (
    TransactionCreate,
    TransactionRead,
)

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