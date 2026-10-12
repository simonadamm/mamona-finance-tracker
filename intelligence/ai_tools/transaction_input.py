from backend.app.schemas.inside.transactions_models import TransactionCreate

from typesafe_sdk import Choice, Noul, Score, TypeSafeClient

class AITransactionInput:

    # Using Jev type model to classify category and amount
    def _clasification(query: str): 

        client = TypeSafeClient()

        response = client.system_one(
            state=query,
            questions={
                "category": Choice(
                    instructions="",
                    criteria={}
                ),
                "type": Choice(
                    instructions="",
                    criteria={}
                )
            }
        )

    # Using LLM to recognize 
    def _reasoning(): ...

    def run(query: str) -> TransactionCreate: ...
