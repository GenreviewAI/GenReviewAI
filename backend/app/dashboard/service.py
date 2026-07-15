from app.database.supabase import supabase


def generate_recovery_plan(customer_name: str, rating: int, feedback_text: str):
    """Generate professional apology response and key operational correction using Gemini."""
    import os
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key or not feedback_text:
        return None
    
    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        prompt = f"""
        A customer named '{customer_name}' gave a rating of {rating}/5 and submitted this private feedback:
        "{feedback_text}"
        
        Analyze the complaint and return a JSON object with:
        1. "apology_draft": A short (max 2 sentences), warm, and highly professional apology response to send to the customer.
        2. "action_item": A short (max 1 sentence) operational action item for the restaurant staff based on the complaint.
        
        Output JSON only. Format:
        {{"apology_draft": "...", "action_item": "..."}}
        """
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt,
            config={"response_mime_type": "application/json"}
        )
        import json
        return json.loads(response.text)
    except Exception as e:
        print(f"[AI Recovery] Failed to generate recovery plan: {e}")
        return None


def get_dashboard_data(restaurant_id: str):

    # Fetch public reviews
    reviews_res = (
        supabase
        .table("reviews")
        .select("*")
        .eq("restaurant_id", restaurant_id)
        .execute()
    )
    reviews_data = reviews_res.data or []

    # Fetch private feedback
    feedback_res = (
        supabase
        .table("private_feedback")
        .select("*")
        .eq("restaurant_id", restaurant_id)
        .execute()
    )
    feedback_data = feedback_res.data or []

    # Merge datasets
    combined = []
    for r in reviews_data:
        combined.append({
            "customer_name": r.get("customer_name"),
            "rating": r.get("rating"),
            "review_text": r.get("review_text"),
            "sentiment": r.get("sentiment"),
            "created_at": r.get("created_at"),
            "is_private": False
        })
    for f in feedback_data:
        combined.append({
            "customer_name": f.get("customer_name"),
            "rating": f.get("rating"),
            "review_text": f.get("feedback_text"),
            "sentiment": f.get("sentiment"),
            "created_at": f.get("created_at"),
            "is_private": True
        })

    # Sort combined reviews by created_at desc
    combined.sort(key=lambda x: x.get("created_at") or "", reverse=True)

    total_reviews = len(combined)

    if total_reviews > 0:
        average_rating = round(
            sum(r.get("rating", 0) for r in combined)
            / total_reviews,
            2
        )
    else:
        average_rating = 0.0

    positive_reviews = sum(
        1 for r in combined
        if str(r.get("sentiment", "")).lower() == "positive"
    )

    negative_reviews = sum(
        1 for r in combined
        if str(r.get("sentiment", "")).lower() == "negative"
    )

    neutral_reviews = sum(
        1 for r in combined
        if str(r.get("sentiment", "")).lower() == "neutral"
    )

    recent_reviews = []
    for r in combined[:5]:
        ai_rec = None
        if r.get("is_private") or r.get("rating", 5) < 4:
            ai_rec = generate_recovery_plan(
                customer_name=r.get("customer_name") or "Guest",
                rating=r.get("rating", 3),
                feedback_text=r.get("review_text") or ""
            )

        recent_reviews.append({
            "customer_name": r.get("customer_name"),
            "rating": r.get("rating"),
            "review_text": r.get("review_text"),
            "sentiment": r.get("sentiment"),
            "is_private": r.get("is_private"),
            "created_at": r.get("created_at"),
            "ai_recovery": ai_rec
        })

    return {
        "success": True,
        "metrics": {
            "total_reviews": total_reviews,
            "average_rating": average_rating,
            "positive_reviews": positive_reviews,
            "negative_reviews": negative_reviews,
            "neutral_reviews": neutral_reviews
        },
        "recent_reviews": recent_reviews
    }