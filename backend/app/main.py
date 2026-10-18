# Main file for FastAPI

from fastapi import FastAPI

from backend.app.api.transactions import router as transactions_router
from backend.app.api.categories import router as categories_router
from backend.app.api.transaction_drafts import router as transaction_drafts_router
from backend.app.api.balance import router as balance_router
from backend.app.api.analytics import router as analytics_router
from backend.app.api.savings import router as savings_router
from backend.app.api.saving_goals import router as saving_goals_router


app = FastAPI(title="Mamona")

# Collect all routers
app.include_router(transactions_router)
app.include_router(categories_router)
app.include_router(transaction_drafts_router)
app.include_router(balance_router)
app.include_router(analytics_router)
app.include_router(savings_router)
app.include_router(saving_goals_router)