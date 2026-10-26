"""Deterministic synthetic EUR transactions. Does not connect to a database."""

from calendar import monthrange
from dataclasses import dataclass
from datetime import date, datetime, time, timedelta
from decimal import Decimal
from random import Random
from typing import Literal
from uuid import UUID, uuid5
from zoneinfo import ZoneInfo

DEMO_USER_ID = UUID("00000000-0000-0000-0000-000000000001")
DATASET_VERSION = "mamona-demo-history-v1"
DATASET_NAMESPACE = UUID("c7f7566d-12fc-5518-b4bf-3c8f05580291")
BERLIN = ZoneInfo("Europe/Berlin")


@dataclass(frozen=True)
class DemoTransaction:
    id: UUID
    user_id: UUID
    transaction_date: date
    type: Literal["income", "expense"]
    amount: Decimal
    category: str
    merchant_name: str
    description: str
    created_at: datetime
    currency: str = "EUR"


def eighteen_months_before(day: date) -> date:
    year, month = divmod(day.year * 12 + day.month - 1 - 18, 12)
    return date(year, month + 1, min(day.day, monthrange(year, month + 1)[1]))


def generate_transactions(
    start_date: date,
    end_date: date,
    user_id: UUID = DEMO_USER_ID,
) -> list[DemoTransaction]:
    """Generate the same transactions for overlapping dates, regardless of range."""
    if end_date < start_date:
        raise ValueError("End date cannot precede start date.")
    rows: list[DemoTransaction] = []
    day = start_date
    while day <= end_date:
        # Each day has its own RNG, so extending the range never changes old rows.
        rng = Random(f"{DATASET_VERSION}:{day.isoformat()}")
        month_index = day.year * 12 + day.month
        weekend = day.weekday() >= 5
        working_day = not weekend and not (
            (day.month == 7 and 12 <= day.day <= 16)
            or (day.month == 5 and 16 <= day.day <= 18)
        )

        def add(slot, category, cents, merchant, description, kind="expense"):
            recorded = datetime.combine(day, time(rng.randrange(8, 22), rng.randrange(60)), BERLIN)
            rows.append(DemoTransaction(
                id=uuid5(DATASET_NAMESPACE, f"{user_id}:{day}:{slot}"),
                user_id=user_id, transaction_date=day, type=kind,
                amount=Decimal(cents) / 100, category=category,
                merchant_name=merchant, description=description, created_at=recorded,
            ))

        # A fictional employed person: raise in 2026, predictable bills, changing spending.
        if day.day == 1:
            add("salary", "Main Income", 325000 if day.year <= 2025 else 355000,
                "Northstar Digital", "Monthly salary", "income")
        if day.day == 2:
            add("rent", "Housing", 98000 if day < date(2026, 4, 1) else 104000,
                "City Living", "Monthly apartment rent")
        bills = {
            3: ("internet", "Utilities & Telecom", 3999, "HomeNet", "Home internet bill"),
            4: ("phone", "Utilities & Telecom", 1499, "Mobile Connect", "Mobile phone plan"),
            5: ("transit-pass", "Local Transit & Commute", 5800, "City Transit", "Monthly public transport pass"),
            6: ("gym", "Fitness & Sports", 2990, "Urban Fitness", "Monthly gym membership"),
            7: ("insurance", "Insurance", 3150, "Everyday Cover", "Personal liability and home insurance"),
            8: ("video", "Subscriptions & Streaming", 1399, "StreamBox", "Monthly video subscription"),
            11: ("music", "Subscriptions & Streaming", 1099, "Soundwave", "Monthly music subscription"),
            15: ("cloud", "Subscriptions & Streaming", 299, "Cloud Drive", "Cloud storage subscription"),
        }
        if day.day in bills:
            slot, category, cents, merchant, description = bills[day.day]
            add(slot, category, cents, merchant, description)
        if day.day == 10:
            add("energy", "Utilities & Telecom", 7900 if day.month in (11, 12, 1, 2) else 5900,
                "Green Energy", "Monthly electricity and heating payment")
        if day.day == 18 and day.month in (3, 6, 9, 12):
            add("dividend", "Investment Returns", rng.randrange(1800, 4800),
                "Index Fund", "Quarterly investment dividend", "income")
        if day.day == 22 and month_index % 3 == 0:
            add("freelance", "Main Income", rng.choice([18000, 24000, 32000]),
                "Studio Atlas", "Freelance website maintenance", "income")
        if day.month == 12 and day.day == 15:
            add("annual-bonus", "Main Income", 65000, "Northstar Digital", "Annual performance bonus", "income")

        # Repeat merchants and descriptions deliberately, as a real transaction history would.
        if rng.random() < (0.46 if weekend else 0.34):
            merchant = rng.choices(["REWE", "Lidl", "EDEKA", "ALDI"], weights=[4, 4, 2, 2])[0]
            add("groceries", "Groceries", rng.randrange(2500, 8900) if weekend else rng.randrange(1400, 4900),
                merchant, rng.choice(["Weekly grocery shopping", "Groceries and household essentials", "Fresh vegetables and groceries"]))
        if rng.random() < 0.19:
            add("top-up", "Groceries", rng.randrange(250, 1450), "Neighbourhood Market",
                rng.choice(["Milk, bread and eggs", "Fruit and snacks", "A few groceries on the way home"]))
        if rng.random() < (0.40 if weekend else 0.62):
            add("coffee", "Dining Out & Cafes", rng.choice([320, 350, 390, 420, 450, 480, 590]),
                rng.choice(["Corner Coffee", "Coffee Collective", "Morning Brew"]),
                rng.choice(["Morning coffee", "Cappuccino on the way to work", "Coffee and a pastry"]
                           if working_day else ["Morning coffee", "Coffee during a day out", "Coffee and a pastry"]))
        if working_day and rng.random() < 0.29:
            add("lunch", "Dining Out & Cafes", rng.randrange(790, 1650),
                rng.choice(["Green Bowl", "Office Kitchen", "Pasta Corner"]), "Lunch during the workday")
        if rng.random() < (0.48 if weekend else 0.16):
            add("dining", "Dining Out & Cafes", rng.randrange(1600, 7200),
                rng.choice(["Little Italy", "Burger House", "Sakura Kitchen", "The Local Table"]),
                rng.choice(["Dinner with friends", "Dinner at a local restaurant", "Takeaway after a busy day"]))
        if rng.random() < 0.12:
            add("bakery", "Groceries", rng.randrange(290, 1190), "Daily Bread Bakery", "Bread and pastries")
        if rng.random() < 0.13:
            add("extra-transport", "Local Transit & Commute", rng.randrange(290, 1950),
                rng.choice(["City Bike", "City Transit", "Local Taxi"]),
                rng.choice(["Bike share ride", "Extra local transport", "Late evening ride home"]))

        occasional = [
            ("Personal Care & Beauty", "dm", "Toiletries and personal care", 650, 3400),
            ("Health & Medical", "City Pharmacy", "Pharmacy essentials", 590, 3900),
            ("Clothing & Accessories", "Uniqlo", "Everyday clothing", 1990, 10900),
            ("Entertainment & Events", "City Cinema", "Cinema tickets", 1200, 3200),
            ("Hobbies", "Bookshop", "A new book", 990, 3500),
            ("Furnishings & Home Goods", "IKEA", "Small household items", 990, 7900),
            ("Education & Self-Development", "Online Learning", "Online course and study materials", 1490, 6900),
        ]
        if rng.random() < 0.20:
            category, merchant, description, low, high = rng.choice(occasional)
            add("occasional", category, rng.randrange(low, high), merchant, description)
        if day.day == 20 and day.month in (2, 5, 9):
            add("birthday-gift", "Gifts & Donations", rng.randrange(2500, 8500), "Gift Shop", "Birthday present for a friend")
        if day.day == 12 and day.month == 12:
            add("holiday-gifts", "Gifts & Donations", rng.randrange(15000, 26000), "Local Shops", "Holiday gifts for family")
        if day.day == 26 and day.month == 11:
            add("winter-clothes", "Clothing & Accessories", 16990, "Outdoor Store", "Winter coat and warm clothing")
        if day.day == 14 and day.month == 4:
            add("dentist", "Health & Medical", 9500, "City Dental", "Dental check-up and cleaning")
        if day.day == 9 and day.month == 8:
            add("repair", "Home Maintenance & Repairs", rng.randrange(8500, 18000), "Local Repair Service", "Plumbing repair at home")
        if day.day == 17 and day.month == 9:
            if day.year == 2025:
                add("laptop", "Electronics & Tech", 139900, "Tech Store", "Replacement laptop for work and personal use")
            else:
                add("headphones", "Electronics & Tech", 18900, "Tech Store", "Replacement wireless headphones")
        if day.day == 24 and day.month == 3:
            add("tax-fee", "Taxes & Fees", 4900, "Tax Filing Service", "Annual tax filing fee")

        # A summer holiday and a smaller spring trip create visible seasonal peaks.
        if day.month == 7:
            vacation = {
                8: ("holiday-train", "Travel & Vacation", 18990, "Rail Europe", "Return train tickets for summer holiday"),
                12: ("holiday-hotel", "Lodging & Hotels", 78000, "Coastal Guesthouse", "Five-night summer holiday accommodation"),
                13: ("holiday-tour", "Travel & Vacation", 6900, "City Walking Tours", "Guided tour during summer holiday"),
                14: ("holiday-dinner", "Dining Out & Cafes", 8700, "Harbour Restaurant", "Dinner during summer holiday"),
                15: ("holiday-museum", "Entertainment & Events", 3200, "Coastal Museum", "Museum tickets during summer holiday"),
                16: ("holiday-bus", "Travel & Vacation", 2400, "Regional Bus", "Day trip during summer holiday"),
            }
            if day.day in vacation:
                slot, category, cents, merchant, description = vacation[day.day]
                add(slot, category, cents, merchant, description)
        if day.month == 5 and day.day in (16, 17):
            if day.day == 16:
                add("spring-train", "Travel & Vacation", 8900, "Rail Europe", "Train tickets for a weekend away")
            else:
                add("spring-hotel", "Lodging & Hotels", 24500, "Old Town Hotel", "Two-night weekend hotel stay")
        # Keep the final day populated for demo screens, without depending on end_date.
        if day.day == 26:
            add("monthly-donation", "Gifts & Donations", 1000, "Community Food Bank", "Monthly community donation")
        day += timedelta(days=1)

    return sorted(rows, key=lambda row: (row.transaction_date, row.created_at, str(row.id)))
