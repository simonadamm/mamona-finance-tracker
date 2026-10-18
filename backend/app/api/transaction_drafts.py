from fastapi import APIRouter

from backend.app.schemas.input.transaction_input_models import TransactionDraftRequest
from backend.app.schemas.inside.transactions_models import TransactionDraft
from backend.app.services.transaction_drafts import prepare_transaction_draft

router = APIRouter(
    prefix="/transactions",
    tags=["Transaction drafts"],
)

@router.post("/draft")
def generate_transaction_draft(data: TransactionDraftRequest) -> TransactionDraft:
    return prepare_transaction_draft(data.query)