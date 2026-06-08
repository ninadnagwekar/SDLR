# Smart Task Escalation Engine

## Capability Overview

The Smart Task Escalation Engine automatically identifies overdue tasks, creates escalation records, notifies managers, and maintains a complete audit trail of escalation activities.

### Key Features

- JWT Authentication and Role-Based Access Control (employee, manager, admin)
- Overdue Task Detection
- Escalation Creation and Status Management
- Escalation History
- Manager Notification Trigger
- Audit Logging
- Next.js Dashboard UI

---

## Technology Stack

| Layer | Technologies |
| ----- | ------------ |
| Frontend | Next.js, React, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | PostgreSQL (schema ready; in-memory store for local dev) |
| Testing | Jest, Supertest |

---

## Repository Structure

```text
backend/     Express API, services, tests
frontend/    Next.js dashboard
PLAN.md      Implementation plan
STATUS.md    Project status
PR-Document.md  Pull request documentation
```

---

## Setup Instructions

### Clone Repository

```bash
git clone https://github.com/ninadnagwekar/SDLR.git
cd SDLR
```

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Backend runs at http://localhost:3000

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at http://localhost:3002

### Environment Variables

```env
PORT=3000
JWT_SECRET=change-me-in-production
JWT_EXPIRES_IN=24h
DATABASE_URL=
```

---

## Demo Accounts

| Role | Email | Password |
| ---- | ----- | -------- |
| Admin | admin@example.com | admin123 |
| Manager | manager@example.com | manager123 |
| Employee | employee@example.com | employee123 |

---

## API Endpoints

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST | `/api/auth/login` | Authenticate and receive JWT |
| GET | `/api/tasks` | List tasks |
| GET | `/api/tasks/overdue` | List overdue tasks |
| POST | `/api/escalations` | Create escalation |
| GET | `/api/escalations/history` | Escalation history |
| PUT | `/api/escalations/:id/status` | Update escalation status |
| POST | `/api/notifications/trigger` | Notify manager |
| GET | `/api/audit` | Audit logs (admin) |

---

## Run Tests

```bash
cd backend
npm test
```

75 tests passing with 95%+ coverage.

---

## Project Status

**Current Phase:** SDLR Phase 6 – Agentic Development

**Health:** On Track

See `STATUS.md` for detailed progress and `PLAN.md` for implementation tasks.
