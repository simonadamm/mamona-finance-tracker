import os

from langchain_core.tools import tool
from tavily import TavilyClient

tavily = TavilyClient(api_key=os.environ["TAVILY_API_KEY"])

@tool
def web_search(query: str) -> str:
    """Search the web for up-to-date information.

    Use this tool when you need current information from the internet.
    """
    response = tavily.search(
        query=query,
        search_depth="basic",
        max_results=5,
    )

    results = []

    for item in response["results"]:
        results.append(
            f"Title: {item['title']}\n"
            f"URL: {item['url']}\n"
            f"Content: {item['content']}"
        )

    return "\n\n".join(results)