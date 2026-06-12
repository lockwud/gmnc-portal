# CEREBRAL CARE — RESEARCH REPORT V3 (DRAFT)
**Date:** 2026-06-11  
**Scope:** Full-stack (backend `gcpr_backend/` + frontend `gmnc-next-admins/`)  
**Status:** IN PROGRESS

---

## 1. ITERATION 3 FOCUS AREAS

1. Clinical Governance & Outcome Measurement deep-dive
2. Automated Care Plan generation from assessment results
3. Ghana Health Service integration mapping
4. Mobile Offline-First sync architecture (design only — mobile app out of scope)
5. BaselineBuilder format compliance for frontend/backend facts

---

## 2. CLINICAL GOVERNANCE GAPS (CONFIRMED IN CODE)

### 2.1 Assessment Lifecycle States
**Current:** `DRAFT → COMPLETED → REVIEWED` (manual only)

**Required full lifecycle:**
```
DRAFT → PENDING_REVIEW → APPROVED → ACTIVE → ARCHIVED
              ↓              ↓
       REVIEWED_NEEDS_REVISION  COMPLETED
```

**Missing in backend:**
- No `PENDING_REVIEW` state transition
- No automatic reviewer assignment (round-robin to CLINICAL_REVIEWER)
- No 48h review SLA enforcement
- No escalation to CLINICAL_SUPERVISOR on SLA breach

### 2.2 Functional Classification Auto-Population
**Current:** Manual entry of GMFCS/MACS/CFCS/EDACS levels per assessment

**Gap identified:**
- `referral.engine.js` analyses GMFM-88 dimensions but only for referral routing
- No automated mapper from assessment scores → suggested classifier level
- No `ClassificationMapper` service

**Required:**
```
Input: AssessmentReport.scores + toolCode
Output: suggestedClassifierLevel + confidence
Action: Populate FunctionalClassification as "PROPOSED"
        Requires CLINICAL_REVIEWER approval before committing
```

### 2.3 Multidisciplinary Care Conference
**Current:** Referral chain only (Physio → OT → SLP → Psych → Social Worker)

**Missing:** No joint review mechanism

**Required workflow:**
- Schedule conference with multiple participants
- Unified care plan generation
- Agreed referrals from conference
- Follow-up scheduling

**Status:** Not in schema, not in routes, not in frontend

### 2.4 Assessment Tool Versioning
**Current:** `toolVersion: String` free text

**Gap:**
- No version registry
- Frontend may send v3.0 while backend expects v2.5
- No validation of tool version on submit
- No migration endpoint for legacy responses

### 2.5 Clinical Note Signing
**Current:** Assessments have `ClinicalAssessmentReport` with no signature field

**Required:** `DigitalSignature` model for legal validity:
```
DigitalSignature {
  id
  signerType: PROVIDER | REVIEWER | CAREGIVER
  signerId: String
  documentType: ASSESSMENT | CARE_PLAN | REFERRAL | DISCHARGE
  documentId: String
  signedAt: DateTime
  hash: String (SHA-256)
}
```

### 2.6 Consent Management
**Current:** No structured consent tracking

**Required consents for Ghana:**
1. Treatment consent
2. Data sharing consent (Ghana Data Protection Act 843)
3. Telehealth recording consent (per session, per participant)
4. Photo/video consent
5. Research consent

**Required model:**
```
ConsentRecord {
  id
  patientId
  consentType: TREATMENT | DATA_SHARING | RECORDING | PHOTO_VIDEO | RESEARCH
  grantedByUserId
  grantedAt: DateTime
  revokedAt: DateTime?
  scope: String?
  documentId: String?
  method: DIGITAL_SIGNATURE | SMS | PAPER
}
```

---

## 3. AUTOMATED CARE PLAN GENERATION

### 3.1 Trigger: Assessment APPROVED

**Flow:**
```
Assessment APPROVED
  → ClinicalGovernanceService.generateCarePlan(assessmentId)
    → Collect inputs from:
      - AssessmentReport
      - MotorFunctionOutcome
      - FunctionalClassification
      - ReferralRecommendations
      - PatientEnrollmentRecord
      - Adherence history (30 days)
    → Generate structured CarePlan
      - Goals
      - Interventions (frequency, duration, equipment)
      - Evidence-based for GMFCS level
    → Create RehabTask[] from plan
    → Notify caregiver + provider
    → Schedule follow-up FunctionalClassification at 12 weeks
```

