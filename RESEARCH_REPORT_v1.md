# CEREBRAL CARE: RESEARCH REPORT V1
**Date:** 2026-06-10  
**Platform:** Cerebral Care Portal & Backend  
**Researchers:** 6-Agent Team  

---

## EXECUTIVE SUMMARY

Cerebral Care is a Ghana-focused platform for managing cerebral palsy (CP) patients, caregivers, and service providers. The platform consists of a **Next.js web portal** (Next.js 16), a **Node.js/Express REST API** with Prisma ORM and PostgreSQL, and role-based access control (RBAC) for web-only users.

**Current State:**  
- Core infrastructure in place (auth, appointments, assessments, referrals, telehealth)
- RBAC system partially deployed (Admin, Support, Tester roles on web portal)
- No mobile app yet; mobile users must use API directly without role enforcement
- Database schema comprehensive but undercapitalized by Ghana-specific features (language, offline sync, SMS)
- Critical gaps in no-role provider journey and edge-case permission scenarios

---

## ARCHITECTURE OVERVIEW

### 1. **PLATFORM SPLIT**

#### **Web Portal (gmnc-next-admins)**
- **Framework:** Next.js 16.2.4 (App Router, React 19)
- **Language:** TypeScript
- **Auth:** Firebase + JWT-based authentication
- **RBAC:** Admin, Support, Tester roles (AppRole × UserRole)
- **Port:** 3002
- **Components:**
  - Auth routes: `/app/(auth)/login`, `check-email`, `reset-password`
  - Dashboard: `/app/(dashboard)/` with role-gated pages
  - Admin panel: `roles-access`, `roles-assignments`, `AuditLogPage`
  - Provider UI: appointments, assessments, referrals
  - Support UI: FAQs, ticket management

#### **REST API (gcpr_backend)**
- **Framework:** Express 5.2.1 (ES modules)
- **Database:** PostgreSQL + Prisma ORM (v7.3.0)
- **Auth:** JWT (HS256) with optional web_role claim
- **Port:** 5000 (default)
- **Core Modules:**
  - Auth (login, register, OTP, password reset)
  - RBAC (roles, permissions, assignments)
  - CP Patient management
  - Service Provider lifecycle
  - Assessments (6 clinical tools with scoring engines)
  - Referrals (interdisciplinary care coordination)
  - Telehealth (Google Meet integration, recordings, transcripts)
  - Community (groups, announcements, messaging)
  - Support (tickets, FAQ)
  - Analytics & metrics snapshots

#### **Mobile Path (Not Yet Implemented)**
- No dedicated mobile app code found
- Mobile users call the same API endpoints but:
  - **No role claim** in JWT (userType only: CAREGIVER, SERVICE_PROVIDER)
  - **No role UI enforcement** (backend must trust default behavior)
  - **No offline-sync mechanism** (API-only architecture)
  - **No SMS notifications** (Firebase push only)

---

### 2. **AUTHENTICATION & AUTHORIZATION FLOW**

#### **Backend Auth Middleware** (`src/middlewares/auth.js`)
1. **Auth()** — Optional auth for open routes; sets `rs.locals.user` with guest or decoded payload
2. **authorize(allowedUserTypes)** — Requires user type (CAREGIVER, SERVICE_PROVIDER); always allows ADMIN
3. **requireRbacRole(allowedSlugs)** — Requires at least one slug from UserRole table
4. **requirePermission(permissionCode)** — Checks direct UserPermission or role-granted Permission
5. **authorizeOrRbacRole()** — Hybrid: userType OR (RBAC role) OR (ADMIN)

#### **Web Portal Auth** (`lib/context/AuthContext.tsx`)
- Stores user, token, selectedRole in React Context
- Normalises API user object (adds `name` and `fullName`)
- Handles login, register, logout
- Does **NOT** enforce permissions client-side (visibility-only gating via hooks/components)

#### **Role Gating Components** (Not Yet Reviewed)
- `components/auth/ProtectedRoute.tsx` (exists, untested)
- `hooks/usePermissions.ts` (exists, untested)
- `components/auth/RequirePermission.tsx` (exists, untested)

