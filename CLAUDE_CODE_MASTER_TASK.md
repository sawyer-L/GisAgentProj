# Claude Code Master Task

## 1. Role And Ownership

This document is the main handoff brief for Claude Code.

From this point forward, Claude Code is expected to act as the primary execution agent for this repository, continue the implementation work, keep progress visible, and move the project from presentation prototype toward a deployable full project.

Codex has already completed bootstrap work, initial architecture docs, a polished frontend presentation prototype, and a backend skeleton. Claude Code should continue from that base instead of rebuilding from scratch.

## 2. Project Goal

Build a moderately complex system that combines:

- AI API integration
- agent-style workflows
- GIS visualization and interaction
- frontend application
- backend services
- PostgreSQL/PostGIS
- server deployment

The product must support two realities at the same time:

1. It must remain strong enough as a customer-facing demo.
2. It must evolve into a real deployable project instead of staying a fake-only prototype forever.

## 3. Current Product Position

The project is currently closer to a high-quality demo prototype than a full deployable system.

Rough status estimate:

- frontend presentation prototype: advanced
- backend real runtime readiness: early
- database integration: not started
- deployable full-stack MVP: early
- production-grade platform: not started

## 4. What Already Exists

### 4.1 Repository Structure

Current repository root:

- `.codex/`
- `backend/`
- `docs/`
- `frontend/`
- `mock-data/`
- `scripts/`
- `AGENTS.md`
- `README.md`

### 4.2 Existing Documentation

Already present:

- `README.md`
- `docs/system-architecture.md`
- `docs/system-blueprint.md`
- `docs/local-run-guide.md`
- `.codex/rules/project-structure-spec.md`

Important note:

- `.codex/rules/project-structure-spec.md` was written when the repository was still almost empty.
- The repository now contains real frontend and backend scaffolding.
- One of Claude Code's first documentation tasks should be to refresh that structure spec so it reflects the current codebase.

### 4.3 Frontend Status

The frontend already includes a strong demo shell with:

- Vue 3 + Vite + TypeScript
- Cesium-based GIS presentation
- map-centered workbench layout
- AI dialogue panel
- agent team / workflow presentation
- mission scenarios
- mock task history
- structured result cards
- polished visual presentation suitable for customer demonstration

Important current behavior:

- the current demo flow is frontend-only
- fake/mock data is acceptable for presentation
- no live backend is required for the current visual demo

### 4.4 Backend Status

The backend folder already contains a Spring Boot style skeleton, including:

- health endpoint
- mock agent task endpoint
- AI gateway placeholder
- GIS query placeholder
- report service placeholder

Important limitation:

- the backend has not been fully verified on this machine because local build tooling is incomplete
- Java is present, but Maven and Gradle are not both available as fully usable local toolchains

### 4.5 Collaboration Scripts

Existing helper scripts:

- `scripts/launch-claude-mimo.ps1`
- `scripts/start-visible-collab-demo.ps1`

These are useful for local collaboration testing and session-local Claude launch behavior.

## 5. Primary User Intent

The user's intent has evolved in this sequence:

1. Verify Claude Code can be launched against the Mimo API without global pollution.
2. Build a presentation-first AI + Agent + GIS frontend experience.
3. Keep fake data and fake functionality acceptable for customer demo if needed.
4. Now move toward a complete project that can eventually be deployed to a server.

This means the next implementation strategy should be:

- do not discard the demo polish
- preserve the presentation value
- progressively replace fake subsystems with real ones
- keep architecture deployable

## 6. Hard Constraints

### 6.1 Repository Behavior Rules

Follow `AGENTS.md` and existing repository constraints:

- preserve repository structure and coding habits unless change is justified
- do not introduce speculative architecture without need
- if a better implementation than the current conservative path is proposed, explain it before adopting it
- follow local project rules before non-trivial implementation

### 6.2 API Safety Rule

Very important:

