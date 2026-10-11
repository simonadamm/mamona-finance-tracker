from uuid import UUID

from backend.app.db.db_engine import SessionLocal
from backend.app.models.tables import Transactions


TRANSACTION_ID = UUID("00000000-0000-0000-0000-000000000002")

with SessionLocal.begin() as session:
    transaction = session.get(Transactions, TRANSACTION_ID)

    if transaction is not None:
        session.delete(transaction)

with SessionLocal() as session:
    transaction = session.get(Transactions, TRANSACTION_ID)

    if transaction is None:
        print("Transaction doesn't exist in database")
    else:
        print("Transaction still exists in database")