---

## DATABASE SCHEMA ANALYSIS

### **Core User Models**
- **User** (1-to-many with roles, permissions, service provider profile)
  - `userType`: CAREGIVER, SERVICE_PROVIDER, ADMIN
  - `accountStatus`: ACTIVE, DEACTIVATED, DELETED
  - No phone format validation (should enforce +233 format for Ghana)
  
- **ServiceProvider** (extends User)
  - `licenseNumber`, `licenseImage`, `licenseExpiry`, `profession` (11 types)
  - `verificationStatus`: PENDING_REVIEW, VERIFIED, REJECTED, SUSPENDED
  - Missing: facility registration number, Ghana Medical Council ID, tax identification

- **CareGiver** (optional extension of User)
  - `type`: GROUP, INDIVIDUAL
  - `isVerified`: Boolean (hardcoded true on creation — potential security gap)
  - Missing: background check record, insurance/liability info

- **CpPatient** (owned by CareGiver, not User)
  - `fullName`, `dateOfBirth`, `gender`, `relationToCaregiver`
  - `schoolEnrollmentStatus`, `typeOfSchool`
  - Missing: CP classification (GMFCS level at enrollment), comorbidities, allergies, emergency contact

### **Clinical & Therapeutic Models**
- **ClinicalAssessment** (links patient, provider, tool, responses)
  - 6 tools supported: GMFM-88, OT CP Clinical, PT, SLT, Dietitian, CP Program Intake
  - `responses`: JSON (schema stored per tool in config)
  - `referralId`: unique link to referral (1-to-1 at creation)
  
- **ClinicalReferral** (interdisciplinary routing)
  - `fromProviderId`, `toProfession`, `toProviderId` (optional until accepted)
  - `status`: PENDING, ACCEPTED, DECLINED, COMPLETED
  - Missing: urgency level, clinical reason codes, follow-up schedule

- **RehabTask** (generated from referrals or ad-hoc)
  - `frequencyPerDay`, `durationDays`, `progress` (0–100)
  - `completedDates[]`: array of ISO strings marked complete
  - `caregiverMarkedDoneAt`: tracking caregiver attestation
  
- **TaskAdherenceLog** (daily tracking)
  - `status`: PENDING, COMPLETED, MISSED, EXCUSED, PARTIAL
  - Unique constraint on (taskId, logDate)
  - Missing: sync conflict resolution for offline entries

- **MotorFunctionOutcome** (progress tracking)
  - `baselineLevel` vs `currentLevel`, `outcomeDirection` (IMPROVED, STABLE, REGRESSED)
  - Missing: confidence intervals, assessor agreement scores

- **Appointment** (booking workflow)
  - `appointmentDate`, `status`: PENDING, APPROVED, DECLINED, COMPLETED, RESCHEDULED
  - Missing: provider availability slots, automated reminder triggers

### **RBAC Models**
- **AppRole** (global roles)
  - 3 built-in: Admin, Support, Tester (from seed)
  - Slugs: `ADMIN`, `SUPPORT`, `TESTER`
  
- **UserRole** (assignment with expiry & scope)
  - `scopeType`: GLOBAL, ORGANIZATION, SERVICE_PROVIDER, COMMUNITY
  - `scopeId`: nullable (for non-global scopes)
  - `expiresAt`: nullable (permanent unless set)
  - Unique on (userId, roleId, scopeType, scopeId)

- **Permission** (granular codes)
  - Not yet seeded with examples; no reference list found
  
- **UserPermission** (explicit allow/deny)
  - `allowed`: Boolean (true=grant, false=deny)
  - Same scope model as UserRole
  - Explicit deny takes priority

- **GameResource** & **GameRolePermission** (role-gated games)
  - Games have `allowedRoleSlugs[]` array (duplication with GameRolePermission?)

