from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


# ==============================
# Opening Balance Update/Create
# ==============================
class OpeningBalanceUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    opening_balance: Decimal = Field(
        max_digits=12,
        decimal_places=2,
        allow_inf_nan=False,
    )
    opening_date: date

# ==========================
# Opening Balace Read
# ==========================
class OpeningBalanceRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    currency: str
    opening_balance: Decimal | None
    opening_date: date | None

# ==========================
# Balace Read
# ==========================
class BalanceRead(OpeningBalanceRead):
    as_of: date
    total_income: Decimal | None = None
    total_expenses: Decimal | None = None
    current_balance: Decimal | None = None