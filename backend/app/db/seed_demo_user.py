from uuid import UUID

from backend.app.db.db_engine import SessionLocal
from backend.app.models.tables import Users


DEMO_USER_ID = UUID("00000000-0000-0000-0000-000000000001")

with SessionLocal.begin() as session:
    user = session.get(Users, DEMO_USER_ID)

    if user is None:
        user = Users(
            id=DEMO_USER_ID,
            name="Demo",
            currency="EUR",
        )
        session.add(user)

with SessionLocal() as session:
    user = session.get(Users, DEMO_USER_ID)
    print(user.id, user.name, user.currency)