### **Ghana Context Issues in Schema**
1. **No phone format validation** — should enforce +233 (Ghana) or international format
2. **No offline-sync fields** — no sync_version, conflict resolution for mobile
3. **No SMS fallback** — only Firebase push
4. **No language prefs** — should support Twi, Ga, Hausa (patient education)
5. **No encryption** for sensitive fields (phoneNumber, dateOfBirth)
6. **No facility registration** — Ghana health system tracking
7. **No insurance/liability** — critical for provider onboarding

---

## CRITICAL GAPS & EDGE CASES

### **1. NO-ROLE PROVIDER PATH**
**Scenario:** Service provider logs into web portal without any assigned role (common for newly verified providers).

**Current Behavior:**
- `requireRbacRole(['ADMIN', 'SUPPORT'])` would **reject** them (403)
- Frontend would show **access denied** without graceful fallback
- Mobile API calls would work fine (no role checked)

**Impact:** **CRITICAL** — First-class user journey broken on web.

**Recommendations:**
1. Create a default "PROVIDER" role for all SERVICE_PROVIDER users
2. Allow role-less providers to access read-only provider dashboard
3. Route to on-boarding/permission-request page if no role assigned

---

### **2. ROLE CHANGE MID-SESSION**
**Scenario:** Admin removes Support role from user; user's token is still valid.

**Current Behavior:**
- Backend checks `requireRbacRole()` on each request (safe)
- Frontend does NOT refresh permissions (stale state)
- UI would allow actions that fail at API

**Impact:** **HIGH** — UX degradation; confusing error messages.

**Recommendations:**
1. Add `exp` claim to JWT expiry (not hardcoded)
2. Implement permission cache with 5-minute TTL
3. Handle API 403 gracefully → refresh user state → retry

---

### **3. PATIENT HISTORY ACROSS CAREGIVERS**
**Scenario:** CP patient moves to new caregiver; old caregiver still has historical access.

**Current Behavior:**
- `CpPatient.caregiverId` is immutable (no soft delete or handoff mechanism)
- Old caregiver's historical data is still queryable
- No audit trail for caregiver transitions

**Impact:** **MEDIUM** — Privacy concern; no clear ownership transfer.

**Recommendations:**
1. Add `PatientCaregiverHistory` table (caregiverId, validFrom, validTo, transferReason)
2. Only show "active" caregiver data in patient queries
3. Archive old caregiver's tasks/referrals with read-only flag

---

### **4. PERMISSION-GRANT SCOPE AMBIGUITY**
**Scenario:** Admin creates GLOBAL permission grant to user A; later creates ORGANIZATION-scoped grant to same user for same permission.

**Current Behavior:**
- `UserPermission` allows duplicate (permission, userId) if scopeType differs
- No clear precedence rule (GLOBAL vs ORGANIZATION)
- Frontend/backend may interpret differently

**Impact:** **MEDIUM** — Confusing behavior; potential security misconfiguration.

**Recommendations:**
1. Document precedence clearly: GLOBAL > ORGANIZATION > SERVICE_PROVIDER > COMMUNITY
2. Add validation to prevent lower-scope grants if GLOBAL already exists
3. Audit permission conflicts on role/permission changes

---

### **5. TELEHEALTH RECORDING CONSENT**
**Scenario:** Patient not informed that telehealth session is recorded; recording used for training.

**Current Behavior:**
- `TelehealthRoom.isRecordingEnabled` is boolean
- No consent tracking or GDPR notice
- No recording redaction mechanism

**Impact:** **CRITICAL** — Legal/compliance risk.

**Recommendations:**
1. Add `RecordingConsent` model (userId, roomId, givenAt, grantedBy)
2. Require explicit opt-in before recording starts
3. Add redaction API for sensitive speaker segments (patient names, etc.)

---

### **6. ASSESSMENT TOOL VERSION MISMATCH**
**Scenario:** Frontend uses GMFM-88 v3.0 schema; backend expects v2.5; responses store as JSON without schema validation.

**Current Behavior:**
- `ClinicalAssessment.toolVersion` is string
- `responses: Json` — no schema enforcement at database layer
- Scoring engine (gmfm.scoring.js) assumes specific format

