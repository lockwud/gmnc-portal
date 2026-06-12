# CEREBRAL CARE — RESEARCH REPORT V2
**Date:** 2026-06-11  
**Scope:** Full-stack (backend `gcpr_backend/` + frontend `gmnc-next-admins/`)  
**Status:** COMPLETE

---

## 1. EXECUTIVE SUMMARY

Cerebral Care is a Ghana-focused cerebral palsy care platform with:
- **Backend:** Express 5 + Prisma 7 + PostgreSQL, JWT auth, role-based access control (RBAC), 30+ modules
- **Frontend:** Next.js 16 + React 19, Firebase auth, client-side RBAC, 50+ route pages
- **Architecture:** Shared REST API consumed by web portal (with roles) and mobile (without roles)

**Critical findings:**
1. Backend RBAC is robust and consistently applied via middleware; frontend route protection is **inconsistent** (only 4/50+ routes gated)
2. **Empty `lib/api/referrals.ts`** blocks referral functionality on web
3. **No-role provider path** is partially handled but fragile
4. **Stale permission state** in frontend after role changes
5. **Ghana-specific gaps** in phone format, offline sync, language, and SMS fallback

---

## 2. BACKEND ARCHITECTURE

### 2.1 Tech Stack
- Express 5.2.1 (ES modules)
- Prisma ORM v7.3.0 + PostgreSQL
- JWT (HS256) with refresh tokens
- Socket.IO for real-time messaging
- Zod validation
- express-rate-limit on all routes
- Swagger docs at `/docs`

### 2.2 Module Map
| Module | Route Prefix | Auth Middleware | Purpose |
|---|---|---|---|
| auth | `/auth` | None (open) | Register, login, OTP, password reset |
| cpPatient | `/cp-patient` | `authorize(["CAREGIVER"])` | Patient CRUD + task tracking |
| scheduleAppointment | `/schedule-appointment` | `authorize(["CAREGIVER", "SERVICE_PROVIDER", "ADMIN"])` | Appointments |
| assessment | `/assessment` | `authorizeOrRbacRole(["SERVICE_PROVIDER", "ADMIN"], ["ADMIN", "TESTER"])` | Tools, submit, referrals, tasks |
| telehealth | `/telehealth` | `authorize(["ADMIN", "SERVICE_PROVIDER", "CAREGIVER"])` | Google Meet rooms |
| user | `/user` | `authorize(["SERVICE_PROVIDER", "CAREGIVER"])` | Profile, videos, account deactivation |
| community | `/community` | `authorize(["SERVICE_PROVIDER", "CAREGIVER"])` | Groups, members, invites |
| resource | `/resource` | `authorize(["SERVICE_PROVIDER", "CAREGIVER", "ADMIN"])` | File/video/link resources |
| game | `/game` | `authorize(["SERVICE_PROVIDER", "CAREGIVER"])` | Game resources |
| support | `/support` | `authorize([...])` + RBAC admin | Tickets |
| admin | `/admin` | `requireRbacRole(["ADMIN"])` (mostly) | Users, providers, RBAC, metrics |
| rbac | `/rbac` + `/admin/rbac` | Mixed | Permission checks + management |
| settings | `/settings` | `authorizeOrRbacRole(...)` | Appointment + telehealth settings |
| report | `/report` + `/admin/reports` | Mixed | Content reports |
| notification | `/notification` | `authorize([...])` | Push notifications |
| functionalClassification | `/functional-classification` | Mixed | GMFCS/MACS/etc |
| metrics | `/metrics` | `authorize([...])` | Provider/system snapshots |
| chat | `/chat` | Mixed | AI chat sessions |
| adherence | `/adherence` | Mixed | Task adherence logs |
| outcomes | `/outcomes` | Mixed | Motor function outcomes |
| enrollment | `/enrollment` | Mixed | Patient enrollment |
| signature | `/signature` | Mixed | Document signatures |
| analytics | `/analytics` | Mixed | Analytics data |
| files | `/files` | Mixed | File serving |

