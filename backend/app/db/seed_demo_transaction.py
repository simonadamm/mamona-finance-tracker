from datetime import date
from decimal import Decimal
from uuid import UUID

from sqlalchemy import select

from backend.app.db.db_engine import SessionLocal
from backend.app.models.tables import Categories, Transactions


DEMO_USER_ID = UUID("00000000-0000-0000-0000-000000000001")
DEMO_TRANSACTION_ID = UUID("00000000-0000-0000-0000-000000000002")

with SessionLocal.begin() as session:
    transaction = session.get(Transactions, DEMO_TRANSACTION_ID)

    if transaction is None:
        category = session.scalars(
            select(Categories).where(Categories.name == "Groceries")
        ).one()

        transaction = Transactions(
            id=DEMO_TRANSACTION_ID,
            user_id=DEMO_USER_ID,
            category_id=category.id,
            type="expense",
            amount=Decimal("18.20"),
            currency="EUR",
            transaction_date=date.today(),
            description="Test shopping",
            classification_source="manual",
        )
        session.add(transaction)

with SessionLocal() as session:
    transaction = session.get(Transactions, DEMO_TRANSACTION_ID)
    print(transaction.id, transaction.amount, transaction.currency)