# EngiPath AI — Backend

> **Discover. Learn. Intern. Grow.**
> Production-ready Flask backend with live AI-powered class discovery and internship recommendations.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Environment Variables](#environment-variables)
3. [Database Setup](#database-setup)
4. [Running the Server](#running-the-server)
5. [API Documentation (Swagger)](#api-documentation)
6. [Testing](#testing)
7. [External Services](#external-services)
8. [Architecture Overview](#architecture-overview)
9. [Security Notes](#security-notes)

---

## Quick Start

### 1. Clone and enter directory

```bash
cd backend
```

### 2. Create virtual environment

```bash
python -m venv venv
```

### 3. Activate

**Windows:**
```bash
venv\Scripts\activate
```

**Linux/macOS:**
```bash
source venv/bin/activate
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

### 5. Configure environment

```bash
copy .env.example .env   # Windows
cp .env.example .env     # Linux/macOS
# Edit .env with your API keys
```

### 6. Run database migrations

```bash
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

### 7. Start server

```bash
python run.py
```

Server starts at: **http://localhost:5000**
Swagger UI: **http://localhost:5000/swagger**

---

## Environment Variables

All configuration is via `.env` (never commit this file).

| Variable | Required | Description |
|---|---|---|
| `FLASK_ENV` | No | `development` (default) / `production` |
| `DATABASE_URL` | No | SQLite (dev) or PostgreSQL (prod) URL |
| `CLASSES_GEMINI_API_KEY` | **Yes** | Gemini key for Classes module ONLY |
| `CLASSES_GEMINI_MODEL` | No | Gemini model (default: `gemini-2.0-flash`) |
| `INTERNSHIP_GEMINI_API_KEY` | **Yes** | Gemini key for Internship/Resume module ONLY |
| `INTERNSHIP_GEMINI_MODEL` | No | Gemini model (default: `gemini-2.0-flash`) |
| `SEARCH_API_KEY` | No | Google CSE API key (100 free queries/day). Falls back to DuckDuckGo if not set. |
| `SEARCH_ENGINE_ID` | No | Google Programmable Search Engine ID |
| `NOMINATIM_URL` | No | OpenStreetMap Nominatim URL (default: public endpoint) |
| `OSRM_URL` | No | OSRM routing URL (default: public endpoint) |
| `CORS_ORIGINS` | No | Allowed CORS origins (comma-separated) |
| `UPLOAD_FOLDER` | No | Directory for resume uploads (default: `uploads/`) |
| `MAX_CONTENT_LENGTH` | No | Max upload size in bytes (default: 10MB) |
| `DELETE_RESUME_AFTER_ANALYSIS` | No | Delete resume file after extraction (default: `true`) |
| `LOG_LEVEL` | No | Logging level (default: `INFO`) |

---

## Gemini Key Separation

> ⚠️ **Critical Architecture Rule**

Two completely separate Gemini API keys are used:

| Key | Used By | NEVER used by |
|---|---|---|
| `CLASSES_GEMINI_API_KEY` | Class search, Class comparison | Internships, Resume analysis |
| `INTERNSHIP_GEMINI_API_KEY` | Internship recommendations, Resume analysis | Classes, Comparison |

This separation is enforced in code and verified by `tests/test_gemini_separation.py`.

---

## Database Setup

**Development (SQLite — no setup needed):**
```bash
flask db init
flask db migrate -m "Initial"
flask db upgrade
```

**Production (PostgreSQL):**
```env
DATABASE_URL=postgresql://user:password@host:5432/engipath
```
Then run the same migration commands.

---

## Running the Server

**Development:**
```bash
python run.py
```

**Production (Gunicorn):**
```bash
gunicorn --bind 0.0.0.0:5000 --workers 4 wsgi:application
```

---

## API Documentation

Swagger UI is available at:
```
http://localhost:5000/swagger
```

OpenAPI JSON spec:
```
http://localhost:5000/apispec.json
```

### Key Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/health` | Health check |
| POST | `/api/v1/classes/search` | Live class search |
| GET | `/api/v1/classes/{id}` | Get class by ID |
| POST | `/api/v1/classes/compare` | AI class comparison (2–3 classes) |
| POST | `/api/v1/resume/upload` | Upload resume (PDF/DOCX) |
| POST | `/api/v1/resume/analyze` | Extract profile from resume |
| POST | `/api/v1/internships/recommend` | Get recommendations + live internships |
| POST | `/api/v1/internships/search` | Live internship search only |
| GET | `/api/v1/internships/{id}` | Get internship by ID |
| POST | `/api/v1/maps/geocode` | Address → coordinates |
| POST | `/api/v1/maps/reverse-geocode` | Coordinates → address |
| POST | `/api/v1/maps/directions` | Routing between two points |

---

## Testing

**Run all tests:**
```bash
pytest tests/ -v
```

**With coverage report:**
```bash
pytest tests/ -v --cov=app --cov-report=term-missing
```

**Run specific test file:**
```bash
pytest tests/test_gemini_separation.py -v
pytest tests/test_class_comparison.py -v
```

### Test Suite Coverage

| File | Tests |
|---|---|
| `test_health.py` | Health endpoint, DB connectivity |
| `test_classes.py` | Validation, pipeline, deduplication |
| `test_class_comparison.py` | 0/1/4 rejected, 2/3 accepted, AI comparison |
| `test_internships.py` | Two separate lists, counts, live search |
| `test_resume.py` | File validation, PDF/DOCX extraction, security |
| `test_maps.py` | Geocode, reverse geocode, routing |
| `test_gemini_separation.py` | **Key isolation verification** |
| `test_web_discovery.py` | Dynamic queries, SSRF, deduplication |
| `test_external_failures.py` | Timeouts, HTTP errors, graceful degradation |

---

## External Services

### Google Custom Search API
- **Type**: Web search
- **Free tier**: 100 queries/day
- **Key**: `SEARCH_API_KEY` + `SEARCH_ENGINE_ID`
- **Setup**: [Google Programmable Search Engine](https://programmablesearchengine.google.com/)
- **Fallback**: DuckDuckGo (no key — used automatically if CSE not configured)

### Nominatim (OpenStreetMap)
- **Type**: Geocoding
- **Cost**: Completely free
- **Key**: None required
- **Rate limit**: 1 request/second (enforced internally)
- **Documentation**: [nominatim.org](https://nominatim.org/)

### OSRM (Open Source Routing Machine)
- **Type**: Turn-by-turn routing
- **Cost**: Completely free
- **Key**: None required
- **Documentation**: [project-osrm.org](http://project-osrm.org/)

### Google Gemini
- **Type**: AI analysis and extraction
- **SDK**: `google-genai` (current, NOT deprecated `google-generativeai`)
- **Free tier**: Available via Google AI Studio
- **Setup**: [aistudio.google.com](https://aistudio.google.com/)

---

## Architecture Overview

```
backend/
├── app/
│   ├── api/          → Thin route handlers (Blueprint-based)
│   ├── services/     → Business logic layer
│   │   ├── classes/  → Class search + comparison
│   │   ├── internships/ → Recommendations + live search
│   │   ├── resume/   → File processing
│   │   ├── search/   → Web search (Google CSE + DuckDuckGo)
│   │   ├── scraping/ → Page retrieval + content extraction
│   │   └── maps/     → Geocoding (Nominatim) + Routing (OSRM)
│   ├── ai/
│   │   ├── gemini/   → ClassesGeminiService, InternshipGeminiService (ISOLATED)
│   │   └── prompts/  → All LLM prompts
│   ├── models/       → SQLAlchemy models
│   ├── schemas/      → Pydantic validation
│   └── middleware/   → Error handling, logging
└── tests/            → pytest test suite
```

### Data Flow

**Class Finder:**
```
User Query → Validation → Dynamic Web Search → Page Scraping
→ Content Extraction → ClassesGemini → Deduplication
→ Nominatim Geocoding → DB Persist → API Response
```

**Internship Recommender:**
```
User Profile + Resume → Resume Extraction (InternshipGemini)
→ Skill-Based Recommendations (InternshipGemini) [List 1]
→ Resume-Based Recommendations (InternshipGemini) [List 2]
→ Live Web Search → Scraping → Live Internships [List 3]
→ API Response (3 separate lists)
```

---

## Security Notes

- **No Redis** — intentionally excluded by design
- **SSRF Protection** — all URLs validated against private IP ranges before fetch
- **File validation** — extension + MIME type checked for resume uploads
- **No path traversal** — filenames sanitized via `werkzeug.utils.secure_filename`
- **No secrets in logs** — API keys and resume text never logged
- **No mock data in production** — all data comes from live web sources
- **Gemini key isolation** — enforced in code and verified by automated tests
