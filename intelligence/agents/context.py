from dataclasses import dataclass
from uuid import UUID

@dataclass(frozen=True)
class AgentContext:
    user_id: UUID