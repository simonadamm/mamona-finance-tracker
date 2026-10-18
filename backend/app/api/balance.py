from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from backend.app.api.dependencies import get_current_user_id
from backend.app.schemas.inside.balance_models import (
    OpeningBalanceRead,
    OpeningBalanceUpdate,
    BalanceRead,
)
from backend.app.services.balance import (
    UserNotFoundError,
    get_opening_balance,
    update_opening_balance,
    get_current_balance,
)


router = APIRouter(
    prefix="/balance",
    tags=["Balance"],
)


@router.get("/opening")
def read_opening_balance(user_id: Annotated[UUID, Depends(get_current_user_id)]) -> OpeningBalanceRead:
    try:
        return get_opening_balance(user_id)
    except UserNotFoundError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        ) from error


@router.put("/opening")
def set_opening_balance(data: OpeningBalanceUpdate, user_id: Annotated[UUID, Depends(get_current_user_id)]) -> OpeningBalanceRead:
    try:
        return update_opening_balance(
            user_id=user_id,
            data=data,
        )
    except UserNotFoundError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        ) from error

@router.get("")
def read_current_balance(user_id: Annotated[UUID, Depends(get_current_user_id)]) -> BalanceRead:
    try:
        return get_current_balance(user_id)
    except UserNotFoundError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        ) from error
    except ValueError as error:
        raise HTTPException(
            status_code=422,
            detail=str(error),
        ) from error