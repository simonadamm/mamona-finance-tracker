from langgraph.graph import START, END, StateGraph, MessagesState
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.runtime import Runtime
from langchain_core.messages import SystemMessage
from typing import Literal

# Current date
from datetime import datetime
from zoneinfo import ZoneInfo

# User Context
from intelligence.agents.context import UserContext

# Agents
from intelligence.agents.financial_copilot_agent import financial_copilot_agent

# Router
from intelligence.ai_tools.question_router import router

# Response model
from intelligence.ai_tools.response_model import (
    out_of_scope_node,
    clarification_node,
)

# State
class State(MessagesState):
    route: Literal[
        "financial",
        "out_of_scope",
        "clarification",
    ]

# UTILS - Router Node
def router_node(state: State):
    messages = state["messages"]
    latest_message = messages[-1]

    # all messages except the last one
    history = [
        {
            "role": "user" if message.type == "human" else "assistant",
            "content": str(message.content),
        }
        for message in messages[:-1]
        if message.type in ("human", "ai")
    ]

    # main router tool
    decision = router(
        query=str(latest_message.content),
        history=history,
    )

    return {"route": decision.route}

# UTILS - choose route (for conditional edge)
def choose_route(state: State):
    return state["route"]

# UTILS - financial node
def financial_node(state: State, runtime: Runtime[UserContext]):
    today = datetime.now(ZoneInfo("Europe/Berlin")).date()

    # Save current date
    date_context = SystemMessage(
        content=(
            f"Current date: {today.isoformat()}. "
            "Timezone: Europe/Berlin. "
            "Use this date to interpret relative dates and assess "
            "the freshness of web search results. "
            "For questions asking for the latest information, verify "
            "the reference period and publication date. "
            "Do not assume that the first search result is current."
        )
    )

    result = financial_copilot_agent.invoke(
        {
            "messages": [
                date_context,
                *state["messages"],
            ]
        },
        context=runtime.context,
    )

    return {"messages": [result["messages"][-1]]}

# Graph Nodes
builder = StateGraph(State, context_schema=UserContext)
builder.add_node("router", router_node)
builder.add_node("financial_copilot", financial_node)
builder.add_node("out_of_scope", out_of_scope_node)
builder.add_node("clarification", clarification_node)


# Edges
builder.add_edge(START, "router")
builder.add_conditional_edges(
    "router",
    choose_route,
    {
        "financial": "financial_copilot",
        "out_of_scope": "out_of_scope",
        "clarification": "clarification"
    }
)
builder.add_edge("financial_copilot", END)
builder.add_edge("out_of_scope", END)
builder.add_edge("clarification", END)

# Memory
memory = InMemorySaver()

# Compile
workflow = builder.compile(checkpointer=memory)