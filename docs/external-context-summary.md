# External Context Summary

This file mirrors the external context that Claude Code needs for normal project execution so it does not need to read files outside the repository during routine work.

## 1. API Usage Constraint

The user requires that AI provider settings must not be configured globally by default.

Required rule:

- only configure API credentials in the specific terminal or process that needs them
- do not write machine-level or user-level `ANTHROPIC_*` values unless the user explicitly asks

## 2. Current Mimo-Compatible Claude Configuration Pattern

The current working session-local pattern is:

- `ANTHROPIC_AUTH_TOKEN=<provided separately by user>`
- `ANTHROPIC_BASE_URL=https://api.xiaomimimo.com/anthropic`
- `ANTHROPIC_MODEL=mimo-v2.5-pro`
- `ANTHROPIC_DEFAULT_SONNET_MODEL=mimo-v2.5-pro`
- `ANTHROPIC_DEFAULT_OPUS_MODEL=mimo-v2.5-pro`
- `ANTHROPIC_DEFAULT_HAIKU_MODEL=mimo-v2.5-pro`

Important compatibility note:

- do not mix an `sk-...` token with `https://token-plan-cn.xiaomimimo.com/anthropic`
- the validated pattern for the current user-provided token is `https://api.xiaomimimo.com/anthropic`

## 3. Practical Rule For Claude Code

For normal repository work:

- assume the Claude session is already configured if model access is needed
- do not proactively read external secret files unless the current task is blocked and the user has granted that path

## 4. Server Blueprint Summary

The repository should eventually deploy according to this multi-project server pattern:

- host runs `Nginx`
- host runs `PostgreSQL`
- project services preferably run in `Docker`
- each project gets its own:
  - project directory
  - `.env`
  - `compose.yml`
  - database
  - database user
  - Nginx site config
  - internal ports

Recommended server layout:

- `/srv/apps/<project>/...`
- `/srv/data/<project>/...`
- `/srv/backups/...`

Port planning:

- `21000-21099` frontend
- `22000-22099` backend API
- `23000-23099` workers or management

Public ports should remain:

- `22`
- `80`
- `443`

Database model:

- one project -> one database
- one project -> one DB user

Known infrastructure context:

- new server: `120.53.242.193`
- old public entry: `http://43.143.67.18/`

## 5. External Source Files

The original external source files still exist, but they should be treated as fallback references rather than required first reads:

- `G:\DevProject\mimo_api.txt`
- `G:\DevProject\server_blueprint\README.md`
- `G:\DevProject\server_blueprint\SERVER_LAYOUT.md`
- `G:\DevProject\server_blueprint\PROJECT_REGISTRY.md`
- `G:\DevProject\server_blueprint\MIGRATION_CHECKLIST.md`
