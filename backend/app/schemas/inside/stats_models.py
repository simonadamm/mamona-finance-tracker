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
    savings_deposits: Decimal
    savings_withdrawals: Decimal
    net_savings: Decimal
    remaining_budget: Decimal
    average_daily_expenses: Decimal

    expenses_by_category: list[CategoryExpenseRead]

# Models for history/time analysis

class MonthlyHistoryPoint(BaseModel):
    year: int
    month: int

    total_income: Decimal
    total_expenses: Decimal
    net_cash_flow: Decimal

    is_current_month: bool


class MonthlyHistoryRead(BaseModel):
    currency: str
    as_of: date
    points: list[MonthlyHistoryPoint]
