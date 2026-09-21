# EngiPath AI — Autonomous Career & Education Intelligence Platform

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg?logo=python)
![Flask](https://img.shields.io/badge/Flask-3.0-lightgrey.svg?logo=flask)
![React](https://img.shields.io/badge/React-18-blue.svg?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg?logo=tailwind-css)
![Gemini AI](https://img.shields.io/badge/Google%20Gemini-2.5%20Flash-4285F4.svg?logo=google)
![Tests](https://img.shields.io/badge/Tests-102%2F102%20Passing-success.svg)

**Discover. Learn. Intern. Grow.**  
*An end-to-end autonomous intelligence platform empowering engineering students with AI-powered course discovery, deep curriculum comparison, resume ATS scoring, dual-tier internship matching, and real-time geospatial commute intelligence.*

</div>

---

## 🌟 Key Highlights

- **Dual-Aesthetic User Experience**:
  - **Cinematic Landing Zone**: 240-frame dynamic canvas scroll scrubber (`requestAnimationFrame`) with ambient glowing gradients and interactive hero visual.
  - **Tactile Bento Workspace**: Tactile claymorphic card elevations (`#F8F9F5` warm surface, `#82E2B0` mint accents) with vibrant pastel highlights and pill navigation.
- **Strictly Separated Gemini AI Engines**:
  - **Classes & Curriculum Engine**: Powered by Google Gemini 2.5 Flash for intelligent course recommendations, syllabus extraction, and side-by-side curriculum comparison.
  - **Internship & Resume ATS Engine**: Powered by Gemini Flash for PDF/DOCX parsing, skill gap analysis, and dual-layer internship match scoring.
- **Dual-Tier Internship Recommendations**:
  - **Curated Matches**: High-confidence role matches based on student branch, academic year, and extracted resume skills.
  - **Live Web Enrichment**: Real-time opportunity search via DuckDuckGo / Google Programmable Search.
- **Geospatial Campus & Commute Routing**:
  - Zero-cost OpenStreetMap Nominatim geocoding and OSRM routing engine calculating real-world driving distance and commute durations.
- **Stateless Authentication & Security**:
  - Signed URLSafeTimedSerializer stateless tokens (24h expiry) and secure password hashing.
- **Production Rigor**:
  - **102 / 102 Backend Pytest Suite Passing** with comprehensive integration and schema validation.
  - **Strict TypeScript (`tsc --noEmit`) verified** with zero compile errors.

---

## 🏗️ Architecture & Tech Stack

```
                                    ┌────────────────────────┐
                                    │    React 18 Frontend   │
                                    │ (Vite + TS + Tailwind) │
                                    └───────────┬────────────┘
                                                │ REST API / Bearer Auth
                                                ▼
                                    ┌────────────────────────┐
                                    │   Flask 3.0 Backend    │
                                    │ (Application Factory)  │
                                    └───────┬───┬────┬───────┘
                     ┌──────────────────────┘   │    └──────────────────────┐
                     ▼                          ▼                           ▼
        ┌─────────────────────────┐ ┌────────────────────────┐ ┌─────────────────────────┐
        │   Classes AI Engine     │ │   Internships Engine   │ │   Geospatial & Search   │
        │ (Gemini 2.5 Flash)      │ │ (Gemini Flash + ATS)   │ │ (OSRM + Nominatim + DDG)│
        └─────────────────────────┘ └────────────────────────┘ └─────────────────────────┘
                     │                          │                           │
                     └──────────────────────┬───┴───────────────────────────┘
                                            ▼
                                ┌─────────────────────────┐
                                │   PostgreSQL / SQLite   │
                                │  (SQLAlchemy + Alembic) │
                                └─────────────────────────┘
```

### Backend Tech Stack
- **Framework**: Flask 3.0 with Blueprint modular routing
- **AI & LLM**: Google Gemini API (`google-genai` / `google-generativeai`)
- **Database & ORM**: SQLAlchemy 2.0 with Flask-SQLAlchemy, Alembic migrations, PostgreSQL & SQLite support
- **Data Validation**: Pydantic v2 schemas
- **Resume Extraction**: `pypdf`, `python-docx`
- **Geospatial & Mapping**: OpenStreetMap Nominatim, OSRM Routing API
- **Testing**: `pytest`, `pytest-mock`, `pytest-cov`

### Frontend Tech Stack
- **Framework**: React 18, Vite 5, TypeScript 5
- **Styling**: Tailwind CSS 3.4 with custom claymorphic elevation plugins
- **State Management**: Zustand with persistent storage
- **Routing**: React Router DOM v6
- **Icons & UI**: Lucide React
- **Performance**: High-speed Canvas image frame scrubber with asynchronous preloading

---

## 📁 Repository Structure

```
EngiPath_AI_Kshitij/
├── backend/
│   ├── app/
│   │   ├── ai/                 # Gemini prompt engineering & AI providers
│   │   ├── api/v1/             # REST endpoints (auth, classes, internships, resume)
│   │   ├── models/             # SQLAlchemy ORM models
│   │   ├── schemas/            # Pydantic request/response validation schemas
│   │   ├── services/           # Business logic (maps, search, auth, resume)
│   │   └── utils/              # Error handlers, logging, rate limiters
│   ├── migrations/             # Alembic database migration scripts
│   ├── tests/                  # 102 Pytest unit and integration tests
│   ├── .env.example            # Environment variables template
│   ├── requirements.txt        # Python backend dependencies
│   ├── run.py                  # Local development server entrypoint
│   └── wsgi.py                 # Production WSGI entrypoint
│
├── frontend/
│   ├── public/
│   │   └── frames/             # 240 extracted frames for landing page canvas scrubber
│   ├── src/
│   │   ├── components/         # Reusable UI cards, badges, navbar, modals
│   │   ├── pages/              # Landing, Classes, Internships, Resume, Auth
│   │   ├── services/           # Axios API client & endpoints
│   │   ├── store/              # Zustand authentication & preference stores
│   │   ├── types/              # TypeScript interfaces & API contracts
│   │   ├── App.tsx             # Root application & routing
│   │   └── main.tsx            # DOM initialization
│   ├── .env.example            # Frontend environment variables template
│   ├── package.json            # Frontend dependencies & scripts
│   ├── tailwind.config.js      # Custom theme tokens & design system
│   └── vite.config.ts          # Vite build configuration
│
├── FRONTEND_IMPLEMENTATION_AUDIT.md # Detailed frontend implementation audit
├── .gitignore                  # Git ignore rules
└── README.md                   # Project documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** 18+ and **npm**
- **Python** 3.10+
- **PostgreSQL** (Optional; SQLite works automatically for local development)
- **Google Gemini API Key** (from [Google AI Studio](https://aistudio.google.com/))

---

### 1. Backend Setup

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create and activate a Python virtual environment
# Windows:
python -m venv venv
venv\Scripts\activate
# Linux/macOS:
python3 -m venv venv
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment variables
cp .env.example .env

# Edit .env and supply your Gemini API Keys:
# CLASSES_GEMINI_API_KEY=your_key_here
# INTERNSHIP_GEMINI_API_KEY=your_key_here

# 5. Start the backend development server
python run.py
```
The backend API will be live at `http://localhost:5000`.  
Access API Health Check: `http://localhost:5000/api/v1/health`

---

### 2. Frontend Setup

```bash
# 1. In a new terminal, navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env

# 4. Start the frontend development server
npm run dev
```
The frontend will launch at `http://localhost:5173`.

---

## 🧪 Testing & Validation

### Backend Automated Test Suite
The project contains 102 comprehensive automated tests covering authentication, resume parsing, ATS scoring algorithms, syllabus comparison, and mock geospatial routing:

```bash
cd backend
venv\Scripts\activate
pytest -v
```
```
============================= 102 passed in 14.82s =============================
```

### Frontend Typecheck & Build
```bash
cd frontend
npm run build
```

---

## 📡 API Endpoints Matrix

| Module | Method | Endpoint | Description |
|---|---|---|---|
| **Health** | `GET` | `/api/v1/health` | System status & health check |
| **Auth** | `POST` | `/api/v1/auth/register` | Register new student profile |
| **Auth** | `POST` | `/api/v1/auth/login` | Authenticate & retrieve Bearer token |
| **Auth** | `GET` | `/api/v1/auth/me` | Fetch active user session |
| **Classes** | `POST` | `/api/v1/classes/search` | Search engineering courses with AI |
| **Classes** | `GET` | `/api/v1/classes/<id>` | Retrieve syllabus and details |
| **Classes** | `POST` | `/api/v1/classes/compare` | Deep side-by-side curriculum comparison |
| **Internships** | `POST` | `/api/v1/internships/recommend` | Dual-tier role match scoring |
| **Internships** | `POST` | `/api/v1/internships/search` | Live search for internship openings |
| **Resume** | `POST` | `/api/v1/resume/upload` | Upload PDF/DOCX for ATS extraction |
| **Resume** | `GET` | `/api/v1/resume/analysis/<id>`| Retrieve parsed skills and gaps |

---

## 🔒 Security & Privacy

- Sensitive environment variables (`.env`) are strictly excluded from source control.
- Passwords are encrypted using robust cryptographic hashing (`werkzeug.security`).
- Stateless authentication tokens are cryptographically signed with configurable TTL expiration.
- User resume uploads are validated for MIME type, sanitized, and stored securely.

---

## 📄 License

This project is licensed under the MIT License — see the LICENSE file for details.