### 2.3 Auth Middleware (src/middlewares/auth.js)

**Four middleware functions:**

1. `Auth(rq, rs, next)` — Optional auth for open routes; sets `rs.locals.user` as guest or decoded payload
2. `authorize(allowedUserTypes)` — Requires userType (CAREGIVER, SERVICE_PROVIDER); always allows ADMIN; fetches `serviceProviderId`
3. `requireRbacRole(allowedSlugs)` — Requires at least one slug from UserRole table; always allows ADMIN; fetches `serviceProviderId`
4. `authorizeOrRbacRole(allowedUserTypes, allowedRoleSlugs)` — Hybrid: userType OR RBAC role OR ADMIN
5. `requirePermission(permissionCode)` — Checks direct UserPermission or role-granted Permission

**Key behavior:**
- All middleware reads JWT from `Authorization: Bearer <token>` header
- `serviceProviderId` is fetched on every authenticated request for SERVICE_PROVIDER users
- ADMIN userType is always allowed regardless of RBAC roles
- Rate limiting: 15-min windows, 20-200 requests depending on route sensitivity

### 2.4 Database Schema Highlights

**150+ models including:**
- User (with one-to-many to UserRole, UserPermission, ServiceProvider, CareGiver, etc.)
- ServiceProvider (license, facility, profession, verification)
- CareGiver (type: GROUP/INDIVIDUAL, isVerified)
- CpPatient (owned by caregiver, includes school enrollment, typeOfSchool)
- ClinicalAssessment (toolCode, toolVersion, status, responses JSON, referralId)
- ClinicalReferral (fromProviderId, toProfession, toProviderId, status)
- RehabTask (referralId optional, completedDates[], caregiverMarkedDoneAt)
- TaskAdherenceLog (unique taskId + logDate)
- Appointment (status: PENDING/APPROVED/DECLINED/COMPLETED/RESCHEDULED)
- TelehealthRoom (Google Meet integration, recording, participants, transcripts)
- TelehealthRecording (encrypted storage, S3, transcripts)
- UserRole, AppRole, Permission, UserPermission, RolePermission
- GameResource, GameRolePermission
- Community, CommunityGroup, CommunityMessage, CommunityAnnouncement
- Notification, PushNotificationToken
- Metrics snapshots (Provider, System, Patient)
- ChatSession, ChatMessage

---

## 3. AUTHENTICATION & AUTHORIZATION FLOW (END-TO-END)

### 3.1 Registration
```
POST /auth/register
  → validate(signUpSchema)
  → AuthController.registerUser
  → AuthService.registerUser
    → hash password
    → create User (userType from `role` field)
    → if SMS OTP: SendOTP via Hubtel, store Otp record
    → if Email OTP: genOTP, hash, store Otp record
    → if ADMIN: seedRbac() + assign ADMIN UserRole
    → send notification
  → return { otpChannel }
```

### 3.2 Verification
```
POST /auth/verify-otp
  → validate(verifyOtpSchema)
  → AuthService.verifyOtp
    → find User + Otp
    → check attempts < 5
    → check expiresAt
    → if SMS: VerifyOTP via Hubtel
    → if EMAIL: compare hash
    → $transaction:
      → update User.verified = true
      → delete Otp
      → create RefreshToken
    → generateAccessToken({ id, email, userType, roles })
    → return { accessToken, refreshToken, user }
```

**CRITICAL:** Access token does NOT include `roles` from UserRole table on initial verification. Roles are only included on login. This means a newly verified user who receives an accessToken from verifyOtp will have an empty `roles` array until they log in again.

### 3.3 Login
```
POST /auth/login
  → validate(loginSchema)
  → AuthService.loginUser
    → find User by email/phone
    → compare password
    → find User WITH userRoles (includes role + permissions)
    → map roles to slugs
    → generateAccessToken({ id, email, userType, roles })
    → create RefreshToken
    → return { accessToken, refreshToken, user }
```

