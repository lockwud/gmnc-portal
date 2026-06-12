# Cerebral Care Portal — Pilot Documentation
**Version:** 2026-06-12 (pre-pilot)
**Scope:** Admin/Provider web portal only. Caregiver mobile app is out of scope for pilot.

---

## 1. System Overview

Cerebral Care is a Ghana-focused neurorehabilitation management platform that connects multidisciplinary providers (physiotherapists, occupational therapists, speech therapists, psychologists, social workers) with paediatric patients through structured assessments, referrals, care plans, and outcome tracking.

### 1.1 Architecture

```
Browser → Next.js 16 (gmnc-next-admins) → Express API (gcpr_backend) → PostgreSQL (Neon)
```

### 1.2 Live Deployments (use these exact URLs)

| Component | URL | Notes |
|---|---|---|
| Frontend (Pilot) | `http://localhost:3002` | Next.js dev or static export |
| Backend API | `http://localhost:3001` | Express server |
| Database | Neon PostgreSQL | Connection string in `gcpr_backend/.env` |

### 1.3 Key Credentials

| Role | Email | Password | Notes |
|---|---|---|---|
| Admin (seed) | `oklement3@gmail.com` | `Pass123$1` | Auto-created on first login |
| Default Admin | `admin@gmnc.local` | `Admin!234` | Alternative seed account |

### 1.4 Pilot User Roles

| Role | Slug | Who |
|---|---|---|
| Admin | `admin` | Platform managers. Full access to all modules. |
| Provider | `provider` | Clinical staff (physio, OT, SLP, psych, social work). |
| Support | `support` | Helpdesk / ticket triage staff. |
| Tester | `tester` | QA / pilot testing. Read-only overview. |

**Caregiver login is blocked in the admin portal.** Caregiver-facing flows are future work.

---

## 2. Authentication & RBAC

### 2.1 Login Flow

1. User enters email/phone + password on `/login`.
2. Frontend calls `POST /api/auth/login` (proxied to backend `/auth/login`).
3. Backend validates credentials, issues:
   - **Access token** (JWT, short-lived, stored in memory + localStorage)
   - **Refresh token** (stored in DB)
4. Frontend stores `user` and `token` in localStorage.
5. On reload, frontend hydrates via `GET /api/auth/me`.

### 2.2 Token Format

The JWT payload contains:
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "userType": "ADMIN",
  "roles": ["admin"],
  "iat": 1234567890,
  "exp": 1234567890
}
```

### 2.3 RBAC Model

Permissions are checked at two levels:

| Layer | Mechanism | Examples |
|---|---|---|
| Middleware | User type + role | `authorize(["SERVICE_PROVIDER", "ADMIN"])` |
| Route-level | RBAC role | `requireRbacRole(["ADMIN", "CLINICAL_REVIEWER", "PROVIDER"])` |
| UI-level | `useAuth().user.roles` | Sidebar hides items you can’t access |

### 2.4 First-Login Admin Bootstrap

If a user logs in with email `oklement3@gmail.com` (case-insensitive) and no existing roles exist, the system:
1. Seeds the RBAC permission tree.
2. Creates the `ADMIN` app role assignment.
3. Returns roles `["admin"]` in the JWT.

This means **the first person to log in with that email automatically becomes admin**.

### 2.5 Token Refresh

- Access tokens expire. Frontend calls `POST /api/auth/refresh` (backend `/auth/refresh`) with the stored refresh token.
- Refresh tokens are stored in `prisma.refreshToken` and tied to the user.

---

## 3. Core Clinical Workflows

### 3.1 Assessment Lifecycle

```
DRAFT → PENDING_REVIEW → APPROVED → ACTIVE → ARCHIVED
              ↓                   ↓
       REVIEWED_NEEDS_REVISION   COMPLETED
