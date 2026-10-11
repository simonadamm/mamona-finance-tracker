from sqlalchemy import select

from backend.app.db.db_engine import SessionLocal
from backend.app.models.tables import Categories
from backend.app.schemas.categories import CATEGORIES


# Save Categories (which are not in database)
with SessionLocal.begin() as session:
    existing_names = set(
        session.scalars(select(Categories.name))
    )

    for name in CATEGORIES:
        if name not in existing_names:
            category = Categories(name=name)
            session.add(category)


# Read saved categories
with SessionLocal() as session:
    categories = session.scalars(
        select(Categories).order_by(Categories.name)
    ).all()

    for category in categories:
        print(category.id, category.name)