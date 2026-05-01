# Backend

This folder contains the backend skeleton for the GIS + AI + Agent platform.

## Current Scope

- Java 17
- Spring Boot 3
- Gradle build
- basic package layout for `config`, `ai`, `agent`, `gis`, and `report`
- health endpoint
- mock agent task endpoint

## Planned Responsibilities

- provide spatial query APIs
- wrap AI provider calls
- run controlled agent workflows
- persist task and report data later, once a real database is provided

## First Demo Endpoints

- `GET /api/health`
- `GET /api/agent-tasks/demo`
- `POST /api/agent-tasks/demo-run`

## Notes For Frontend Integration

- CORS is open for `http://localhost:5173`
- the demo run endpoint accepts:
  - `prompt`
  - `selectedFeature`