```

**Current flow (pilot):**
1. Provider creates a new assessment for a patient.
2. Assessment starts as `DRAFT`.
3. Provider submits → status moves to `COMPLETED` (or `PENDING_REVIEW` if configured).
4. Admin/Clinical Reviewer approves → status becomes `APPROVED`.
5. Approved assessments can be linked to care plans.

### 3.2 Assessment Tools

| Tool Code | Name |
|---|---|
| `GMFM_88` | Gross Motor Function Measure (88 items) |
| `OT_CP_CLINICAL_ASSESSMENT` | Occupational Therapy Clinical Assessment |
| `GMFCS` | Gross Motor Function Classification System |
| `MACS` | Manual Ability Classification System |
| `CFCS` | Communication Function Classification System |
| `EDACS` | Eating and Drinking Ability Classification System |

### 3.3 Functional Classification Auto-Population

When an assessment is submitted, the system suggests a classifier level:

- **GMFM_88**: Uses total score % to suggest GMFCS level.
- **OT Assessment**: Uses ADL section keywords to suggest level.

Suggested classifications are stored as `PROPOSED` and require reviewer approval before committing.

### 3.4 Referral Workflow

1. Provider creates a referral → status `PENDING`.
2. SLA timer starts (72-hour default).
3. Recipient reviews:
   - `ACCEPTED` → generates rehab tasks
   - `DECLINED` → escalates back to referrer
4. If SLA expires → status changes to `EXPIRED` (cron job handles this).
5. If approaching SLA (last 4 hours) → notification sent to recipient.

### 3.5 Care Plan Generation

**Trigger:** Assessment is `APPROVED`.

1. Backend gathers:
   - Assessment report + scores
   - Functional classifications
   - Referral recommendations
   - Motor function outcomes
   - Patient enrollment record
2. Generates structured care plan:
   - Goals (JSON)
   - Interventions (frequency, duration, equipment)
   - Evidence-based for GMFCS level
3. Creates `RehabTask` records from the plan.
4. Notifies provider + caregiver (in-app).

---

## 4. Consent Management

### 4.1 Consent Types

| Type | When Required |
|---|---|
| `TREATMENT` | Before any clinical intervention |
| `DATA_SHARING` | Before sharing data with third parties (DPA 843) |
| `RECORDING` | Before each telehealth session |
| `PHOTO_VIDEO` | Before capturing clinical photos/videos |
| `RESEARCH` | Before enrolling in research studies |

### 4.2 Consent Methods

| Method | Description |
|---|---|
| `DIGITAL_SIGNATURE` | E-signed in portal |
| `SMS` | Hubtel SMS confirmation |
| `PAPER` | Scanned/physical record |

### 4.3 Consent Record Fields

- `patientId` — linked patient
- `consentType` — one of the 5 types above
- `grantedByUserId` — provider/staff who recorded it
- `revokedAt` — nullable; if set, consent is withdrawn
- `scope` — optional free-text scope
- `documentId` — optional linked document

### 4.4 Revocation

Consent can be revoked at any time. Revocation is immediate and irreversible (new record with `revokedAt` timestamp).

---

## 5. Frontend Routes

### 5.1 Admin Routes

| Path | Purpose |
|---|---|
| `/admin` | Admin dashboard |
| `/admin/users` | Manage platform users |
| `/admin/care-plans` | Review all care plans |
| `/admin/consent` | Audit consent records |
| `/admin/approvals` | Provider verification queues |
| `/admin/reports` | System reports |
| `/settings` | Platform configuration |

### 5.2 Provider Routes

| Path | Purpose |
|---|---|
| `/provider` | Provider dashboard |
| `/provider/cp-patient` | Patient list |
| `/provider/assessments` | Assessment hub |
| `/provider/referrals` | Referral management |
| `/provider/tasks` | Rehab tasks & notes |
| `/provider/approvals` | Pending approvals |
| `/provider/care-plans` | Care plan management |
| `/provider/consent` | Consent management |
| `/provider/appointments` | Scheduling |
| `/provider/telehealth` | Telehealth sessions |

### 5.3 Support Routes

| Path | Purpose |
|---|---|
| `/support` | Support dashboard |
| `/support/tickets` | Ticket management |
| `/support/faqs` | FAQ database |

### 5.4 Auth Routes

| Path | Method | Purpose |
|---|---|---|
| `/login` | GET | Login page |
| `/register` | GET | Registration page |
| `/api/auth/login` | POST | Login API |
| `/api/auth/register` | POST | Register API |
| `/api/auth/me` | GET | Current user |
| `/api/auth/logout` | POST | Logout |

---

## 6. API Proxying

The Next.js frontend proxies all backend API calls. Each page uses helpers in `lib/api/*.ts` which call internal routes like `/api/assessment/...` or `/api/patients`.

**Key proxy files:**
- `app/api/assessment/[...path]/route.ts` — assessment endpoints
- `app/api/auth/[...path]/route.ts` — auth endpoints
- `app/api/patients/route.ts` — patient list
- `app/api/care-plan/[...path]/route.ts` — care plan endpoints (added)
- `app/api/consent/[...path]/route.ts` — consent endpoints

**Token forwarding:** The proxy reads `Authorization` from incoming request headers and forwards it to the backend.

---

## 7. Data Models (Prisma)

### 7.1 Core Models

| Model | Purpose |
|---|---|
| `User` | Platform users (admin, provider, support) |
| `CareGiver` | Caregiver profile linked to User |
| `ServiceProvider` | Provider profile (profession, license, verification) |
| `CpPatient` | Patient record (linked to caregiver) |
| `ClinicalAssessment` | Assessment instance (tool, status, responses) |
| `ClinicalAssessmentReport` | Detailed assessment report |
| `ClinicalReferral` | Referral between providers |
| `RehabTask` | Rehab task assigned from referral or care plan |
| `CarePlan` | Generated care plan (goals, interventions) |
| `ConsentRecord` | Patient consent records |
| `FunctionalClassification` | GMFCS/MACS/CFCS/EDACS levels |
| `MotorFunctionOutcome` | Outcome measurement over time |

### 7.2 Key Enums

| Enum | Values |
|---|---|
| `AssessmentStatus` | `DRAFT`, `PENDING_REVIEW`, `COMPLETED`, `REVIEWED`, `REVIEWED_NEEDS_REVISION`, `APPROVED` |
| `ReferralStatus` | `PENDING`, `ACCEPTED`, `DECLINED`, `COMPLETED`, `EXPIRED`, `CANCELLED` |
| `CarePlanStatus` | `ACTIVE`, `COMPLETED`, `SUPERSEDED` |
| `ConsentType` | `TREATMENT`, `DATA_SHARING`, `RECORDING`, `PHOTO_VIDEO`, `RESEARCH` |
| `ConsentMethod` | `DIGITAL_SIGNATURE`, `SMS`, `PAPER` |

---

## 8. Cron Jobs (Background Automation)

| Job | Schedule | What it does |
|---|---|---|
| Referral SLA | Every 5 min | Marks overdue referrals as `EXPIRED`, sends reminders |
| Notification | Continuous | Delivers in-app notifications |
| Telehealth Reminder | Periodic | Checks upcoming telehealth sessions |
| FAQ Seed | Startup | Seeds initial FAQ data if empty |
| License Check | Daily 06:00 | Flags licenses expiring within 30 days |

---

## 9. Pilot Checklist

### Before Going Live

1. **Database:** `npx prisma migrate reset --force` (only if DB is empty or staging).
2. **Install dependencies:** `pnpm install` in both `gmnc-next-admins/` and `gcpr_backend/`.
3. **Start backend:** `cd gcpr_backend && pnpm dev` → listens on `3001`.
4. **Start frontend:** `cd gmnc-next-admins && pnpm dev` → listens on `3002`.
5. **Login:** Use `oklement3@gmail.com` / `Pass123$1`.
6. **Verify:** Go to `/provider/care-plans` and `/provider/consent` — both should load without 401/404.

### Known Pilot Limitations

- Caregiver mobile app is not included.
- DHIS2/NHIS integrations are design-only.
- Analytics dashboards are partial.
- Some settings pages have placeholder content.
- Consent/care-plan pages are functional but simple (no approval workflows yet).

---

## 10. Support & Escalation

For technical issues during pilot:
1. Check backend console for Prisma errors (migrations).
2. Check frontend console for 401s (token not forwarded).
3. Restart both servers if database schema changes were applied.
4. Clear localStorage if auth state is stale.
