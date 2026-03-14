"""LLM service integration module (Gemini, Groq, Ollama)."""
import json
import os

_SYSTEM_PROMPT = (
    "You are a GIS and land analysis expert. "
    "Analyze parcel data and provide concise, professional insights."
)


def analyze_parcels(parcels_summary: dict, provider: str = "ollama") -> str:
    """Route to the appropriate LLM provider."""
    provider = provider.lower()
    if provider == "gemini":
        return _analyze_with_gemini(parcels_summary)
    if provider == "groq":
        return _analyze_with_groq(parcels_summary)
    if provider == "ollama":
        return _analyze_with_ollama(parcels_summary)
    raise ValueError(f"Unknown LLM provider: {provider!r}")


def _analyze_with_gemini(parcels_summary: dict) -> str:
    import google.generativeai as genai

    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set")
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content([_SYSTEM_PROMPT, _build_prompt(parcels_summary)])
    return response.text


def _analyze_with_groq(parcels_summary: dict) -> str:
    from groq import Groq

    api_key = os.getenv("GROQ_API_KEY", "")
    if not api_key:
        raise ValueError("GROQ_API_KEY is not set")
    client = Groq(api_key=api_key)
    completion = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[
            {"role": "system", "content": _SYSTEM_PROMPT},
            {"role": "user", "content": _build_prompt(parcels_summary)},
        ],
    )
    return completion.choices[0].message.content


def _analyze_with_ollama(parcels_summary: dict) -> str:
    import httpx

    base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    response = httpx.post(
        f"{base_url}/api/generate",
        json={
            "model": "llama3",
            "prompt": f"{_SYSTEM_PROMPT}\n\n{_build_prompt(parcels_summary)}",
            "stream": False,
        },
        timeout=60,
    )
    response.raise_for_status()
    return response.json().get("response", "")


def _build_prompt(parcels_summary: dict) -> str:
    return (
        "Analyze the following land parcel summary and provide key insights, "
        "potential land use recommendations, and any notable observations:\n\n"
        + json.dumps(parcels_summary, indent=2)
    )
