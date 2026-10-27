from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

# ==============================
# Financial Copilot Request Model
# ==============================
class FinancialCopilotRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    query: str = Field(min_length=1, max_length=2000)
    thread_id: UUID | None = None

# ==============================
# Financial Copilot Response Model
# ==============================
class FinancialCopilotResponse(BaseModel):
    thread_id: UUID

    route: Literal[
        "financial",
        "out_of_scope",
        "clarification"
    ]
    answer: str = Field(min_length=1)