### 3.4 JWT Payload
```json
{
  "id": "uuid",
  "email": "string",
  "userType": "SERVICE_PROVIDER|CAREGIVER|ADMIN",
  "roles": ["ADMIN", "SUPPORT", ...],
  "iat": 1234567890,
  "exp": 1234567890
}
```

**Note:** `exp` claim IS set (unlike Research v1 assumption). Token expiry is enforced.

### 3.5 Token Refresh
```
POST /auth/refresh-token
  → validate(refreshTokenSchema)
  → AuthService.refreshToken
    → delete expired tokens
    → find matching refresh token (bcrypt compare)
    → delete old token
    → create new RefreshToken (keep max 5 per user)
    → generate new AccessToken
    → return { accessToken, refreshToken }
```

---

## 4. RBAC SYSTEM (BACKEND)

### 4.1 Seed Roles (src/utils/rbacSeed.js)
| Slug | Name | Description |
|---|---|---|
| ADMIN | Administrator | Full platform control |
| IT_SUPPORT | IT Support | Technical troubleshooting |
| SUPPORT | Support Agent | Ticket and customer support |
| EMERGENCY_RESPONSE | Emergency Response | Urgent intervention |
| CLINICAL_REVIEWER | Clinical Reviewer | Reviews assessments and referrals |
| COMMUNITY_MODERATOR | Community Moderator | Community moderation |
| CONTENT_MANAGER | Content Manager | FAQ/resources management |
| PROVIDER_VERIFIER | Provider Verifier | License verification |
| ANALYTICS_MANAGER | Analytics Manager | Metrics oversight |
| TELEHEALTH_COORDINATOR | Telehealth Coordinator | Telehealth ops |
| PROVIDER | Provider | **Default for service providers without RBAC role** |

### 4.2 Seed Permissions (35 permissions)
- appointment.read, appointment.write
- users.list, users.read, users.update, users.delete
- provider.list, provider.read, provider.verify
- patient.list, patient.read
- community.list, community.delete, community.member.remove
- faq.manage, content.manage
- support.list, support.manage
- report.list, report.manage
- metrics.system, metrics.providers
- assessment.tool.manage
- telehealth.manage
- rbac.manage

### 4.3 Role-Permission Assignments
| Role | Permissions |
|---|---|
| ADMIN | All 35 |
| IT_SUPPORT | users.list, users.read |
| SUPPORT | support.list, support.manage, users.read |
| EMERGENCY_RESPONSE | users.read, patient.read, patient.list |
| CLINICAL_REVIEWER | patient.list, patient.read, provider.read |
| COMMUNITY_MODERATOR | community.list, community.delete, community.member.remove |
| CONTENT_MANAGER | faq.manage, content.manage |
| PROVIDER_VERIFIER | provider.list, provider.read, provider.verify |
| ANALYTICS_MANAGER | metrics.system, metrics.providers |
| TELEHEALTH_COORDINATOR | telehealth.manage |
| PROVIDER | *(none by default)* |

### 4.4 Route-Level RBAC Application
| Route Pattern | Middleware | Notes |
|---|---|---|
| `/admin/**` | `requireRbacRole(["ADMIN"])` | Mostly consistent |
| `/assessment/**` | `authorizeOrRbacRole(["SERVICE_PROVIDER", "ADMIN"], ["ADMIN", "TESTER"])` | Hybrid — allows mobile + web |
| `/schedule-appointment/**` | `authorize([...userTypes])` | UserType-based, no RBAC |
| `/telehealth/**` | `authorize(["ADMIN", "SERVICE_PROVIDER", "CAREGIVER"])` | UserType-only |
| `/rbac/check` | `authorize([...])` | Permission check endpoint |
| `/support/**` | Mixed (user-facing vs admin) | Admin uses requireRbacRole |

