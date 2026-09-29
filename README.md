CycloneShield 🌪️

CycloneShield is a disaster-intelligence and cyclone-response platform that brings cyclone monitoring, spatial risk visualization, infrastructure exposure analysis, operational alerts, and AI-assisted emergency advisories into one interface.

Core Features

Operational Dashboard — cyclone conditions, infrastructure exposure, alerts, and risk indicators.

Risk Map — geospatial risk zones and backend-generated risk overlays.

Cyclone Tracking — cyclone track and storm visualization layers.

Infrastructure Risk — infrastructure exposure and category-based risk summaries.

AI Advisory — Gemini-backed cyclone impact analysis and emergency directives.

Alerts & Notifications — operational alert feed with dismiss and navigation actions.

Responsive View — mobile-oriented preview of the application.

Risk Intelligence — cyclone, forecast, infrastructure-exposure, risk-zone, validation, and dataset modules.

Repository Structure

CycloneShield/
├── CycloneProject/
│   └── CycloneProject/
│       ├── app/
│       ├── intelligence/
│       ├── data/
│       ├── Dockerfile
│       ├── requirements.txt
│       └── ...
│
├── Cyclone_Alert-main/
│   └── Cyclone_Alert-main/
│       ├── public/
│       ├── src/
│       │   ├── components/
│       │   ├── screens/
│       │   ├── imports/
│       │   └── ...
│       ├── package.json
│       ├── vite.config.ts
│       └── ...
│
└── README.md

Technology Stack

Frontend

React

TypeScript

Vite

Tailwind CSS

Lucide Icons

Leaflet/geospatial visualization components

Backend

Python

FastAPI

PostgreSQL / PostGIS

SQLAlchemy

GeoAlchemy2

Alembic

Docker

Google Gemini integration

Data & Intelligence

GeoJSON / CSV / JSON datasets

Cyclone and wind datasets

Risk-engine and infrastructure-exposure processing

🚀 Running the Project Locally

Prerequisites

Install:

Git

Node.js and npm

Python 3.12+

Docker Desktop

PostgreSQL/PostGIS access

Gemini API key for AI Advisory

Verify:

git --version
node --version
npm --version
python --version
docker --version

1. Backend Setup

Open PowerShell in:

CycloneProject/CycloneProject

Create a virtual environment:

python -m venv venv

Activate it:

.env\Scripts\Activate.ps1

Install dependencies:

pip install -r requirements.txt

Environment variables

Create a local .env file in the backend directory:

DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@127.0.0.1:5433/cycloneshield
GEMINI_API_KEY=YOUR_GEMINI_API_KEY

Never commit .env or cloud credentials to GitHub.

Start PostgreSQL/PostGIS

If the project's Docker database already exists:

docker start cycloneshield-postgres

If it must be created:

docker run -d `
  --name cycloneshield-postgres `
  -e POSTGRES_PASSWORD=YOUR_PASSWORD `
  -e POSTGRES_DB=cycloneshield `
  -p 5433:5432 `
  postgis/postgis:16-3.4

Start FastAPI

From the backend directory:

uvicorn app.main:app --reload --host 0.0.0.0 --port 8080

API:

http://localhost:8080

Swagger:

http://localhost:8080/docs

Health check:

http://localhost:8080/health

2. Frontend Setup

Open a second PowerShell window in:

Cyclone_Alert-main/Cyclone_Alert-main

Install dependencies:

npm install

Start the development server:

npm run dev

Vite normally serves the application at:

http://localhost:5173

Use the exact URL printed by Vite if a different port is selected.

Frontend production build

npm run build

Preview the build:

npm run preview

3. Recommended Startup Order

Use three terminals.

Terminal 1 — Database

docker start cycloneshield-postgres

Terminal 2 — Backend

cd "$HOME\OneDrive\Desktop\CycloneShield\CycloneProject\CycloneProject"
.env\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8080

Terminal 3 — Frontend

cd "$HOME\OneDrive\Desktop\CycloneShield\Cyclone_Alert-main\Cyclone_Alert-main"
npm run dev

Then open the frontend URL displayed in Terminal 3.

🔌 Main Backend APIs

Current project APIs include:

GET  /health
GET  /health/database

GET  /api/v1/cyclones
GET  /api/v1/infrastructure
GET  /api/v1/risk/zones
POST /api/v1/risk/analyze

GET  /api/v1/data/risk-map
GET  /api/v1/data/cyclone-tracks
GET  /api/v1/data/grid

POST /api/gemini

Use the FastAPI Swagger page for the exact request and response schemas:

http://localhost:8080/docs

🤖 AI Advisory

The AI Advisory screen sends cyclone information to:

POST /api/gemini

The backend uses the configured Gemini credential and returns generated advisory content such as:

cyclone impact analysis

emergency action directives

Example request:

{
  "cyclone": "Cyclone Name",
  "wind_speed": 120,
  "location": "Affected Location",
  "language": "English"
}

Keep API credentials only in the local environment.

🗺️ Risk & Geospatial Data

The application uses geospatial datasets for visualization and risk analysis, including cyclone tracks, risk-map GeoJSON, infrastructure/grid data, and wind-related datasets.

The frontend loads the backend risk-map layer through:

GET /api/v1/data/risk-map

Risk-zone features can contain fields such as risk level and risk score, which are used by the visualization layer.

🧠 Intelligence Layer

The backend intelligence code is organized under:

CycloneProject/CycloneProject/intelligence/

It includes modules for:

cyclone loading and validation

infrastructure checks

wind-unit checks

dataset statistics

risk-engine processing

cyclone scenarios

forecasts

infrastructure exposure

risk zones

Gemini advisory support

intelligence QA and verification

🔐 Security Notes

Do not commit:

.env
.env.*
venv/
.venv/
node_modules/
*service-account*.json

Do not place API keys directly inside frontend source files.

If a credential has already been exposed in Git history, rotate/revoke it before using it again.

🧭 Application Flow

Cyclone / Weather Data
          ↓
   Risk Intelligence
          ↓
    Spatial Risk Map
          ↓
Infrastructure Exposure
          ↓
 Operational Dashboard
          ↓
     AI Advisory
          ↓
 Alerts & Response Actions

🎯 Project Objective

CycloneShield is designed as an operational decision-support prototype for cyclone response. It combines geospatial visualization, risk intelligence, infrastructure exposure analysis, and AI-assisted advisory generation to help users understand changing cyclone conditions and associated risks from a single dashboard.

👥 Team

CycloneShield — Hackathon Project

The project combines frontend engineering, backend/API development, geospatial visualization, risk intelligence, data processing, and AI integration.

Project Status

CycloneShield is currently a hackathon/prototype project. Some integrations depend on local database availability, external API credentials, configured datasets, and deployment configuration.

