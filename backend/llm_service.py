"""LLM service for generating analysis reports.

Supports multiple providers: Gemini, Groq, Ollama.
Generates reports from selection summaries with SUBTYPE-based breakdowns.
"""
import os
import httpx
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

LLM_PROVIDER = os.getenv("LLM_PROVIDER", "ollama")


# =============================================================================
# LLM Provider Functions
# =============================================================================


def get_gemini_response(prompt: str) -> str:
    """Generate response using Google Gemini."""
    import google.generativeai as genai
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return "Gemini API key not found. Please add GEMINI_API_KEY to .env."
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.5-flash")
    response = model.generate_content(prompt)
    return response.text


def get_groq_response(prompt: str) -> str:
    """Generate response using Groq."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return "Groq API key not found. Please add GROQ_API_KEY to .env."
    headers = {"Authorization": f"Bearer {api_key}"}
    payload = {
        "model": "mixtral-8x7b-32768",
        "messages": [{"role": "user", "content": prompt}]
    }
    try:
        response = httpx.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=60.0
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]
    except Exception as e:
        return f"Groq Error: {e}"


def get_ollama_response(prompt: str) -> str:
    """Generate response using local Ollama."""
    url = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
    payload = {"model": "llama3", "prompt": prompt, "stream": False}
    try:
        response = httpx.post(url, json=payload, timeout=120.0)
        response.raise_for_status()
        return response.json().get("response", "")
    except Exception as e:
        return f"Ollama error: {e}"


def call_llm(prompt: str, provider: str = LLM_PROVIDER) -> str:
    """Route prompt to the configured LLM provider."""
    if provider == "gemini":
        return get_gemini_response(prompt)
    elif provider == "groq":
        return get_groq_response(prompt)
    else:
        return get_ollama_response(prompt)


# =============================================================================
# Report Generation
# =============================================================================


def generate_selection_report(
    selection_summary: dict,
    extra_context: Optional[str] = None,
    provider: str = LLM_PROVIDER
) -> str:
    """Generate an LLM report from a polygon/bbox selection summary.
    
    The prompt uses SUBTYPE-based categorization with LANDUSE_CATEGORY breakdowns.
    
    Args:
        selection_summary: The breakdown object from polygon/bbox selection
        extra_context: Optional user-provided context
        provider: LLM provider to use (gemini, groq, ollama)
        
    Returns:
        Generated report text with five sections.
    """
    prompt = build_selection_report_prompt(selection_summary, extra_context)
    return call_llm(prompt, provider)


def build_selection_report_prompt(
    summary: dict,
    extra_context: Optional[str] = None
) -> str:
    """Build the LLM prompt for selection report generation.
    
    Report sections:
    1. Area Overview
    2. Land Use Analysis by Type
    3. Capacity and Utilization Assessment
    4. Development Status
    5. Recommendations
    """
    # Extract key metrics
    total_parcels = summary.get("total_parcels", 0)
    total_area_m2 = summary.get("total_area_m2", 0)
    vacant_count = summary.get("vacant_count", 0)
    developed_count = summary.get("developed_count", 0)
    commercial_area = summary.get("commercial_total_area_m2", 0)
    non_commercial_area = summary.get("non_commercial_total_area_m2", 0)
    religious_capacity = summary.get("total_religious_capacity", 0)
    shops_estimated = summary.get("total_shops_estimated", 0)
    blocks_covered = summary.get("block_ids_covered", [])
    
    # Build category breakdown section
    breakdown = summary.get("breakdown", {})
    category_lines = []
    for category, data in breakdown.items():
        count = data.get("count", 0)
        area = data.get("total_area_m2", 0)
        capacity = data.get("total_capacity_estimated", 0)
        shops = data.get("total_shops_estimated", 0)
        
        line = f"  - {category}: {count} parcels, {area:,.0f} m²"
        if capacity > 0:
            line += f", capacity: {capacity:,}"
        if shops > 0:
            line += f", shops: {shops:,}"
        category_lines.append(line)
    
    category_breakdown_text = "\n".join(category_lines) if category_lines else "  No data available"
    
    # Build vacancy analysis
    if total_parcels > 0:
        vacancy_rate = (vacant_count / total_parcels) * 100
        development_rate = (developed_count / total_parcels) * 100
    else:
        vacancy_rate = 0
        development_rate = 0
    
    vacancy_text = f"""
  - Vacant Parcels: {vacant_count} ({vacancy_rate:.1f}%)
  - Developed Parcels: {developed_count} ({development_rate:.1f}%)
  - Other Status: {total_parcels - vacant_count - developed_count} parcels"""
    
    # Build blocks section
    blocks_text = ", ".join(blocks_covered[:10]) if blocks_covered else "None identified"
    if len(blocks_covered) > 10:
        blocks_text += f" ... and {len(blocks_covered) - 10} more"
    
    prompt = f"""You are an expert urban planner analyzing a land parcel selection in Saudi Arabia.