---

## 5. FRONTEND ARCHITECTURE

### 5.1 File Structure
```
gmnc-next-admins/
  app/
    layout.tsx                    ← Root (AuthProvider + UIContext)
    page.tsx                      ← Landing
    (auth)/
      login/page.tsx
      forgot-password/page.tsx
      check-email/page.tsx
      reset-password/page.tsx
      error/page.tsx
    (dashboard)/
      layout.tsx                  ← MainLayout wrapper
      dashboard/page.tsx          ← Overview (ProtectedRoute)
      profile/
      notifications/
      admin/
        page.tsx                  ← NO ProtectedRoute
        users/page.tsx
        providers/page.tsx
        appointments/page.tsx
        referrals/page.tsx
        audit/page.tsx
        analytics/page.tsx
        reports/page.tsx
        approvals/providers/page.tsx
        integrations/page.tsx
        inbox/page.tsx
        roles-access/page.tsx     ← ProtectedRoute requiredRole="admin"
        role-assignments/page.tsx ← ProtectedRoute requiredRole="admin"
      provider/
        page.tsx                  ← NO ProtectedRoute
        assessments/page.tsx       ← ProtectedRoute (no role)
        appointments/page.tsx      ← NO ProtectedRoute
        referrals/page.tsx         ← NO ProtectedRoute
        tasks/page.tsx             ← NO ProtectedRoute
        telehealth/page.tsx
        cp-patient/page.tsx
        resources/page.tsx
        games/page.tsx
      support/
        page.tsx                  ← NO ProtectedRoute
        tickets/page.tsx
        faqs/page.tsx
      tester/page.tsx
      caregiver/                  ← Blocked by AuthContext
  components/
    auth/
      ProtectedRoute.tsx          ← Route guard (client-side)
      RequirePermission.tsx       ← Permission gate
      LoginPage.tsx
      AuthErrorPage.tsx
      AccessDeniedPage.tsx
    provider/
      assessments/
        OtAssessmentSection.tsx   ← 403 lines, ADL/ROM/Ashworth
        AssessmentHubPage.tsx
        AssessmentCreatePage.tsx
        AssessmentReportPage.tsx
        AssessmentListPage.tsx
        DynamicAssessmentForms.tsx
        AssessmentFieldRender.tsx
        AssessmentToolPicker.tsx
        AssessmentSection.tsx
        AssessmentSkeletons.tsx
      referrals/
        ReferralsPage.tsx
      tasks/
        TasksPage.tsx
      appointments/
        AppointmentsPage.tsx
    support/
      FaqCenter.tsx
      FaqListPlaceholder.tsx
      FAQManagementPage.tsx
  lib/
    context/
      AuthContext.tsx             ← Auth state, login, role resolution
      UIContext.tsx
    api/
      client.ts                   ← ApiClient (timeout 15s, retry)
      assessments.ts              ← Full + OT fallback (383 lines)
      appointments.ts             ← Full (175 lines)
      referrals.ts                ← EMPTY (0 bytes)
      settings.ts
      auth.ts
      users.ts
      telehealth.ts
      providers.ts
      patients.ts
      resources.ts
      videos.ts
      games.ts
      notifications.ts
      approvals.ts
      analytics.ts
      support.ts
      signatures.ts
      types.ts                    ← All TypeScript types
    rbac.ts                       ← Role + Permission logic
    validators/
      auth.ts                     ← Referenced but MISSING
  hooks/
    usePermissions.ts
    useNotifications.ts
  utils/
    assessment.ts
    role-access.ts
```

### 5.2 Auth Flow
```
Root Layout
  └─ AuthProvider
       └─ Hydrate from /api/auth/me on mount
       └─ Login: POST /api/auth/login → normaliseUser
       └─ Block CAREGIVER at portal level
       └─ Resolve selectedRole via getEffectiveRoles()
       └─ Persist to localStorage
```

