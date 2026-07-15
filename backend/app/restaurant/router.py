from fastapi import APIRouter

from app.schemas.restaurant import RestaurantCreate, RestaurantUpdate
from app.restaurant.service import (
    create_restaurant,
    get_google_review_url,
    get_restaurant_by_short_code,
    list_restaurants,
    update_restaurant
)


router = APIRouter(
    prefix="/restaurant",
    tags=["Restaurant"]
)


@router.post("/create")
def create(request: RestaurantCreate):
    return create_restaurant(request)


@router.get("/owner/{owner_id}")
def restaurants_for_owner(owner_id: str):
    return list_restaurants(owner_id)


@router.put("/{restaurant_id}")
def update(restaurant_id: str, request: RestaurantUpdate):
    return update_restaurant(restaurant_id, request)


@router.get("/short-codes")
def get_all_short_codes():
    from app.restaurant.service import get_short_codes
    return get_short_codes()


@router.get("/short-code/{short_code}")
def restaurant_by_short_code(short_code: str):
    return get_restaurant_by_short_code(short_code)


@router.get("/{restaurant_id}/google-review-url")
def google_review_url(restaurant_id: str):
    return get_google_review_url(restaurant_id)
