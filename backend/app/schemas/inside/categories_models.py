from uuid import UUID

from pydantic import BaseModel, ConfigDict

# ==========================
# Model for Category Read
# ==========================
class CategoryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str