- do not globally configure API credentials
- do not write AI provider credentials to machine-level or user-level environment variables by default
- only configure API credentials inside the specific terminal or process that needs them, unless the user explicitly asks otherwise

This is a hard requirement because the user wants to avoid polluting other agent applications.

### 6.3 Source Of Truth For API Settings

The original external source file is:

- `G:\DevProject\mimo_api.txt`

However, for routine repository execution, Claude Code should use the repository-local summary file first:

- `G:\DevProject\Agent_Proj\GisAgentProj\docs\external-context-summary.md`

Operational rule:

- do not proactively read secret files outside the repository during normal work
- prefer the repository-local summary for non-secret operational guidance
- prefer not to duplicate secrets into additional repository files unless the user explicitly asks
- use session-local environment variables only

### 6.4 Current Mimo Integration Pattern

The current working pattern is based on:

- `ANTHROPIC_AUTH_TOKEN`
- `ANTHROPIC_BASE_URL=https://api.xiaomimimo.com/anthropic`
- `ANTHROPIC_MODEL=mimo-v2.5-pro`

Important compatibility note:

- do not mix the `sk-...` token with the `token-plan-cn.xiaomimimo.com` base URL
- the user previously hit `401 Invalid API Key` because of that mismatch

## 7. Server Blueprint And Deployment Constraints

Server blueprint source directory:

- `G:\DevProject\server_blueprint`

For routine repository work, use the repository-local summary first:

- `G:\DevProject\Agent_Proj\GisAgentProj\docs\external-context-summary.md`

Relevant files already reviewed:

- `README.md`
- `SERVER_LAYOUT.md`
- `PROJECT_REGISTRY.md`
- `MIGRATION_CHECKLIST.md`

### 7.1 Known Server Context

Known infrastructure context from the blueprint:

- new server: `120.53.242.193`
- old public entry: `http://43.143.67.18/`

`server_info.txt` currently does not provide usable extra details.

### 7.2 Required Deployment Blueprint Rules

Claude Code must design future deployment around these rules:

- host machine runs `Nginx`
- host machine runs `PostgreSQL`
- project services should preferably run in `Docker`
- each project gets:
  - its own project directory
  - its own `.env`
  - its own `compose.yml`
  - its own database
  - its own database user
  - its own Nginx site config
  - its own registered internal ports

### 7.3 Required Server Layout Model

Deployment should follow the long-term structure:

- `/srv/apps/<project>/...`
- `/srv/data/<project>/...`
- `/srv/backups/...`

Do not design the deployment in a way that conflicts with this multi-project blueprint.

### 7.4 Port Planning Rules

Use host-local bindings and avoid public business ports:

- `21000-21099` for frontend services
- `22000-22099` for backend APIs
- `23000-23099` for workers or management services

Public exposure should remain limited to:

- `22`
- `80`
- `443`

### 7.5 Database Rules

Do not plan a shared catch-all database.

The target model is:

- one project -> one database
- one project -> one DB user

### 7.6 Project Registry Rule

Before real deployment, this project must be registered into the pattern described by `PROJECT_REGISTRY.md`.

If a new formal project name is chosen, keep it consistent across:

- project directory
- database name
- database user
- Nginx site config
- deployment docs

## 8. Recommended Product Architecture

Keep the current recommended baseline unless the user approves a more complex path:

- frontend: Vue 3 + Vite + TypeScript + Pinia + Cesium
- backend: Spring Boot
- database: PostgreSQL + PostGIS
- AI integration: backend provider adapter
- agent model: controlled workflow orchestration first

Do not jump directly into fully autonomous multi-agent design.

Recommended first real agent model:

- planner step
- GIS tool step
- data aggregation step
- model reasoning step
- structured output step

## 9. What Claude Code Should Treat As The Immediate Mission

### 9.1 Strategic Objective

Transform the repository from:

- demo-heavy presentation prototype

toward:

- full-stack deployable MVP

while preserving the demo experience.

