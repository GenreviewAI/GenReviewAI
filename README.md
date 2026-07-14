# 🍽️ GenReviewAI

> **Turn every visit into a review** — AI-powered restaurant review generation and sentiment analytics platform.

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## 📌 About

**GenReviewAI** helps restaurant owners collect more Google reviews effortlessly. Customers scan a QR code, rate their experience, and the AI generates a natural-sounding review draft they can post with one click. Negative feedback is captured privately so owners can improve without public damage.

### How It Works

```
Customer scans QR → Rates experience → Selects tags
                                          ↓
                            ★★★★★ (High rating)     ★★☆☆☆ (Low rating)
                                  ↓                        ↓
                         AI generates 3 review      Private feedback
                         drafts via Gemini           sent to owner
                                  ↓                        ↓
                         Customer picks one,         Owner gets notified
                         edits & posts on Google     to follow up
```

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **Owner Registration & Auth** | Sign up, log in with JWT-based authentication |
| 🏪 **Restaurant Management** | Register restaurants with Google Review links and brand settings |
| 📱 **QR Code Generation** | Auto-generated QR codes linking to the customer review page |
| ⭐ **Smart Rating Flow** | High ratings → AI review drafts · Low ratings → Private feedback |
| 🤖 **Gemini AI Review Drafts** | 3 natural-sounding review options generated using Google Gemini |
| 🧠 **RAG Knowledge Base** | Restaurant-specific context (menu, specialties) improves review quality |
| 📊 **Sentiment Analysis** | ML model (TF-IDF + Keras) classifies review sentiment with confidence scores |
| 📈 **Analytics Dashboard** | Real-time charts showing ratings, sentiment trends, and review volume |
| 🏷️ **Customizable Tags** | Owners define positive/negative tags customers can select |
| 🔒 **Private Feedback** | Low-rating feedback goes directly to the owner, not public |

---

## 🏗️ Tech Stack

### Backend
- **Framework:** FastAPI (Python)
- **Database:** Supabase (PostgreSQL)
- **AI:** Google Gemini 1.5 Flash (review generation + embeddings)
- **ML:** TensorFlow/Keras sentiment model with TF-IDF vectorization
- **Vector Search:** pgvector for RAG similarity matching

### Frontend
- **Framework:** Next.js 14 (React, App Router)
- **Styling:** Tailwind CSS with custom receipt/ticket design system
- **State:** React hooks with localStorage for auth tokens

---

## 📂 Project Structure

```
GenReviewAI/
├── backend/
│   ├── app/
│   │   ├── ai/              # Gemini AI review generation
│   │   ├── analytics/        # Analytics endpoints
│   │   ├── auth/             # Registration & JWT login
│   │   ├── dashboard/        # Owner dashboard API
│   │   ├── database/         # Supabase client
│   │   ├── ml/               # Sentiment analysis model
│   │   │   ├── models/       # Pre-trained .keras + .pkl files
│   │   │   ├── dataset/      # Training data
│   │   │   └── notebooks/    # Training notebooks
│   │   ├── qr/               # QR code generation
│   │   ├── rag/              # RAG knowledge base + vector search
│   │   ├── restaurant/       # Restaurant CRUD
│   │   ├── review/           # Review & private feedback submission
│   │   └── tags/             # Review tag management
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── app/
│   │   ├── (owner)/          # Owner dashboard pages
│   │   │   ├── dashboard/    # Main dashboard
│   │   │   ├── analytics/    # Analytics charts
│   │   │   ├── qr/           # QR code page
│   │   │   ├── tags/         # Tag management
│   │   │   ├── knowledge/    # RAG knowledge base
│   │   │   └── settings/     # Restaurant settings
│   │   ├── login/            # Login page
│   │   ├── register/         # Registration page
│   │   └── r/[restaurantId]/ # Customer review flow
│   ├── components/           # Reusable UI components
│   ├── lib/                  # API client & types
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Supabase account (free tier works)
- Google Gemini API key

### 1. Clone the repo

```bash
git clone https://github.com/vishwabhandare094-png/GenReviewAI.git
cd GenReviewAI
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your Supabase URL, Supabase Key, and Gemini API Key

# Start the server
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local if your backend runs on a different URL

# Start the dev server
npm run dev
```

### 4. Open in browser

| Page | URL |
|------|-----|
| Landing Page | http://localhost:3000 |
| Owner Registration | http://localhost:3000/register |
| Owner Login | http://localhost:3000/login |
| Owner Dashboard | http://localhost:3000/dashboard |
| API Docs (Swagger) | http://127.0.0.1:8000/docs |

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `DATABASE_URL` | PostgreSQL connection string |
| `GEMINI_API_KEY` | Google Gemini API key |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL (default: `http://127.0.0.1:8000`) |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register a new owner |
| `POST` | `/auth/login` | Login and get JWT token |
| `POST` | `/restaurant/create` | Create a restaurant |
| `GET` | `/restaurant/{id}/google-review-url` | Get Google Review URL |
| `POST` | `/qr/generate/{restaurant_id}` | Generate QR code |
| `GET` | `/tags/{restaurant_id}` | Get review tags |
| `POST` | `/ai/generate-review` | Generate AI review drafts |
| `POST` | `/review/submit` | Submit a public review |
| `POST` | `/review/private-feedback` | Submit private feedback |
| `GET` | `/dashboard/{restaurant_id}` | Get dashboard data |
| `GET` | `/analytics/{restaurant_id}` | Get analytics data |
| `POST` | `/rag/knowledge` | Add knowledge to RAG |

---

## 🧪 Customer Review Flow

1. **Scan QR Code** → Opens the review page for that restaurant
2. **Rate 1–5 stars** → Determines the flow path
3. **High rating (≥ 4 stars):**
   - Select up to 2 feedback tags (e.g., "Great food", "Friendly staff")
   - AI generates 3 natural review drafts
   - Pick one, edit it, and post directly to Google Reviews
4. **Low rating (< 4 stars):**
   - Write private feedback sent directly to the owner
   - Option to still post on Google if desired

---

## 🤝 Contributors

- **Vishwa Bhandare** — Project Lead
- **Sandesh Rathod** — Backend & ML Development

---

## 📄 License

This project is for educational and demonstration purposes.

---

<p align="center">
  Built with ❤️ using FastAPI, Next.js, Gemini AI & Supabase
</p>