### 3.2 CarePlan Model (MISSING)
```
CarePlan {
  id
  patientId
  assessmentId
  primaryProviderId
  reviewDate: DateTime
  status: ACTIVE | COMPLETED | SUPERSEDED
  goals: Json
  interventions: Json
  createdAt
  createdBy: DigitalSignature?
}
```

**Status:** Not in Prisma schema, no service, no controller, no frontend

### 3.3 Automation Blueprint
| Field | Value |
|---|---|
| Event Trigger | Assessment.status = APPROVED |
| Condition | Assessment has report; no active CarePlan |
| Action | Generate CarePlan; create RehabTask[]; notify |
| Notification | In-app + SMS to caregiver |
| DB Changes | Add `CarePlan` model |
| API Changes | `POST /care-plan/generate/:assessmentId` |
| Frontend | CarePlan view; task preview before activation |
| Priority | P1 (during pilot) |

---

## 4. OUTCOME MEASUREMENT ENGINE

### 4.1 Current State
`MotorFunctionOutcome` exists but is manually created. No trend analysis, no alerts, no population-level dashboards.

### 4.2 GMFCS Trajectory Tracking
```
OutcomeMeasurementEngine {
  computeGmfcsTrajectory(patientId) {
    query: FunctionalClassification where classifier = GMFCS
    sort by assessedAt
    compute: slope of level change over time
    alert if: regression >= 1 level in < 12 weeks
    alert if: stagnation > 6 months
  }

  computeProviderOutcomes(providerId, period) {
    aggregate: average adherence, improvement rate, regression rate
    benchmark: compare to platform average
  }

  computeNationalOutcomes(region?, period?) {
    aggregate: total improved, stable, regressed
    breakdown: by region, facility type, profession
  }
}
```

### 4.3 Missing Analytics Dashboards
| Dashboard | KPIs | Alerts |
|---|---|---|
| **Caregiver Outcomes** | Child's GMFCS/MACS trend, task adherence 30d, appointments | Regression alert (SMS) |
| **Provider Outcomes** | Patients improved/stable/regressed %, avg adherence | Below-threshold alert |
| **Admin National** | Regional heatmap, outcome by district, provider performance | Outlier detection |
| **Clinical Governance** | Pending review > 48h, reviewer throughput, inter-rater disagreement | SLA breach alert |

### 4.4 Outcome Alert Automation
| Event | Condition | Action |
|---|---|---|
| GMFCS regression ≥ 1 level in 12 weeks | 2+ classifications | Notify provider + admin |
| Adherence < 60% over 14 days | Active tasks | Notify provider; SMS caregiver |
| No assessment in 90 days | Active patient | Notify provider |
| Reviewer backlog > 20 | PENDING_REVIEW count | Auto-assign reviewers |

---

## 5. GHANA HEALTH SERVICE INTEGRATION

### 5.1 Facility Hierarchy
```
Ghana Health Service (National)
  ├─ Teaching Hospital (Tertiary)
  │    └─ Regional Rehabilitation Centre
  ├─ Regional Hospital (Secondary)
  │    └─ District Physiotherapy Unit
  ├─ District Hospital (Primary)
  │    └─ Community Clinic
  └─ Community-based Rehabilitation (CBR) Worker
```

**Missing:** No facility hierarchy in platform

### 5.2 Proposed Facility Model
```
Facility {
  id
  name
  type: TEACHING_HOSPITAL | REGIONAL_HOSPITAL | DISTRICT_HOSPITAL | COMMUNITY_CLINIC | CBR_CENTRE
  region: String (Ghana region)
  district: String
  gpsLatitude?: Float
  gpsLongitude?: Float
  ghanaHealthServiceCode: String?
  accreditationStatus: ACCREDITED | PENDING | SUSPENDED
  accreditationBody: String?
  parentFacilityId: String?
}

ProviderFacility {
  providerId
  facilityId
  isPrimary: Boolean
  department: String?
}
```

