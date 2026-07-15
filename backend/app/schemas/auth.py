from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    phone: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ProfileUpdateRequest(BaseModel):
    user_id: str
    full_name: str
    phone: str = ""


class EmailChangeRequest(BaseModel):
    user_id: str
    new_email: EmailStr
    current_password: str


class PasswordChangeRequest(BaseModel):
    user_id: str
    current_password: str
    new_password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr
