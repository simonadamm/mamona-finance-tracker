from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query

from backend.app.api.dependencies import get_current_user_id
from backend.app.schemas.inside.stats_models import MonthlyStatsRead
from backend.app.services.analytics import (
    AnalyticsUserNotFoundError,
    get_monthly_stats,
)


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)


@router.get("/monthly")
def read_monthly_stats(
    user_id: Annotated[UUID, Depends(get_current_user_id)],
    year: Annotated[int, Query(ge=1, le=9998)],
    month: Annotated[int, Query(ge=1, le=12)],
) -> MonthlyStatsRead:
    try:
        return get_monthly_stats(
            user_id=user_id,
            year=year,
            month=month,
        )
    except AnalyticsUserNotFoundError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        ) from error
    except ValueError as error:
        raise HTTPException(
            status_code=422,
            detail=str(error),
        ) from error