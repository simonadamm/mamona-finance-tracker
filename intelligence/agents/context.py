from dataclasses import dataclass
from uuid import UUID

@dataclass(frozen=True)
class UserContext:
    user_id: UUID