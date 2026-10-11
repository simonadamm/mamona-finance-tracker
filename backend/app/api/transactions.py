# FastAPI Router for transactions

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends

from backend.app.api.dependencies import get_current_user_id
from backend.app.schemas.inside.transactions_models import TransactionRead
from backend.app.services.transactions import get_transactions

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.get("")
def list_transactions(user_id: Annotated[UUID, Depends(get_current_user_id)],) -> list[TransactionRead]:
    return get_transactions(user_id=user_id)