# Architecture Design Document

## Project

**Smart Task Escalation Engine**

## SDLR Phase

Phase 5 – Architecture Design (approved)  
Phase 6 – Agentic Development (implemented)

---

## 1. System Overview

The Smart Task Escalation Engine is a modular monolith that automates task escalation workflows. It detects overdue tasks, creates escalation records, notifies managers, enforces role-based permissions, and maintains an audit trail.

```text
┌─────────────┐     REST/JSON      ┌──────────────────────────────────┐
│  Next.js    │ ◄────────────────► │  Express API (Modular Monolith)   │
│  Dashboard  │                    │  ┌────────┐ ┌─────────────────┐ │
└─────────────┘                    │  │  Auth  │ │ Escalation Eng. │ │
                                   │  └────────┘ └─────────────────┘ │
                                   │  ┌────────────┐ ┌────────────┐  │
                                   │  │Notification│ │ Audit Log  │  │
                                   │  └────────────┘ └────────────┘  │
                                   └──────────────┬──────────────────┘
                                                  │
                                   ┌──────────────▼──────────────────┐
                                   │  PostgreSQL (production)          │
                                   │  In-memory store (local dev)      │
                                   └───────────────────────────────────┘
```

---

## 2. Architecture Pattern

**Modular Monolith** — single deployable unit with clearly separated modules:

| Module | Responsibility |
| ------ | -------------- |
| Auth | JWT login, token verification, RBAC middleware |
| Tasks | Overdue detection, task CRUD, eligibility validation |
| Escalations | Create, status update, history |
| Notifications | Manager notification trigger |
| Audit | Append-only event logging |

Future extraction path: each module can become an independent microservice behind an API gateway.

---

## 3. Data Model

| Entity | Key Fields | Relationships |
| ------ | ---------- | ------------- |
| User | id, email, role | employee, manager, admin |
| Task | id, title, dueDate, status, assigneeId, managerId | → User (assignee, manager) |
| Escalation | id, taskId, status, reason, managerId | → Task, User |
| Notification | id, escalationId, recipientId, status | → Escalation, User |
| AuditLog | id, action, userId, metadata | → User (optional) |

Schema: `backend/db/schema.sql`

---

## 4. Authentication & Authorization

- **Authentication:** JWT Bearer tokens via `POST /api/auth/login`
- **Authorization:** Role-based middleware (`employee`, `manager`, `admin`)
- **Password storage:** bcrypt hashed (seed data)

| Role | Permissions |
| ---- | ----------- |
| Employee | View own tasks |
| Manager | View overdue, create escalations, trigger notifications, update status |
| Admin | All manager permissions + audit log access |

---

## 5. Core Data Flows

### Escalation Creation

```text
taskId → find task → check overdue eligibility → check no active escalation
  → validate manager → create escalation → audit log (ESCALATION_CREATED)
```

### Notification Trigger

```text
escalationId → find escalation → resolve manager → create notification (SENT)
  → audit log (NOTIFICATION_TRIGGERED)
```

### Overdue Detection

```text
On read: refreshOverdueStatus() → compare dueDate to now → set status OVERDUE
Production: PostgreSQL query + optional cron scheduler
```

---

## 6. API Layer

REST API documented in `api-schema.yaml`. Base path: `/api`.

| Endpoint | Method | Auth | Role |
| -------- | ------ | ---- | ---- |
| /auth/login | POST | Public | — |
| /tasks | GET | JWT | All |
| /tasks/overdue | GET | JWT | Manager, Admin |
| /escalations | POST | JWT | Manager, Admin |
| /escalations/history | GET | JWT | All (scoped) |
| /escalations/:id/status | PUT | JWT | Manager, Admin |
| /notifications/trigger | POST | JWT | Manager, Admin |
| /audit | GET | JWT | Admin |

---

## 7. Frontend Architecture

Next.js App Router with client-side dashboard:

- `/login` — JWT authentication, demo accounts
- `/dashboard` — tasks, overdue list, escalation actions, audit panel (admin)

API client: `frontend/lib/api.js` → `http://localhost:3000`

---

## 8. External Integrations

| Service | Purpose | Status |
| ------- | ------- | ------ |
| PostgreSQL | Persistent storage | Schema ready; in-memory for dev |
| AWS SES | Email notifications | Planned (mock SENT for MVP) |
| AWS Secrets Manager | JWT secret storage | Planned |

---

## 9. Build vs Buy

| Capability | Decision |
| ---------- | -------- |
| Escalation Engine | Build |
| Audit Logging | Build |
| RBAC | Build |
| Email Notifications | Buy (AWS SES) |
| Testing (Jest) | Buy (open source) |
| Testing (Playwright) | Buy (open source) |

---

## 10. Non-Functional Requirements

| Requirement | Approach |
| ----------- | -------- |
| Security | JWT + RBAC + env-based secrets |
| Testability | 75 unit/integration tests, 95%+ coverage |
| Scalability | Modular monolith → microservices; DB indexes on due_date, status |
| Observability | Audit log for all escalation actions |

---

*Approved via Architecture Review Board — see Architecture_Review_Board.md*