### 5.3 NHIS Integration Points
| NHIS Field | Platform Field | Gap |
|---|---|---|
| NHIS Number | Patient.insuranceNumber | Missing |
| NHIS Facility Code | Facility.ghanaHealthServiceCode | Missing |
| NHIS Tariff | Service pricing | No pricing model |
| NHIS Claim Batch | InsuranceClaim model | Entire module missing |
| NHIS Reimbursement | Provider payout | No payout workflow |

### 5.4 DHIS2 Integration
**Purpose:** Export aggregate metrics to Ghana Health Service DHIS2

**Approach:** Scheduled batch export (daily at 03:00)
- Collect: new enrollments, appointments, assessments, referrals, outcomes
- Transform to DHIS2 data value set format
- Push via DHIS2 API (if endpoint configured)

**Missing:** DHIS2 API endpoint config, data element mapping, authentication

### 5.5 National Provider Registry
**Purpose:** Auto-verify provider credentials against Ghana Medical Council / professional body registers

**Design:**
```
ExternalRegistrySync {
  gmcLookup(licenseNumber, professionalBody) → Promise<VerificationResult>
  schedule: daily at 04:00
  onMatch: update ServiceProvider.verificationStatus = VERIFIED
  onMismatch: flag for admin review
  onNotFound: flag as UNVERIFIED_EXTERNAL
}
```

**Missing:** No API integration with:
- Ghana Medical Council (GMC)
- Allied Health Professions Council (AHPC)
- Pharmacy Council of Ghana (PCG)
- Psychology Council of Ghana (PCG)

---

## 6. MOBILE OFFLINE-FIRST ARCHITECTURE

### 6.1 Current State
No mobile app code exists. Mobile users call the same REST API directly without role enforcement. No offline queue.

### 6.2 Offline-First Design
```
┌─────────────────────────────────────┐
│  UI Layer (Flutter/React Native)    │
├─────────────────────────────────────┤
│  State Layer (Riverpod/Redux)       │
│  - Always reads from Local DB first │
├─────────────────────────────────────┤
│  Local DB (SQLite / Hive / MMKV)    │
│  - Mirrors core data models         │
│  - Conflict-free by design (CRDT)   │
├─────────────────────────────────────┤
│  Sync Queue                         │
│  - Pending mutations                │
│  - Retry with exponential backoff   │
│  - Dedup by client-generated UUID   │
├─────────────────────────────────────┤
│  Network Layer (Dio/Fetch)          │
│  - Online/offline detector          │
│  - Auto-sync on reconnect            │
└─────────────────────────────────────┘
```

### 6.3 Sync Protocol
```
Client                          Server
  │                                │
  ├── GET /sync/delta ───────────►│  (since: lastSyncTimestamp)
  │◄── { changes, serverTime } ───┤
  │                                │
  ├── POST /sync/push ───────────►│  { mutations[] }
  │◄── { accepted: [ids], conflicts } ──┤
  │                                │
  └── POST /sync/push (retry) ───►│  { conflicts: resolved }
      ◄── { ok } ──────────────────┤
```

### 6.4 Mobile-Specific API Contracts
**No-role token:** Mobile JWT includes `userType` but NO `roles` array.

**New backend endpoints:**
- `GET /sync/delta?since=<timestamp>` — fetch changes since last sync
- `POST /sync/push` — batch push local mutations
- `GET /sync/conflicts/:mutationId` — fetch conflict details

### 6.5 Low-Bandwidth Optimizations
| Optimization | Implementation |
|---|---|
| Request dedup | Single-flight: cancel in-flight requests for same endpoint |
| Sparse fields | `?fields=id,fullName,status` on list endpoints |
| Delta sync | Only changed records since last sync |
| Compression | Server compression middleware |
| Image downscale | Client-side resize before upload (max 400px width) |
| SMS fallback | Hubtel SMS for all notifications if push token inactive > 7d |

---

## 7. MISSING BACKEND MODELS/ROUTES AUDIT

