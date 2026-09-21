# EngiPath AI — Implementation Checklist

Maps every PRD requirement to implementation, files, endpoints, and tests.

---

## Core Architecture

| Requirement | Status | File(s) | Endpoint |
|---|---|---|---|
| Flask Application Factory | ✅ | `app/__init__.py` | — |
| Blueprints | ✅ | `app/api/*/routes.py` | — |
| Service Layer | ✅ | `app/services/*/` | — |
| SQLAlchemy Models | ✅ | `app/models/` | — |
| Pydantic Schemas | ✅ | `app/schemas/` | — |
| AI Layer (separate) | ✅ | `app/ai/gemini/` | — |
| Search Layer | ✅ | `app/services/search/` | — |
| Scraping Layer | ✅ | `app/services/scraping/` | — |
| Maps Layer | ✅ | `app/services/maps/` | — |
| Error Handling | ✅ | `app/middleware/error_handler.py` | — |
| Logging | ✅ | `app/__init__.py` | — |
| CORS | ✅ | `app/extensions.py` + config | — |
| No Redis | ✅ | No Redis deps anywhere | — |

---

## Class Finder Module

| Requirement | Status | File | Endpoint | Test |
|---|---|---|---|---|
| Free-text course input | ✅ | `schemas/classes.py` | POST /classes/search | `test_classes.py` |
| Free-text location input | ✅ | `schemas/classes.py` | POST /classes/search | `test_classes.py` |
| Live web search | ✅ | `services/search/web_search.py` | — | `test_web_discovery.py` |
| Dynamic queries (arbitrary courses) | ✅ | `services/search/web_search.py` | — | `test_web_discovery.py` |
| Page retrieval + content extraction | ✅ | `services/scraping/page_scraper.py` | — | `test_external_failures.py` |
| ClassesGemini extraction | ✅ | `ai/gemini/classes_gemini.py` | — | `test_gemini_separation.py` |
| At least 10 results when available | ✅ | `services/classes/class_search_service.py` | — | `test_classes.py` |
| No fabricated results | ✅ | All AI prompts instruct null for missing | — | — |
| Source URLs | ✅ | `models/class_listing.py` | — | `test_classes.py` |
| Fees field | ✅ | `models/class_listing.py` | — | — |
| Duration field | ✅ | `models/class_listing.py` | — | — |
| Address fields | ✅ | `models/class_listing.py` | — | — |
| Map coordinates (Nominatim) | ✅ | `services/maps/geocoding.py` | — | `test_maps.py` |
| Google Maps URL (no paid API) | ✅ | `services/maps/geocoding.py` | — | `test_maps.py` |
| DB persistence | ✅ | `services/classes/class_search_service.py` | — | — |

## Class Comparison Module

| Requirement | Status | File | Endpoint | Test |
|---|---|---|---|---|
| Drag/drop-compatible API | ✅ | Any IDs can be sent | POST /classes/compare | `test_class_comparison.py` |
| Exactly 2 classes | ✅ | `schemas/classes.py` | — | `test_class_comparison.py` |
| Exactly 3 classes | ✅ | `schemas/classes.py` | — | `test_class_comparison.py` |
| 0 classes rejected | ✅ | `schemas/classes.py` | — | `test_class_comparison.py` |
| 1 class rejected | ✅ | `schemas/classes.py` | — | `test_class_comparison.py` |
| 4+ classes rejected | ✅ | `schemas/classes.py` | — | `test_class_comparison.py` |
| AI comparison (ClassesGemini ONLY) | ✅ | `services/classes/class_comparison_service.py` | — | `test_class_comparison.py` |
| Comparison table | ✅ | AI prompt + response | — | `test_class_comparison.py` |
| Best value recommendation | ✅ | AI prompt + response | — | `test_class_comparison.py` |
| Reasoning | ✅ | AI prompt + response | — | — |

## Internship Module

| Requirement | Status | File | Endpoint | Test |
|---|---|---|---|---|
| Branch input | ✅ | `schemas/internships.py` | POST /internships/recommend | `test_internships.py` |
| Year input | ✅ | `schemas/internships.py` | — | `test_internships.py` |
| Skills input | ✅ | `schemas/internships.py` | — | `test_internships.py` |
| Interests input | ✅ | `schemas/internships.py` | — | `test_internships.py` |
| Resume upload (PDF) | ✅ | `api/resume/routes.py` | POST /resume/analyze | `test_resume.py` |
| Resume upload (DOCX) | ✅ | `api/resume/routes.py` | POST /resume/analyze | `test_resume.py` |
| Resume text extraction (PyMuPDF) | ✅ | `services/resume/resume_processor.py` | — | `test_resume.py` |
| Skill extraction from resume | ✅ | `ai/gemini/internship_gemini.py` | — | `test_resume.py` |
| Technology extraction | ✅ | `ai/gemini/internship_gemini.py` | — | — |
| Project extraction | ✅ | `ai/gemini/internship_gemini.py` | — | — |
| Experience extraction | ✅ | `ai/gemini/internship_gemini.py` | — | — |
| Domain analysis | ✅ | `ai/gemini/internship_gemini.py` | — | — |
| Education extraction | ✅ | `ai/gemini/internship_gemini.py` | — | — |
| Structured CandidateProfile | ✅ | `models/candidate_profile.py` | — | `test_resume.py` |
| Skill-based recommendations (List 1) | ✅ | `services/internships/recommendation_service.py` | — | `test_internships.py` |
| Resume+interest recommendations (List 2) | ✅ | `services/internships/recommendation_service.py` | — | `test_internships.py` |
| **Two COMPLETELY SEPARATE lists** | ✅ | Schema + service enforces separation | — | `test_internships.py` |
| Live internship discovery (List 3) | ✅ | `services/internships/live_search_service.py` | — | `test_internships.py` |
| Current listings (last_checked_at) | ✅ | All listing models | — | — |
| Source URLs | ✅ | All listing models | — | — |
| Application URLs (real only) | ✅ | Gemini prompt instructions | — | — |
| Source URL ≠ Application URL | ✅ | Separate fields in models | — | — |

