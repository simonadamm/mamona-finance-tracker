from calendar import monthrange
from datetime import date, datetime
from uuid import UUID
from zoneinfo import ZoneInfo

from backend.app.db.db_engine import SessionLocal
from backend.app.models.tables import Users
from backend.app.schemas.inside.stats_models import (
    CategoryExpenseRead,
    MonthlyStatsRead,
)
from backend.app.services.categories import get_categories
from backend.app.services.transactions import get_transactions_by_month
from intelligence.statistics.basic_stats import (
    calculate_average_daily_expenses,
    calculate_expenses_by_category,
    calculate_net_cash_flow,
    calculate_total_expenses,
    calculate_total_income,
)


class AnalyticsUserNotFoundError(LookupError):
    pass


def get_monthly_stats(
    user_id: UUID,
    year: int,
    month: int,
) -> MonthlyStatsRead:
    if not 1 <= year <= 9998:
        raise ValueError("Year must be between 1 and 9998.")

    if not 1 <= month <= 12:
        raise ValueError("Month must be between 1 and 12.")

    today = datetime.now(ZoneInfo("Europe/Berlin")).date()
    period_start = date(year, month, 1)

    if period_start > today:
        raise ValueError(
            "Statistics for future months are not available."
        )

    last_day = monthrange(year, month)[1]
    period_end = min(date(year, month, last_day), today)
    days_counted = (period_end - period_start).days + 1

    with SessionLocal() as session:
        user = session.get(Users, user_id)

        if user is None:
            raise AnalyticsUserNotFoundError("User not found.")

        currency = user.currency

    transactions = get_transactions_by_month(
        user_id=user_id,
        year=year,
        month=month,
    )

    transactions = [
        transaction
        for transaction in transactions
        if transaction.transaction_date <= period_end
    ]

    total_income = calculate_total_income(
        transactions,
        currency,
    )
    total_expenses = calculate_total_expenses(
        transactions,
        currency,
    )

    category_totals = calculate_expenses_by_category(
        transactions,
        currency,
    )

    category_names = {
        category.id: category.name
        for category in get_categories()
    }

    expenses_by_category = [
        CategoryExpenseRead(
            category_id=category_id,
            category_name=category_names.get(
                category_id,
                "Unknown category",
            ),
            amount=amount,
        )
        for category_id, amount in sorted(
            category_totals.items(),
            key=lambda item: item[1],
            reverse=True,
        )
    ]

    return MonthlyStatsRead(
        year=year,
        month=month,
        currency=currency,
        period_start=period_start,
        period_end=period_end,
        days_counted=days_counted,
        total_income=total_income,
        total_expenses=total_expenses,
        net_cash_flow=calculate_net_cash_flow(
            total_income,
            total_expenses,
        ),
        average_daily_expenses=calculate_average_daily_expenses(
            total_expenses,
            days_counted,
        ),
        expenses_by_category=expenses_by_category,
    )