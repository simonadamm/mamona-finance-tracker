from langchain_core.messages import SystemMessage
from langchain_ollama import ChatOllama
from langsmith import traceable

response_model = ChatOllama(
    model="qwen3.5:9b",
    temperature=0.0,
    num_ctx=4096,
    reasoning=False,
)

@traceable
def out_of_scope_node(state):

    response = response_model.invoke([
        SystemMessage(
            content=(
                "You are the conversational interface of a personal-finance app. "
                "For unrelated questions, briefly explain that you help with "
                "personal finances and financial or economic information, and "
                "invite the user to ask a question within that scope. "
                "Do not answer the unrelated question itself. "
                "Do not claim that the application cannot search the web or access "
                "current information; explain only that the current request is "
                "outside its financial and economic scope. "
                "Respond naturally to greetings and thanks. "
                "Use the user's language."
            )
        ),
        *state["messages"],
    ])

    return {"messages": [response]}

@traceable
def clarification_node(state):

    response = response_model.invoke([
        SystemMessage(
            content=(
                "The user's latest message is ambiguous in the available "
                "conversation context. Ask one short, specific question "
                "to clarify what they mean. "
                "Do not invent missing context or financial figures. "
                "Use the user's language."
            )
        ),
        *state["messages"],
    ])

    return {"messages": [response]}
