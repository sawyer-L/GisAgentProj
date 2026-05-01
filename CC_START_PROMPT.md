# CC Start Prompt

Read these files in order and then continue execution in high-autonomy mode:

1. `G:\DevProject\Agent_Proj\GisAgentProj\CLAUDE_CODE_MASTER_TASK.md`
2. `G:\DevProject\Agent_Proj\GisAgentProj\AGENTS.md`
3. `G:\DevProject\Agent_Proj\GisAgentProj\PROJECT_PROGRESS_LIVE.md`
4. `G:\DevProject\Agent_Proj\GisAgentProj\docs\external-context-summary.md`

Important:

- do not proactively read files outside this repository during routine work
- use the repository-local external context summary first
- only read external files if truly blocked and that path has already been permitted by the user or session

Execution policy:

- do not pause for routine confirmation
- treat normal repository work as pre-approved
- make conservative assumptions when risk is low
- keep updating `PROJECT_PROGRESS_LIVE.md`
- continue until the current phase is complete or blocked by a true external dependency

Only stop if:

- a real external dependency is missing
- server or database access is required but unavailable
- an action is destructive or may cause data loss
- a major business or architecture decision cannot be reasonably inferred
- legal, security, privacy, or billing risk is involved

First tasks:

1. audit the repository
2. refresh stale structure/spec docs
3. update `PROJECT_PROGRESS_LIVE.md`
4. identify the next concrete implementation step
5. continue executing without waiting for routine approval
