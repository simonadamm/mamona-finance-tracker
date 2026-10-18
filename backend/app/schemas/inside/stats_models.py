from datetime import date
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel


class CategoryExpenseRead(BaseModel):
    category_id: UUID
    category_name: str
    amount: Decimal


class MonthlyStatsRead(BaseModel):
    year: int
    month: int
    currency: str

    period_start: date
    period_end: date
    days_counted: int

    total_income: Decimal
    total_expenses: Decimal
    net_cash_flow: Decimal
    average_daily_expenses: Decimal

    expenses_by_category: list[CategoryExpenseRead]