from uuid import UUID, uuid4

from backend.app.schemas.inside.ai_conversations_models import (
    FinancialCopilotRequest,
    FinancialCopilotResponse
)
from intelligence.agents.context import UserContext
from intelligence.harness.workflow import workflow

def ask_financial_copilot(user_id: UUID, data: FinancialCopilotRequest) -> FinancialCopilotResponse:
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
            "recursion_limit": 30
        },
        context=UserContext(user_id=user_id)
    )

    return FinancialCopilotResponse(
        thread_id=thread_id,
        route=result["route"],
        answer=result["messages"][-1].text.strip(),
    )