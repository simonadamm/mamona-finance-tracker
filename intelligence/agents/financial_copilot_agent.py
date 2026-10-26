from langchain.agents import create_agent
from langchain_ollama import ChatOllama
from langgraph.checkpoint.memory import InMemorySaver

from intelligence.agents.context import AgentContext
from intelligence.agent_tools.sql_tools import (
    get_monthly_summary,
    search_transactions,
    list_categories,
)

MODEL = ChatOllama(
    model="qwen3.5:9b",
    temperature=0.0,
    num_ctx=4096,   # it should be higher
    reasoning=True,
)

financial_copilot_agent = create_agent(
    model=MODEL,
    tools=[get_monthly_summary, search_transactions, list_categories],
    checkpointer=InMemorySaver(),
    context_schema=AgentContext,
    system_prompt=(
        "You are a financial assistant."
        "Use the monthly summary tool for questions about the user's "
        "monthly finances. Never invent financial figures. "
        "Clearly distinguish monthly balance from remaining budget "
        "after Savings. Answer in the user's language."
        "Use search_transactions to inspect individual transactions. "
        "Search results are paginated; never treat one page as a complete "
        "financial total. Use get_monthly_summary for monthly totals. "
        ),
)