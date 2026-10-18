from collections.abc import Sequence
from decimal import Decimal, ROUND_HALF_UP
from uuid import UUID

from backend.app.schemas.inside.transactions_models import TransactionRead

# ==========================
# Total Income
# ==========================
def calculate_total_income(transactions: Sequence[TransactionRead], currency: str) -> Decimal:

    return sum(
        (
            transaction.amount
            for transaction in transactions
            if transaction.type == "income"
            and transaction.currency == currency
        ),
        Decimal("0.00"),
    )

# ==========================
# Total Expenses
# ==========================
def calculate_total_expenses(transactions: Sequence[TransactionRead], currency: str) -> Decimal:

    return sum(
        (
            transaction.amount
            for transaction in transactions
            if transaction.type == "expense"
            and transaction.currency == currency
        ),
        Decimal("0.00"),
    )

# ==========================
# Net Cash Flow
# ==========================
def calculate_net_cash_flow(total_income: Decimal, total_expenses: Decimal) -> Decimal:

    return total_income - total_expenses

# ==========================
# Expenses per Category
# ==========================
def calculate_expenses_by_category(transactions: Sequence[TransactionRead], currency: str) -> dict[UUID, Decimal]:

    totals: dict[UUID, Decimal] = {}

    for transaction in transactions:
        if transaction.type != "expense":
            continue

        if transaction.currency != currency:
            continue

        category_id = transaction.category_id

        totals[category_id] = (
            totals.get(category_id, Decimal("0.00"))
            + transaction.amount
        )

    return totals

# ==========================
# Average Daily Expenses
# ==========================
def calculate_average_daily_expenses(total_expenses: Decimal, number_of_days: int) -> Decimal:

    if number_of_days <= 0:
        raise ValueError("Number of days must be greater than zero.")

    return (
        total_expenses / Decimal(number_of_days)
    ).quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP,
    )


def calculate_remaining_budget(
    net_cash_flow: Decimal,
    net_savings: Decimal,
) -> Decimal:
    return net_cash_flow - net_savings
