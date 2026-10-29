# Libraries for Agent
from backend.app.services.financial_copilot import ask_financial_copilot
from backend.app.schemas.inside.ai_conversations_models import FinancialCopilotRequest

# Libraries for LLM as a Judge or Jev as a Judge
from typesafe_sdk import TypeSafeClient, Choice

# Libraries for Metrics

# Questions set
QUESTIONS_SET_FILE = "small_eval_dataset.json"

# Others
from pydantic import BaseModel
import json


# Output schema
class SmallEvalOutput(BaseModel):
    # Metadata
    query_id: str
    query: str

    # Tools
    right_tools: bool
    too_much_tools: bool
    too_less_tools: bool
    wrong_tools: bool

    # Judgement of answer's context
    decision: str

    # Metrics results
    tmp_metric: float


# Judgement model
def ai_judgement(query: str):
    client = TypeSafeClient()
    response = client.system_one(
        state=query,
        questions={
            "decision": Choice(
                instructions=(),
                criteria={
                    "full answer": (),
                    "almost full answer": (),
                    "partly answer": (),
                    "almost wrong answer": (),
                    "wrong answer": ()
                }
            )
        }
    )

    return response.answers["decision"].choice

# Read questions file
data = []
with open(QUESTIONS_SET_FILE, "r") as f:
    data = json.load(f)

def run(): ...