# EngiPath AI — Comprehensive Backend Architecture & Technical Guide

> **Target Audience:** Project Reviewers, Clients, Faculty Evaluators, and Students  
> **Project Title:** EngiPath AI (AI-Smart Internship & Skill Learning Navigator)  
> **Backend Framework:** Python 3.10+ / Flask 3.1 (Application Factory Pattern)  
> **Validation Status:** 102 / 102 Pytest Automated Tests Passing  

---

## 1. Executive Overview

The **EngiPath AI** backend is a production-grade RESTful service built with **Flask 3.1**, designed to eliminate hardcoded, mock, or synthetic data in student career navigation. Unlike traditional portals that present static databases of stale internships and coaching classes, EngiPath AI operates as an **autonomous real-time discovery engine**.

### Core Responsibilities
1. **Dynamic Web Discovery**: Orchestrating live search queries via Google Custom Search API and DuckDuckGo.
2. **Resilient Web Scraping**: Concurrently fetching institute syllabi and job postings while stripping HTML boilerplate and guarding against security vulnerabilities (SSRF).
3. **Isolated AI Intelligence**: Employing Google Gemini 2.0/2.5 Flash and LangChain under strict architectural separation for resume parsing, course extraction, and recommendation generation.
4. **Zero-Cost Geospatial Intelligence**: Calculating exact campus coordinates and commute times using OpenStreetMap Nominatim and OSRM without recurring API bills.
5. **Stateless Security**: Providing cryptographic token authentication and secure document handling with automated file shredding.

---

## 2. End-to-End System Architecture

```
                                  [ React 18 Frontend ]
                                            │
                                            │ HTTP / JSON (Bearer Token)
                                            ▼
                           ┌─────────────────────────────────┐
                           │    Flask 3.1 Application        │
                           │   (App Factory + Blueprints)    │
                           └────────────────┬────────────────┘
                                            │
          ┌─────────────────────┬───────────┴───────────┬─────────────────────┐
          ▼                     ▼                       ▼                     ▼
 ┌─────────────────┐   ┌─────────────────┐     ┌─────────────────┐   ┌─────────────────┐
 │  Auth & Resume  │   │  Class Search   │     │  Internships    │   │  Geospatial     │
 │  Service Layer  │   │  Service Layer  │     │  Service Layer  │   │  Service Layer  │
 └────────┬────────┘   └────────┬────────┘     └────────┬────────┘   └────────┬────────┘
          │                     │                       │                     │
          │ PyMuPDF/docx        │ Google CSE/DuckDuckGo │ Live Job Boards     │ Nominatim/OSRM
          ▼                     ▼                       ▼                     ▼
 ┌─────────────────┐   ┌─────────────────┐     ┌─────────────────┐   ┌─────────────────┐
 │ Document Parser │   │ WebSearchService│     │  PageScraper    │   │ Routing Machine │
 │ + Secure Shred  │   │ (Query Builder) │     │ (ThreadPoolEx.) │   │ (Zero-Cost API) │
 └────────┬────────┘   └────────┬────────┘     └────────┬────────┘   └─────────────────┘
          │                     │                       │
          └─────────────────────┼───────────────────────┘
                                ▼
         ┌──────────────────────────────────────────────┐
         │         AI & LLM Orchestration Layer         │
         │   (LangChain + Google GenAI 1.10+ SDK)       │
         ├──────────────────────┬───────────────────────┤
         │ ClassesGeminiService │InternshipGeminiService│
         │ (CLASSES_API_KEY)    │ (INTERNSHIP_API_KEY)  │
         └──────────────────────┴───────────────────────┘
                                │
                                ▼
         ┌──────────────────────────────────────────────┐
         │     Database Layer (SQLAlchemy 2.0 ORM)      │
         │   SQLite (Dev)  /  PostgreSQL (Production)   │
         └──────────────────────────────────────────────┘
```

---

## 3. Dynamic Search Engine: Google CSE & DuckDuckGo Fallback

