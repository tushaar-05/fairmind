# FairMind

FairMind is a full-stack AI fairness audit and monitoring project.  
It helps teams upload tabular decision data, analyze bias metrics, review compliance risk, and visualize fairness behavior in a dashboard.

## What It Includes

- **Frontend:** React + Vite dashboard (`frontend/`)
- **Backend:** FastAPI service scaffold (`backend/`)
- **Analysis Engine:** modular fairness computation logic in `frontend/src/analysis/`
- **Monitoring UI:** D3-powered visualizations for trends and risk monitoring

## Core Features

- Dataset upload (`CSV`, `JSON`) with column role mapping
- Fairness analysis with transparent metric formulas
- Risk scoring and compliance mapping (EU/USA)
- Counterfactual and intersectional bias views
- Monitoring dashboard with dynamic alerts and D3 charts

## Fairness Math Used

Current metrics exposed in the UI:

- **Demographic Parity:** difference in approval tendency across groups
- **Equal Opportunity (proxy mode):** subgroup positive-rate proxy comparison
- **Disparate Impact:** ratio-based fairness check (80% rule style threshold)
- **Calibration (prototype proxy):** score-based calibration indicator
- **Proxy Detection:** feature risk heuristics for possible proxy variables

The frontend analysis logic lives under:

- `frontend/src/analysis/auditEngine.js`
- `frontend/src/analysis/fairnessMetrics.js`
- `frontend/src/analysis/riskScoring.js`
- `frontend/src/analysis/complianceMapping.js`
- `frontend/src/analysis/datasetProfile.js`
- `frontend/src/analysis/ingestion.js`

## Project Structure

```text
fairmind/
  frontend/                 # React + Vite app
    src/
      App.jsx               # Main pages (landing/upload/analysis/monitoring)
      App.css               # Styling
      analysis/             # Analysis modules
  backend/                  # FastAPI backend scaffold
    main.py                 # API app and routes
    requirements.txt
  docs/                     # Methodology, roadmap, data contract docs
```

## Run Locally

### 1) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend dev URL is usually `http://localhost:5173`.

### 2) Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend URL is usually `http://localhost:8000`.

### 3) Quality Checks

```bash
cd frontend
npm run lint
npm run test
npm run build
```

## API Endpoints (Current Scaffold)

- `GET /health`
- `POST /analysis/run`

> Note: The frontend currently computes most analysis locally.  
> Backend routes are scaffolded to support migration to server-side analysis.

## Deployment (Vercel Recommended)

Use **two Vercel projects**:

1. **Frontend project**
   - Root: `frontend`
   - Build: `npm run build`
   - Output: `dist`

2. **Backend project**
   - Root: `backend`
   - Add `backend/api/index.py`:
     ```python
     from main import app
     ```

Then set frontend env var:

- `VITE_API_BASE_URL=https://<your-backend-domain>`

## Current Limitations

- Monitoring data is demo/simulated (state-driven), not yet from live production streams
- Mitigation/export buttons in UI are flow-ready but not fully wired to persistent backend jobs
- Some compliance and calibration indicators are heuristic/prototype-level signals

## Roadmap (Short)

- Move analysis execution fully to backend APIs
- Add real model training + mitigation pipeline
- Add report export + persistence
- Add live ingest/stream-backed monitoring
