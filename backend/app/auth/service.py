from app.database.supabase import supabase
from app.auth.security import hash_password, verify_password
from app.schemas.auth import LoginRequest


def register_user(data):

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

    # Fetch a default organization and role from the database
    orgs_res = supabase.table("organizations").select("id").limit(1).execute()
    roles_res = supabase.table("roles").select("id").eq("name", "business_owner").execute()
    
    org_id = orgs_res.data[0]["id"] if orgs_res.data else "00000000-0000-0000-0000-000000000000"
    role_id = roles_res.data[0]["id"] if roles_res.data else "a2f06723-49c7-4851-a429-7c4a99a3d5ad"

    result = (
        supabase.table("users")
        .insert(
            {
                "name": data.full_name,
                "email": data.email,
                "hashed_password": hashed_password,
                "org_id": org_id,
                "role_id": role_id,
                "is_active": True
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

    if not verify_password(data.password, user["hashed_password"]):
        return {
            "success": False,
            "message": "Invalid email or password"
        }

    return {
        "success": True,
        "message": "Login successful",
        "user": {
            "id": user["id"],
            "full_name": user["name"],
            "email": user["email"],
            "phone": user.get("phone", "")
        }
    }