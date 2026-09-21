"""
EngiPath AI — Internship Prompts

Prompts for the InternshipGeminiService ONLY.
"""
import json


def build_resume_analysis_prompt(
    resume_text: str,
    branch: str,
    year: str,
    skills: list[str],
    interests: list[str],
) -> str:
    """Build prompt to extract structured candidate profile from resume text."""
    return f"""You are an expert resume analyzer for engineering students.

USER-PROVIDED CONTEXT:
- Engineering Branch: {branch}
- Current Year: {year}
- Manually entered skills: {', '.join(skills) if skills else 'None provided'}
- Interests: {', '.join(interests) if interests else 'None provided'}

RESUME TEXT:
---
{resume_text[:8000]}
---

TASK: Extract a comprehensive, structured candidate profile from the resume.

INSTRUCTIONS:
1. Extract only what is ACTUALLY present in the resume text.
2. Do NOT invent skills, projects, or experience not mentioned.
3. For skills: extract only technical skills explicitly mentioned.
4. For projects: include title, description (brief), and technologies used.
5. For experience: include role, company/organization, duration, and key responsibilities.
6. For education: include degree, institution, year, and GPA if mentioned.
7. For domains: identify broad technical areas the candidate has worked in.

RETURN FORMAT (JSON only, no markdown):
{{
  "branch": "string (from user input or resume, whichever is more specific)",
  "year": "string",
  "resume_skills": ["skill1", "skill2", ...],
  "technologies": ["tech1", "tech2", ...],
  "projects": [
    {{
      "title": "string",
      "description": "brief description",
      "technologies": ["tech1", "tech2"],
      "duration": "string or null"
    }}
  ],
  "experience": [
    {{
      "role": "string",
      "company": "string",
      "duration": "string or null",
      "responsibilities": ["resp1", "resp2"]
    }}
  ],
  "domains": ["domain1", "domain2"],
  "education": [
    {{
      "degree": "string",
      "institution": "string",
      "year": "string or null",
      "gpa": "string or null"
    }}
  ]
}}

Return ONLY the JSON object."""


def build_skill_based_prompt(branch: str, year: str, skills: list[str]) -> str:
    """
    Build prompt for skill-based internship recommendations.
    Uses ONLY manually entered skills — NOT resume data.
    """
    skills_str = ", ".join(skills) if skills else "Not specified"

    return f"""You are an expert career counselor for engineering students.

STUDENT PROFILE (skill-based only — no resume data used):
- Engineering Branch: {branch}
- Current Year: {year}
- Skills: {skills_str}

TASK: Recommend 8–10 specific internship roles and opportunities that match these EXACT skills.

INSTRUCTIONS:
1. Base recommendations STRICTLY on the listed skills above.
2. Do NOT assume skills the student hasn't listed.
3. For each recommendation, explain specifically WHY it matches their listed skills.
4. For company: suggest real companies known to offer such internships (do NOT fabricate company names).
5. For stipend: use realistic ranges based on public knowledge, or null if unsure.
6. For application_url: use only REAL, known URLs (e.g., company careers page). If unsure, use null.
7. For match_score: rate 0.0–1.0 based on how well the student's skills match this role.
8. Vary the recommendations — include startups, MNCs, and research opportunities.

RETURN FORMAT (JSON only, no markdown):
{{
  "recommendations": [
    {{
      "role": "Specific Internship Role Title",
      "company": "Company Name or null if generic",
      "skills_needed": ["skill1", "skill2"],
      "what_you_can_achieve": ["achievement1", "achievement2"],
      "why_recommended": "Specific reason based on student's listed skills",
      "match_score": 0.0-1.0,
      "location": "City/Remote or null",
      "mode": "remote/on-site/hybrid or null",
      "eligibility": "string or null",
      "duration": "duration string or null",
      "stipend": "stipend range or null",
      "source_url": "real URL or null",
      "application_url": "real URL or null"
    }}
  ]
}}

Return ONLY the JSON object."""


def build_resume_based_prompt(profile: dict, interests: list[str]) -> str:
    """
    Build prompt for resume + interest based recommendations.
    Uses full candidate profile — NOT manually entered skills directly.
    This generates a COMPLETELY SEPARATE list from skill-based recommendations.
    """
    profile_json = json.dumps(profile, indent=2, ensure_ascii=False)
    interests_str = ", ".join(interests) if interests else "Not specified"

    return f"""You are an expert career counselor analyzing an engineering student's complete profile.

STUDENT FULL PROFILE (extracted from resume):
{profile_json}

STUDENT INTERESTS: {interests_str}

TASK: Recommend 8–10 internship opportunities based on the COMPLETE profile above, including:
- Resume skills and technologies
- Project experience
- Work experience
- Domain expertise
- Education background
- Stated interests

This is a DIFFERENT, MORE COMPREHENSIVE analysis than simple skill matching.
Identify hidden strengths, cross-domain opportunities, and interest-aligned roles.

INSTRUCTIONS:
1. Leverage the FULL profile — not just skills.
2. Identify opportunities that match the student's DEMONSTRATED capabilities from projects/experience.
3. Consider interest alignment heavily.
4. For company: suggest real companies. Do NOT fabricate.
5. For application_url: use only REAL known URLs or null.
6. Make these recommendations DIFFERENT from what a simple skill-match would produce.
7. Include research internships, domain-specific opportunities, and cross-functional roles.

RETURN FORMAT (JSON only, no markdown):
{{
  "recommendations": [
    {{
      "role": "Specific Internship Role Title",
      "company": "Company Name or null",
      "skills_needed": ["skill1", "skill2"],
      "what_you_can_achieve": ["achievement1", "achievement2"],
      "why_recommended": "Specific reason based on profile analysis",
      "match_score": 0.0-1.0,
      "location": "City/Remote or null",
      "mode": "remote/on-site/hybrid or null",
      "eligibility": "string or null",
      "duration": "duration string or null",
      "stipend": "stipend range or null",
      "source_url": "real URL or null",
      "application_url": "real URL or null"
    }}
  ]
}}

Return ONLY the JSON object."""


def build_live_internship_extraction_prompt(scraped_content: str, context: dict) -> str:
    """Build prompt to extract live internship listings from scraped web content."""
    branch = context.get("branch", "")
    skills = ", ".join(context.get("skills", []))
    interests = ", ".join(context.get("interests", []))

    return f"""You are an expert data extraction assistant.

SEARCH CONTEXT:
- Branch: {branch}
- Skills: {skills}
- Interests: {interests}

WEB CONTENT (from live internship listings):
---
{scraped_content[:12000]}
---

TASK: Extract ALL currently available internship listings from this content.

INSTRUCTIONS:
1. Extract only listings that appear to be REAL and CURRENT internships.
2. For each listing, use only data PRESENT in the content.
3. Do NOT invent deadlines, stipends, or application URLs not in the content.
4. For application_url: use only URLs explicitly mentioned as application links.
5. For source_url: use the page URL where this listing was found.
6. Remove duplicate listings.
7. Only include listings relevant to the student's branch/skills/interests.

RETURN FORMAT (JSON only, no markdown):
{{
  "internships": [
    {{
      "company": "string (required)",
      "role": "string (required)",
      "location": "string or null",
      "mode": "remote/on-site/hybrid or null",
      "skills": ["skill1", "skill2"],
      "eligibility": "string or null",
      "duration": "string or null",
      "stipend": "string or null",
      "deadline": "string or null",
      "description": "brief description or null",
      "source_name": "platform/site name or null",
      "source_url": "string or null",
      "application_url": "string or null"
    }}
  ]
}}

Return ONLY the JSON object."""