### The Problem It Solves
Traditional platforms rely on static local databases. When a student in Amravati or Pune searches for "VLSI Design" or "Generative AI", hardcoded databases return zero or outdated results. EngiPath AI performs **on-the-fly live web discovery**.

### How It Works (`app/services/search/web_search.py`)
The search subsystem implements a two-tier priority hierarchy:

1. **Tier 1 (Google Programmable Custom Search JSON API)**:
   - Used when `SEARCH_API_KEY` and `SEARCH_ENGINE_ID` are configured.
   - Provides 100 free search queries per day with high precision.
2. **Tier 2 (DuckDuckGo HTML Search — Zero-Cost Fallback)**:
   - When Google CSE quota is exhausted or unconfigured, the system automatically switches to DuckDuckGo (`https://html.duckduckgo.com/html/`).
   - Requires **no API key**, charges zero fees, and has no strict daily rate-limit.
   - DuckDuckGo's raw HTML response is parsed using BeautifulSoup to extract live URLs, titles, and snippets.

### Algorithmic Query Synthesis
Instead of naive search queries, the system synthesizes targeted Boolean search strings:

* **For Classes & Courses:**
  ```python
  f"{course} classes in {location}"
  f"best {course} training institute {location}"
  f"{course} coaching center {location} fees"
  ```
* **For Live Internships:**
  ```python
  f"{branch} engineering internship {location} site:internshala.com OR site:linkedin.com OR site:indeed.com"
  f"{skills_str} internship {location} apply now"
  ```

### Result Deduplication
Search engines often return multiple links pointing to the same domain or identical subpages. The backend enforces URL canonicalization via an in-memory set (`seen_urls`) to ensure students only receive unique, high-value opportunities.

---

## 4. High-Performance Web Scraping & Enterprise Security

Once candidate URLs are discovered, raw web content must be retrieved and parsed. This is handled by `PageScraperService` (`app/services/scraping/page_scraper.py`).

### 1. Concurrent Multi-Threaded Batch Scraping
Sequential scraping is too slow for real-time web interactions (e.g., 6 URLs taking 3 seconds each would force an 18-second delay).
- EngiPath AI uses Python's **`ThreadPoolExecutor`** with `max_workers=6`.
- Up to 6 institute or job pages are scraped concurrently.
- The overall roundtrip time drops from ~18s to under 3.5s.

### 2. Dual-Engine Content Extraction
Web pages contain heavy boilerplate (navbars, ads, footers, cookie banners) that wastes LLM token budgets.
- **Primary Extractor (`trafilatura`)**: A specialized natural language web scraper that identifies the main content article while stripping out HTML markup, scripts, and advertisements.
- **Fallback Extractor (`BeautifulSoup4` + `lxml`)**: If `trafilatura` yields less than 50 characters, BeautifulSoup automatically steps in to parse text from article tags and paragraphs.

### 3. Server-Side Request Forgery (SSRF) Defense
Web scrapers that visit arbitrary user-supplied or search-derived links can be exploited to probe internal network infrastructure. EngiPath AI implements strict SSRF filters before establishing any HTTP socket:
- **DNS Resolution & IP Validation**: Every URL's hostname is resolved to its underlying IP address.
- **Private IP Blacklist**: The request is aborted if the IP falls into private or link-local subnets:
  * `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16` (Private LAN)
  * `127.0.0.0/8`, `::1/128` (Localhost loopback)
  * `169.254.0.0/16` (AWS / Cloud metadata endpoints)
- **Domain Blacklist**: Known social media or login-walled domains (`facebook.com`, `instagram.com`, `twitter.com`) are automatically skipped.

### 4. Fault Tolerance
- **Timeouts**: Individual requests are strictly capped at 6 seconds using `httpx`.
- **Exponential Backoff**: Transient network drops are retried using the `tenacity` library.
- **Graceful Partial Failure**: If 1 out of 6 websites times out or blocks access, the scraper discards that page and processes the remaining 5 without failing the user request.

---

## 5. LangChain & Strictly Isolated Dual-Key Gemini AI Engine

