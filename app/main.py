from fastapi import FastAPI

from app.auth.router import router as auth_router
from app.restaurant.router import router as restaurant_router
from app.qr.router import router as qr_router
from app.review.router import router as review_router
from app.tags.router import router as tags_router
from app.ai.router import router as ai_router
from app.dashboard.router import router as dashboard_router
from app.rag.router import router as rag_router
from app.analytics.router import router as analytics_router

app = FastAPI(
    title="GenReviewAI API",
    version="1.0.0",
    description="AI Powered Review Management System"
)


@app.get("/")
def home():
    return {
        "status": "success",
        "message": "GenReviewAI Backend Running 🚀"
    }


app.include_router(auth_router)
app.include_router(restaurant_router)
app.include_router(qr_router)
app.include_router(review_router)
app.include_router(tags_router)
app.include_router(ai_router)
app.include_router(dashboard_router)
app.include_router(rag_router)
app.include_router(analytics_router)

from fastapi.staticfiles import StaticFiles

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")