# Pydantic model
from backend.app.schemas.inside.transactions_models import TransactionDraft

# Typesafe SDK (Jev model)
from typesafe_sdk import Choice, Noul, Score, TypeSafeClient

# Langchain's libraries
from langchain_core.prompts import ChatPromptTemplate
from langchain_ollama import ChatOllama
from langsmith import traceable

# ReasoningDetails Libraries
import re
from pydantic import BaseModel, Field, field_validator
from decimal import Decimal
from typing import Optional

# Date reasoning
from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

# Loading dotenv
from pathlib import Path
from dotenv import load_dotenv
PROJECT_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(PROJECT_ROOT / ".env")


# ==========================
# Output Models
# ==========================

# reasoning output structure
class ReasoningDetails(BaseModel):
    amount: Optional[Decimal] = Field(
        default=None,
        gt=0,
        max_digits=12,
        decimal_places=2,
        description=(
            "Explicit total amount of the transaction, expressed as a positive "
            "value. Transaction direction is classified separately. Normalize "
            "decimal commas to decimal points, for example '18,20' to '18.20'. "
            "Do not invent an amount, calculate totals, or combine transactions. "
            "Return null when the amount is missing or ambiguous."
        ),
    )

    currency: Optional[str] = Field(
        default=None,
        pattern=r"^[A-Z]{3}$",
        description=(
            "Currency explicitly stated in the user's message, normalized to an "
            "uppercase three-letter ISO 4217 code, such as EUR, PLN, or USD. "
            "Convert unambiguous names and symbols, such as 'euros' or '€' to EUR "
            "and 'zloty' or 'zł' to PLN. Return null when the currency is missing "
            "or ambiguous; '$' alone does not establish USD. "
            "Do not infer currency from the message's language."
        ),
    )

    transaction_date: Optional[date] = Field(
        default=None,
        description=(
            "Date of the transaction in YYYY-MM-DD format. Follow the date rules "
            "and reference dates supplied in the system message. "
            "If no date is mentioned, use the supplied reference date. "
            "Return null when a date is mentioned but cannot be determined "
            "unambiguously. Future transaction dates are allowed."
        ),
    )

    merchant_name: Optional[str] = Field(
        default=None,
        max_length=255,
        description=(
            "Name of the merchant, business, service provider, or other "
            "counterparty explicitly identified in the user's message. "
            "A product name, purchased item, or transaction category is not "
            "a merchant name. Do not guess a merchant from what was purchased. "
            "Return null when no counterparty is identified."
        ),
    )

    description: str = Field(
        description=(
            "A short description of the financial transaction itself, usually "
            "2–10 words, written in the same language as the user's message. "
            "State what was purchased, paid for, received, or transferred. "
            "Include the merchant or purpose only when explicitly provided. "
            "Return only the transaction description. "
            "Do not describe or analyze the input text. Do not mention its "
            "language, provide a translation, or add introductory explanations. "
            "Do not invent missing details."
        ),
    )

    @field_validator("amount", mode="before")
    @classmethod
    def normalize_amount(cls, value: object) -> object:
        if not isinstance(value, str):
            return value

        value = value.strip()

        if "," in value:
            if not re.fullmatch(r"[+-]?[0-9]+,[0-9]{1,2}", value):
                raise ValueError(
                    "Ambiguous or unsupported amount format."
                )

            value = value.replace(",", ".")

        return value

# ==========================
# AI Input Tool
# ==========================

