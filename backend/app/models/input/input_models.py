from pydantic import BaseModel

# ==========================
# First User's inputs
# ==========================

class UserInfo(BaseModel):
    user_id: str
    name: str

class MoneyFirstInput(BaseModel):
    user_id: str
    current_budget: float
    savings: float 

# ==========================
# Bills etc.
# ==========================