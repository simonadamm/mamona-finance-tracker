from calendar import monthrange
from datetime import date, datetime
from uuid import UUID
from zoneinfo import ZoneInfo
from decimal import Decimal
from sqlalchemy import case, func, select

from backend.app.db.db_engine import SessionLocal
from backend.app.models.tables import Users, Transactions
from backend.app.schemas.inside.stats_models import (
    CategoryExpenseRead,
    MonthlyStatsRead,
    MonthlyHistoryPoint,
    MonthlyHistoryRead
)
from backend.app.services.categories import get_categories
from backend.app.services.savings import get_savings_totals_for_period
from backend.app.services.transactions import get_transactions_by_month
from intelligence.statistics.basic_stats import (
    calculate_average_daily_expenses,
    calculate_expenses_by_category,
    calculate_net_cash_flow,
    calculate_remaining_budget,
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

    net_cash_flow = calculate_net_cash_flow(total_income, total_expenses)
    savings = get_savings_totals_for_period(
        user_id=user_id,
        currency=currency,
        start_date=period_start,
        end_date=period_end,
    )

    return MonthlyStatsRead(
        year=year,
        month=month,
        currency=currency,
        period_start=period_start,
        period_end=period_end,
        days_counted=days_counted,
        total_income=total_income,
        total_expenses=total_expenses,
        net_cash_flow=net_cash_flow,
        savings_deposits=savings.total_deposits,
        savings_withdrawals=savings.total_withdrawals,
        net_savings=savings.net_savings,
        remaining_budget=calculate_remaining_budget(net_cash_flow, savings.net_savings),
        average_daily_expenses=calculate_average_daily_expenses(
            total_expenses,
            days_counted,
        ),
        expenses_by_category=expenses_by_category,
    )

def get_monthly_history(user_id: UUID, months: int = 12) -> MonthlyHistoryRead:
    if not 1 <= months <= 60:
        raise ValueError("Months must be between 1 and 60.")

    today = datetime.now(ZoneInfo("Europe/Berlin")).date()

    current_index = today.year * 12 + today.month - 1
    first_index = current_index - months + 1

    first_year, first_month_index = divmod(first_index, 12)
    start_date = date(first_year, first_month_index + 1, 1)

    zero = Decimal("0.00")

    with SessionLocal() as session:
        user = session.get(Users, user_id)

        if user is None:
            raise AnalyticsUserNotFoundError("User not found.")

        currency = user.currency

        month_bucket = func.date_trunc(
            "month",
            Transactions.transaction_date,
        ).label("month_start")

        statement = (
            select(
                month_bucket,
                func.sum(
                    case(
                        (
                            Transactions.type == "income",
                            Transactions.amount,
                        ),
                        else_=zero,
                    )
                ).label("total_income"),
                func.sum(
                    case(
                        (
                            Transactions.type == "expense",
                            Transactions.amount,
                        ),
                        else_=zero,
                    )
                ).label("total_expenses"),
            )
            .where(
                Transactions.user_id == user_id,
                Transactions.currency == currency,
                Transactions.type.in_(["income", "expense"]),
                Transactions.transaction_date >= start_date,
                Transactions.transaction_date <= today,
            )
            .group_by(month_bucket)
            .order_by(month_bucket)
        )

        rows = session.execute(statement).all()

    totals_by_month = {
        row.month_start.date(): row
        for row in rows
    }

    points = []

    for offset in range(months):
        year, month_index = divmod(first_index + offset, 12)
        month = month_index + 1

        row = totals_by_month.get(date(year, month, 1))

        total_income = row.total_income if row is not None else zero
        total_expenses = row.total_expenses if row is not None else zero

        points.append(
            MonthlyHistoryPoint(
                year=year,
                month=month,
                total_income=total_income,
                total_expenses=total_expenses,
                net_cash_flow=calculate_net_cash_flow(
                    total_income,
                    total_expenses,
                ),
                is_current_month=(
                    year == today.year and month == today.month
                ),
            )
        )

    return MonthlyHistoryRead(
        currency=currency,
        as_of=today,
        points=points,
    )
