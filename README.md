# GenReviewAI

GenReviewAI is an AI-powered review management platform for restaurants. It helps happy customers write public Google reviews and routes unhappy customers into a private feedback flow so owners can respond before the issue becomes public.

**Live Frontend:** https://genreviewai-frontend.onrender.com

## Features

- QR-based customer review flow
- 1-5 star rating screen
- AI-generated Google review drafts for positive ratings
- Private feedback collection for low ratings
- Restaurant owner dashboard
- Sentiment analysis for reviews and feedback
- Review tags, analytics, and Google review redirects

## Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** FastAPI, Python, Pydantic
- **Database:** Supabase, PostgreSQL
- **AI:** Google Gemini
- **ML/NLP:** TensorFlow, Keras, Scikit-learn
- **Deployment:** Render

## Customer Flow

```text
QR Scan
  -> /r/[shortCode]
  -> Load restaurant
  -> Show restaurant name
  -> Customer gives 1-5 star rating
  -> Positive rating: generate AI review and redirect to Google
  -> Low rating: collect private feedback for the owner
```

## Project Structure

```text
GenReviewAI/
├── backend/      # FastAPI backend
├── frontend/     # Next.js frontend
├── uploads/      # Generated QR assets
├── render.yaml   # Render deployment config
└── README.md
```

## Local Setup

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Create the required environment files before running locally. The frontend expects:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

For production, the frontend uses:

```env
NEXT_PUBLIC_API_BASE_URL=https://genreviewai-backend.onrender.com
```

## Deployment

The app is deployed on Render:

- Frontend: https://genreviewai-frontend.onrender.com
- Backend: https://genreviewai-backend.onrender.com

