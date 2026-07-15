from app.database.supabase import supabase
from app.auth.security import hash_password, verify_password
from app.schemas.auth import (
    EmailChangeRequest,
    ForgotPasswordRequest,
    LoginRequest,
    PasswordChangeRequest,
    ProfileUpdateRequest,
)


def _password_is_strong(password: str) -> bool:
    return (
        len(password) >= 8
        and any(ch.isupper() for ch in password)
        and any(ch.islower() for ch in password)
        and any(ch.isdigit() for ch in password)
    )


def register_user(data):
    if not _password_is_strong(data.password):
        return {
            "success": False,
            "message": "Password must be at least 8 characters and include uppercase, lowercase, and a number"
        }

    existing = (
        supabase.table("users")
        .select("*")
        .eq("email", data.email)
        .execute()
    )

    if existing.data:
        return {
            "success": False,
            "message": "Email already exists"
        }

    hashed_password = hash_password(data.password)

    result = (
        supabase.table("users")
        .insert(
            {
                "full_name": data.full_name,
                "email": data.email,
                "password_hash": hashed_password,
                "phone": getattr(data, "phone", ""),
                "role": "owner",
                "is_verified": True
            }
        )
        .execute()
    )

    return {
        "success": True,
        "message": "User registered successfully",
        "data": result.data,
    }


def login_user(data: LoginRequest):
    result = (
        supabase.table("users")
        .select("*")
        .eq("email", data.email)
        .execute()
    )

    if not result.data:
        return {
            "success": False,
            "message": "Invalid email or password"
        }

    user = result.data[0]

    # The column is called password_hash now
    if not verify_password(data.password, user["password_hash"]):
        return {
            "success": False,
            "message": "Invalid email or password"
        }

    # Look up the restaurant linked to this user
    restaurant_id = None
    restaurant_name = None
    restaurant_short_code = None
    try:
        rest_res = supabase.table("restaurants").select("id, restaurant_name, short_code").eq("owner_id", user["id"]).limit(1).execute()
        if rest_res.data:
            restaurant_id = rest_res.data[0]["id"]
            restaurant_name = rest_res.data[0].get("restaurant_name")
            restaurant_short_code = rest_res.data[0].get("short_code")
    except Exception as e:
        print(f"[Auth] Could not look up restaurant: {e}")

    return {
        "success": True,
        "message": "Login successful",
        "user": {
            "id": user["id"],
            "full_name": user["full_name"],
            "email": user["email"],
            "phone": user.get("phone", ""),
            "restaurant_id": restaurant_id,
            "restaurant_name": restaurant_name,
            "restaurant_short_code": restaurant_short_code,
        }
    }


def update_profile(data: ProfileUpdateRequest):
    result = (
        supabase.table("users")
        .update({
            "full_name": data.full_name,
            "phone": data.phone,
        })
        .eq("id", data.user_id)
        .execute()
    )
    return {
        "success": True,
        "message": "Profile updated successfully",
        "user": result.data[0] if result.data else None,
    }


def change_email(data: EmailChangeRequest):
    user_res = supabase.table("users").select("*").eq("id", data.user_id).limit(1).execute()
    if not user_res.data:
        return {"success": False, "message": "User not found"}

    user = user_res.data[0]
    if not verify_password(data.current_password, user["password_hash"]):
        return {"success": False, "message": "Current password is incorrect"}

    existing = supabase.table("users").select("id").eq("email", data.new_email).execute()
    if existing.data and existing.data[0]["id"] != data.user_id:
        return {"success": False, "message": "Email is already in use"}

    supabase.table("users").update({"email": data.new_email}).eq("id", data.user_id).execute()
    return {"success": True, "message": "Email updated successfully"}


def change_password(data: PasswordChangeRequest):
    if not _password_is_strong(data.new_password):
        return {
            "success": False,
            "message": "New password must be at least 8 characters and include uppercase, lowercase, and a number"
        }

    user_res = supabase.table("users").select("*").eq("id", data.user_id).limit(1).execute()
    if not user_res.data:
        return {"success": False, "message": "User not found"}

    user = user_res.data[0]
    if not verify_password(data.current_password, user["password_hash"]):
        return {"success": False, "message": "Current password is incorrect"}

    supabase.table("users").update({"password_hash": hash_password(data.new_password)}).eq("id", data.user_id).execute()
    return {"success": True, "message": "Password updated successfully"}


def forgot_password(data: ForgotPasswordRequest):
    # Do not reveal whether the email exists. This prevents account enumeration.
    try:
        user_res = supabase.table("users").select("id, email, full_name").eq("email", data.email).limit(1).execute()
        if user_res.data:
            from app.email.service import send_password_reset_notice
            send_password_reset_notice(data.email, user_res.data[0].get("full_name", "Owner"))
    except Exception as e:
        print(f"[Auth] Forgot password notice failed: {e}")

    return {
        "success": True,
        "message": "If this email is registered, reset instructions will be sent."
    }
