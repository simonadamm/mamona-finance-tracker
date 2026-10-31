from typing import Literal
from uuid import UUID

from langchain.tools import tool, ToolRuntime
from intelligence.agents.context import UserContext

from datetime import date

from backend.app.services.transactions import (
    search_transactions as search_transactions_in_db
)
from backend.app.services.analytics import get_monthly_stats
from backend.app.services.categories import get_categories

@tool
def get_monthly_summary(year: int, month: int, runtime: ToolRuntime[UserContext]) -> dict:
    """Get complete monthly financial totals and expense totals by category.

    Use this tool FIRST for questions about:
    - Total monthly income, expenses or monthly balance.
    - Total monthly spending in a category, such as Groceries.
    - The largest expense categories or their ranking.
    - Savings deposits, withdrawals and remaining monthly budget.
    - Comparisons between calendar months.

    For category spending, read expenses_by_category directly.
    No category UUID or list_categories call is needed.
    For comparisons, call this tool once for each requested month.

    Do not retrieve and sum individual transactions when this summary
    already contains the requested total. Report only figures relevant
    to the user's question.

    Amounts use the user's configured currency. Transactions in other
    currencies and transfer transactions are excluded. For the current
    month, the summary includes data only through today. Future months
    are unsupported. Check period_start and period_end in the result.

    Key fields:
    - total_income: Recorded income within the reported scope.
    - total_expenses: Recorded expenses within the reported scope.
    - net_cash_flow: Income minus expenses, before Savings.
    - net_savings: Savings deposits minus Savings withdrawals.
    - remaining_budget: net_cash_flow minus net_savings.
    - expenses_by_category: Complete expense totals by category within
      the reported scope, rather than a paginated transaction list.

    Savings deposits are not expenses. These figures describe a monthly
    budget, not a bank-account balance. If a category is absent from a
    successful complete summary, no expenses for that category are
    included within the reported scope.

    Args:
        year: Calendar year of the requested summary, for example 2026.
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
    transaction_type: Literal["income", "expense", "transfer"] | None, 
    limit: int = 20,
    offset: int = 0,
    category_id: UUID | None = None,
    ) -> dict: 
    """Retrieve individual transaction records matching date and optional filters.

    Use this tool when the user asks to list or inspect transactions:
    recent purchases, transaction dates, merchants, descriptions,
    individual amounts or transactions in a particular category.

    For monthly totals, category spending totals and category rankings,
    use get_monthly_summary instead. Do not fetch transaction pages to
    recalculate totals already available from that tool.

    Dates are inclusive. Results are ordered newest first and may
    include multiple currencies and future-dated transactions.
    Preserve each transaction's currency; do not silently combine
    or convert currencies.

    Results are paginated:
    - Start with offset=0.
    - Use the requested number of records as limit, up to 50.
    - has_more=true means additional matching records exist.
    - To continue, use next_offset from the previous result.
    - Do not describe a partial page as the complete matching history.

    When filtering by category, use an actual category UUID obtained
    from list_categories. Reuse an identifier already verified in the
    conversation rather than looking it up again. Never invent UUIDs.

    Preserve returned amounts and details. Missing merchants or
    descriptions are unknown; do not invent them. A result containing
    an error does not mean that no transactions exist.

    Args:
        start_date: Inclusive start date in YYYY-MM-DD format.
        end_date: Inclusive end date in YYYY-MM-DD format.
        transaction_type: Filter by income, expense or transfer.
            Pass None to include all transaction types.
        limit: Maximum records to return, from 1 to 50. Defaults to 20.
        offset: Number of matching records to skip. Defaults to 0.
        category_id: Verified category UUID. Omit to include all categories.
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
    """List transaction categories and their database UUIDs.

    Use this tool to:
    - Resolve a category name to the category_id needed by search_transactions.
    - Answer questions about which transaction categories are available.

    Do not call this tool for monthly category spending or category
    rankings. get_monthly_summary already returns category names
    and their expense totals.

    Match the user's intended category to the returned names.
    If several categories are plausible and the distinction matters,
    ask for clarification rather than choosing arbitrarily.

    Never invent category UUIDs. Reuse identifiers already verified
    in the conversation when available.

    This tool returns category definitions only. The existence of a
    category does not mean the user has transactions in that category.
    """
    return [
        category.model_dump(mode="json")
        for category in get_categories()
    ]
