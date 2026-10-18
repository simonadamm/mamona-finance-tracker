"""Add opening balance to users

Revision ID: 1d166e3ee737
Revises: 11dff6dae392
Create Date: 2026-10-18 16:37:13.748535

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1d166e3ee737'
down_revision: Union[str, Sequence[str], None] = '11dff6dae392'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "opening_balance",
            sa.Numeric(precision=12, scale=2),
            nullable=True,
        ),
    )
    op.add_column(
        "users",
        sa.Column("opening_date", sa.Date(), nullable=True),
    )

    op.create_check_constraint(
        "ck_users_opening_balance_configuration",
        "users",
        """
        (opening_balance IS NULL AND opening_date IS NULL)
        OR
        (opening_balance IS NOT NULL AND opening_date IS NOT NULL)
        """,
    )
    op.create_check_constraint(
        "ck_users_opening_balance_valid",
        "users",
        "opening_balance IS NULL OR opening_balance <> 'NaN'::numeric",
    )


def downgrade() -> None:
    op.drop_constraint(
        "ck_users_opening_balance_valid",
        "users",
        type_="check",
    )
    op.drop_constraint(
        "ck_users_opening_balance_configuration",
        "users",
        type_="check",
    )

    op.drop_column("users", "opening_date")
    op.drop_column("users", "opening_balance")