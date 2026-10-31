from pathlib import Path

from langchain.agents import create_agent
from langchain_ollama import ChatOllama

from intelligence.agents.context import UserContext
from intelligence.agent_tools.sql_tools import (
    get_monthly_summary,
    search_transactions,
    list_categories,
)
from intelligence.agent_tools.web_search_tools import web_search


SYSTEM_PROMPT = (Path(__file__).resolve().parent / "prompts" / "financial_copilot_prompt.md").read_text(
    encoding="utf-8"
)

MODEL = ChatOllama(
    model="qwen3.5:9b",
    temperature=0.0,
    num_ctx=16384,
    reasoning=True,
)

financial_copilot_agent = create_agent(
    model=MODEL,
    tools=[get_monthly_summary, search_transactions, list_categories, web_search],
    context_schema=UserContext,
    system_prompt=SYSTEM_PROMPT,
)
