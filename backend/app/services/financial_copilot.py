from uuid import UUID, uuid4

from langchain_core.callbacks import BaseCallbackHandler
from langsmith import traceable

from backend.app.schemas.inside.ai_conversations_models import (
    FinancialCopilotRequest,
    FinancialCopilotResponse
)
from intelligence.agents.context import UserContext
from intelligence.harness.workflow import workflow

@traceable(
    name="financial_copilot.request"
)
def ask_financial_copilot(
    user_id: UUID,
    data: FinancialCopilotRequest,
    *,
    callbacks: list[BaseCallbackHandler] | None = None,
) -> FinancialCopilotResponse:
    thread_id = data.thread_id or uuid4()

    memory_key = f"{user_id}:{thread_id}"

    result = workflow.invoke(
        {
            "messages": [
                {
                    "role": "user",
                    "content": data.query
                }
            ]
        },
        config={
            "configurable": {
                "thread_id": memory_key
            },
            "recursion_limit": 30,
            "callbacks": callbacks or [],
        },
        context=UserContext(user_id=user_id)
    )

    return FinancialCopilotResponse(
        thread_id=thread_id,
        route=result["route"],
        answer=result["messages"][-1].text.strip(),
    )
