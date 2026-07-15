import os
import uuid
import qrcode

from app.database.supabase import supabase

UPLOAD_DIR = "uploads/qr"

os.makedirs(UPLOAD_DIR, exist_ok=True)


def generate_qr(restaurant_id: str, force_reset: bool = False):
    # Check if restaurant already has a short_code
    res = (
        supabase.table("restaurants")
        .select("short_code, qr_code_url, restaurant_name")
        .eq("id", restaurant_id)
        .execute()
    )
    
    if res.data and not force_reset:
        row = res.data[0]
        short_code = row.get("short_code")
        qr_code_url = row.get("qr_code_url")
        
        if short_code and qr_code_url:
            # Verify file exists on disk
            if os.path.exists(qr_code_url):
                frontend_url = os.environ.get("CORS_ORIGINS", "https://genreviewai-frontend.onrender.com").split(",")[0].strip()
                review_url = f"{frontend_url}/r/{short_code}/"
                return {
                    "success": True,
                    "message": "Existing QR Code retrieved",
                    "short_code": short_code,
                    "review_url": review_url,
                    "qr_path": qr_code_url
                }

    # Otherwise generate a new short code or reuse the existing one but regenerate the image
    existing_short_code = None
    if res.data:
        existing_short_code = res.data[0].get("short_code")
        
    short_code = existing_short_code if (existing_short_code and not force_reset) else str(uuid.uuid4())[:8].upper()
    
    frontend_url = os.environ.get("CORS_ORIGINS", "https://genreviewai-frontend.onrender.com").split(",")[0].strip()
    review_url = f"{frontend_url}/r/{short_code}/"
    
    img = qrcode.make(review_url)
    filename = f"{short_code}.png"
    filepath = os.path.join(UPLOAD_DIR, filename)
    img.save(filepath)

    supabase.table("restaurants").update(
        {
            "short_code": short_code,
            "qr_code_url": filepath
        }
    ).eq("id", restaurant_id).execute()

    return {
        "success": True,
        "message": "QR Generated Successfully",
        "short_code": short_code,
        "review_url": review_url,
        "qr_path": filepath
    }