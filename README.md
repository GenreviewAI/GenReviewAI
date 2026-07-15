# GenReviewAI

GenReviewAI is an enterprise-grade, AI-powered review management and detractor recovery platform for restaurants. It helps happy customers write public Google reviews and routes unhappy customers into a private feedback flow so owners can analyze and respond before the issue becomes public.

**Live Frontend:** https://genreviewai-frontend.onrender.com

---

## 🚀 Key Features

### 1. Global Active Restaurant Sync
- A persistent active outlet selector dropdown is integrated directly into the sidebar panel.
- Allows owners with multiple restaurant branches or outlets to switch between properties instantly.
- Selection is synced globally across the Dashboard, QR Generator, Settings, Tags, and RAG Knowledge pages, and is fully persisted in `localStorage` across page reloads.

### 2. AI Detractor Recovery & Operational Action Plans
- Powered by Google Gemini (`gemini-1.5-flash`), the owner's dashboard automatically generates a customized **AI Recovery Plan** for every private feedback or low-rating customer response.
- Includes a copy-to-clipboard **Suggested Apology Response** to send to the customer.
- Provides a clear **Operational Action Item** for kitchen/service staff to rectify the root cause (e.g. food quality, service latency).

### 3. Static QR Code Generation (All-in-One QR)
- QR codes are static and linked to a persistent short code (e.g. `FB8E635B`). Pushing settings updates, menu edits, or restaurant profile changes will **never regenerate the QR code** automatically.
- Owners can download and print the card layout once and use it permanently.
- Includes an explicit **"Reset and create new QR"** function that updates the link only when forced.

### 4. Dynamic CSS Themes
- Custom, HSL-harmonized preset templates (e.g., *Modern Green*, *Soft Plum*, *Warm Ticket*) are loaded dynamically.
- The customer-facing rating and feedback pages dynamically pull and apply styling properties at runtime via custom CSS Properties (variables).

### 5. Multi-Channel Email Alerts
- Leverages the Resend API to deliver instant notifications when reviews drop below the owner's customized rating threshold.
- Features a fallback routing model that uses the restaurant record's contact email if the profile lacks user credentials.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS, Recharts
- **Backend:** FastAPI, Python 3.11, Pydantic, Uvicorn, Gunicorn
- **Database:** Supabase, PostgreSQL
- **AI/LLM:** Google GenAI SDK (Gemini API)
- **ML/NLP:** TensorFlow, Keras, Scikit-learn (Sentiment & Confidence scoring)
- **Deployment:** Render, GitHub Actions

---

## 📂 Project Structure

```text
GenReviewAI/
├── backend/            # FastAPI python backend
│   ├── app/
│   │   ├── ai/        # Gemini API review generator
│   │   ├── dashboard/ # Analytics & AI Recovery compiler
│   │   ├── email/     # Resend notification services
│   │   ├── qr/        # QR image generator & static pathing
│   │   └── main.py    # FastAPI endpoints routing
├── frontend/           # Next.js frontend app
│   ├── app/           # App router (Owner dashboard, QR, settings, Customer pages)
│   ├── components/    # Reusable UI widgets & Sidebar
│   └── lib/           # Supabase & API request client helpers
├── gunicorn.conf.py    # Gunicorn port binder for Render
├── render.yaml         # Render Infrastructure-as-Code config
└── README.md
```

---

## 💻 Local Setup

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

Create a `.env` file in the `backend` directory matching the `.env.example` structure, and set `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000` in the `frontend` folder for local development.

---

## 🌐 Production Deployment

- **Frontend:** https://genreviewai-frontend.onrender.com (Next.js Static out)
- **Backend:** https://genreviewai-backend.onrender.com (FastAPI Web Service)
- **Gunicorn binding**: Configured in `gunicorn.conf.py` to automatically map the FastAPI web service to `0.0.0.0:$PORT` on Render.
