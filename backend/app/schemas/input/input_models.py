from pydantic import BaseModel
from ..inside.budget_models import BudgetInput

# ==========================
# First User's inputs
# ==========================

class UserInfo(BaseModel):
    user_id: str
    name: str

class MoneyFirstInput(BaseModel):
    user_id: str
    current_budget: list[BudgetInput]
    savings: float 

# ==========================
# Bills etc.
# ==========================