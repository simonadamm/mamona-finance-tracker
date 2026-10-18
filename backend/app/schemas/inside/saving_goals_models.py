from datetime import date, datetime
from decimal import Decimal
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

# ==========================
# Create Saving Goal Model
# ==========================
class SavingGoalCreate(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        str_strip_whitespace=True,
    )

    name: str = Field(min_length=1, max_length=255)

    target_amount: Decimal = Field(
        gt=0,
        max_digits=12,
        decimal_places=2,
        allow_inf_nan=False,
    )

    target_date: date

# ==========================
# Read Saving Goal Model
# ==========================
class SavingGoalRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str

    target_amount: Decimal
    current_amount: Decimal
    currency: str

    status: Literal["active", "completed", "cancelled"]
    target_date: date

    created_at: datetime
    updated_at: datetime

# ==========================
# Assign or release Savings
# ==========================
class SavingGoalAllocation(BaseModel):
    model_config = ConfigDict(extra="forbid")

    amount: Decimal = Field(
        gt=0,
        max_digits=12,
        decimal_places=2,
        allow_inf_nan=False,
    )