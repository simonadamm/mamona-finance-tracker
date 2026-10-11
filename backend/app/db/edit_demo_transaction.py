from decimal import Decimal
from uuid import UUID

from backend.app.db.db_engine import SessionLocal
from backend.app.models.tables import Transactions


TRANSACTION_ID = UUID("00000000-0000-0000-0000-000000000002")

with SessionLocal.begin() as session:
    transaction = session.get(Transactions, TRANSACTION_ID)

    if transaction is None:
        raise ValueError("Demo transaction not found")

    transaction.amount = Decimal("21.50")

with SessionLocal() as session:
    transaction = session.get(Transactions, TRANSACTION_ID)
    print(transaction.id, transaction.amount, transaction.currency)