class AITransactionInput:

    # Using Jev type model to check domain of input (is it related with transactions topic)
    @traceable
    def _domain_check(self, query: str):

        client = TypeSafeClient()

        domain_check_response = client.system_one(
            state=query,
            questions={
                "is_query_relevant": Noul(
                    instructions=(
                        "Determine whether the user's message describes a specific financial "
                        "transaction: money spent, received, or transferred, or an explicitly "
                        "planned future payment, receipt, or transfer. "
                        "A missing amount or date does not make the message irrelevant. "
                        "Reject general financial questions, unrelated text, and purely "
                        "hypothetical scenarios without a stated transaction or plan."
                    )
                )
            }
        )

        return domain_check_response

    # Using Jev type model to classify category and amount
    @traceable
    def _clasification(self, query: str):

        client = TypeSafeClient()

        response = client.system_one(
            state=query,
            questions={
                "category": Choice(
                    instructions=(
                        "Classify the transaction by its primary purpose. "
                        "Choose the most specific matching category. "
                        "Use Other only when none of the available categories reasonably apply."
                    ),
                    criteria={
                        # Income
                        "Main Income":
                            "Salary, wages, bonuses, freelance pay, or other primary earned income.",

                        "Investment Returns":
                            "Income generated by investments, such as dividends, interest, or realized investment profits.",

                        # Transfers & Financial Movements
                        "Savings & Investments":
                            "Money moved into savings accounts, investment accounts, stocks, funds, or other investments.",

                        "Debt & Loan Repayments":
                            "Payments toward loans, credit card debt, mortgages treated as debt repayment, or other borrowed money.",

                        "Internal Transfer":
                            "Money transferred between the user's own accounts without being earned or spent.",

                        # Living & Housing
                        "Housing":
                            "Rent, mortgage housing payments, property-related housing costs, or recurring residence charges.",

                        "Utilities & Telecom":
                            "Electricity, gas, water, heating, internet, mobile phone, and similar household utility bills.",

                        "Home Maintenance & Repairs":
                            "Repairs, maintenance services, renovation materials, or costs required to maintain the home.",

                        "Furnishings & Home Goods":
                            "Furniture, decorations, kitchenware, household equipment, and other non-electronic home items.",

                        # Daily & Lifestyle Expenses
                        "Groceries":
                            "Food, drinks, and everyday household consumables purchased from supermarkets or grocery stores.",

                        "Dining Out & Cafes":
                            "Restaurants, cafes, bars, takeout, food delivery, and other prepared food purchases.",

                        "Clothing & Accessories":
                            "Clothes, shoes, bags, jewelry, watches, and fashion accessories.",

                        "Personal Care & Beauty":
                            "Haircuts, cosmetics, skincare, beauty treatments, hygiene products, and personal grooming.",

                        "Pet Care":
                            "Pet food, veterinary care, grooming, medication, accessories, and other pet-related expenses.",

                        # Leisure & Entertainment
                        "Subscriptions & Streaming":
                            "Recurring subscriptions for streaming, digital content, software services, memberships, or online platforms.",

                        "Entertainment & Events":
                            "Cinema, concerts, festivals, parties, museums, attractions, tickets, and other entertainment events.",

                        "Hobbies":
                            "Products, materials, activities, or services related to personal hobbies and recreational interests.",

                        "Fitness & Sports":
                            "Gym memberships, sports activities, sports equipment, training, classes, or fitness-related expenses.",

                        # Health & Education
                        "Health & Medical":
                            "Doctors, dentists, medication, therapy, medical procedures, tests, and other healthcare costs.",

                        "Education & Self-Development":
                            "Courses, books, training, certifications, tuition, workshops, and other learning or self-development expenses.",

                        # Travel & Transportation
                        "Local Transit & Commute":
                            "Everyday transportation such as public transit, fuel, parking, taxis, ride-sharing, or commuting costs.",

                        "Travel & Vacation":
                            "Transportation, activities, packages, and other expenses primarily related to trips or vacations.",

                        "Lodging & Hotels":
                            "Hotels, hostels, vacation rentals, and other temporary accommodation expenses.",

                        # Tech, Finance & Obligations
                        "Electronics & Tech":
                            "Phones, computers, electronics, accessories, hardware, and other technology purchases.",

                        "Insurance":
                            "Insurance premiums or payments for health, car, home, travel, life, or other insurance policies.",

                        "Taxes & Fees":
                            "Taxes, government charges, banking fees, administrative fees, fines, or similar mandatory charges.",

                        "Gifts & Donations":
                            "Gifts purchased for others, charitable donations, tips given as gifts, or financial contributions.",

                        # Others
                        "Other":
                            "Transactions that cannot reasonably be assigned to any of the available categories."
                    }
                ),

                "type": Choice(
                    instructions=(
                        "Classify the direction of money in the transaction. "
                        "Use income when money is received, expense when money is spent, "
                        "and transfer when money is moved between accounts, savings, investments, "
                        "or debt positions without representing normal consumption."
                    ),
                    criteria={
                        "income":
                            "Money received by the user, increasing available funds or wealth.",

                        "expense":
                            "Money spent on goods, services, bills, obligations, or consumption.",

                        "transfer":
                            "Money moved between accounts, savings, investments, or debt balances rather than consumed."
                    }
                )
            }
        )

        return response

    # Using LLM to recognize
    @traceable
    def _reasoning(self, query: str, user_timezone: str) -> ReasoningDetails:

        # date
        today = datetime.now(ZoneInfo(user_timezone)).date()
        yesterday = today - timedelta(days=1)
        tomorrow = today + timedelta(days=1)
        
        # model setup - 3 seconds or even less to get answer (also with Jev)
        llm = ChatOllama(
            model="qwen3.5:9b",
            temperature=0.0,
            num_ctx=4096,
            reasoning=False,
        )

        structured_llm = llm.with_structured_output(ReasoningDetails)

        system_prompt = (
            "Extract structured details of the user's financial transaction.\n"
            "Amount rules: amount is the positive magnitude of the transaction, "
            "not a signed account balance change. "
            "For example, spending 80 EUR means amount=80, never amount=-80. "
            "Transaction direction is classified separately as income, expense, "
            "or transfer. Return null if the amount is missing or ambiguous.\n"
                        f"User timezone: {user_timezone}.\n"
            f"Reference date / today: {today.isoformat()}.\n"
            f"Yesterday: {yesterday.isoformat()}.\n"
            f"Tomorrow: {tomorrow.isoformat()}.\n"
            "Date rules: use an explicitly stated date when unambiguous. "
            "Resolve relative dates against the supplied reference date. "
            "If a calendar date has no year and no relative context, use the "
            "reference year. If no date is mentioned, use the reference date. "
            "If a date is mentioned but is ambiguous or invalid, return null "
            "for transaction_date. Output dates as YYYY-MM-DD.\n"
            "Do not invent missing information for other fields.\n"
            "For description, summarize the transaction itself in a short "
            "phrase, usually 2–10 words, in the user's language. "
            "Do not analyze the input, mention its language, provide "
            "translations, or add introductory explanations. "
            "Include a merchant or purpose only when explicitly stated."
        )

        return structured_llm.invoke([
            ("system", system_prompt),
            ("human", query),
        ])

    @traceable
    def run(self, query: str, user_timezone: str = "Europe/Berlin") -> TransactionDraft:

        # Domain check
        check = self._domain_check(query)

        if check.answers["is_query_relevant"].noul >= 0.7:
            # Classification
            classification_results = self._clasification(query)

            # Reasoning
            reasoning_results = self._reasoning(query, user_timezone=user_timezone)

            final_result = TransactionDraft(
                category=classification_results.answers["category"].choice,
                type=classification_results.answers["type"].choice,
                amount=reasoning_results.amount,
                currency=reasoning_results.currency,
                transaction_date=reasoning_results.transaction_date,
                merchant_name=reasoning_results.merchant_name,
                description=reasoning_results.description
            )

            return final_result
        else:
            return TransactionDraft()


