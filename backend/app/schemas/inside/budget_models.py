from pydantic import BaseModel


class BudgetInput(BaseModel):
    category: str
    amount: float
    