### 5.3 RBAC Resolution
```
USER_TYPE_ROLES: { ADMIN → 'admin', SERVICE_PROVIDER → 'provider' }
getEffectiveRoles(user) = BUILT_IN_ROLES(user.roles) ∪ USER_TYPE_ROLES[userType]
hasPermission(user, perm) = user.permissions ∪ ROLE_PERMISSIONS[effectiveRoles]
```

---

## 6. CRITICAL GAPS & EDGE CASES

### GAP 1: Frontend Route Protection Inconsistency
**Severity:** CRITICAL  
**Location:** All dashboard routes except 4  
**Impact:** Unauthenticated or under-authenticated users can access sensitive routes by direct URL  
**Evidence:**
- Only `/dashboard`, `/provider/assessments`, `/admin/roles-access`, `/admin/role-assignments` use `ProtectedRoute`
- `/admin`, `/provider`, `/support` and all sub-routes bypass entirely

### GAP 2: Empty Referrals API Module
**Severity:** CRITICAL  
**Location:** `gmnc-next-admins/lib/api/referrals.ts` (0 bytes)  
**Impact:** Web portal cannot list, create, or update referrals  
**Evidence:** File is empty; `ReferralsPage.tsx` likely imports from it and fails silently  
**Backend:** `/assessment/referrals/**` endpoints exist and work  
**Fix required:** Implement full CRUD for referrals in frontend

### GAP 3: No-Role Provider Path (Frontend)
**Severity:** HIGH  
**Location:** `AuthContext.tsx:140-148` (`resolveSelectedRole`)  
**Impact:** Provider with no roles + no userType lands on `/dashboard` and can navigate to `/provider`  
**Behavior:**
- `getDefaultRoleForUserType(null)` → null
- `user.roles[0]` → undefined
- `selectedRole` → null
- User navigates to `/provider` without guard

### GAP 4: Stale Permission State
**Severity:** HIGH  
**Location:** `AuthContext.tsx:176-224`  
**Impact:** If admin removes role mid-session, UI still shows old permissions  
**Behavior:** `hydrateAuth()` runs only on mount; no re-fetch on window focus or interval

### GAP 5: Privilege Escalation in Mobile Referral Creation
**Severity:** CRITICAL  
**Location:** Backend has no ownership check  
**Impact:** Mobile user can create referrals with arbitrary `fromProviderId`  
**Evidence:** `AssessmentService.createReferral()` takes `fromProviderId` from `req.body` without verifying against `res.locals.user.serviceProviderId` or decoded user id

### GAP 6: Orphaned Tasks After Referral Decline
**Severity:** HIGH  
**Location:** Backend `ClinicalReferral` → `RehabTask` relationship  
**Impact:** Tasks remain PENDING after referral is DECLINED  
**Evidence:** No cascade or trigger in service code when referral status changes

### GAP 7: Assessment Schema Validation
**Severity:** MEDIUM  
**Location:** `assessment.validator.js:17-36`  
**Impact:** `responses: z.record(z.string(), z.any())` accepts any JSON; no tool-specific schema enforcement  
**Evidence:** Frontend `AssessmentSubmitPayload.responses: Record<string, unknown>` mirrors this

### GAP 8: Telehealth Recording Consent
**Severity:** CRITICAL  
**Location:** `TelehealthRoom.isRecordingEnabled` boolean  
**Impact:** No consent tracking; recordings may be made without explicit patient opt-in  
**Evidence:** `TelehealthRoom` model has no consent fields; service creates rooms with `isRecordingEnabled` from settings only

### GAP 9: Caregiver-Patient Privacy
**Severity:** MEDIUM  
**Location:** `CpPatient.caregiverId`  
**Impact:** Any caregiver with the ID can fetch any patient; no scope restriction  
**Evidence:** `CpPatientService.fetchPatients(userId, page, limit)` uses `caregiverId = userId` — no audit for cross-caregiver access

