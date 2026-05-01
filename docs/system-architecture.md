# System Architecture

## 1. Conservative Baseline

Use a single main backend first.

- Frontend: Vue + Cesium
- Backend: Spring Boot
- Database: PostgreSQL + PostGIS
- AI: backend adapter layer
- Agent: backend workflow engine

This is the recommended starting point because it is:

- easier to debug
- easier to deploy
- easier to learn from
- still rich enough to support agent workflows

## 2. Main System Modules

### Frontend

- `Map Workspace`
  - Cesium globe/scene
  - layer tree
  - feature selection
  - spatial drawing tools
- `AI Assistant Panel`
  - chat UI
  - task form
  - structured result cards
- `Task Center`
  - agent task status
  - task history
  - rerun/review
- `Report Panel`
  - AI summary
  - GIS-linked evidence
  - export entry

### Backend

- `Auth Module`
  - user/session/role basics
- `GIS Data Module`
  - feature query
  - spatial filtering
  - area/range analysis
- `AI Gateway Module`
  - provider config
  - model routing
  - prompt templates
  - request/response logging
- `Agent Workflow Module`
  - task creation
  - workflow steps
  - tool calling
  - result persistence
- `Report Module`
  - report generation
  - export metadata

### Database

- `users`
- `roles`
- `map_layers`
- `spatial_features`
- `events`
- `agent_tasks`
- `agent_task_steps`
- `ai_call_logs`
- `reports`

Spatial tables should use `geometry` columns and be indexed with PostGIS indexes.

## 3. Core Data Flow

### Flow A: AI Chat With GIS Context

1. User selects an area, feature, or layer on the map
2. Frontend sends business context and spatial context to backend
3. Backend queries PostGIS and business tables
4. Backend builds a structured AI request
5. AI result returns as:
   - narrative answer
   - structured action suggestion
   - optional map highlight payload
6. Frontend renders both text and map results

### Flow B: Agent Analysis Task

1. User submits a goal such as "analyze risk points in this polygon"
2. Backend creates an `agent_task`
3. Agent workflow runs step by step:
   - collect context
   - call GIS query tool
   - call AI model
   - normalize result
   - save report
4. Frontend polls or subscribes to task status
5. User sees result on map and in report panel

## 4. What "Agent" Means In This Project

At the start, "agent" should mean a controlled workflow, not a totally open autonomous agent.

Recommended initial pattern:

- planner step
- GIS tool step
- data aggregation step
- model reasoning step
- structured output step

This is better than starting with a free-form autonomous agent because:

- behavior is easier to explain
- debugging is easier
- cost is easier to control
- GIS/business safety is easier to enforce

## 5. Recommended First Agent Workflows

### Workflow 1: Spatial Risk Summary

Input:

- selected polygon or point buffer
- selected event type

Output:

- risk summary text
- ranked issue list
- highlighted features on map

### Workflow 2: Inspection Route Suggestion

Input:

- start point
- candidate targets
- priority rule

Output:

- ordered visit list
- route recommendation
- explanation

### Workflow 3: Area Comparison Report

Input:

- area A
- area B
- metric selection

Output:

- comparison summary
- structured indicators
- map overlays

## 6. API Boundaries

Recommended API families:

- `/api/auth/*`
- `/api/layers/*`
- `/api/features/*`
- `/api/spatial/*`
- `/api/ai/*`
- `/api/agent-tasks/*`
- `/api/reports/*`

Examples:

- `POST /api/ai/chat-with-map-context`
- `POST /api/agent-tasks/spatial-risk-summary`
- `GET /api/agent-tasks/{id}`
- `POST /api/spatial/query-by-geometry`

## 7. Frontend Page Suggestions

- `Login`
- `MapWorkbench`
- `TaskCenter`
- `ReportCenter`
- `SystemConfig` later

For the first real UI, `MapWorkbench` should contain:

- main Cesium canvas
- left layer panel
- right AI/task panel
- bottom result/details panel

## 8. Before The User Provides A Server

We can safely do all of this now:

- architecture design
- frontend scaffold
- backend scaffold
- fake spatial dataset
- local API contracts
- mock agent workflows
- one end-to-end demo using local files or local DB

We do not need a remote server yet for those steps.

## 9. When The User Provides Server And Database

Then we should add:

- real deployment layout
- PostgreSQL/PostGIS initialization scripts
- environment split: dev/test/prod
- file storage strategy
- scheduled task/queue strategy
- backup and logging strategy

## 10. Better Architecture Option Requiring Approval

If later you want stronger agent experimentation, a better long-term option may be:

- keep Java as the main business backend
- add a separate `agent-service` for advanced orchestration

That side service could be Python-based if the goal becomes rapid experimentation with richer agent ecosystems.

This is not the default starting point. It should only be adopted if you approve the added complexity.
