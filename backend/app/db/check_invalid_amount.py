from decimal import Decimal
from uuid import UUID

from sqlalchemy.exc import IntegrityError

from backend.app.db.db_engine import SessionLocal
from backend.app.models.tables import Transactions


TRANSACTION_ID = UUID("00000000-0000-0000-0000-000000000002")

try:
    with SessionLocal.begin() as session:
        transaction = session.get(Transactions, TRANSACTION_ID)

        if transaction is None:
            raise ValueError("Demo transaction not found.")

        transaction.amount = Decimal("-5.00")

except IntegrityError:
    print("Database refused invalid amount.")

with SessionLocal() as session:
    transaction = session.get(Transactions, TRANSACTION_ID)
    print(transaction.amount, transaction.currency)