### GAP 10: Phone Format Validation
**Severity:** MEDIUM  
**Location:** Constants `REGEX.PHONE: /^[0-9]{10}$/`  
**Impact:** Rejects +233 prefix; Ghana numbers need international format support  
**Evidence:** Both frontend and backend use simple 10-digit regex; Hubtel SMS normalizes but registration does not enforce +233

### GAP 11: Permission Scope Ambiguity
**Severity:** MEDIUM  
**Location:** `UserPermission` model allows duplicates with different scopes  
**Impact:** GLOBAL and ORGANIZATION grants for same permission can coexist with unclear precedence  
**Evidence:** `@@unique([userId, permissionId, scopeType, scopeId])` permits multiple rows per user/permission

### GAP 12: Offline Resilience
**Severity:** HIGH  
**Location:** Frontend `apiClient` + all API modules  
**Impact:** Network loss causes 15s timeout then error; no retry queue  
**Evidence:** `apiClient.ts:42` hardcoded `timeoutMs = 15000`; no IndexedDB; no service worker

---

## 7. GHANA-SPECIFIC GAPS

| Gap | Frontend | Backend | Priority |
|---|---|---|---|
| Phone format (+233) | No validation | Regex rejects +233 | HIGH |
| Language (Twi/Ga/Hausa) | `lang="en"` hardcoded | Error messages English-only | HIGH |
| Offline sync | No IndexedDB | No sync queue | HIGH |
| SMS fallback | No SMS UI | Hubtel integrated (OTP only) | MEDIUM |
| NHIS context | No NHIS fields | No NHIS tracking model | MEDIUM |
| GMC registration | No verification UI | License types (AHPC/MDC/PHCG/PSCG) present | LOW |
| Ghana locale | `formatDate(undefined)` | Moment.js default locale | LOW |
| Low-bandwidth UI | No compression | Server has compression middleware | MEDIUM |

---

## 8. IMMEDIATE PRIORITIES

### P0 — CRITICAL (This Iteration)
| # | Gap | Owner | Action |
|---|---|---|---|
| 1 | **Empty referrals API** | Frontend | Implement `lib/api/referrals.ts` with full CRUD |
| 2 | **Route protection** | Frontend | Add `ProtectedRoute` to all dashboard routes |
| 3 | **Privilege escalation** | Backend | Verify `fromProviderId` matches caller in referral creation |
| 4 | **Recording consent** | Backend | Add consent model + require opt-in before recording |
| 5 | **Orphaned tasks** | Backend | Cascade task status on referral DECLINED |

### P1 — HIGH (Next Iteration)
| # | Gap | Owner | Action |
|---|---|---|---|
| 6 | No-role provider fallback | Frontend | Graceful landing page + permission request UI |
| 7 | Stale permissions | Frontend | Poll `/api/auth/me` every 5 min |
| 8 | Offline queue | Frontend | IndexedDB + sync on reconnect |
| 9 | Assessment validation | Frontend/Backend | Tool-specific Zod schema |
| 10 | Caregiver privacy audit | Backend | Log + restrict CpPatient reads |

### P2 — MEDIUM (Roadmap)
| # | Gap | Owner | Action |
|---|---|---|---|
| 11 | i18n | Frontend | next-i18next + Twi seed |
| 12 | Phone format | Both | Enforce +233 on registration |
| 13 | Ghana locale | Frontend | `toLocaleDateString('en-GH')` |
| 14 | Permission precedence docs | Backend | Document GLOBAL > ORGANIZATION > ... |
| 15 | SMS notifications | Backend | Hubtel for appointment reminders |

---

## 9. TEST MATRIX (FOR AGENT 4)

