from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query

from backend.app.api.dependencies import get_current_user_id
from backend.app.schemas.inside.savings_models import (
    SavingsDepositCreate,
    SavingsMovementRead,
    SavingsSummaryRead,
    SavingsMovementPage,
)
from backend.app.services.savings import (
    SavingsUserNotFoundError,
    create_savings_deposit,
    get_savings_summary,
    get_savings_movements,
)


router = APIRouter(
    prefix="/savings",
    tags=["Savings"],
)


@router.get("")
def read_savings_summary(
    user_id: Annotated[UUID, Depends(get_current_user_id)],
) -> SavingsSummaryRead:
    try:
        return get_savings_summary(user_id)
    except SavingsUserNotFoundError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@router.get("/movements")
def read_savings_movements(
    user_id: Annotated[UUID, Depends(get_current_user_id)],
    limit: Annotated[int, Query(ge=1, le=100)] = 25,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> SavingsMovementPage:
    try:
        return get_savings_movements(user_id=user_id, limit=limit, offset=offset)
    except SavingsUserNotFoundError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error


@router.post("/deposits", status_code=201)
def add_savings_deposit(
    data: SavingsDepositCreate,
    user_id: Annotated[UUID, Depends(get_current_user_id)],
) -> SavingsMovementRead:
    try:
        return create_savings_deposit(
            user_id=user_id,
            data=data,
        )
    except SavingsUserNotFoundError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        ) from error
    except ValueError as error:
        raise HTTPException(
            status_code=422,
            detail=str(error),
        ) from error