### Why LangChain?
LangChain (`langchain==0.3.25`, `langchain-google-genai`, `langchain-core`) provides standardized prompt templates, output parsers, and chaining mechanisms. It abstracts model communication, allowing clean substitution between models while maintaining deterministic schema guarantees.

### The Strict Dual-Key Isolation Rule
In standard AI applications, developers often share a single API key across all features. In EngiPath AI, **two completely distinct Gemini API keys are enforced at the code and configuration level**:

| Service Class | Dedicated Environment Key | Permitted Modules | Prohibited Modules |
|---|---|---|---|
| `ClassesGeminiService` | `CLASSES_GEMINI_API_KEY` | Course discovery, syllabus extraction, multi-course comparison | Internships, Resume parsing |
| `InternshipGeminiService` | `INTERNSHIP_GEMINI_API_KEY` | Resume ATS extraction, candidate profiling, internship matching | Course search, Course comparison |

> **Architectural Benefit:** This prevents quota starvation. A heavy batch of resume uploads will never exhaust the API quota of students searching for local engineering courses. The automated test `test_gemini_separation.py` verifies this separation.

### Dynamic Multi-Model Fallback Chain
To ensure 99.9% uptime during Google AI Studio rate limits, the AI callers implement fallback chains:
```
Preferred Model: gemini-2.0-flash
     │ (Fallback on 429 / Quota error)
     ▼
Secondary Model: gemini-2.5-flash
     │ (Fallback)
     ▼
Tertiary Model: gemini-flash-latest / gemini-2.5-flash-lite
```

### Deterministic JSON Extraction & Guardrails
- **MIME Type Enforcement**: All calls enforce `response_mime_type="application/json"`.
- **Low Temperature (0.1)**: Temperature is pinned to 0.1 for syllabus extraction and resume analysis to prevent creative hallucinations.
- **Zero-Hallucination Policy**: Prompts explicitly instruct the LLM to output `null` for unknown fees, missing contact numbers, or unverified links. Fake application URLs are forbidden.

---

## 6. Resume ATS Processing & Candidate Profiling

Located in `app/services/resume/resume_processor.py` and `app/ai/gemini/internship_gemini.py`:

```
Uploaded File (.pdf / .docx)
     │
     ▼
[ Extension & MIME Verification ] ──(Invalid)──► Reject HTTP 400
     │ (Valid)
     ▼
[ Path Sanitization (secure_filename) ]
     │
     ▼
[ Binary Text Extraction ]
  ├── PDF:  PyMuPDF (fitz) — High speed layout-aware stream reader
  └── DOCX: python-docx   — XML paragraph & table extractor
     │
     ▼
[ InternshipGeminiService ] ──► Extracts Structured CandidateProfile:
                                • Technical Skills (Languages, Frameworks, DBs)
                                • Tools & Platforms (Docker, Git, AWS)
                                • Academic Background (Branch, CGPA, Year)
                                • Practical Projects (Description, Tech Used)
                                • Domain Interests (AI/ML, Web, Embedded)
     │
     ▼
[ Secure Post-Analysis Shredding ]
  └── Local file deleted immediately if DELETE_RESUME_AFTER_ANALYSIS=true
```

---

## 7. Triple-Stream Internship Recommendation Engine

A core requirement of the platform is that students receive **three distinct, non-overlapping streams of opportunities**:

```
                       User Profile & Resume
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
   [ STREAM 1 ]             [ STREAM 2 ]            [ STREAM 3 ]
   Skill-Based              Resume-Based            Live Web Search
 Recommendations         Recommendations           Discovery Feed
         │                       │                       │
 • Computed ONLY from     • Computed from full     • Real-time web search
   manually entered         resume profile +         scraped from job
   skills (e.g. Python,     projects + domain        boards (Internshala,
   React, SQL).             experience.              LinkedIn, Indeed).
 • Shows % Match Score    • Identifies holistic    • Verified direct source
   and required missing     career fit and           and application URLs.
   skill chips.             depth.
```