=== SELECTION DATA ===

AREA OVERVIEW:
  - Total Parcels: {total_parcels}
  - Total Area: {total_area_m2:,.0f} m²
  - Commercial Area: {commercial_area:,.0f} m²
  - Non-Commercial Area: {non_commercial_area:,.0f} m²
  - Blocks Covered: {blocks_text}

LAND USE BREAKDOWN BY CATEGORY (SUBTYPE-based classification):
{category_breakdown_text}

CAPACITY ESTIMATES:
  - Total Religious Facility Capacity: {religious_capacity:,} worshippers (at 1.2 m²/person)
  - Total Commercial Shops: {shops_estimated:,} units (at 120 m²/shop estimate)

DEVELOPMENT STATUS:
{vacancy_text}

"""
    
    if extra_context:
        prompt += f"""ADDITIONAL CONTEXT FROM USER:
{extra_context}

"""
    
    prompt += """=== INSTRUCTIONS ===

Generate a professional urban planning report with EXACTLY these five sections:

1. AREA OVERVIEW
   Summarize the selection: total parcels, total area, number of blocks covered.

2. LAND USE ANALYSIS BY TYPE
   Analyze each LANDUSE_CATEGORY present. Use specific SUBTYPE labels where relevant.
   Discuss the distribution and any notable patterns.

3. CAPACITY AND UTILIZATION ASSESSMENT
   Evaluate religious facility (mosque) capacity relative to population estimates.
   Analyze commercial potential and shop density.
   Identify any capacity constraints or opportunities.

4. DEVELOPMENT STATUS
   Analyze vacancy rates and development levels.
   Highlight areas with high vacancy or underutilization.

5. RECOMMENDATIONS
   Provide 3-5 actionable recommendations for urban planners.
   Consider zoning, development priorities, and infrastructure needs.

Write in a professional, objective tone. Use numbers and percentages to support analysis.
Do NOT add any sections beyond the five listed above.
"""
    
    return prompt


# =============================================================================
# Natural Language Query
# =============================================================================


def answer_nl_query(
    question: str,
    parcels_summary: dict,
    provider: str = LLM_PROVIDER,
) -> str:
    """Answer a natural language question about parcels in a selection.

    Args:
        question: The user's question in natural language.
        parcels_summary: Compact summary of the parcels (counts, areas, categories).
        provider: LLM provider to use.

    Returns:
        Answer text.  If the data cannot answer the question the model must
        say so rather than fabricate information.
    """
    prompt = _build_nl_query_prompt(question, parcels_summary)
    return call_llm(prompt, provider)


def _build_nl_query_prompt(question: str, summary: dict) -> str:
    total_parcels = summary.get("total_parcels", 0)
    total_area = summary.get("total_area_m2", 0)
    vacant = summary.get("vacant_count", 0)
    developed = summary.get("developed_count", 0)
    breakdown = summary.get("category_breakdown", {})
    religious_capacity = summary.get("total_religious_capacity", 0)
    shops_estimated = summary.get("total_shops_estimated", 0)
    commercial_area = summary.get("commercial_total_area_m2", 0)
    non_commercial_area = summary.get("non_commercial_total_area_m2", 0)

    cat_lines = "\n".join(
        f"  - {cat}: {cnt} parcels"
        for cat, cnt in sorted(breakdown.items(), key=lambda x: -x[1])
    ) or "  No category data available"

    # Build rich breakdowns from parcels list
    parcels = summary.get("parcels", [])
    subtype_counts: dict[str, int] = {}
    detail_counts: dict[str, int] = {}
    status_counts: dict[str, int] = {}
    commercial_count = 0
    non_commercial_count = 0
    floor_counts: dict[str, int] = {}
    areas: list[float] = []

    for p in parcels:
        # Subtype & Detail
        st = p.get("SUBTYPE_LABEL_EN") or p.get("SUBTYPE") or "Unknown"
        dt = p.get("DETAIL_LABEL_EN") or p.get("DETAILSLANDUSE") or "Unknown"
        subtype_counts[st] = subtype_counts.get(st, 0) + 1
        detail_counts[dt] = detail_counts.get(dt, 0) + 1

        # Development / Parcel status
        status = p.get("PARCEL_STATUS_LABEL") or "Unknown"
        status_counts[status] = status_counts.get(status, 0) + 1

        # Commercial vs Non-Commercial
        is_comm = p.get("IS_COMMERCIAL")
        if is_comm == 1 or is_comm is True or str(is_comm).lower() == "true":
            commercial_count += 1
        else:
            non_commercial_count += 1

        # Floors
        floors = p.get("NOOFFLOORS")
        if floors and float(floors) > 0:
            floor_label = f"{int(float(floors))} floor(s)"
            floor_counts[floor_label] = floor_counts.get(floor_label, 0) + 1

        # Area
        area = float(p.get("AREA_M2") or 0)
        if area > 0:
            areas.append(area)

    subtype_lines = "\n".join(
        f"  - {st}: {cnt} parcels"
        for st, cnt in sorted(subtype_counts.items(), key=lambda x: -x[1])
    ) or "  No subtype data available"

    detail_lines = "\n".join(
        f"  - {dt}: {cnt} parcels"
        for dt, cnt in sorted(detail_counts.items(), key=lambda x: -x[1])
    ) or "  No detail data available"

    status_lines = "\n".join(
        f"  - {s}: {cnt} parcels"
        for s, cnt in sorted(status_counts.items(), key=lambda x: -x[1])
    ) or "  No status data available"

    floor_lines = "\n".join(
        f"  - {fl}: {cnt} parcels"
        for fl, cnt in sorted(floor_counts.items(), key=lambda x: -x[1])
    ) or "  No floor data available"

    area_stats = ""
    if areas:
        area_stats = (
            f"  Smallest Parcel: {min(areas):,.0f} m²\n"
            f"  Largest Parcel: {max(areas):,.0f} m²\n"
            f"  Average Parcel Size: {sum(areas) / len(areas):,.0f} m²"
        )
    else:
        area_stats = "  No area data available"

    return f"""You are a GIS data assistant. Answer the user's question using ONLY the data provided below.
