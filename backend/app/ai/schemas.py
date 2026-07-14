from pydantic import BaseModel

class GenerateReviewRequest(BaseModel):
    restaurant_id: str
    rating: int
    selected_tags: list[str]