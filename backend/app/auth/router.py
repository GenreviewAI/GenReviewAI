from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.schemas.auth import (
    EmailChangeRequest,
    ForgotPasswordRequest,
    LoginRequest,
    PasswordChangeRequest,
    ProfileUpdateRequest,
    RegisterRequest,
)
from app.auth.service import (
    change_email,
    change_password,
    forgot_password,
    login_user,
    register_user,
    update_profile,
)

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


@router.post("/profile/update")
def profile_update(request: ProfileUpdateRequest):
    return update_profile(request)


@router.post("/email/change")
def email_update(request: EmailChangeRequest):
    return change_email(request)


@router.post("/password/change")
def password_update(request: PasswordChangeRequest):
    return change_password(request)


@router.post("/password/forgot")
def password_forgot(request: ForgotPasswordRequest):
    return forgot_password(request)
