# Deployment Runbook - GisAgentProj

## Prerequisites

- Docker and Docker Compose installed
- (For production) Server access at 120.53.242.193

## Local Development

### Option 1: Docker Compose (recommended)

```bash
# Copy and edit environment file
cp .env.example .env
# Edit .env to set DB_PASS and optionally AI_API_KEY

# Start all services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f backend
```

Services:

- Frontend: http://localhost:21000
- Backend API: http://localhost:22000
- PostgreSQL: localhost:5432

### Option 2: Separate processes

**Database:**

```bash
# Using Docker for PostGIS only
docker run -d --name gis-agent-db \
  -e POSTGRES_DB=gis_agent \
  -e POSTGRES_USER=gis_agent \
  -e POSTGRES_PASSWORD=dev_pass \
  -p 5432:5432 \
  postgis/postgis:15-3.4
```

**Backend:**

```bash
cd backend
export DB_URL=jdbc:postgresql://localhost:5432/gis_agent
export DB_USER=gis_agent
export DB_PASS=dev_pass
export DB_ENABLED=true
export AI_API_KEY=your_key_here  # optional, omit for mock mode

./gradlew.bat bootRun
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_URL` | `jdbc:postgresql://localhost:5432/gis_agent` | PostgreSQL JDBC URL |
| `DB_USER` | `gis_agent` | Database user |
| `DB_PASS` | (empty) | Database password |
| `DB_ENABLED` | `false` | Enable Flyway migrations and JPA |
| `AI_BASE_URL` | `https://api.xiaomimimo.com/anthropic` | AI provider base URL |
| `AI_API_KEY` | (empty) | AI provider API key (empty = mock mode) |
| `AI_MODEL` | `mimo-v2.5-pro` | Model name |
| `AI_MAX_TOKENS` | `1024` | Max tokens per AI response |
| `AI_TIMEOUT_MS` | `30000` | AI request timeout (ms) |

## Production Deployment

### Server Layout

Following the multi-project server blueprint:

```
/srv/apps/gis-agent/
  docker-compose.yml
  .env
/srv/data/gis-agent/
  pgdata/  (Docker volume)
/srv/backups/gis-agent/
```

### Port Allocation

| Service | Internal Port | External |
|---------|--------------|----------|
| Frontend (Nginx) | 80 | 21000 |
| Backend (Spring Boot) | 8080 | 22000 |
| PostgreSQL | 5432 | (not exposed) |

### Nginx Site Config

```nginx
server {
    listen 80;
    server_name gis-agent.your-domain.com;

    location / {
        proxy_pass http://localhost:21000;
    }

    location /api/ {
        proxy_pass http://localhost:22000;
    }
}
```

### Database Provisioning

```sql
CREATE DATABASE gis_agent;
CREATE USER gis_agent WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE gis_agent TO gis_agent;
```

## Verification

1. Health check: `curl http://localhost:22000/api/health`
2. Demo task: `curl -X POST http://localhost:22000/api/agent-tasks/demo-run -H 'Content-Type: application/json' -d '{"prompt":"test","selectedFeature":"Binhe Pump Station"}'`
3. Task history: `curl http://localhost:22000/api/agent-tasks/history`
4. Frontend: Open http://localhost:21000 and run a mission scenario