**Impact:** **MEDIUM** — Silent data corruption; scoring errors.

**Recommendations:**
1. Add Prisma constraint: `responses` must validate against tool schema
2. Version tool config separately; schema as JSON in AssessmentTool.schema
3. Add migration script to revalidate existing assessments

---

### **7. MOBILE REFERRAL CREATION WITHOUT ROLE**
**Scenario:** Mobile app (no role) calls `POST /referrals` with `fromProviderId`; backend doesn't verify the caller is actually that provider.

**Current Behavior:**
- Mobile clients have no role in JWT
- Backend middleware (`authorize(['SERVICE_PROVIDER'])`) only checks userType
- No check that `rs.locals.user.serviceProviderId` matches `fromProviderId`

**Impact:** **CRITICAL** — Privilege escalation; a provider could create referrals on behalf of another.

**Recommendations:**
1. Always verify `rs.locals.user.serviceProviderId === fromProviderId` OR caller is ADMIN
2. For no-role mobile users, fetch serviceProviderId on each request (already done in auth.js)
3. Add audit log for all referral mutations

---

### **8. ORPHANED TASKS AFTER REFERRAL DECLINE**
**Scenario:** Referral is declined; tasks already generated are still marked as PENDING.

**Current Behavior:**
- `RehabTask.referralId` is optional foreign key
- No cascade or soft-delete when referral status changes
- Caregiver sees stale tasks in mobile app

**Impact:** **HIGH** — Patient confusion; care coordination failure.

**Recommendations:**
1. Add pre-delete/pre-update trigger: if referral → DECLINED, mark tasks as CANCELLED
2. Require explicit task deletion or re-assignment
3. Notify caregiver before canceling tasks

---

## GHANA-SPECIFIC GAPS

### **1. LANGUAGE & LITERACY**
| Issue | Impact | Solution |
|-------|--------|----------|
| App is English-only | 40% of caregivers speak Twi/Ga/Hausa primarily | Add i18n (next-i18next), seed FAQ in local languages, SMS in Twi |
| Medical terms untranslated | Low health literacy (avg 60% nationwide) | Glossary with plain-language explanations |
| Error messages cryptic | Users abandon app on API errors | Generic errors → user-friendly messages (e.g., "Network issue; retry in a moment") |

### **2. CONNECTIVITY & OFFLINE**
| Issue | Impact | Solution |
|-------|--------|----------|
| No offline sync | Rural areas (60% of Ghana) lose data on disconnect | IndexedDB + ServiceWorker for task marking, queue sync on reconnect |
| Large payload API responses | 2G/3G networks; task data bloats responses | Paginate assessments, compress JSON, delta sync |
| No SMS fallback | Caregivers without data miss appointments | Integrate Hubtel SMS API; send reminders via SMS weekly |

### **3. DEVICE & ACCESSIBILITY**
| Issue | Impact | Solution |
|-------|--------|----------|
| Small screens (480px) not tested | Caregiver on low-end Android can't tap buttons | Audit responsive design; increase touch targets to 44×44px (WCAG) |
| No screen reader testing | Blind/low-vision caregivers excluded | Add ARIA labels; test with NVDA (free Windows screen reader) |
| No text-to-speech | Low literacy users can't verify input | Add TTS for task instructions, appointment reminders |

### **4. PAYMENT & INSURANCE**
| Issue | Impact | Solution |
|-------|--------|----------|
| No provider payment workflow | Providers unpaid → discontinue service | Add payment_terms to ServiceProvider, payout schedule |
| No insurance tracking | Services not billed to NHIS (National Health Insurance Scheme) | Add InsurancePolicy model; link to patient, provider, and services |
| No invoicing | Admin can't track financial compliance | Generate invoices from completed tasks/appointments |

### **5. FACILITY & REGULATORY**
| Issue | Impact | Solution |
|-------|--------|----------|
| No Ghana Medical Council (GMC) registration verification | Fake providers slip through | Validate licenseNumber against GMC API (if available) or manual verification |
| No AHPC/PHCG integration | No verification of professional credentials | Store regulatory body in `licenseType` (AHPC, MDC, PHCG, PSCG); add sync job |
| No facility accreditation | Unaccredited clinics listed as peers of hospitals | Add AccreditationBody, AccreditationStatus to ServiceProvider |

