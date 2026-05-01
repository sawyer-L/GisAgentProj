# Local Run Guide

## Quick Start (Frontend Only - Demo Mode)

From [frontend](G:\DevProject\Agent_Proj\GisAgentProj\frontend):

```powershell
npm install
npm run dev
```

Open http://localhost:5173. The frontend runs in mock mode by default — no backend required.

## Full Stack (with Backend)

### 1. Start Backend

From [backend](G:\DevProject\Agent_Proj\GisAgentProj\backend):

```powershell
# Optional: set AI API key for real AI calls (omit for mock mode)
$env:AI_API_KEY = "your_key_here"

./gradlew.bat bootRun
```

Backend starts at http://localhost:8080.

### 2. Start Frontend

From [frontend](G:\DevProject\Agent_Proj\GisAgentProj\frontend):

```powershell
npm run dev
```

Frontend at http://localhost:5173 proxies API calls to the backend.

### 3. Verify

```powershell
# Health check
curl http://localhost:8080/api/health

# Run a demo task
curl -X POST http://localhost:8080/api/agent-tasks/demo-run `
  -H "Content-Type: application/json" `
  -d '{"prompt":"Analyze risks","selectedFeature":"Binhe Pump Station"}'
```

## Full Stack with Database

### 1. Start PostgreSQL/PostGIS

```powershell
docker run -d --name gis-agent-db `
  -e POSTGRES_DB=gis_agent `
  -e POSTGRES_USER=gis_agent `
  -e POSTGRES_PASSWORD=dev_pass `
  -p 5432:5432 `
  postgis/postgis:15-3.4
```

### 2. Start Backend with DB

```powershell
$env:DB_URL = "jdbc:postgresql://localhost:5432/gis_agent"
$env:DB_USER = "gis_agent"
$env:DB_PASS = "dev_pass"
$env:DB_ENABLED = "true"

./gradlew.bat bootRun
```

### 3. Start Frontend

```powershell
npm run dev
```

## Docker Compose (All Services)

From the repository root:

```powershell
cp .env.example .env
# Edit .env to set DB_PASS and optionally AI_API_KEY

docker compose up -d
```

- Frontend: http://localhost:21000
- Backend: http://localhost:22000
- Database: localhost:5432

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `AI_API_KEY` | (empty) | AI provider key. Empty = mock mode |
| `AI_BASE_URL` | `https://api.xiaomimimo.com/anthropic` | AI provider URL |
| `DB_ENABLED` | `false` | Enable database integration |
| `DB_URL` | `jdbc:postgresql://localhost:5432/gis_agent` | Database URL |
| `DB_USER` | `gis_agent` | Database user |
| `DB_PASS` | (empty) | Database password |

## Demo Scenarios

1. **Urban Risk Overview** — Select "Binhe Pump Station" on the map
2. **Patrol Dispatch Route** — Select "Patrol Station A"
3. **Critical Node Review** — Select "Northwest Drainage Node"

Each scenario runs: collect context -> GIS query -> AI summary -> compose report.
