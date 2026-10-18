from pydantic import BaseModel, ConfigDict, Field

# ======================================
# Request model for AI Input with query
# ======================================

class TransactionDraftRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    query: str = Field(min_length=3, max_length=2000)