### 9.2 First Priority Deliverables

Claude Code should work toward these outcomes in order:

1. stabilize the current repository structure and documentation
2. refresh the local structure spec
3. audit the current frontend and backend status
4. identify exactly what is mock, what is scaffold, and what is real
5. define the deployable MVP scope
6. implement the backend runtime path
7. introduce PostgreSQL/PostGIS integration plan and scripts
8. add environment and deployment structure
9. connect frontend -> backend -> AI adapter -> task workflow
10. prepare the server deployment package

## 10. Required Working Method For Claude Code

### 10.0 High-Autonomy Execution Policy

This subsection is specifically for Claude Code.

Claude Code is authorized to continue working without pausing for routine confirmation.

Execution rules:

- treat the user as having pre-approved all normal development actions in this repository
- do not stop to ask for confirmation on ordinary implementation choices, refactors, file creation, file edits, command execution, local validation, or dependency-free documentation work
- when requirements are incomplete but the risk is low, make the most reasonable conservative assumption and continue
- when multiple valid implementation paths exist, choose the one that best fits the current repository structure and project goals, then record the assumption in progress documents instead of pausing
- continue working until the current phase goal is actually completed, blocked by a real external dependency, or reaches a clearly verified milestone
- keep `PROJECT_PROGRESS_LIVE.md` updated as work progresses
- prefer solving blockers independently before surfacing them to the user

Claude Code should only pause and ask the user if one of the following is true:

- a production credential, password, token, or private key is missing
- server login or database access is required but not available
- an action is destructive, irreversible, or may cause data loss
- there is a business decision with major scope, cost, or architectural consequences that cannot be reasonably inferred
- legal, security, privacy, or billing risk is involved
- the task is blocked by a real external dependency that Claude Code cannot obtain by itself

Default behavior:

- act first
- verify results
- update docs
- continue to the next task
- only escalate true blockers

### 10.1 Start With A Fresh Repo Audit

Before major code changes:

- rescan the repository
- verify current frontend state
- verify current backend skeleton
- verify docs are still accurate
- update stale structure documentation
- avoid reading files outside the repository during initial audit unless blocked

### 10.2 Maintain A Live Progress File

Claude Code must continuously update:

- `G:\DevProject\Agent_Proj\GisAgentProj\PROJECT_PROGRESS_LIVE.md`

Update it whenever one of these happens:

- phase changes
- meaningful milestone completed
- blocker discovered
- architecture decision changes
- deployment requirement clarified

### 10.3 Keep Demo Value Intact

Even when replacing mocks:

- avoid breaking the existing customer-facing demo experience
- prefer additive changes or controlled swaps
- keep a demo-safe mode if needed

### 10.4 Prefer Environment-Driven Design

All runtime settings should be designed for environment-based configuration, especially:

- AI provider settings
- backend ports
- database settings
- allowed frontend origins
- deployment environment differences

### 10.5 Keep AI Integration Replaceable

Even though only one provider is needed right now, design should still make room for later extension.

Implementation rule:

- architecture can be provider-extensible
- actual first implementation only needs the current Mimo-compatible provider

## 11. Recommended Phase Plan

### Phase A: Consolidate The Current Prototype

Tasks:

- refresh project structure spec
- verify frontend routes, stores, services, and demo flow
- verify backend folder structure and build path
- standardize docs to match actual repo

Expected output:

- trustworthy project docs
- clear inventory of completed vs missing work

### Phase B: Define The Full MVP Scope

Tasks:

- decide the first real business slice
- define frontend pages needed beyond the demo shell
- define backend modules needed for MVP
- define initial database schema
- define API contracts

Expected output:

- deployable MVP scope document
- API contract draft
- DB schema draft

### Phase C: Make Backend Runnable

Tasks:

- fix and verify build tooling
- confirm Java and build configuration
- run the backend locally
- expose working REST endpoints
- establish unified response model

Expected output:

- runnable backend
- verified local startup steps

