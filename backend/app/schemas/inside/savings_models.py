from datetime import date, datetime
from decimal import Decimal
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class SavingsDepositCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    amount: Decimal = Field(
        gt=0,
        max_digits=12,
        decimal_places=2,
        allow_inf_nan=False,
    )
    movement_date: date
    description: str | None = Field(default=None, max_length=2000)


class SavingsMovementRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    type: Literal["deposit", "withdrawal"]
    amount: Decimal
    currency: str
    movement_date: date
    description: str | None

    created_at: datetime
    updated_at: datetime


class SavingsPeriodTotals(BaseModel):
    total_deposits: Decimal
    total_withdrawals: Decimal
    net_savings: Decimal


class SavingsSummaryRead(BaseModel):
    currency: str
    as_of: date
    total_deposits: Decimal
    total_withdrawals: Decimal
    total_savings: Decimal
    assigned_savings: Decimal
    available_savings: Decimal


class SavingsMovementPage(BaseModel):
    currency: str
    as_of: date
    items: list[SavingsMovementRead]
    total: int
    limit: int
    offset: int
