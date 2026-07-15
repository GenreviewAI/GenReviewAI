from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.schemas.auth import RegisterRequest, LoginRequest
from app.auth.service import register_user, login_user

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/register")
def register(request: RegisterRequest):
    try:
        return register_user(request)
    except Exception as e:
        print(f"[Auth] Register error: {e}")
        return JSONResponse(
            status_code=503,
            content={"success": False, "message": f"Service temporarily unavailable: {str(e)}"}
        )


@router.post("/login")
def login(request: LoginRequest):
    try:
        return login_user(request)
    except Exception as e:
        print(f"[Auth] Login error: {e}")
        return JSONResponse(
            status_code=503,
            content={"success": False, "message": f"Service temporarily unavailable: {str(e)}"}
        )