### 7.1 Confirmed Missing from Prisma Schema
| Model | Priority | Notes |
|---|---|---|
| `CarePlan` | P1 | Automated care plan generation |
| `ConsentRecord` | P1 | GDPR/DPA compliance for Ghana |
| `DigitalSignature` | P1 | Legal validity for audits |
| `MultidisciplinaryCaseConference` | P2 | Joint provider review |
| `InsurancePolicy` (NHIS) | P2 | National insurance integration |
| `InsuranceClaim` (NHIS) | P2 | Claim submission |
| `Facility` | P2 | GHS facility hierarchy |
| `ProviderFacility` | P2 | Provider-facility mapping |
| `ExternalRegistrySync` | P3 | GMC/AHPC/PCG verification |

### 7.2 Confirmed Missing from Backend Routes
| Route | Method | Priority | Notes |
|---|---|---|---|
| `/care-plan/generate/:assessmentId` | POST | P1 | Trigger care plan generation |
| `/care-plan/:id` | GET | P1 | Retrieve care plan |
| `/care-plan/:id/tasks` | GET | P1 | Tasks from care plan |
| `/consent` | POST | P1 | Record consent |
| `/consent/:patientId` | GET | P1 | List consents |
| `/consent/:id/revoke` | PATCH | P1 | Revoke consent |
| `/signature` | POST | P1 | Record signature |
| `/sync/delta` | GET | P2 | Mobile offline sync |
| `/sync/push` | POST | P2 | Mobile offline sync |
| `/sync/conflicts/:id` | GET | P2 | Sync conflict resolution |
| `/conference` | POST | P2 | Schedule case conference |
| `/conference/:id/start` | POST | P2 | Start conference |
| `/conference/:id/complete` | POST | P2 | Complete + generate plan |
| `/facility` | CRUD | P2 | GHS facility management |
| `/insurance/claim` | POST | P2 | NHIS claim submission |

### 7.3 Confirmed Missing from Backend Services
| Service | Priority | Notes |
|---|---|---|
| `CarePlanService` | P1 | Generate + manage care plans |
| `ConsentService` | P1 | Consent CRUD + validation |
| `SignatureService` | P1 | Hash + store signatures |
| `ClassificationMapper` | P1 | Auto-suggest GMFCS/MACS levels |
| `SyncService` | P2 | Delta sync + conflict resolution |
| `FacilityService` | P2 | Facility hierarchy |
| `InsuranceService` | P2 | NHIS policy + claims |
| `ExternalRegistryService` | P3 | GMC/AHPC lookups |

---

## 8. MISSING FRONTEND PAGES/MODULES AUDIT

### 8.1 Confirmed Missing Pages
| Route | Priority | Notes |
|---|---|---|
| `/caregiver/emergency` | P1 | Emergency support button |
| `/care-plan/:id` | P1 | View active care plan |
| `/consent/manage` | P1 | Consent management |
| `/support/tickets` (caregiver) | P1 | Caregiver support tickets |
| `/profile/signature` | P1 | Digital signature capture |
| `/care-plan/preview` | P1 | Preview before activation |
| `/sync/status` | P2 | Offline sync status |
| `/sync/conflicts` | P2 | Conflict resolution UI |
| `/conference/:id` | P2 | Case conference view |
| `/facility/select` | P2 | Facility selection during registration |

### 8.2 Confirmed Missing Frontend Modules
| Module | Priority | Notes |
|---|---|---|
| `lib/api/care-plans.ts` | P1 | Care plan CRUD |
| `lib/api/consent.ts` | P1 | Consent management API |
| `lib/api/sync.ts` | P2 | Offline sync API |
| `lib/api/conferences.ts` | P2 | Case conference API |
| `lib/offline/queue.ts` | P2 | Offline mutation queue |
| `lib/offline/sync.ts` | P2 | Sync engine |
| `hooks/useOnlineStatus.ts` | P2 | Network detection |
| `hooks/useSyncQueue.ts` | P2 | Queue management |

---

## 9. BASELINEBUILDER FORMAT SUMMARY

### 9.1 Backend Facts
| Field | Value |
|---|---|
| Runtime | Node.js (Express 5.2.1) |
| Database | PostgreSQL + Prisma 7.3.0 |
| Auth | JWT HS256 + RBAC middleware |
| Cron | node-cron (5 jobs) |
| Real-time | Socket.IO |
| Validation | Zod |
| Total Models | 150+ |
| Total Routes | 30+ modules |
| SMS | Hubtel |
| Email | SMTP |
| File Storage | S3-compatible |

