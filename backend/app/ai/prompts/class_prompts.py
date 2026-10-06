"""
EngiPath AI — Class Prompts

Prompts for the ClassesGeminiService ONLY.
"""
import json


def build_extraction_prompt(scraped_content: str, course: str, location: str) -> str:
    """Build the prompt to extract structured class listings from scraped web content."""
    return f"""You are an expert data extraction assistant for an educational platform.

TASK: Extract ALL private coaching class, training institute, and academy listings from the provided web content for the searched course and location.

SEARCH CONTEXT:
- Course searched: {course}
- Location searched: {location}

WEB CONTENT:
---
{scraped_content[:20000]}
---

INSTRUCTIONS:
1. Extract EVERY distinct private coaching class, training institute, or academy mentioned in the content.
2. IMPORTANT — DO NOT include universities, colleges, or degree-granting institutions (e.g., MIT, VIT, SPPU, any institution with "University", "College", "IIT", "NIT" in the name). Only include private coaching centers, training institutes, and academies.
3. For each listing, fill in as many fields as possible from the actual content.
4. If a field is NOT present in the content, use null — do NOT invent or guess values.
5. NEVER hallucinate fees, addresses, phone numbers, or URLs that are not in the content.
6. For source_url: use the URL where this information came from, if mentioned.
7. For mode: use "online", "offline", or "hybrid" only.
8. For confidence: estimate how confident you are this is a real, relevant listing (0.0–1.0).
9. Remove duplicates — if the same institute appears multiple times, include it once with the best data.
10. Aim to extract as many unique institutes as possible — do not stop at the first one found.

RETURN FORMAT (JSON only, no markdown, no explanation):
{{
  "classes": [
    {{
      "institute_name": "string (required)",
      "course_name": "string (required)",
      "address": "string or null",
      "city": "string or null",
      "state": "string or null",
      "country": "string or null",
      "fees": number or null,
      "currency": "INR or USD or null",
      "duration": number or null,
      "duration_unit": "weeks/months/hours or null",
      "mode": "online/offline/hybrid or null",
      "description": "string or null",
      "topics": ["topic1", "topic2"],
      "skills": ["skill1", "skill2"],
      "website_url": "string or null",
      "contact": "string or null",
      "source_name": "string or null",
      "source_url": "string or null",
      "confidence": 0.0-1.0
    }}
  ]
}}

Return ONLY the JSON object. No prose, no markdown fences."""


def build_comparison_prompt(classes_data: list[dict]) -> str:
    """Build the prompt for AI-powered class comparison."""
    classes_json = json.dumps(classes_data, indent=2, ensure_ascii=False)
    count = len(classes_data)

    return f"""You are an expert educational advisor helping a student compare {count} class/course offerings.

CLASSES TO COMPARE:
{classes_json}

INSTRUCTIONS:
1. Compare the classes ONLY based on the data provided above.
2. Do NOT invent, assume, or hallucinate any missing values.
3. If a field is null/missing, note it as "Not available" in your comparison.
4. Be objective and helpful.

Generate a structured comparison covering:
- Fees (value for money)
- Duration and time commitment
- Mode (online/offline/hybrid) and location
- Topics and curriculum coverage
- Skills gained
- Overall quality and recommendation

RETURN FORMAT (JSON only, no markdown):
{{
  "comparison_table": [
    {{
      "attribute": "Fees",
      "values": ["value for class 1", "value for class 2", ...]
    }},
    {{
      "attribute": "Duration",
      "values": [...]
    }},
    {{
      "attribute": "Mode",
      "values": [...]
    }},
    {{
      "attribute": "Location",
      "values": [...]
    }},
    {{
      "attribute": "Topics Covered",
      "values": [...]
    }},
    {{
      "attribute": "Skills Gained",
      "values": [...]
    }}
  ],
  "best_value": "Name of institute offering best value for money, or null if cannot determine",
  "best_curriculum": "Name of institute with best curriculum, or null if cannot determine",
  "best_location": "Name of institute with best location/accessibility, or null if cannot determine",
  "overall_recommendation": "Which class/institute you recommend overall and why (1-2 sentences)",
  "reasoning": "Detailed reasoning for your recommendation based only on available data (2-4 sentences)"
}}

Return ONLY the JSON object."""
