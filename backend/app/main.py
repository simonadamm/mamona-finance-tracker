# Main file for FastAPI

from fastapi import FastAPI

from backend.app.api.transactions import router as transactions_router


app = FastAPI(title="Mamona")

# Collect all routers
app.include_router(transactions_router)