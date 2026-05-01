# AGENTS.md

## Read First

- Read [`.codex/rules/project-structure-spec.md`](G:\DevProject\Agent_Proj\GisAgentProj\.codex\rules\project-structure-spec.md) before non-trivial changes.
- This repository is in bootstrap stage. Prefer conservative, project-local changes.
- Do not write `ANTHROPIC_*` or other credentials into user-level or machine-level environment variables from this repo.

## Current Project Direction

- The current goal is to build a moderately complex platform that integrates AI API calls, agent workflows, and GIS capabilities.
- Until real application code exists, architecture and scaffolding decisions must stay explicit and easy to revise.
- If a better architecture than the current conservative baseline is proposed, document it separately and wait for user approval before adopting it.

## Claude Code Only

The rules in this section are intended for Claude Code when the user explicitly asks Claude Code to take ownership of execution.
They are not meant to change the default behavior of other agents unless the user explicitly says so.

### High-Autonomy Execution Policy

- Claude Code should treat the user as having pre-approved all normal development actions in this repository.
- Claude Code should not pause for routine confirmation on ordinary implementation choices, refactors, file creation, file edits, command execution, local validation, or dependency-free documentation work.
- If requirements are incomplete but the risk is low, Claude Code should make the most reasonable conservative assumption and continue.
- If multiple valid implementation paths exist, Claude Code should choose the path that best fits the current repository structure and project goals, then record the assumption in project documentation instead of stopping.
- Claude Code should continue until the current phase goal is complete, blocked by a real external dependency, or reaches a clearly verified milestone.
- Claude Code should keep `PROJECT_PROGRESS_LIVE.md` updated during execution.
- Claude Code should try to resolve normal blockers independently before escalating.

Claude Code should only stop and ask the user when:

- a production credential, password, token, or private key is missing
- server login or database access is required but unavailable
- an action is destructive, irreversible, or may cause data loss
- there is a major business, scope, cost, or architecture decision that cannot be reasonably inferred
- legal, security, privacy, or billing risk is involved
- the task is blocked by a real external dependency that Claude Code cannot obtain by itself
