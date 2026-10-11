# FastAPI Router for transactions

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query

from backend.app.api.dependencies import get_current_user_id
from backend.app.schemas.inside.transactions_models import TransactionRead
from backend.app.services.transactions import (
    get_transactions,

    get_transactions_by_month,
    get_transactions_by_month_and_category,

    get_transactions_by_year,
    get_transactions_by_year_and_category
)

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.get("")
def list_transactions(
    user_id: Annotated[UUID, Depends(get_current_user_id)],
    year: Annotated[int | None, Query(ge=1, le=9998)] = None,   # Query -> year between 1 and 9998
    month: Annotated[int | None, Query(ge=1, le=12)] = None,    # Query -> month between 1 and 12
    category_id: UUID | None = None,
) -> list[TransactionRead]:

    # No year
    if year is None:

        # No year but there is a month and / or category
        if month is not None or category_id is not None:
            raise HTTPException(
                status_code=422,
                detail="Provide year when filtering by month or category.",
            )
        
        # When there is no year and month -> full list last 50 transactions
        return get_transactions(user_id=user_id)

    # Year and month
    if month is not None:

        # and also category
        if category_id is not None:
            return get_transactions_by_month_and_category(
                user_id=user_id,
                year=year,
                month=month,
                category_id=category_id,
            )

        # no category
        return get_transactions_by_month(
            user_id=user_id,
            year=year,
            month=month,
        )

    # Year and category
    if category_id is not None:
        return get_transactions_by_year_and_category(
            user_id=user_id,
            year=year,
            category_id=category_id,
        )

    # Just year
    return get_transactions_by_year(
        user_id=user_id,
        year=year,
    )