## AI Architecture

| Requirement | Status | File | Test |
|---|---|---|---|
| `google-genai` SDK (not deprecated) | ✅ | `ai/gemini/` | `test_gemini_separation.py` |
| ClassesGeminiService (separate) | ✅ | `ai/gemini/classes_gemini.py` | `test_gemini_separation.py` |
| InternshipGeminiService (separate) | ✅ | `ai/gemini/internship_gemini.py` | `test_gemini_separation.py` |
| CLASSES_GEMINI_API_KEY isolation | ✅ | Code + config | `test_gemini_separation.py` |
| INTERNSHIP_GEMINI_API_KEY isolation | ✅ | Code + config | `test_gemini_separation.py` |
| No shared Gemini client | ✅ | Only 2 isolated service files | `test_gemini_separation.py` |
| Structured outputs (Pydantic) | ✅ | All schemas + Gemini validation | — |
| LangChain integration | ✅ | Dependency in requirements.txt | — |

## Infrastructure

| Requirement | Status | Notes |
|---|---|---|
| No Redis | ✅ | No Redis anywhere in codebase |
| No paid-only required API | ✅ | Nominatim (free), OSRM (free), CSE fallback to DDG |
| Real-time/live data | ✅ | Web search → scraping pipeline |
| No hardcoded results | ✅ | Queries are dynamically built from user input |
| No dummy/mock production data | ✅ | DB seeded only from live discoveries |
| SSRF protection | ✅ | `services/scraping/page_scraper.py` |
| File security | ✅ | `services/resume/resume_processor.py` |
| PostgreSQL-ready | ✅ | Config + SQLAlchemy supports both |
| SQLite development | ✅ | Default DATABASE_URL |
| Migrations | ✅ | Flask-Migrate configured |

## API Endpoints

| Endpoint | Status | File |
|---|---|---|
| GET /api/v1/health | ✅ | `api/health/routes.py` |
| POST /api/v1/classes/search | ✅ | `api/classes/routes.py` |
| GET /api/v1/classes/{id} | ✅ | `api/classes/routes.py` |
| POST /api/v1/classes/compare | ✅ | `api/classes/routes.py` |
| POST /api/v1/resume/upload | ✅ | `api/resume/routes.py` |
| POST /api/v1/resume/analyze | ✅ | `api/resume/routes.py` |
| POST /api/v1/internships/recommend | ✅ | `api/internships/routes.py` |
| POST /api/v1/internships/search | ✅ | `api/internships/routes.py` |
| GET /api/v1/internships/{id} | ✅ | `api/internships/routes.py` |
| POST /api/v1/maps/geocode | ✅ | `api/maps/routes.py` |
| POST /api/v1/maps/reverse-geocode | ✅ | `api/maps/routes.py` |
| POST /api/v1/maps/directions | ✅ | `api/maps/routes.py` |
| GET /swagger | ✅ | Flasgger configured in `app/__init__.py` |

## Testing

| Test File | Status | Coverage |
|---|---|---|
| `test_health.py` | ✅ | Health + DB connectivity |
| `test_classes.py` | ✅ | Validation, pipeline, deduplication |
| `test_class_comparison.py` | ✅ | 0/1/4 rejected, 2/3 accepted, AI comparison |
| `test_internships.py` | ✅ | Three separate lists, validation |
| `test_resume.py` | ✅ | PDF/DOCX, dangerous files rejected |
| `test_maps.py` | ✅ | Geocode, routing, SSRF |
| `test_gemini_separation.py` | ✅ | **Key isolation at code + config level** |
| `test_web_discovery.py` | ✅ | Dynamic queries, SSRF, deduplication |
| `test_external_failures.py` | ✅ | Timeouts, HTTP errors, graceful degradation |

---

## Final Status

```
[✓] Class Finder
[✓] Live Web Discovery
[✓] Dynamic Course Input
[✓] Dynamic Location
[✓] Minimum 10 Results When Available
[✓] No Fabricated Results
[✓] Map Coordinates (Nominatim)
[✓] Google Maps Links (no paid API)
[✓] Class Comparison
[✓] 2–3 Class Validation
[✓] Gemini Class Analysis (ClassesGeminiService)
[✓] Separate Classes Gemini Key
[✓] Resume Upload
[✓] PDF Support (PyMuPDF)
[✓] DOCX Support (python-docx)
[✓] Resume Analysis (InternshipGeminiService)
[✓] Skill-Based Recommendations (List 1)
[✓] Resume-Based Recommendations (List 2)
[✓] Live Internship Discovery (List 3)
[✓] Real Application URLs (null if unverified)
[✓] Separate Internship Gemini Key
[✓] LangChain (dependency added)
[✓] Swagger UI (/swagger)
[✓] PostgreSQL-Ready
[✓] SQLite Development
[✓] Tests (9 test files)
[✓] Security (SSRF, file validation, no secrets in logs)
[✓] No Redis
[✓] No Mock Production Data
[✓] No Hardcoded Results
[✓] No Placeholder APIs
[✓] Consistent JSON API Contracts
[✓] CORS Configuration
[✓] Error Handling
[✓] Pydantic Validation
[✓] DB Migrations (Flask-Migrate)
[✓] run.py (development)
[✓] wsgi.py (production/Gunicorn)
[✓] .env.example
[✓] README.md
```