> **Important:** Stream 1 and Stream 2 are strictly returned as two separate JSON arrays (`skill_based_recommendations` and `resume_based_recommendations`). They are never merged into one generic list, allowing students to contrast what their listed skills qualify them for versus their documented resume experience.

---

## 8. Class Comparison Module

Students frequently struggle to choose between 2 or 3 training institutes.
- **Strict Cardinality Validation**: The endpoint `POST /api/v1/classes/compare` accepts a list of class IDs.
  * 0 or 1 class $\rightarrow$ **Rejected** (HTTP 400: comparison requires at least 2 institutes).
  * 2 or 3 classes $\rightarrow$ **Accepted**.
  * 4 or more classes $\rightarrow$ **Rejected** (HTTP 400: UI cognitive overload safeguard).
- **Gemini Comparative Verdict**: The LLM evaluates the extracted syllabi, fees, durations, and batch sizes side-by-side to declare:
  1. **Overall Winner** with comprehensive reasoning.
  2. **Best Value Winner** (maximum curriculum depth per rupee).
  3. **Best Curriculum Winner** (most modern tech stack).
  4. **Best Location / Flexibility Winner**.

---

## 9. Zero-Cost Geospatial & Commute Intelligence

Commercial mapping APIs (such as Google Maps Platform) require credit cards and can lead to unexpected billing. EngiPath AI provides full geospatial navigation with **zero recurring software costs**:

1. **Geocoding via OpenStreetMap Nominatim (`app/services/maps/geocoding.py`)**:
   - Converts textual addresses (e.g., "FC Road, Shivajinagar, Pune") into exact latitude and longitude coordinates.
   - Enforces Nominatim's fair usage policy with an internal 1 request/second rate-limiter.
2. **Turn-by-Turn Commute Routing via OSRM (`app/services/maps/routing.py`)**:
   - Uses the Open Source Routing Machine (OSRM) public engine.
   - Computes real-world driving distance in kilometers and estimated commute duration in minutes between the student's campus and the coaching institute.
3. **Universal Google Maps URL Generation**:
   - Instead of paid embedded map SDKs, the backend dynamically synthesizes standard Google Maps universal search queries (`https://www.google.com/maps/search/?api=1&query=...`).
   - Students click the link to open turn-by-turn navigation directly on their mobile or desktop devices for free.

---

## 10. Database Architecture (SQLAlchemy 2.0 ORM)

The backend uses **SQLAlchemy 2.0** with **Flask-Migrate (Alembic)**.
- **Development**: Zero-setup local SQLite file (`instance/engipath.db`).
- **Production**: Seamlessly switches to enterprise PostgreSQL by changing `DATABASE_URL` in `.env`.

### Key Data Models (`app/models/`)
* **`User`**: Student account credentials (bcrypt hashed), academic branch, year, and registration timestamp.
* **`ClassListing`**: Discovered coaching institutes, course titles, fees, duration, physical address, coordinates (lat/long), and verified source URLs.
* **`CandidateProfile`**: Structured representation of student technical competencies, tools, frameworks, and projects extracted from their resume.
* **`ResumeAnalysis`**: Metadata tracking resume uploads, extraction status, and parsed skills.
* **`InternshipListing`**: Curated and live-discovered internship openings with stipend details, requirements, and application links.
* **`ClassComparison`**: Cached comparative evaluation matrices generated by `ClassesGeminiService`.
* **`SearchHistory`**: Query logging for student discovery patterns.

---

## 11. Security & Production Engineering

1. **No Redis Architecture**: Redis was deliberately excluded. In-memory structures, token serializing, and database sessions eliminate external service overhead, simplifying deployment to lightweight containers.
2. **Stateless Authentication**: Utilizes `itsdangerous.URLSafeTimedSerializer` signed Bearer tokens with a 24-hour expiration window. No server-side session bloat.
3. **Credential Protection**: Passwords hashed using PBKDF2 with SHA-256 salts via `werkzeug.security`.
4. **Environment Isolation**: All secrets (`.env`) are strictly isolated; zero sensitive tokens are exposed in logs or test output.

