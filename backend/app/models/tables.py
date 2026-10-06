from sqlalchemy import String, Column, Integer, Float, UUID, Date
from sqlalchemy.orm import declarative_base

Base = declarative_base()


# ==========================
# USERS
# ==========================
class Users(Base):
    __tablename__ = 'users'
    id = Column(UUID, primary_key=True)
    name = Column(String, nullable=False)
    currency = Column(String, nullable=False)
    created_at = Column()
    updated_at = Column()

# ==========================
# BUDGET
# ==========================
class Budget(Base):
    __tablename__ = 'budget'
    id = Column()
    user_id = Column()
    category_id = Column()
    amount = Column()
    period = Column()   # e.g month
    start_date = Column()
    end_date = Column()
    created_at = Column()

# ==========================
# TRANSACTIONS
# ==========================
class Transactions(Base):
    __tablename__ = 'transactions'
    id = Column()
    user_id = Column()
    category_id = Column()
    type = Column()     # income, expense, transfer
    amount = Column()
    currency = Column()
    merchant_name = Column()    # nessecary?
    description = Column()      # LLM rewritten or original?
    transaction_date = Column()
    classification_source = Column()
    classification_confidence = Column()
    created_at = Column()
    updated_at = Column()

# ==========================
# CATEGORIES
# ==========================
class Categories(Base):
    __tablename__ = 'categories'
    id = Column()
    name = Column()
    type = Column()    # income, expense, transfer
    icon = Column()    # maybe later as NICE TO HAVE

# ==========================
# SAVING GOALS
# ==========================
class SavingGoals(Base):
    __tablename__ = 'saving_goals'
    id = Column()
    user_id = Column()
    name = Column()
    target_amount = Column()
    current_amount = Column()
    target_date = Column()
    status = Column()
    created_at = Column()
    updated_at = Column()

# ==========================
# RECCURING PAYMENTS
# ==========================
class ReccuringPayments(Base):
    __tablename__ = 'reccuring_payments'
    id = Column()
    user_id = Column()
    category_id = Column()
    merchant_name = Column()
    amount = Column()
    frequency = Column()
    next_expected_date = Column()
    status = Column()
    created_at = Column()
    updated_at = Column()

# ==========================
# Anomaly Results
# ==========================
class AnomalyResults(Base):
    __tablename__ = 'anomaly_results'
    id = Column()
    transaction_id = Column()
    model_version = Column()
    anomaly_score = Column()
    is_anomaly = Column()
    explanation = Column()
    created_at = Column()

# ==========================
# FORECASTS
# ==========================
class Forecasts(Base):
    __tablename__ = 'forecasts'
    id = Column()
    user_id = Column()
    category_id = Column()
    model_version = Column()
    forecast_date = Column()
    predicted_amount = Column()
    lower_bound = Column()
    upper_bound = Column()
    created_at = Column()

# ==========================
# AI CONVERSATIONS
# ==========================
class AIConversations(Base):
    __tablename__ = 'ai_conversations'
    id = Column()
    user_id = Column()
    title = Column()
    created_at = Column()
    updated_at = Column()

# ==========================
# AI MESSAGES
# ==========================
class AIMessages(Base):
    __tablename__ = 'ai_messages'
    id = Column()
    conversation_id = Column()
    role = Column()
    content = Column()
    created_at = Column()