### 9.2 Frontend Facts
| Field | Value |
|---|---|
| Runtime | Next.js 16.2.4 + React 19 |
| Auth | Firebase + client-side RBAC |
| State | React Context (Auth, UI) |
| UI Library | Custom components + Tailwind CSS |
| Charts | Recharts |
| Animation | Framer Motion |
| Icons | Lucide React |
| Validation | Zod |
| Route Groups | `(dashboard)` |
| Protected Routes | ~50 pages wrapped |
| API Client | Custom `apiClient` with fetch |

### 9.3 Ghana-Specific Facts
| Field | Value |
|---|---|
| Regions | 16 (Greater Accra, Ashanti, etc.) |
| Languages | English (official), Twi, Ga, Hausa |
| Currency | GHS (Ghanaian Cedi) |
| Data Protection | Ghana Data Protection Act 843 |
| Health System | Ghana Health Service (GHS) |
| Insurance | NHIS (National Health Insurance Scheme) |
| Professional Bodies | GMC, AHPC, PCG |
| SMS Provider | Hubtel |
| Phone Format | +233 XX XXX XXXX |

---

## 10. PRIORITIZED IMPLEMENTATION BACKLOG

### P0 — CRITICAL (Already Done)
- ✅ Frontend referral API module (`lib/api/referrals.ts`)
- ✅ Route protection on all dashboard pages
- ✅ Referral task cascade on DECLINED
- ✅ Referral SLA 72h + escalation cron
- ✅ `CANCELLED` + `EXPIRED` enum values
- ✅ No-role provider fallback in AuthContext
- ✅ Permission state refresh polling

### P1 — HIGH (During Pilot, Weeks 1-6)
| # | Gap | Owner | Status |
|---|---|---|---|
| 1 | Assessment lifecycle: PENDING_REVIEW state | Backend | TODO |
| 2 | Assessment reviewer queue + SLA | Backend | TODO |
| 3 | Caregiver emergency support button | Full-stack | TODO |
| 4 | Support ticket escalation: URGENT + clinical → SMS | Backend | TODO |
| 5 | Caregiver "request assessment" workflow | Full-stack | TODO |
| 6 | Data retention cron + archive | Backend | TODO |
| 7 | Audit log export for regulators | Backend | TODO |
| 8 | Digital signature model | Full-stack | TODO |
| 9 | Consent management model | Backend | TODO |
| 10 | Automated care plan generation | Full-stack | TODO |
| 11 | Care plan frontend pages | Frontend | TODO |
| 12 | GMFCS/MACS auto-population from scores | Backend | TODO |

### P2 — MEDIUM (Post-Pilot, Months 2-4)
| # | Gap | Owner | Status |
|---|---|---|
| 13 | National analytics dashboard (GIS) | Frontend | TODO |
| 14 | NHIS claim submission module | Backend | TODO |
| 15 | DHIS2 sync integration | Backend | TODO |
| 16 | i18n (Twi, Ga, Hausa) | Frontend | TODO |
| 17 | Offline-first mobile sync protocol | Full-stack | TODO |
| 18 | SMS fallback for notifications | Backend | TODO |
| 19 | Provider availability grid | Full-stack | TODO |
| 20 | Multidisciplinary case conference | Full-stack | TODO |
| 21 | Facility hierarchy | Backend | TODO |

### P3 — FUTURE (Months 5+)
| # | Gap | Owner | Status |
|---|---|---|
| 22 | AI-assisted rehabilitation recommendations | Backend | TODO |
| 23 | Multi-facility multi-tenant architecture | Full-stack | TODO |
| 24 | National provider registry API integration | Backend | TODO |
| 25 | Mobile money provider payouts | Backend | TODO |
| 26 | Telehealth post-session auto-notes | Backend | TODO |
| 27 | Cross-facility referral national network | Full-stack | TODO |
| 28 | Predictive outcome modelling | Backend/ML | TODO |

---

## 11. AUTOMATION BLUEPRINTS