### Phase D: Add Real AI Gateway

Tasks:

- implement provider config binding
- implement Mimo-compatible AI adapter
- add timeout, retry, and error handling
- add request/response logging strategy

Expected output:

- real backend AI call path using the current API source

### Phase E: Add Database Foundation

Tasks:

- create PostgreSQL/PostGIS schema plan
- create initialization SQL and migration strategy
- define spatial tables and task tables
- define local and server env expectations

Expected output:

- DB schema
- migration scripts
- connection contract

### Phase F: Replace Mock Workflow With Real Workflow

Tasks:

- connect frontend task actions to backend
- implement controlled agent workflow
- store task history
- return structured GIS-linked results

Expected output:

- real end-to-end AI + Agent + GIS flow

### Phase G: Prepare Deployment

Tasks:

- create deployment docs
- align with server blueprint
- create project compose file and env template
- define Nginx reverse proxy plan
- define database provisioning steps

Expected output:

- deployment package and runbook for the target server pattern

## 12. Current Known Gaps

Known missing or incomplete areas:

- real backend runtime verification
- build tool consistency
- PostgreSQL/PostGIS integration
- persistent task storage
- auth and role model
- deployment configuration
- real AI adapter implementation
- real GIS query pipeline

## 13. Known Risks

- the current polished frontend may hide how much backend work is still missing
- the structure spec is stale and should not be trusted until refreshed
- server credentials are not yet fully available
- old server internals are still unknown beyond public HTTP behavior
- API credentials must be handled carefully to avoid cross-tool pollution

## 14. What Not To Do

Claude Code should avoid these mistakes:

- do not rewrite the frontend from scratch
- do not remove the current demo polish without replacement
- do not store credentials globally
- do not assume server SSH or DB credentials that have not been provided
- do not over-engineer into a multi-service or multi-agent maze too early
- do not bypass the multi-project server blueprint

## 15. Definition Of Success For The Next Stage

The next major success state is:

- repository docs are accurate
- progress file is actively maintained
- backend can run locally
- AI gateway can call the current Mimo provider
- frontend can call backend instead of frontend-only fake logic
- database plan exists and is ready for real PostgreSQL/PostGIS integration
- deployment structure matches the server blueprint

## 16. Required Output Discipline

For each meaningful work cycle, Claude Code should leave behind:

- updated code
- updated `PROJECT_PROGRESS_LIVE.md`
- updated docs when assumptions change
- clear note of what was verified and what remains blocked

## 17. Paths To Treat As Important Inputs

- `G:\DevProject\Agent_Proj\GisAgentProj\AGENTS.md`
- `G:\DevProject\Agent_Proj\GisAgentProj\.codex\rules\project-structure-spec.md`
- `G:\DevProject\Agent_Proj\GisAgentProj\README.md`
- `G:\DevProject\Agent_Proj\GisAgentProj\docs\system-architecture.md`
- `G:\DevProject\Agent_Proj\GisAgentProj\docs\system-blueprint.md`
- `G:\DevProject\Agent_Proj\GisAgentProj\docs\local-run-guide.md`
- `G:\DevProject\Agent_Proj\GisAgentProj\docs\external-context-summary.md`

Fallback-only external references if truly needed and already permitted by the session:

- `G:\DevProject\mimo_api.txt`
- `G:\DevProject\server_blueprint\README.md`
- `G:\DevProject\server_blueprint\SERVER_LAYOUT.md`
- `G:\DevProject\server_blueprint\PROJECT_REGISTRY.md`
- `G:\DevProject\server_blueprint\MIGRATION_CHECKLIST.md`

## 18. Final Instruction To Claude Code

Treat this repository as an active project handoff, not as a blank scaffold.

Start by auditing what already exists, update the local structure/spec documents, preserve the current strong demo experience, then drive the repository forward toward a real deployable AI + Agent + GIS system aligned with the Mimo API constraint and the provided multi-project server blueprint.