| # | Scenario | Platform | Expected | Risk |
|---|---|---|---|---|
| 1 | Unauthenticated → `/admin` | Web | Redirect to login | ❌ Renders page |
| 2 | Unauthenticated → `/provider` | Web | Redirect to login | ❌ Renders page |
| 3 | Provider (no roles) → `/provider` | Web | Read-only dashboard | ❌ Full dashboard |
| 4 | Admin removes role mid-session | Web | UI hides features | ❌ Stale state |
| 5 | Mobile (no web_role) → `/assessment/submit` | Mobile | Works | ✅ |
| 6 | Mobile creates referral with other `fromProviderId` | Mobile | 403 Forbidden | ❌ Privilege escalation |
| 7 | Assessment with mismatched toolVersion | Both | Reject or normalize | ❌ Accepted as-is |
| 8 | Telehealth room recording without consent | Both | Should require opt-in | ❌ Records silently |
| 9 | Referral DECLINED → tasks status | Backend | CANCELLED | ❌ Still PENDING |
| 10 | Caregiver A accesses Caregiver B's patient | Backend | 403 | ❌ May succeed |
| 11 | Phone `+233241234567` | Both | Accepted as valid | ❌ Rejected by regex |
| 12 | RBAC `/check` with no roles | Web | Returns false | ✅ |
| 13 | New ADMIN via register | Backend | Gets ADMIN UserRole | ✅ (email OTP only) |
| 14 | Token refresh after expiry | Both | New token issued | ✅ |
| 15 | Rate limit on `/auth/login` | Both | 429 after 10 fails | ✅ |

---

## 10. AGENT HANDOFF NOTES

### Agent 2 (Backend)
- Schema and routes are well-structured; focus on Gap 3 (referral ownership), Gap 4 (recording consent), Gap 6 (task cascade), Gap 10 (caregiver privacy)
- No mobile app code exists; mobile users hit the same endpoints without web_role
- Consider adding `fromProviderId` ownership check in `AssessmentService.createReferral`
- Add `recordingConsent` boolean + timestamp to `TelehealthRoom`
- Add `onDeleteReferral` trigger service for `RehabTask`

### Agent 3 (Frontend)
- **Immediate P0:** Implement `lib/api/referrals.ts` (refer to `lib/api/appointments.ts` as template)
- **Immediate P0:** Wrap ALL dashboard routes in `ProtectedRoute` with `requiredRole` matching backend expectations
- **P1:** Add no-role provider fallback UI in `AuthContext` → route to `/provider` with permission request banner
- **P1:** Permission cache refresh: poll `/api/auth/me` every 5 minutes
- **P2:** i18n foundation, offline IndexedDB, Ghana locale dates

### Agent 4 (QA)
- Test matrix above; prioritize P0 scenarios 1-3 (route protection)
- Add integration tests for referral CRUD, role-change mid-session, mobile no-role access
- Accessibility audit for assessment forms (WCAG AA)

### Agent 5 (Debugger)
- The 0-byte `referrals.ts` is not a bug but a missing implementation
- Route protection gaps are security misconfigurations requiring immediate fix
- `lib/validators/auth.ts` missing causes TypeScript build errors

### Agent 6 (PM)
- Raise referrals as blocking for web launch
- Document that mobile path requires no RBAC; web requires explicit role
- Schedule Ghana localization sprint (Twi, phone format, SMS)

---

## 11. RESEARCHER'S LOOP STATUS

**This report supersedes RESEARCH_REPORT_v1.md** for full-stack scope.

- ✅ Backend: 50+ files scanned (routes, controllers, services, middleware, schema)
- ✅ Frontend: 50+ route files, 14 API modules, core components scanned
- ✅ RBAC flow: end-to-end verified (register → verify → login → token → middleware → route → service)
- ✅ Ghana gaps: identified across both codebases
- ⚠️ `lib/api/referrals.ts` empty — **highest functional priority**
- ⚠️ Frontend route guards inconsistent — **highest security priority**
- ⚠️ Referral privilege escalation — **critical backend fix needed**
- ⚠️ Recording consent missing — **compliance risk**

**Next iteration:** After P0 fixes are implemented, re-scan for new edge cases.
