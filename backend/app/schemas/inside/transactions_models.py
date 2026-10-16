from datetime import date, datetime
from decimal import Decimal
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

# ==========================
# Model for Create Transaction
# ==========================
class TransactionCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    category_id: UUID
    type: Literal["income", "expense", "transfer"]

    amount: Decimal = Field(
        gt=0,
        max_digits=12,
        decimal_places=2,
    )
    currency: str = Field(pattern=r"^[A-Z]{3}$")
    transaction_date: date

    merchant_name: str | None = Field(default=None, max_length=255)
    description: str | None = None


# ==========================
# Model for Read Transaction Details
# ==========================
class TransactionRead(TransactionCreate):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

# ==========================
# Model for AI Input
# ==========================

class TransactionDraft(BaseModel):
    model_config = ConfigDict(extra="forbid")

    category: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )
    category_id: UUID | None = None

    type: Literal["income", "expense", "transfer"] | None = None

    amount: Decimal | None = Field(
        default=None,
        gt=0,
        max_digits=12,
        decimal_places=2
    )
    currency: str | None = Field(
        default=None,
        pattern=r"^[A-Z]{3}$",
    )
    transaction_date: date | None = None

    merchant_name: str | None = Field(
        default=None,
        max_length=255
    )
    description: str | None = None