If the data does not contain information to answer the question, say so honestly — do NOT make up data.
Be concise and factual. Use numbers when available.

=== SELECTION DATA ===
Total Parcels: {total_parcels}
Total Area: {total_area:,.0f} m²

Development Status:
{status_lines}

Commercial: {commercial_count} parcels ({commercial_area:,.0f} m²)
Non-Commercial: {non_commercial_count} parcels ({non_commercial_area:,.0f} m²)

Estimated Religious/Mosque Capacity: {religious_capacity:,} worshippers
Estimated Commercial Shops: {shops_estimated:,}

Land Use Categories:
{cat_lines}

Land Use Subtypes:
{subtype_lines}

Detailed Land Use:
{detail_lines}

Building Floors Distribution:
{floor_lines}

Area Statistics:
{area_stats}

=== USER QUESTION ===
{question}

=== INSTRUCTIONS ===
Answer the question directly. If the answer can be derived from the data, provide it with numbers.
If the data does not have the information, respond: "This information is not available in the current selection data."
Do not hallucinate or invent numbers.
"""


# =============================================================================
# Legacy Functions (backward compatibility)
# =============================================================================


def generate_report_prompt(stats: dict, extra_context: str = "", shop_size_m2: float = 120.0) -> str:
    """Legacy prompt generation function."""
    main_breakdown = "\n".join([f"- {k}: {v}" for k, v in stats.get("mainlanduse_label", {}).items()])
    detail_breakdown = "\n".join([f"- {k}: {v}" for k, v in stats.get("landuse_category", {}).items()])
    subtypes = "\n".join([f"- {st}" for st in stats.get("subtypes", [])[:20]])
    
    prompt = f"""
You are an expert urban planner. Analyze the following GIS data and provide a report.

Tier 1: MAINLANDUSE Breakdown
{main_breakdown or 'None available'}

Tier 2: DETAILSLANDUSE Breakdown
{detail_breakdown or 'None available'}
Total Mosque Capacity (1.2 m2/person): {stats.get('total_religious_capacity', 0)}
Total Shops ({shop_size_m2} m2/shop): {stats.get('total_shops', 0)}

Tier 3: SUBTYPE Summary
{subtypes or 'None available'}

Development Status:
Vacant Parcels: {stats.get('vacant_count', 0)}
Developed Parcels: {stats.get('developed_count', 0)}

Total Area: {stats.get('total_area_m2', 0)} m2
Total Parcels: {stats.get('total_parcels', 0)}

Additional Context:
{extra_context}

Please provide the report exactly in these seven sections:
1. Executive Summary
2. Land Use Distribution by MAINLANDUSE category
3. Detailed Breakdown by DETAILSLANDUSE type
4. Commercial Utilization Assessment
5. Mosque and Public Facility Capacity Review
6. Development Status and Vacancy Analysis
7. Recommendations for Urban Planners
"""
    return prompt


def analyze_parcels(stats: dict, provider: str = LLM_PROVIDER, extra_context: str = "", shop_size_m2: float = 120.0) -> str:
    """Legacy function: Generate report from stats dict."""
    prompt = generate_report_prompt(stats, extra_context, shop_size_m2)
    return call_llm(prompt, provider)


def analyze_single_mosque(object_id: int, provider: str = LLM_PROVIDER) -> str:
    """Legacy function: Generate brief analysis for a single mosque parcel."""
    prompt = f"Please provide a short paragraph about the mosque parcel with OBJECTID {object_id}, its capacity, its location context, and how it compares to the neighbourhood average."
    return call_llm(prompt, provider)