---

## 12. RESTful API Endpoints Reference

| Module | Method | Endpoint | Request Payload / Params | Core Function |
|---|---|---|---|---|
| **Health** | `GET` | `/api/v1/health` | None | Service heartbeat & DB status |
| **Auth** | `POST` | `/api/v1/auth/register` | `{ name, email, password, branch, year }` | Creates student profile & returns Bearer token |
| **Auth** | `POST` | `/api/v1/auth/login` | `{ email, password }` | Authenticates credentials & issues token |
| **Auth** | `GET` | `/api/v1/auth/me` | Bearer Token Header | Returns active user profile |
| **Classes**| `POST`| `/api/v1/classes/search` | `{ course, location }` | Live web search + scraping + AI extraction |
| **Classes**| `GET` | `/api/v1/classes/<id>` | URL Param | Retrieves full details & syllabus for a class |
| **Classes**| `POST`| `/api/v1/classes/compare`| `{ class_ids: [id1, id2, (id3)] }` | Side-by-side AI comparative analysis |
| **Resume** | `POST`| `/api/v1/resume/upload` | `multipart/form-data` (file) | Validates & saves resume file |
| **Resume** | `POST`| `/api/v1/resume/analyze`| `multipart/form-data` + metadata | Ingests PDF/DOCX & outputs CandidateProfile |
| **Intern** | `POST`| `/api/v1/internships/recommend` | `{ branch, year, skills, interests, resume_id }` | Outputs Stream 1 (Skills) & Stream 2 (Resume) |
| **Intern** | `POST`| `/api/v1/internships/search` | `{ branch, skills, interests, location }` | Outputs Stream 3 (Live Web Scraping) |
| **Maps**   | `POST`| `/api/v1/maps/geocode` | `{ address: "Pune, India" }` | Returns latitude, longitude & Maps link |
| **Maps**   | `POST`| `/api/v1/maps/directions` | `{ start: [lat, lon], end: [lat, lon] }` | Computes driving distance & commute time |
| **Swagger**| `GET` | `/swagger` | None | Interactive Flasgger OpenAPI documentation |

---

## 13. Frequently Asked Questions (Viva / Client Review)

#### Q1: Why did you use DuckDuckGo when Google Search is available?
> **Answer:** Google Custom Search API has a hard quota limit of 100 queries per day on the free tier. When that limit is reached or when an API key is not configured, DuckDuckGo provides an automatic, zero-cost, unmetered fallback that parses public search HTML without requiring an API key.

#### Q2: What is SSRF and why did you implement protection in the scraper?
> **Answer:** Server-Side Request Forgery (SSRF) occurs when a web scraper fetches URLs provided by an external source that secretly point to internal private IPs (like `127.0.0.1` or `192.168.x.x` or cloud metadata `169.254.169.254`). Our backend resolves the target domain's IP first; if it belongs to any private or link-local subnet, the request is immediately blocked.

#### Q3: Why are there two separate Gemini API keys?
> **Answer:** To prevent architectural cross-contamination and quota starvation. If students upload multiple large resumes, the `INTERNSHIP_GEMINI_API_KEY` handles the load. The `CLASSES_GEMINI_API_KEY` remains untouched, ensuring course search and syllabus comparisons remain responsive.

#### Q4: Why are Skill-Based and Resume-Based recommendations kept separate?
> **Answer:** A student may list "Python" and "Machine Learning" as intended skills, but their resume may show projects in "HTML/CSS" and "SQL". Keeping the lists separate allows students to clearly distinguish opportunities matching their aspirational skills versus their proven resume background.

#### Q5: How do you extract text from PDF and DOCX files?
> **Answer:** We use **PyMuPDF (`fitz`)** for high-speed, layout-aware PDF text streaming and **`python-docx`** for structured paragraph/table parsing in DOCX files. Once extracted, the file is securely deleted to safeguard student privacy.
