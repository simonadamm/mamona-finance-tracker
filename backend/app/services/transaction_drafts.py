from sqlalchemy import select

from backend.app.db.db_engine import SessionLocal
from backend.app.models.tables import Categories
from backend.app.schemas.inside.transactions_models import TransactionDraft
from intelligence.ai_tools.transaction_input import AITransactionInput

# =======================================
# Create TransactionDraft using AI Tool
# =======================================

def prepare_transaction_draft(query: str) -> TransactionDraft:
    tool = AITransactionInput()
    draft = tool.run(query)     # returns TransactionDraft

    # if category was not found -> return without category and category id
    if draft.category is None:
        return draft

    # if there is a category (name)
    statement = select(Categories.id).where(
        Categories.name == draft.category
    )

    with SessionLocal() as session:
        category_id = session.scalar(statement)

    draft.category_id = category_id

    return draft