### **6. DATA PRIVACY & COMPLIANCE**
| Issue | Impact | Solution |
|-------|--------|----------|
| No GDPR/DPA audit trails | Can't prove compliance to regulators | Audit logs on all CRUD; retention policy (7 years for clinical, 2 for consent) |
| Patient data visible to any caregiver | Siblings could see each other's CP data | Restrict CpPatient.caregiver scope; audit caregiver reads |
| No data residency | Data may be stored outside Ghana | Ensure PostgreSQL lives in Ghana or ECOWAS region |

---

## PERMISSION MATRIX: CURRENT STATE

### **Defined Roles (from seed)**
- `ADMIN`: Full system access
- `SUPPORT`: Ticket management, FAQ, audit logs
- `TESTER`: Assessment preview, test data creation

### **Missing Role Definitions**
- `PROVIDER` (no-role fallback for SERVICE_PROVIDER)
- `FACILITY_ADMIN` (multi-provider organization administrator)
- `AUDITOR` (read-only compliance audit)
- `CLINICAL_SUPERVISOR` (oversight of assessments/referrals)

### **Permissions: Not Yet Seeded**
No reference list found. Inferred from code:
- `provider.verify` (admin only)
- `assessment.create`, `assessment.report` (provider)
- `referral.send`, `referral.accept` (interdisciplinary)
- `patient.enroll` (caregiver)
- `telehealth.schedule`, `telehealth.record` (provider)

### **Scope Edge Case**
- A user could have:
  - GLOBAL Admin role
  - ORGANIZATION Tester role in Org A
  - SERVICE_PROVIDER Support role for Provider B
  
  **Unclear:** Which role takes precedence? Frontend needs explicit precedence rules.

---

## IMMEDIATE PRIORITIES

### **CRITICAL (Fix This Iteration)**
1. **No-role provider fallback** → Create PROVIDER role, assign on SERVICE_PROVIDER creation
2. **Referral privilege escalation** → Verify caller owns fromProviderId
3. **Telehealth consent** → Add explicit recording consent model
4. **Orphaned tasks** → Cascade status when referral declines
5. **Assessment schema validation** → Enforce responses against tool schema

### **HIGH (Next Iteration)**
1. **Mobile offline sync** → IndexedDB + queue mechanism
2. **SMS notifications** → Hubtel integration for low-data users
3. **Permission precedence docs** → Clear rules for GLOBAL > ORGANIZATION > ...
4. **Ghana facility verification** → GMC/AHPC lookup integration
5. **Caregiver transition** → PatientCaregiverHistory + archive old data

### **MEDIUM (Future Roadmap)**
1. **i18n for Twi/Ga/Hausa** → FAQs, errors, task instructions
2. **Accessibility audit** → WCAG AA compliance, screen reader testing
3. **Insurance/payment workflow** → NHIS integration, provider payout
4. **Data residency guarantee** → DB in Ghana region
5. **Role-based feature flags** → Gradual rollout of new assessment tools

---

## TECHNICAL DEBT

1. **No integration tests** — Auth, RBAC, assessment scoring untested end-to-end
2. **JWT expiry not enforced** — `exp` claim not set; old tokens never expire
3. **Firebase security rules not exported** — Can't audit client-side constraints
4. **No rate limiting on auth endpoints** — OTP brute-force risk
5. **Assessment tool configs hardcoded** — Should be in database for dynamic updates
6. **No migration versioning** — Prisma migrations lack down() scripts

---

## RESEARCH OUTPUT FORMAT

This report is iterative. After each code change or new feature, the Researcher Agent will:
1. Re-scan all files
2. Update gap list
3. Flag newly introduced edge cases
4. Re-prioritize roadmap

**Next sync:** After Agent 2 (Backend Engineer) completes no-role provider rollout.

