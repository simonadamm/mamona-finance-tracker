from sqlalchemy import select

from backend.app.db.db_engine import SessionLocal
from backend.app.models.tables import Categories
from backend.app.schemas.inside.categories_models import CategoryRead

# =======================================
# Get Categories
# =======================================

def get_categories() -> list[CategoryRead]:
    statement = select(Categories).order_by(Categories.name)

    with SessionLocal() as session:
        categories = session.scalars(statement).all()

        return [
            CategoryRead.model_validate(category)
            for category in categories
        ]