### Automation 1: Assessment Review Queue Auto-Assignment
| Field | Value |
|---|---|
| **Event Trigger** | Assessment.status → PENDING_REVIEW |
| **Condition** | Assessment has report; no ClinicalAssessmentReport exists |
| **Action** | Assign to next available CLINICAL_REVIEWER (round-robin) |
| **Notification Channel** | In-app to reviewer |
| **Database Changes** | None (existing ClinicalAssessmentReport) |
| **API Changes** | `GET /assessment/review-queue` (CLINICAL_REVIEWER) |
| **Frontend Changes** | Reviewer dashboard widget |
| **Priority** | P1 |

### Automation 2: License Expiry + SUSPEND
| Field | Value |
|---|---|
| **Event Trigger** | Daily cron 06:00 |
| **Condition** | `licenseExpiry` - 30d <= now AND verified |
| **Action** | Send reminder; on expiry → SUSPEND; notify admin |
| **Notification Channel** | In-app + SMS |
| **Priority** | P1 |

### Automation 3: GMFCS Regression Alert
| Field | Value |
|---|---|
| **Event Trigger** | FunctionalClassification created |
| **Condition** | new level < previous level AND (today - previous assessedAt) < 365 days |
| **Action** | Notify provider + admin; create support ticket if > 2 level drop |
| **Notification Channel** | In-app + SMS |
| **Priority** | P1 |

---

## 12. BASELINEBUILDER FORMAT

### 12.1 Backend (Express + Prisma)
```
Runtime: Node.js
Framework: Express 5.2.1
ORM: Prisma 7.3.0
Database: PostgreSQL
Auth: JWT HS256 + refresh tokens
RBAC: Custom middleware (authorize, requireRbacRole, authorizeOrRbacRole)
Real-time: Socket.IO
Validation: Zod
Cron: node-cron
SMS: Hubtel
Email: SMTP
File Storage: S3-compatible
```

### 12.2 Frontend (Next.js + React)
```
Runtime: Next.js 16.2.4 (Turbopack)
UI: React 19
Auth: Firebase + client-side RBAC
State: React Context
UI Library: Custom + Tailwind CSS
Charts: Recharts
Animation: Framer Motion
Icons: Lucide React
Validation: Zod
```

### 12.3 Mobile (Design Only)
```
Runtime: Flutter / React Native
State: Riverpod / Redux
Local DB: SQLite / Hive / MMKV
Sync: Custom CRDT-based protocol
Network: Dio / Fetch with online/offline detection
```

---

## 13. NEXT STEPS

1. **Backend P1:**
   - Add `CarePlan`, `ConsentRecord`, `DigitalSignature` models to Prisma schema
   - Create `ClinicalGovernanceService` with auto-assignment + SLA enforcement
   - Add `/care-plan`, `/consent`, `/signature` routes
   - Wire `ClassificationMapper` service

2. **Frontend P1:**
   - Create `lib/api/care-plans.ts`, `lib/api/consent.ts`
   - Build `/caregiver/emergency` page
   - Build `/care-plan/:id` page
   - Build `/consent/manage` page
   - Add digital signature capture component

3. **Backend P2:**
   - Add `Facility`, `ProviderFacility`, `InsurancePolicy`, `InsuranceClaim` models
   - Create `/sync/delta`, `/sync/push` endpoints
   - Add `/facility` CRUD
   - Add NHIS claim workflow

4. **Research:**
   - Validate Ghana Health Service DHIS2 API specs
   - Validate Ghana Medical Council registry API (if public)
   - Document NHIS claim submission format

---

## 14. BASELINE METRICS

| Metric | Current | Target (Pilot) | Target (1 Year) |
|---|---|---|---|
| Caregivers | 0 | 100 | 5,000 |
| Providers | 0 | 20 | 500 |
| Patients | 0 | 150 | 8,000 |
| Assessments/month | 0 | 200 | 5,000 |
| Referrals/month | 0 | 50 | 1,500 |
| Care Plans generated | 0 | 150 | 8,000 |
| Consent records | 0 | 300 | 16,000 |
| Digital signatures | 0 | 500 | 25,000 |

---

**End of Iteration 3 Research Report v3**
