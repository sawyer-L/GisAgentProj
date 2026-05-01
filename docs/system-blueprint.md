# AI + Agent + GIS System Blueprint

## 1. Recommended System Positioning

Build a moderately complex platform for:

- spatial data visualization
- spatial search and analysis
- AI-assisted task execution
- agent-driven workflow automation around GIS data

Recommended stack:

- Frontend: Vue 3 + Vite + TypeScript + Pinia + Vue Router + Cesium
- Backend: Spring Boot 3 + Java 17
- Database: PostgreSQL + PostGIS
- AI layer: provider abstraction for multiple model APIs
- Agent layer: backend service that plans tasks, calls tools, stores run history, and returns traceable results

This is a good fit for your goal because it combines:

- practical AI API integration
- agent application design
- real spatial business capability
- a stack that is common in enterprise GIS systems

## 2. Core Modules

### Frontend

1. `app-shell`
- login shell, layout, routing, permissions, environment switching

2. `map-workbench`
- Cesium globe and map scene
- layer switcher
- drawing and measurement tools
- click/select/highlight interactions
- camera and bookmark management

3. `spatial-analysis-panel`
- buffer, intersect, nearby search, region statistics
- result rendering on map and side panel

4. `agent-console`
- chat-style panel
- task input form
- run status, step trace, tool log, final answer
- structured action confirmation for risky operations

5. `business-modules`
- domain pages such as incidents, assets, patrols, sensors, land parcels, or pipelines

### Backend

1. `gateway-api`
- frontend REST entry
- auth, request validation, unified response

2. `gis-service`
- spatial query APIs
- layer metadata APIs
- GeoJSON and tile-related interfaces

3. `agent-service`
- agent task creation
- run state machine
- memory/session context
- tool routing and audit logging

4. `ai-provider-service`
- unified model adapter
- provider config
- retry, timeout, cost and token logging

5. `business-service`
- domain logic such as incident processing, asset lookup, reporting, workflow status

6. `file-report-service`
- report export
- attachment upload/download
- generated output storage

### Data Layer

1. `postgresql + postgis`
- business tables
- geometry columns
- spatial indexes

2. `object/file storage`
- uploaded layers
- exported reports
- generated artifacts

3. `optional cache/queue`
- Redis for session/cache
- MQ later if async workflows become heavy

## 3. Agent Design Recommendation

Do not start with a fully autonomous multi-agent system.

Start with a controlled single orchestration agent that can call tools:

- `map_context_tool`
- `spatial_query_tool`
- `layer_metadata_tool`
- `business_record_query_tool`
- `report_generation_tool`

Then evolve into role-based agents only after the tool boundary is stable:

- `planner-agent`
- `gis-analyst-agent`
- `report-agent`
- `review-agent`

Recommended principle:

- keep planning in AI
- keep GIS operations in deterministic backend tools
- keep final execution auditable

This avoids the common mistake of asking the model to do spatial logic that should stay in code.

## 4. Suggested Phase Plan

### Phase 0: Architecture And Local Simulation

Goal:

- define modules, contracts, demo path, and local scripts

Deliverables:

- repository structure
- architecture docs
- interface contracts
- mock datasets
- local Claude/Codex collaboration workflow

No real server is required yet.

### Phase 1: Frontend GIS MVP + Mock Backend

Goal:

- make the product visible quickly

Deliverables:

- Vue app with Cesium map
- local mock layer data
- map click and feature panel
- agent console UI
- fake agent response pipeline with hard-coded or mock API responses

This phase proves interaction design before backend complexity.

### Phase 2: Spring Boot Backend + Real AI Gateway

Goal:

- replace mock services with real backend services

Deliverables:

- Spring Boot APIs
- AI provider adapter
- task run logging
- GIS REST endpoints
- first real agent tool chain

Server requirement:

- one dev server is useful here, but still optional if local Java/Postgres runs are acceptable

### Phase 3: PostgreSQL/PostGIS Integration

Goal:

- connect business data and spatial data

Deliverables:

- spatial schema
- sample business domain tables
- geometry import pipeline
- spatial indexes
- analysis endpoints

Server requirement:

- a real database instance becomes useful here

### Phase 4: Controlled Agent Workflow

Goal:

- run end-to-end agent tasks with approval checkpoints

Deliverables:

- agent task history
- step trace
- approval-required actions
- report generation
- audit log

### Phase 5: Multi-Agent And Deployment

Goal:

- move from one orchestrator to coordinated specialist agents

Deliverables:

- planner/reviewer split
- long-running workflow handling
- deployment architecture
- observability and usage metrics

## 5. What To Build Before You Provide Server/Database

These can start immediately:

1. frontend shell and Cesium workbench
2. agent console UI
3. backend API contract definitions
4. mock spatial dataset and mock incident/asset dataset
5. AI provider abstraction interfaces
6. local fake agent workflow
7. result schema for chat, tool trace, and action recommendations

Recommended local-first rules:

- store mock data as JSON/GeoJSON
- make all provider settings environment-driven
- keep business modules behind interfaces so PostgreSQL/PostGIS can be plugged in later

## 6. Three Practical Demo Scenarios

### Demo 1: Incident Around Me

Scenario:

- user clicks a location on the map
- agent reads the clicked point and nearby layers
- system returns nearby incidents, assets, cameras, or patrol routes
- agent summarizes risk and suggests next steps

Value:

- shows map context + tool calling + AI summarization

### Demo 2: Natural Language Spatial Analysis

Scenario:

- user asks: "Find schools within 3 km of this construction site and generate a risk note"
- agent converts the task into deterministic spatial queries
- backend returns results
- agent generates a structured report and highlights features on the map

Value:

- shows that natural language becomes auditable GIS operations

### Demo 3: Event Disposal Copilot

Scenario:

- user selects an incident on the map
- agent fetches nearby resources and historical events
- system drafts a disposal plan and response checklist
- user confirms before any state-changing action

Value:

- shows business workflow integration instead of map-only demo

## 7. Recommended Initial Repository Structure

Use a conservative mono-repo layout:

```text
docs/
frontend/
backend/
mock-data/
scripts/
```

Frontend can start first. Backend and database integration can grow into the reserved folders later.

## 8. What I Need From You Later

Not needed yet:

- production server
- final database
- full domain model

Needed soon:

1. your target business scenario
2. whether this is for incidents, land, pipelines, parks, assets, security, or another GIS domain
3. your preferred deployment style
4. server and database info when we enter real backend integration

## 9. Recommended Next Build Step

Start with a vertical slice:

1. Vue + Cesium frontend shell
2. right-side agent console
3. one mock spatial dataset
4. one mock backend contract
5. one end-to-end scenario: click point -> query nearby mock features -> agent summary

That gives the fastest proof that the combined architecture is viable.
