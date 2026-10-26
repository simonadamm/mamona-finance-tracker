from typing import Literal
from uuid import UUID

from langchain.tools import tool, ToolRuntime
from intelligence.agents.context import UserContext

from datetime import date

from backend.app.services.transactions import (
    get_transactions_by_month,
    get_transactions_by_month_and_category,
    get_transactions_by_year,
    get_transactions_by_year_and_category,
    search_transactions as search_transactions_in_db
)
from backend.app.services.analytics import get_monthly_stats
from backend.app.services.categories import get_categories

@tool
def get_monthly_summary(year: int, month: int, runtime: ToolRuntime[UserContext]) -> dict:
    """Get monthly income, expenses, Savings movements, remaining budget, and expenses by category for the current user.

    Args:
        year: Calendar year, for example 2026.
        month: Calendar month from 1 to 12.
    """
    summary = get_monthly_stats(
        user_id=runtime.context.user_id,
        year=year,
        month=month,
    )

    return summary.model_dump(mode="json")

@tool
def search_transactions(
    start_date: date, 
    end_date: date,
    runtime: ToolRuntime[UserContext],
    transaction_type: Literal["income", "expense", "transfer"], 
    limit: int = 20,
    offset: int = 0,
    category_id: UUID | None = None,
    ) -> dict: 
    """Find individual transactions for the current user.

    Use this tool to inspect transaction details, not to calculate
    complete financial totals. Results include all currencies and
    may include future-dated transactions within the requested range.

    Args:
        start_date: Inclusive start date in YYYY-MM-DD format.
        end_date: Inclusive end date in YYYY-MM-DD format.
        transaction_type: Optional filter: income, expense, or transfer.
        limit: Maximum transactions per page, between 1 and 50.
        offset: Number of matching transactions to skip. Start with zero. To fetch another page, use next_offset from the previous result.
        category_id: Optional category UUID. Get it from list_categories; never invent an identifier. Omit to search all categories.

    Results are ordered newest first. If has_more is true, the returned
    list is incomplete. Use get_monthly_summary for monthly totals.
    """
    try:
        result = search_transactions_in_db(
            user_id=runtime.context.user_id,
            start_date=start_date,
            end_date=end_date,
            transaction_type=transaction_type,
            limit=limit,
            offset=offset,
            category_id=category_id,
        )
    except ValueError as error:
        return {"error": str(error)}

    return result.model_dump(mode="json")

@tool
def list_categories() -> list[dict]:
    """List available transaction categories with their names and UUIDs.

    Use this tool to find the category_id required for filtering
    transactions. Never invent category identifiers.
    """
    return [
        category.model_dump(mode="json")
        for category in get_categories()
    ]