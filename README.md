
<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Rajdhani&weight=700&size=13&duration=3000&pause=1000&color=F5C518&center=true&vCenter=true&width=500&lines=AI-Powered+GIS+Land+Intelligence+Platform" alt="Typing SVG" />

# ⬡ GIS LAND ANALYSIS

<img src="https://img.shields.io/badge/STATUS-ACTIVE-F5C518?style=for-the-badge&labelColor=0a0a0a&logo=circle&logoColor=F5C518" />
<img src="https://img.shields.io/badge/AI--POWERED-LLM+INSIGHTS-F5C518?style=for-the-badge&labelColor=0a0a0a" />
<img src="https://img.shields.io/badge/VERSION-1.0.0-F5C518?style=for-the-badge&labelColor=0a0a0a" />

<br/>

```
  ╔══════════════════════════════════════════════════════════════╗
  ║   Ingest · Visualize · Analyze · Report — Land Parcel Data   ║
  ╚══════════════════════════════════════════════════════════════╝
```

</div>

---

<div align="center">

### ✦ &nbsp; An intelligent geospatial platform for ingesting, visualizing, and analyzing land parcel data — powered by AI-driven insights and automated PDF report generation.

</div>

<br/>

---

## ◈ &nbsp; Table of Contents

- [✦ Introduction](#-introduction)
- [⬡ Architecture](#-architecture)
- [🗂 Project Structure](#-project-structure)
- [⚙ Tech Stack](#-tech-stack)
- [🚀 Setup & Installation](#-setup--installation)
- [🔌 API Reference](#-api-reference)
- [🤖 LLM Providers](#-llm-providers)
- [🌍 Environment Variables](#-environment-variables)
- [🧪 Testing](#-testing)

---

## ✦ &nbsp; Introduction

> **GIS Land Analysis** is a full-stack, AI-powered geospatial intelligence platform built to streamline the ingestion, visualization, and deep analysis of land parcel data.

Whether you're a land developer, urban planner, or GIS analyst — this platform transforms raw GeoJSON parcel boundaries into **interactive maps**, **AI-generated insights**, and **downloadable PDF reports**, all through a clean, modern interface.

**What it does:**

| Capability | Description |
|---|---|
| 🗺️ **Parcel Ingestion** | ETL pipeline ingests GeoJSON → SQLite with full geometry support |
| 🔍 **Spatial Filtering** | Query parcels by bounding box coordinates |
| 🤖 **AI Analysis** | LLM-powered land analysis via Ollama, Gemini, or Groq |
| 📄 **PDF Reports** | Automated professional-grade report generation |
| 🌐 **Interactive Maps** | React + Leaflet UI with real-time parcel rendering |
| 📊 **Statistics** | Aggregate analytics across all ingested parcel data |

---

## ⬡ &nbsp; Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    GIS LAND ANALYSIS PLATFORM                    │
│                                                                 │
│  ┌──────────────┐     ┌──────────────┐     ┌────────────────┐  │
│  │   FRONTEND   │────▶│   BACKEND    │────▶│   AI ENGINE    │  │
│  │              │     │              │     │                │  │
│  │ React + Vite │◀────│  FastAPI     │     │ Ollama / Gemini│  │
│  │ Leaflet Maps │     │  REST API    │     │ / Groq (LLM)   │  │
│  └──────────────┘     └──────┬───────┘     └────────────────┘  │
│                              │                                  │
│                    ┌─────────▼────────┐                         │
│                    │   DATA LAYER     │                         │
│                    │                 │                         │
│                    │  SQLite (GIS DB) │                         │
│                    │  GeoJSON Source  │                         │
│                    └─────────▲────────┘                         │
│                              │                                  │
│                    ┌─────────┴────────┐                         │
│                    │   ETL PIPELINE   │                         │
│                    │                 │                         │
│                    │ GeoJSON → SQLite │                         │
│                    └──────────────────┘                         │
└─────────────────────────────────────────────────────────────────┘
```

**Data Flow:**

```
GeoJSON File
    │
    ▼
ETL Processor ──▶ SQLite Database
                        │
                        ▼
                  FastAPI Backend ──▶ LLM Provider (Analysis)
                        │                    │
                        ▼                    ▼
                  React Frontend       PDF Report
                  (Leaflet Map)
```

---

## 🗂 &nbsp; Project Structure

```
gis-land-analysis/
│
├── 📁 backend/          # FastAPI REST API (Python)
│   └── main.py          # API entry point & route definitions
│
├── 📁 etl/              # GeoJSON → SQLite ingestion pipeline
│   └── processor.py     # Core ETL logic
│
├── 📁 frontend/         # React + Leaflet map UI (Vite)
│   ├── src/
│   └── vite.config.js
│
├── 📁 data/             # GeoJSON source data & SQLite database
│   ├── SubdivisionParcelBoundary.geojson
│   └── gis_database.db
│
├── 📁 tests/            # pytest test suite
│   └── test_*.py
│
├── .env.example         # Environment variable template
├── requirements.txt     # Python dependencies
└── README.md
```

---

## ⚙ &nbsp; Tech Stack

### 🖥 Frontend

| Technology | Badge | Purpose |
|---|---|---|
| **React** | ![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB) | UI framework |
| **Vite** | ![Vite](https://img.shields.io/badge/Vite-B73BFE?style=flat-square&logo=vite&logoColor=FFD62E) | Build tool & dev server |
| **Leaflet.js** | ![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=flat-square&logo=leaflet&logoColor=white) | Interactive map rendering |
| **JavaScript** | ![JS](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black) | Frontend language |

### 🔧 Backend

| Technology | Badge | Purpose |
|---|---|---|
| **Python** | ![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white) | Core backend language |
| **FastAPI** | ![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat-square&logo=fastapi) | REST API framework |
| **SQLite** | ![SQLite](https://img.shields.io/badge/SQLite-07405E?style=flat-square&logo=sqlite&logoColor=white) | Geospatial database |
| **Uvicorn** | ![Uvicorn](https://img.shields.io/badge/Uvicorn-F5C518?style=flat-square&logoColor=black) | ASGI server |
| **pytest** | ![pytest](https://img.shields.io/badge/pytest-0A9EDC?style=flat-square&logo=pytest&logoColor=white) | Testing framework |

### 🤖 AI / LLM Layer

| Provider | Badge | Type |
|---|---|---|
| **Ollama** | ![Ollama](https://img.shields.io/badge/Ollama-000000?style=flat-square&logo=ollama&logoColor=white) | Local LLM (default) |
| **Google Gemini** | ![Gemini](https://img.shields.io/badge/Google%20Gemini-4285F4?style=flat-square&logo=google&logoColor=white) | Cloud LLM |
| **Groq** | ![Groq](https://img.shields.io/badge/Groq-F55036?style=flat-square&logoColor=white) | Ultra-fast inference |

### 🗺 Data & GIS

| Technology | Badge | Purpose |
|---|---|---|
| **GeoJSON** | ![GeoJSON](https://img.shields.io/badge/GeoJSON-F5C518?style=flat-square&logoColor=black) | Parcel boundary source format |
| **SQLite + GIS** | ![SQLite](https://img.shields.io/badge/SQLite%20GIS-07405E?style=flat-square&logo=sqlite&logoColor=white) | Spatial data storage |
| **PDF Generation** | ![PDF](https://img.shields.io/badge/PDF%20Reports-EC1C24?style=flat-square&logo=adobeacrobatreader&logoColor=white) | Automated report output |

---

## 🚀 &nbsp; Setup & Installation

### Prerequisites

```
✦ Python 3.9+
✦ Node.js 18+
✦ npm or yarn
✦ Ollama (optional — for local LLM)
```

---

### 1️⃣ &nbsp; Clone the Repository

```bash
git clone https://github.com/your-username/gis-land-analysis.git
cd gis-land-analysis
```

---

### 2️⃣ &nbsp; Backend Setup

```bash
# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate        # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# → Open .env and add your API keys
```

---

### 3️⃣ &nbsp; ETL — Ingest Parcel Data

```bash
# Run the ETL pipeline to load GeoJSON into SQLite
python -m etl.processor

# Or invoke directly:
python -c "
from etl.processor import process_geojson_to_sqlite
process_geojson_to_sqlite('data/SubdivisionParcelBoundary.geojson', 'data/gis_database.db')
"
```

> ✦ This parses the GeoJSON boundary file and populates `data/gis_database.db`

---

### 4️⃣ &nbsp; Run the API Server

```bash
uvicorn backend.main:app --reload --port 8000
```

> ✦ Swagger UI available at → **http://localhost:8000/docs**
> ✦ ReDoc available at → **http://localhost:8000/redoc**

---

### 5️⃣ &nbsp; Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

> ✦ UI available at → **http://localhost:5173**

---

## 🔌 &nbsp; API Reference

### Base URL
```
http://localhost:8000
```

### Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | 🟢 Health check |
| `GET` | `/parcels` | 📦 List all parcels *(optional bbox filter)* |
| `GET` | `/parcels/stats` | 📊 Aggregate parcel statistics |
| `POST` | `/analyze` | 🤖 AI-powered analysis via LLM |
| `GET` | `/report` | 📄 Download PDF report |

---

### Parcel BBox Filter

Filter parcels by spatial bounding box:

```
GET /parcels?min_x=-118.5&min_y=33.7&max_x=-117.5&max_y=34.2
```

| Param | Type | Description |
|---|---|---|
| `min_x` | float | Minimum longitude |
| `min_y` | float | Minimum latitude |
| `max_x` | float | Maximum longitude |
| `max_y` | float | Maximum latitude |

---

## 🤖 &nbsp; LLM Providers

Send AI analysis requests with your preferred provider:

```http
POST /analyze
Content-Type: application/json
```

```jsonc
// 🖥 Local — Ollama (default, no API key needed)
{ "provider": "ollama" }

// ☁ Cloud — Google Gemini
{ "provider": "gemini" }

// ⚡ Ultra-fast — Groq
{ "provider": "groq" }
```

| Provider | Speed | Cost | Requires |
|---|---|---|---|
| **Ollama** | Medium | Free | Local install |
| **Gemini** | Fast | Paid | `GEMINI_API_KEY` |
| **Groq** | ⚡ Ultra-fast | Paid | `GROQ_API_KEY` |

---

## 🌍 &nbsp; Environment Variables

Copy `.env.example` → `.env` and fill in the following:

```env
# ─── LLM Providers ────────────────────────────────────────
GEMINI_API_KEY=your_google_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here
OLLAMA_BASE_URL=http://localhost:11434    # default

# ─── Database ─────────────────────────────────────────────
DB_PATH=data/gis_database.db
```

| Variable | Default | Description |
|---|---|---|
| `GEMINI_API_KEY` | — | Google Gemini API key |
| `GROQ_API_KEY` | — | Groq API key |
| `OLLAMA_BASE_URL` | `localhost:11434` | Ollama base URL |
| `DB_PATH` | `data/gis_database.db` | SQLite database path |

---

## 🧪 &nbsp; Testing

Run the full test suite with:

```bash
pytest tests/
```

```bash
pytest tests/ -v            # verbose output
pytest tests/ --tb=short    # short traceback
```

---

<div align="center">

---

```
  ╔═══════════════════════════════════════════════╗
  ║   Built with  ⬡  precision, purpose & Python  ║
  ╚═══════════════════════════════════════════════╝
```

<img src="https://img.shields.io/badge/Made%20with-Python-F5C518?style=for-the-badge&logo=python&logoColor=white&labelColor=0a0a0a" />
&nbsp;
<img src="https://img.shields.io/badge/Powered%20by-FastAPI-F5C518?style=for-the-badge&logo=fastapi&logoColor=white&labelColor=0a0a0a" />
&nbsp;
<img src="https://img.shields.io/badge/Maps%20by-Leaflet-F5C518?style=for-the-badge&logo=leaflet&logoColor=white&labelColor=0a0a0a" />

<br/><br/>

⬡ &nbsp; *GIS Land Analysis — Where geospatial data meets artificial intelligence* &nbsp; ⬡

</div>
````

