from fastapi import APIRouter

from backend.app.schemas.inside.categories_models import CategoryRead
from backend.app.services.categories import get_categories


router = APIRouter(
    prefix="/categories",
    tags=["Categories"],
)


@router.get("")
def list_categories() -> list[CategoryRead]:
    return get_categories()