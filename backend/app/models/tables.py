from uuid import uuid4

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import DOUBLE_PRECISION, UUID
from sqlalchemy.orm import declarative_base

Base = declarative_base()


# ==========================
# USERS
# ==========================
class Users(Base):
    __tablename__ = 'users'
    __table_args__ = (
        CheckConstraint(
            "currency ~ '^[A-Z]{3}$'",
            name="ck_users_currency_format",
        ),
    )


    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String(100), nullable=False)

    currency = Column(String(3), nullable=False)

    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

# ==========================
# BUDGET
# ==========================
class Budget(Base):
    __tablename__ = 'budget'
    __table_args__ = (
        CheckConstraint(
            "planned_amount > 0 AND planned_amount <> 'NaN'::numeric",
            name="ck_budget_amount_positive",
        ),
        CheckConstraint(
            "end_date IS NULL OR end_date >= start_date",
            name="ck_budget_date_order",
        ),
        CheckConstraint(
            "period IN ('monthly')",
            name="ck_budget_period",
        ),
        CheckConstraint(
            "currency ~ '^[A-Z]{3}$'",
            name="ck_users_currency_format",
        )
    )   

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=False)

    planned_amount = Column(Numeric(12, 2), nullable=False) # planned amount of money for specific category
    currency = Column(String(3), nullable=False)
    period = Column(String(20), nullable=False)   # e.g month

    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)

    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

# ==========================
# TRANSACTIONS
# ==========================
class Transactions(Base):
    __tablename__ = 'transactions'
    __table_args__ = (
        CheckConstraint(
            "type IN ('income', 'expense', 'transfer')",
            name="ck_transactions_type",
        ),
        CheckConstraint(
            "amount > 0 AND amount <> 'NaN'::numeric",
            name="ck_transactions_amount_positive",
        ),
        CheckConstraint(
            "currency ~ '^[A-Z]{3}$'",
            name="ck_transactions_currency_format",
        ),
        CheckConstraint(
            """
            classification_source IS NULL
            OR classification_source IN ('manual', 'rule', 'llm', 'ml')
            """,
            name="ck_transactions_classification_source",
        ),
        CheckConstraint(
            """
            classification_confidence IS NULL
            OR classification_confidence BETWEEN 0 AND 1
            """,
            name="ck_transactions_classification_confidence",
        ),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=False)   # = other, when there is no good fitting category

    type = Column(String(20), nullable=False)     # income, expense, transfer

    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(3), nullable=False)

    merchant_name = Column(String(255), nullable=True)    # nessecary?
    description = Column(Text, nullable=True)      # LLM rewritten or original?
    
    classification_source = Column(String(30), nullable=True)
    classification_confidence = Column(Numeric(5, 4), nullable=True)

    transaction_date = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

# ==========================
# CATEGORIES
# ==========================
class Categories(Base):
    __tablename__ = 'categories'
    __table_args__ = (
        UniqueConstraint(
            "name",
            name="uq_categories_name",
        ),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String(100), nullable=False)
    icon = Column(String(100), nullable=True)    # maybe later as NICE TO HAVE

# ==========================
# SAVING GOALS
# ==========================
class SavingGoals(Base):
    __tablename__ = 'saving_goals'
    __table_args__ = (
        CheckConstraint(
            "target_amount > 0 AND target_amount <> 'NaN'::numeric",
            name="ck_saving_goals_target_amount",
        ),
        CheckConstraint(
            "current_amount >= 0 AND current_amount <> 'NaN'::numeric",
            name="ck_saving_goals_current_amount",
        ),
        CheckConstraint(
            "status IN ('active', 'completed', 'cancelled')",
            name="ck_saving_goals_status",
        ),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)

    target_amount = Column(Numeric(12, 2), nullable=False)
    current_amount = Column(Numeric(12, 2), nullable=False, server_default=text("0"))
    currency = Column(String(3), nullable=False)

    status = Column(String(20), nullable=False, server_default=text("'active'"))

    target_date = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

# ==========================
# RECCURING PAYMENTS
# ==========================
class ReccuringPayments(Base):
    __tablename__ = 'reccuring_payments'
    __table_args__ = (
        CheckConstraint(
            "amount > 0 AND amount <> 'NaN'::numeric",
            name="ck_reccuring_payments_amount",
        ),
        CheckConstraint(
            "frequency IN ('weekly', 'monthly', 'quarterly', 'yearly')",
            name="ck_reccuring_payments_frequency",
        ),
        CheckConstraint(
            "status IN ('active', 'paused', 'cancelled')",
            name="ck_reccuring_payments_status",
        ),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=False)

    merchant_name = Column(String(255), nullable=True)
    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(3), nullable=False)

    frequency = Column(String(30), nullable=False)
    status = Column(String(20), nullable=False, server_default=text("'active'"))

    next_expected_date = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

# ==========================
# Anomaly Results
# ==========================
class AnomalyResults(Base):
    __tablename__ = 'anomaly_results'
    __table_args__ = (
        CheckConstraint(
            """
            anomaly_score > '-Infinity'::double precision
            AND anomaly_score < 'Infinity'::double precision
            """,
            name="ck_anomaly_results_score_finite",
        ),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    transaction_id = Column(UUID(as_uuid=True), ForeignKey("transactions.id"), nullable=False)
    model_version = Column(String(100), nullable=False)

    anomaly_score = Column(DOUBLE_PRECISION, nullable=False)
    is_anomaly = Column(Boolean, nullable=False)
    explanation = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

# ==========================
# FORECASTS
# ==========================
class Forecasts(Base):
    __tablename__ = 'forecasts'
    __table_args__ = (
        CheckConstraint(
            "predicted_amount <> 'NaN'::numeric",
            name="ck_forecasts_predicted_amount",
        ),
        CheckConstraint(
            "lower_bound IS NULL OR lower_bound <> 'NaN'::numeric",
            name="ck_forecasts_lower_bound",
        ),
        CheckConstraint(
            "upper_bound IS NULL OR upper_bound <> 'NaN'::numeric",
            name="ck_forecasts_upper_bound",
        ),
        CheckConstraint(
            """
            lower_bound IS NULL
            OR upper_bound IS NULL
            OR lower_bound <= upper_bound
            """,
            name="ck_forecasts_bounds_order",
        ),
    )
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=True)
    model_version = Column(String(100), nullable=False)

    forecast_date = Column(Date, nullable=False)

    predicted_amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(3), nullable=False)
    lower_bound = Column(Numeric(12, 2), nullable=True)
    upper_bound = Column(Numeric(12, 2), nullable=True)

    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

# ==========================
# AI CONVERSATIONS
# ==========================
class AIConversations(Base):
    __tablename__ = 'ai_conversations'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=True)

    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

# ==========================
# AI MESSAGES
# ==========================
class AIMessages(Base):
    __tablename__ = 'ai_messages'
    __table_args__ = (
        CheckConstraint(
            "role IN ('user', 'assistant', 'system')",
            name="ck_ai_messages_role",
        ),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("ai_conversations.id"), nullable=False)

    role = Column(String(20), nullable=False)
    content = Column(Text, nullable=False)

    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())