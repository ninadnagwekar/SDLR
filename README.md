# Smart Task Escalation Engine

SDLR Phase 6 prototype — automated task escalation with JWT auth, RBAC, notifications, and audit logging.

## Source Code

| Directory | Description |
| --------- | ----------- |
| [`backend/`](backend/) | Express API, services, unit & integration tests |
| [`frontend/`](frontend/) | Next.js dashboard (login, tasks, escalations, audit) |
| [`.github/workflows/ci.yml`](.github/workflows/ci.yml) | CI pipeline (tests + frontend build) |

## SDLR Deliverables

All planning, architecture, and review documents are in [`deliverables/`](deliverables/):

| Document | Description |
| -------- | ----------- |
| [README](deliverables/README.md) | Capability overview, setup, and quickstart |
| [PLAN](deliverables/PLAN.md) | Implementation plan and acceptance criteria |
| [STATUS](deliverables/STATUS.md) | Current project status |
| [Architecture Design](deliverables/Architecture-Design.md) | System architecture and data flows |
| [API Schema](deliverables/api-schema.yaml) | OpenAPI specification |
| [ARB Checklist](deliverables/Architecture_Review_Board.md) | Architecture Review Board (approved) |
| [MCP Selection](deliverables/MCP-Selection.md) | MCP server selection matrix |
| [PR Document](deliverables/PR-Document.md) | Pull request documentation |
| [SDLR Deliverable](deliverables/SDLR-DELIVERABLE.md) | SDLR loop evidence |
| [Development Logs](deliverables/Development-Logs.md) | Session logs and test output |
| [CodeRabbit Resolution](deliverables/CodeRabbit-Resolution.md) | Code review resolutions |

## Quick Start

```bash
# Backend (port 3000)
cd backend && npm install && npm run dev

# Frontend (port 3002)
cd frontend && npm install && npm run dev

# Tests
cd backend && npm test
```

See [deliverables/README.md](deliverables/README.md) for demo accounts, API endpoints, and full setup instructions.
