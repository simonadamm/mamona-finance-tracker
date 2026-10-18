from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from backend.app.api.dependencies import get_current_user_id
from backend.app.schemas.inside.saving_goals_models import (
    SavingGoalAllocation,
    SavingGoalCreate,
    SavingGoalRead,
)
from backend.app.services.saving_goals import (
    SavingGoalNotFoundError,
    SavingGoalUserNotFoundError,
    assign_savings_to_goal,
    create_saving_goal,
    get_saving_goals,
    release_savings_from_goal,
)


router = APIRouter(
    prefix="/saving-goals",
    tags=["Saving Goals"],
)


@router.post("", status_code=201)
def add_saving_goal(
    data: SavingGoalCreate,
    user_id: Annotated[UUID, Depends(get_current_user_id)],
) -> SavingGoalRead:
    try:
        return create_saving_goal(
            user_id=user_id,
            data=data,
        )
    except SavingGoalUserNotFoundError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        ) from error


@router.get("")
def read_saving_goals(
    user_id: Annotated[UUID, Depends(get_current_user_id)],
) -> list[SavingGoalRead]:
    try:
        return get_saving_goals(user_id=user_id)
    except SavingGoalUserNotFoundError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        ) from error

@router.post("/{goal_id}/assign")
def assign_to_goal(
    goal_id: UUID,
    data: SavingGoalAllocation,
    user_id: Annotated[UUID, Depends(get_current_user_id)],
) -> SavingGoalRead:
    try:
        return assign_savings_to_goal(
            user_id=user_id,
            goal_id=goal_id,
            data=data,
        )
    except (
        SavingGoalUserNotFoundError,
        SavingGoalNotFoundError,
    ) as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        ) from error
    except ValueError as error:
        raise HTTPException(
            status_code=422,
            detail=str(error),
        ) from error


@router.post("/{goal_id}/release")
def release_from_goal(
    goal_id: UUID,
    data: SavingGoalAllocation,
    user_id: Annotated[UUID, Depends(get_current_user_id)],
) -> SavingGoalRead:
    try:
        return release_savings_from_goal(
            user_id=user_id,
            goal_id=goal_id,
            data=data,
        )
    except (
        SavingGoalUserNotFoundError,
        SavingGoalNotFoundError,
    ) as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        ) from error
    except ValueError as error:
        raise HTTPException(
            status_code=422,
            detail=str(error),
        ) from error