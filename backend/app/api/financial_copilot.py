# FastAPI Router for Financial Copilot
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from langchain_core.exceptions import OutputParserException
from langgraph.errors import GraphRecursionError
from pydantic import ValidationError

from backend.app.api.dependencies import get_current_user_id
from backend.app.schemas.inside.ai_conversations_models import (
    FinancialCopilotRequest,
    FinancialCopilotResponse,
)
from backend.app.services.financial_copilot import (
    ask_financial_copilot,
)


router = APIRouter(prefix="/financial_copilot", tags=["Financial Copilot"])

@router.post("")
def ask_copilot(
    data: FinancialCopilotRequest,
    user_id: Annotated[UUID, Depends(get_current_user_id)]
) -> FinancialCopilotResponse:
    try:
        return ask_financial_copilot(
            user_id=user_id,
            data=data
        )
    except GraphRecursionError as error:
        raise HTTPException(
            status_code=503,
            detail = "The assistant reached its execution step limit. Please try a simpler question."
        ) from error
    except (OutputParserException, ValidationError) as error:
        raise HTTPException(
            status_code=502,
            detail="The AI returned an invalid response. Please try again.",
        ) from error