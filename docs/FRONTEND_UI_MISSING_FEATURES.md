# Frontend UI: Missing Features & Implementation Guide

## Project Status: 15% Complete

**Currently Implemented:**
- ✅ Auth flow UI (Login, OTP, Password Reset)
- ✅ Dashboard layout (Sidebar, TopBar)
- ✅ RBAC-based menu rendering
- ✅ Admin Dashboard (stub)
- ✅ Provider/Caregiver/Support/Tester Dashboards (stubs)
- ✅ Permission components
- ✅ Context providers

**Missing: 85% of UI Components & Pages**

---

## 📊 Missing Features by Role & Section

### 1. AUTHENTICATION & ONBOARDING (10% Complete)

#### ✅ Implemented
- Login page
- OTP verification page
- Password reset flow
- Protected route wrapper

#### ❌ Missing

**File/Component:** `app/(auth)/signup/page.tsx` + `components/auth/SignupForm.tsx`
```typescript
// Features:
// - Email/password registration
// - Email verification
// - Role selection (Caregiver, Provider, Support)
// - Terms & privacy acceptance
// - Multi-step signup wizard
```

**File/Component:** `app/(auth)/verify-email/page.tsx` + `components/auth/EmailVerification.tsx`
```typescript
// Features:
// - Email verification code input
// - Resend code functionality
// - Success/error states
```

**File/Component:** `app/(auth)/two-factor/page.tsx` + `components/auth/TwoFactorSetup.tsx`
```typescript
// Features:
// - TOTP/Authenticator setup
// - Backup codes display & download
// - Device trust options
```

**File/Component:** `app/(auth)/error/page.tsx`
```typescript
// Features:
// - Account locked message
// - Session expired message
// - Suspicious activity warning
// - Contact support link
```

**File/Component:** `app/access-denied/page.tsx`
```typescript
// Features:
// - 403 Forbidden message
// - Reason for denial
// - Request access button
// - Back to home link
```

---

### 2. ADMIN DASHBOARD (5% Complete)

**Current:** AdminDashboard with mock stats & patient list
**Missing:** All sub-sections

#### A. Overview/Home Dashboard
**File:** `app/(dashboard)/admin/page.tsx` - EXPAND existing

Missing sections:
```typescript
// 1. KPI Cards (Real-time metrics)
//    - Active Users: 2,450 (+12% vs last month)
//    - Revenue MTD: $85,210 (+15%)
//    - Active Subscriptions: 1,240
//    - Open Support Tickets: 12
//    - System Health: Up/Degraded/Down
//    - Referral Signups: +84

// 2. Charts & Graphs
//    - Revenue Trend (Area chart)
//    - User Growth (Line chart)
//    - Subscription Types (Pie chart)
//    - Top Issues (Bar chart)
//    - Referral Sources (Donut chart)

// 3. Recent Activity Feed
//    - New user signups
//    - Payment transactions
//    - Support escalations
//    - System alerts

// 4. Alerts & Notifications
//    - Failed payments
//    - API errors
//    - SLA breaches
//    - Security alerts
```

#### B. User Management
**Files:**
- `app/(dashboard)/admin/users/page.tsx` - List view
- `app/(dashboard)/admin/users/[id]/page.tsx` - Detail view
- `components/dashboards/admin/UserManagement.tsx`
- `components/dashboards/admin/UserTable.tsx`
- `components/dashboards/admin/UserDetail.tsx`
- `components/dashboards/admin/UserActions.tsx`

```typescript
Features needed:

// User List Table
- Search by name, email, MRN
- Filter by:
  - Role (Admin, Provider, Support, Caregiver, Tester)
  - Status (Active, Inactive, Suspended, Pending)
  - Date range
  - Subscription status

- Columns:
  - Name & Avatar
  - Email
  - Role(s)
  - Status (badge)
  - Subscription (plan)
  - Last login
  - Registration date
  - Actions (View, Edit, Suspend, Delete)

// Bulk Actions
- Select multiple users
- Bulk role assignment
- Bulk status change
- Bulk export

// User Detail View
- Personal info (editable)
- Contact details
- Address
- Subscription info
- Login history
- Activity log
- Assigned roles/permissions
- Notes
- Action buttons (Impersonate, Suspend, Delete, Message)

// User Creation Modal
- First name, Last name
- Email
- Password
- Role assignment
- Subscription plan
- Send welcome email checkbox
```

#### C. Roles & Permission Management
**Files:**
- `app/(dashboard)/admin/roles/page.tsx`
- `components/dashboards/admin/RoleManagement.tsx`
- `components/dashboards/admin/PermissionEditor.tsx`

```typescript
Features needed:

// Roles List
- Built-in roles (Admin, Provider, Support, Caregiver, Tester)
- Custom roles
- Edit/Delete actions
- Columns: Name, Description, Permissions count, Users count

// Role Detail/Edit
- Role name & description
- Permission checkboxes (grid or searchable list)
  - appointment.read, appointment.write
  - telehealth.start, telehealth.join
  - system.manage
  - support.read
  - tester.all
  - caregiver.read
- Users assigned to this role
- Save/Cancel buttons

// Permission Matrix
- Table: Roles (rows) vs Permissions (columns)
- Checkboxes to toggle permissions
- Visual hierarchy (collapse/expand by category)
- Bulk permission assignment

// Audit Log for role changes
- When changed, by whom, what changed
- Ability to revert
```

#### D. Audit Log Viewer
**Files:**
- `app/(dashboard)/admin/audit/page.tsx`
- `components/dashboards/admin/AuditViewer.tsx`

```typescript
Features needed:

// Filter & Search
- Search by user, action, entity
- Filter by:
  - Event type (Login, Role change, Permission change, Data access)
  - Date range
  - User
  - Severity (Info, Warning, Critical)
  - Status (Success, Failed)

// Audit Log Table
- Timestamp
- User (avatar + name)
- Event type (icon + label)
- Entity (User, Role, Appointment, etc.)
- Action (Create, Update, Delete, Access)
- Changes (what was modified)
- IP Address
- Status
- Details link

// Audit Detail Modal
- Full change diff
- Before/after values
- Metadata (user agent, IP, location)
- Related events

// Export
- Download as CSV
- Download as PDF
- Date range selection
- Filter applied to export
```

#### E. Referral Campaign Management
**Files:**
- `app/(dashboard)/admin/referrals/page.tsx`
- `components/dashboards/admin/ReferralManagement.tsx`
- `components/dashboards/admin/CampaignEditor.tsx`

```typescript
Features needed:

// Campaigns List
- Campaign name
- Status (Active, Draft, Ended)
- Referral codes generated
- Successful referrals
- Revenue generated
- Start/End date
- Edit/Clone/Delete actions

// Campaign Detail
- Campaign info (name, description, dates)
- Reward settings
  - Referrer reward ($ or subscription credit)
  - Referee discount
  - Max referrals
- Code settings
  - Single vs multiple codes
  - Prefix
  - Auto-generate
- Generated codes list
  - Code, created date, uses, user, status
- Performance metrics
  - Total codes: N
  - Used codes: N
  - Conversion rate: X%
  - Revenue: $Y
- Activity feed

// Create Campaign Modal
- Name & description
- Date range picker
- Reward amount (referrer)
- Discount (referee)
- Max uses per code
- Generate codes button

// Referral Codes List
- Sortable/filterable table
- Bulk actions (regenerate, revoke, export)
- Copy to clipboard
```

#### F. Integration Status Page
**Files:**
- `app/(dashboard)/admin/integrations/page.tsx`
- `components/dashboards/admin/IntegrationStatus.tsx`

```typescript
Features needed:

// Integration Cards
For each integration (Stripe, Daily.co, Auth0, etc.):
- Name & logo
- Status (Connected, Error, Disabled, Not configured)
- Last sync time
- Error message (if applicable)
- Config button
- Test button
- Logs link

// Integration Detail Modal
- API key status (masked)
- Last successful sync
- Recent errors/logs
- Configuration
- Webhook status
- Test integration button

// Logs
- Timestamp
- Event type (Sync, Error, Success)
- Details
- Status
```

---

### 3. PROVIDER DASHBOARD (5% Complete)

**Current:** ProviderDashboard stub with mock appointments
**Missing:** All features below

#### A. Provider Home/Overview
**Files:**
- `app/(dashboard)/provider/page.tsx` - EXPAND existing
- `components/dashboards/ProviderDashboard.tsx` - REWRITE

```typescript
Features needed:

// 1. Quick Stats
//    - Today's appointments: 8
//    - Completed this week: 42
//    - Patients: 234
//    - Clinical earnings (month): $8,240
//    - Next appointment: Leo Chen @ 2:30 PM
//    - Average rating: 4.8/5

// 2. Today's Schedule
//    - Appointment list/calendar view
//    - Join video button (if time)
//    - Appointment details (patient, condition, notes)

// 3. Recent Activity
//    - New appointments
//    - Completed sessions
//    - New reviews
//    - Messages

// 4. Notifications
//    - Appointment reminders
//    - New reviews
//    - Referral requests
//    - Billing alerts

// 5. Quick Access
//    - Start telehealth button
//    - New appointment
//    - Message patient
//    - View calendar
```

#### B. Appointment Management
**Files:**
- `app/(dashboard)/provider/appointments/page.tsx`
- `components/dashboards/provider/AppointmentCalendar.tsx`
- `components/dashboards/provider/AppointmentList.tsx`
- `components/dashboards/provider/AppointmentDetail.tsx`
- `components/dashboards/provider/BookAppointment.tsx`

```typescript
Features needed:

// Calendar View
- Month/Week/Day view toggle
- Drag-to-reschedule
- Color-coded appointment types
- Click to view details
- Create appointment button

// List View
- Search by patient name/MRN
- Filter by:
  - Date range
  - Status (Scheduled, In-progress, Completed, Cancelled)
  - Type (Telehealth, In-person)
  - Patient condition

// Appointment Card
- Patient name & avatar
- Time & duration
- Appointment type
- Chief complaint/reason
- Status badge
- Actions (Join, Reschedule, Cancel, Note)

// Appointment Detail Modal
- Patient info (name, MRN, DOB, contact)
- Medical history summary
- Previous appointments
- Reason for visit
- Notes
- Vitals (if recorded)
- Documents/attachments
- Join telehealth button (if active)
- Edit/Reschedule/Cancel/Complete buttons

// Create/Edit Appointment Form
- Patient selection (searchable)
- Date & time picker
- Duration
- Appointment type
- Reason/Chief complaint
- Notes
- Attach documents
- Send reminder checkbox

// Bulk Actions
- Select multiple appointments
- Bulk reschedule
- Bulk cancel with reason
- Bulk export
```

#### C. Patient Management
**Files:**
- `app/(dashboard)/provider/patients/page.tsx`
- `components/dashboards/provider/PatientList.tsx`
- `components/dashboards/provider/PatientDetail.tsx`
- `components/dashboards/provider/AddPatient.tsx`

```typescript
Features needed:

// Patient List
- Search by name, MRN, email
- Filter by:
  - Status (Active, Inactive, Archived)
  - Condition
  - Last visit (date range)
  - Subscription plan

// Patient Table
- Avatar & Name
- MRN
- Age/DOB
- Primary condition
- Last visit date
- Next appointment
- Status badge
- Stars/rating
- Actions (View, Edit, Message, Video call)

// Patient Detail View
- Demographics
  - Full name, DOB, Gender
  - Contact info
  - Address
  - Insurance

- Medical History
  - Conditions
  - Medications
  - Allergies
  - Previous diagnoses
  - Family history

- Clinical Data
  - Appointment history
  - Outcomes/notes summary
  - Lab results (if available)
  - Current medications
  - Vitals history

- Communication
  - Send message button
  - Message history
  - Call history

- Referrals
  - Send referral button
  - Referral history

- Documents
  - Upload/download documents
  - List of attachments

- Settings
  - Notification preferences
  - Archive patient

// Add Patient Form
- Full name, DOB, Gender
- Email, phone
- Address
- MRN
- Primary condition
- Medications (add multiple)
- Allergies
- Insurance info
- Emergency contact
- Referral source
```

#### D. Referral Management
**Files:**
- `app/(dashboard)/provider/referrals/page.tsx`
- `components/dashboards/provider/ReferralList.tsx`
- `components/dashboards/provider/SendReferral.tsx`

```typescript
Features needed:

// Referral List
- View sent referrals
- View received referrals
- Filter by status (Sent, Accepted, Completed, Rejected)
- Filter by date range
- Search by provider/patient name

// Referral Card
- From/To provider
- Patient name
- Reason
- Specialty
- Date sent
- Status badge
- Actions (View, Message, Cancel)

// Referral Detail
- Full referral info
- Clinical notes
- Requested specialty
- Urgency level
- Timeline
- Attachments
- Status history
- Message thread
- Accept/Reject buttons (if incoming)
- Cancel button (if outgoing)

// Send Referral Modal
- Patient selection
- Referred to (provider search)
- Specialty
- Urgency level
- Reason for referral
- Clinical notes
- Attachments
- Send button
```

#### E. Telehealth Sessions
**Files:**
- `app/(dashboard)/provider/telehealth/page.tsx` (or `/provider/telehealth/[sessionId]`)
- `components/dashboards/provider/TelehealthRoom.tsx`
- `components/dashboards/provider/SessionHistory.tsx`

```typescript
Features needed:

// Video Session Room
- Video/audio controls
- Screen share toggle
- Chat panel
- End call button
- Record indicator
- Participant info (patient name, connection status)
- Timer (elapsed time)
- Consent banner (if recording)

// Session History
- List of past sessions
- Date & duration
- Patient name
- Status (Completed, Cancelled, No-show)
- Recording available (yes/no)
- Actions (View recording, View notes, Download)

// Session Detail
- Participant info
- Duration
- Date/time
- Recording (playback)
- Session notes
- Outcome
- Follow-up actions
```

#### F. Provider Subscription & Billing
**Files:**
- `app/(dashboard)/provider/billing/page.tsx`
- `components/dashboards/provider/BillingStatus.tsx`

```typescript
Features needed:

// Subscription Info
- Current plan (name, features, price/month)
- Next billing date
- Auto-renew toggle
- Upgrade/downgrade buttons

// Usage/Limits
- Appointment slots used: 45/100
- Video minutes used: 320/600
- Patients: 234/500
- Progress bars for each

// Billing History
- Invoice list (sortable, filterable)
- Date, amount, status
- Download invoice button
- Payment method

// Payment Method
- Current card (masked)
- Expiry date
- Add/edit card button

// Earnings
- Total earnings (month/year)
- Earnings breakdown (by appointment type)
- Payout history
```

#### G. Support & Help
**Files:**
- `app/(dashboard)/provider/support/page.tsx`
- `components/dashboards/provider/SupportPanel.tsx`

```typescript
Features needed:

// Quick Support
- Chat with support button
- Contact form
- FAQ accordion
- Knowledge base search

// Support Tickets
- My tickets list
- Create ticket button
- Filter by status
- Search by subject

// Ticket Detail
- Subject & description
- Status badge
- Messages thread
- Add message button
- Attach files
- Close ticket button
```

#### H. Settings
**Files:**
- `app/(dashboard)/provider/settings/page.tsx`
- `components/dashboards/provider/ProviderSettings.tsx`

```typescript
Features needed:

// Profile Settings
- Name, email, phone (editable)
- Avatar upload
- Bio/About (editable)
- Specialties (multi-select)
- License number (editable)
- Save changes button

// Notification Preferences
- Email notifications (toggle for each type)
  - New appointments
  - Appointment reminders
  - New messages
  - New reviews
  - Billing alerts
- SMS notifications (toggle)
- Push notifications (toggle)

// Working Hours
- By day of week
- Start/end time
- Break times
- Save button

// Availability
- Buffer time before/after appointments
- Auto-accept new appointments (toggle)
- Holiday dates

// Privacy & Security
- Password change
- Two-factor authentication toggle
- Active sessions list
- Sign out all sessions button
- Delete account (dangerous action)
```

#### I. Workflow Builder (Optional for MVP)
**Files:**
- `app/(dashboard)/provider/workflows/page.tsx`
- `components/dashboards/provider/WorkflowBuilder.tsx`

```typescript
Features needed:

// Workflow List
- Pre-built workflows (Patient intake, Follow-up, Referral)
- Custom workflows
- Active/Inactive toggle
- Edit/Clone/Delete actions

// Workflow Editor
- Drag-and-drop step builder
- Step types (Form, Email, SMS, Task)
- Conditional logic
- Save workflow
```

---

### 4. CAREGIVER DASHBOARD (0% Complete)

**Files:**
- `app/(dashboard)/caregiver/page.tsx`
- `components/dashboards/CaregiverDashboard.tsx` (needs major update)
- All sub-pages below

#### A. Caregiver Home/Overview
**File:** `app/(dashboard)/caregiver/page.tsx`

```typescript
Features needed:

// 1. Child/Patient Status
//    - Child name & avatar
//    - Last check-in
//    - Health status (Good, Fair, Poor)
//    - Upcoming appointments
//    - Medication reminders

// 2. Quick Actions
//    - Schedule appointment button
//    - Start telehealth button
//    - Message provider button
//    - View child's records button

// 3. This Week Overview
//    - Appointments list
//    - Tasks/reminders
//    - Games played
//    - Progress towards goals

// 4. Notifications
//    - Appointment reminders
//    - Medication reminders
//    - New achievements
//    - Messages from provider
```

#### B. Telehealth/Video Consultation
**Files:**
- `app/(dashboard)/caregiver/telehealth/page.tsx`
- `components/dashboards/caregiver/TelehealthUI.tsx`

```typescript
Features needed:

// Schedule Telehealth
- Pick date & time
- Select provider
- Chief complaint
- Preferred communication method
- Book button

// Upcoming Sessions
- List of scheduled sessions
- Date, time, provider
- Join button (if time)
- Reminder notification

// Active Session
- Video/audio controls
- Chat panel
- End call button
- Participant info
- Consent banner (if recording)

// Past Sessions
- History list
- Date, provider, duration
- Notes from provider
- Prescribed follow-ups
- Rate session button

// Consent Form
- Recording consent checkbox
- Privacy policy acknowledgment
- Submit button
```

#### C. Games & Well-being
**Files:**
- `app/(dashboard)/caregiver/games/page.tsx`
- `components/dashboards/caregiver/GameLibrary.tsx`
- `components/dashboards/caregiver/GameCard.tsx`

```typescript
Features needed:

// Game Library
- Grid/list view toggle
- Filter by:
  - Category (Educational, Therapeutic, Entertainment)
  - Age group
  - Difficulty
  - Recently played

// Game Card
- Game thumbnail
- Title
- Age range
- Brief description
- Rating
- Play button
- Info icon (opens game details)

// Game Detail Modal
- Full description
- Age range
- Learning objectives
- Parent controls needed
- Download/play button
- Reviews/ratings
- Achievements unlockable
- Time limits (if any)

// Parental Controls
- Games requiring approval
- Age-appropriate filtering
- Time limits per game
- Daily/weekly limits
- Block/allow individual games
- Approved games list

// Game Session
- Start game button
- Timer (if limited)
- Pause/resume
- Exit game
- Achievements earned notification

// Game Achievements
- List of unlocked achievements
- Progress towards achievements
- Share achievement (social)
```

#### D. Rewards & Incentives
**Files:**
- `app/(dashboard)/caregiver/rewards/page.tsx`
- `components/dashboards/caregiver/RewardsDashboard.tsx`

```typescript
Features needed:

// Rewards Overview
- Current points balance
- Referral credits
- Subscription discounts earned
- Rewards progress bar

// Rewards Catalog
- Available rewards (sortable by category)
- Points required for each
- Redeem button
- Reward details (what you get, when)

// Referral Program
- Your referral link (copy button)
- Referral code (copy button)
- Successful referrals count
- Earnings from referrals
- Track referrals link

// Points History
- Transactions list
- Date, action, points earned/spent
- Running balance

// Earned Rewards
- Redeemed rewards list
- Date redeemed
- Reward details
- Expiration date (if applicable)
```

#### E. Help & FAQ
**Files:**
- `app/(dashboard)/caregiver/help/page.tsx`
- `components/dashboards/caregiver/HelpCenter.tsx`

```typescript
Features needed:

// FAQ Accordion
- Categories (Getting Started, Appointments, Games, Billing, etc.)
- Expandable questions
- Search FAQ

// Contact Support
- Support ticket form
- Subject & message
- Upload attachments
- Submit button

// Support Tickets
- My tickets list
- Status badge
- Date submitted
- Messages count
- Click to open conversation

// Chat with Support
- Real-time chat interface
- Message history
- Typing indicator
- Send button

// Knowledge Base Articles
- Search bar
- Popular articles
- Category browsing
- Article content (with images/videos)
- Related articles
- Helpful? (thumbs up/down)
```

#### F. Settings & Preferences
**Files:**
- `app/(dashboard)/caregiver/settings/page.tsx`
- `components/dashboards/caregiver/CaregiverSettings.tsx`

```typescript
Features needed:

// Profile
- Name, email, phone (editable)
- Avatar upload
- Address
- Save button

// Children/Dependents
- List of children
- Add child button
- Remove child button
- Child profile edit

// Notification Preferences
- Email notifications (toggle for each type)
- SMS notifications (toggle)
- Push notifications (toggle)
- Notification frequency

// Privacy & Security
- Password change
- Two-factor authentication toggle
- Active sessions list
- Sign out all sessions button
- Delete account option

// Billing
- Payment methods
- Billing address
- Subscription info
- Update payment button
```

---

### 5. SUPPORT/HELPDESK DASHBOARD (0% Complete)

**Files:**
- `app/(dashboard)/support/page.tsx`
- `components/dashboards/SupportDashboard.tsx` (needs complete rewrite)
- All sub-pages below

#### A. Support Dashboard/Overview
**File:** `app/(dashboard)/support/page.tsx`

```typescript
Features needed:

// 1. Key Metrics
//    - Open tickets: 12
//    - In progress: 8
//    - Avg response time: 2.3 hrs
//    - Avg resolution time: 18 hrs
//    - Customer satisfaction: 4.6/5

// 2. Queue Status
//    - By priority (Critical, High, Medium, Low)
//    - Tickets in queue count
//    - Oldest ticket age
//    - SLA breach count

// 3. Team Performance
//    - Agent stats (responses, resolution rate, satisfaction)
//    - Workload (tickets per agent)
//    - Availability status

// 4. Recent Tickets
//    - List of newest tickets
//    - Priority, subject, user
//    - Age (time open)

// 5. Alerts
//    - SLA breaches
//    - High volume alerts
//    - Critical tickets
```

#### B. Ticket Management
**Files:**
- `app/(dashboard)/support/tickets/page.tsx`
- `components/dashboards/support/TicketQueue.tsx`
- `components/dashboards/support/TicketDetail.tsx`

```typescript
Features needed:

// Ticket Queue View
- Kanban board (New, In Progress, Waiting, Resolved, Closed)
- OR List view with columns:
  - ID (T-8291)
  - Subject
  - User name
  - Priority badge
  - Status
  - Assigned to
  - Created date
  - Age (time open)
  - Actions

// Filter & Search
- Search by ID, subject, user name
- Filter by:
  - Status (Open, In Progress, Waiting, Resolved, Closed)
  - Priority (Critical, High, Medium, Low)
  - Assigned to (me, unassigned, all)
  - Created date range
  - Category
  - SLA status (On track, At risk, Breached)

// Ticket Actions (Bulk)
- Select multiple tickets
- Bulk assign
- Bulk priority change
- Bulk status change

// Ticket Detail View
- Ticket ID & created date
- User info (avatar, name, email)
- Subject & description
- Category
- Priority
- Status (with history)
- Assigned to
- Messages/conversation thread
- Attachments
- Related tickets
- Internal notes
- Actions:
  - Assign ticket
  - Change priority
  - Change status
  - Add internal note
  - Add message
  - Close ticket
  - Escalate

// Message Interface
- Message history (chronological)
- User messages vs internal notes
- Add attachment button
- Message input
- Send button
- Typing indicator (if live chat)

// Ticket Creation
- User search/select
- Subject
- Description
- Category
- Priority
- Attachment upload
- Create button
```

#### C. FAQ Management
**Files:**
- `app/(dashboard)/support/faqs/page.tsx`
- `components/dashboards/support/FAQManagement.tsx`
- `components/dashboards/support/FAQEditor.tsx`

```typescript
Features needed:

// FAQ List
- Search by title/keywords
- Filter by:
  - Category
  - Status (Published, Draft, Archived)
  - Popularity
  - Date created/modified
- Sortable columns:
  - Title
  - Category
  - Status badge
  - Views
  - Helpful count
  - Edit date
  - Actions (Edit, View, Delete, Publish)

// FAQ Editor
- Title & slug
- Category selection
- Question text
- Answer (rich text editor)
  - Bold, italic, underline
  - Links
  - Code blocks
  - Lists
  - Images
- Tags
- SEO meta description
- Publish/Draft toggle
- Save button
- Preview button

// FAQ Organization
- Drag-to-reorder FAQs within category
- Create/edit categories
- Delete FAQs with confirmation

// FAQ Analytics
- Views count
- Helpful/Not helpful votes
- Click-through rate to related articles
- Search terms leading to FAQ
```

#### D. User Lookup & Escalation
**Files:**
- `app/(dashboard)/support/users/page.tsx` (or modular within ticket view)
- `components/dashboards/support/UserLookup.tsx`

```typescript
Features needed:

// User Search
- Search by name, email, MRN, phone
- Search bar with autocomplete

// User Info Panel
- Name, email, phone
- Registration date
- Account status
- Current plan
- Total spend
- Ticket history count

// Quick Actions
- View user's open tickets
- Send message
- Impersonate user (with audit log notification)
- Escalate ticket
- View user activity log
- Update user notes

// Escalation Modal
- Reason for escalation
- Escalate to (department/manager)
- Priority level
- Notes
- Escalate button
```

#### E. Support Metrics & Analytics
**Files:**
- `app/(dashboard)/support/metrics/page.tsx`
- `components/dashboards/support/SupportMetrics.tsx`

```typescript
Features needed:

// KPI Cards
- Response time (avg & 95th percentile)
- Resolution time (avg)
- Customer satisfaction score
- First contact resolution rate
- SLA compliance %

// Charts
- Tickets over time (line chart)
- By priority (bar chart)
- By category (pie chart)
- By status (donut chart)
- Resolution time distribution

// Team Performance
- Agent table:
  - Name
  - Tickets handled
  - Avg resolution time
  - Customer satisfaction
  - On-time SLA %
  - Response rate
  - Current workload

// Trends
- Top issues (recurring problems)
- Emerging issues
- Seasonal patterns

// Export
- Download report (PDF, CSV)
- Date range selection
- Metrics to include
```

---

### 6. TESTER DASHBOARD (5% Complete)

**Current:** TesterDashboard stub
**Missing:** Implementation

**Files:**
- `app/(dashboard)/tester/page.tsx`
- `components/dashboards/TesterDashboard.tsx` (rewrite)

```typescript
Features needed:

// Infrastructure Status
- System status (All Green, Some Issues, Down)
- Component status cards:
  - API Gateway (Operational, last checked: 2 mins ago)
  - Database Cluster (Operational)
  - Authentication Service (Operational)
  - Storage Service (Operational)
  - Telehealth Service (Operational)
  - Payment Gateway (Operational)
  - Email Service (Operational)
  - SMS Service (Operational)

// Service Logs
- Real-time log stream
- Filter by service
- Filter by level (Info, Warning, Error, Critical)
- Search logs
- Log detail modal

// Error Tracking
- Recent errors (sortable by frequency, recency, severity)
- Error type
- Affected users
- Stack trace
- Related incidents

// Performance Metrics
- API response time graph
- Database query time
- Server CPU/Memory usage
- Error rate

// Testing Tools
- API endpoint tester (make requests)
- Database query executor
- Email test sender
- Webhook trigger simulator

// System Configuration
- Environment variables (view/edit)
- API keys management
- Integration settings
- Feature flags (toggle)

// Database Manager
- View/edit mock data
- Seed database
- Reset data button
```

---

### 7. SHARED/COMMON FEATURES (20% Complete)

#### A. Sidebar Navigation
**Status:** ✅ Basic implementation exists
**Missing:** Full RBAC filtering, collapsible categories

#### B. Top Bar / Header
**Status:** ✅ Partial
**Missing:** Notifications bell, proper user menu

**File:** `components/layout/TopBar.tsx` - UPDATE
```typescript
Features needed:
- Search bar (global search)
- Notifications bell
  - Unread count badge
  - Dropdown with recent notifications
  - Notification preferences link
- User profile menu
  - Avatar + name
  - Status indicator
  - Edit profile
  - Settings
  - Sign out
- Theme toggle (light/dark)
- Help icon (opens support chat or FAQ)
```

#### C. Notifications Center
**Files:**
- `app/notifications/page.tsx`
- `components/dashboards/NotificationsCenter.tsx`

```typescript
Features needed:

// Notification List
- All, Unread, Archived tabs
- Sort by date (newest first)
- Filter by type (Appointment, Message, System, etc.)
- Search notifications

// Notification Card
- Icon (by type)
- Title & message preview
- Timestamp (relative)
- Read/unread indicator
- Actions (Mark as read, Archive, Delete)

// Mark as Read
- Click notification to open detail
- Mark all as read button
- Mark selected as read

// Archive
- Archive single notification
- Archive all
- View archived

// Clear
- Clear all
- Clear old notifications
```

#### D. Global Search
**Files:**
- `components/shared/GlobalSearch.tsx`
- Integrated in TopBar

```typescript
Features needed:

// Search Box
- Input field (searchable)
- Keyboard shortcut (Cmd+K / Ctrl+K)
- Cancel button (Esc)

// Search Results
- By type:
  - Users (find users to manage/message)
  - Appointments (find appointments)
  - Patients (find patients)
  - Tickets (find support tickets)
  - FAQs (find knowledge base articles)
  - Referrals (find referrals)

// Result Card
- Icon/avatar
- Title
- Category/type badge
- Metadata (date, status, etc.)
- Click to navigate

// Quick Actions
- Recent searches
- Popular searches
```

#### E. Modal/Dialog Components
**Status:** ✅ Modal component exists
**Missing:** Standardized variants (confirm dialog, forms, etc.)

**Files:**
- `components/ui/Modal.tsx` - EXISTS
- `components/ui/ConfirmDialog.tsx` - MISSING
- `components/ui/FormModal.tsx` - MISSING

#### F. Tables & Data Grids
**Status:** ⚠️ Basic table, no advanced features
**Missing:** Sorting, filtering, pagination, bulk actions, column customization

**Files:**
- `components/ui/Table.tsx` - CREATE/ENHANCE
- `components/ui/DataGrid.tsx` - CREATE (advanced table)

```typescript
Features needed:

// Table Features
- Sortable columns (click header to sort)
- Resizable columns (drag border)
- Sticky header (scroll while keeping header visible)
- Striped rows option
- Hover highlight
- Loading state
- Empty state
- Error state

// Pagination
- Previous/next buttons
- Page size selector (10, 25, 50, 100)
- Jump to page
- Total count display

// Bulk Actions
- Checkbox select all
- Per-row checkboxes
- Selected count indicator
- Bulk action buttons
- Clear selection

// Column Customization
- Show/hide columns
- Reorder columns (drag-drop)
- Save preferences

// Filtering
- Column filter dropdowns
- Search within results
- Advanced filters
- Clear filters

// Export
- Export to CSV
- Export to PDF
- Copy to clipboard
```

#### G. Forms & Input Components
**Status:** ⚠️ Basic inputs exist
**Missing:** Advanced components, validation display, field variations

**Files:**
- `components/ui/Input.tsx` - EXISTS (basic)
- `components/ui/Select.tsx` - MISSING
- `components/ui/Checkbox.tsx` - MISSING
- `components/ui/Radio.tsx` - MISSING
- `components/ui/Textarea.tsx` - MISSING
- `components/ui/DatePicker.tsx` - MISSING
- `components/ui/TimePicker.tsx` - MISSING
- `components/ui/FileUpload.tsx` - MISSING
- `components/ui/FormField.tsx` - MISSING (wrapper with error display)

#### H. Charts & Visualizations
**Status:** ✅ Recharts integrated, some charts in admin dashboard
**Missing:** More chart types, consistent styling

Existing charts:
- AreaChart
- BarChart
- PieChart
- LineChart (implied)

Missing:
- ScatterChart
- RadarChart
- ComposedChart
- Table (Data table in chart form)
- Heatmap

#### I. Status Badges & Indicators
**Status:** ✅ Badge component exists
**Missing:** Variants for different statuses

**File:** `components/ui/Badge.tsx` - ENHANCE

```typescript
Badge variants needed:
- Status badges:
  - Active (green)
  - Inactive (gray)
  - Pending (yellow)
  - Error (red)
  - Warning (orange)
  - Info (blue)

- Priority badges:
  - Critical (red)
  - High (orange)
  - Medium (yellow)
  - Low (blue)

- Role badges:
  - Admin (purple)
  - Provider (blue)
  - Caregiver (green)
  - Support (orange)
  - Tester (gray)
```

#### J. Loading States & Skeletons
**Status:** ❌ Missing
**Missing:** Skeleton loaders, loading spinners

**Files:**
- `components/ui/Spinner.tsx` - CREATE
- `components/ui/Skeleton.tsx` - CREATE
- `components/ui/LoadingCard.tsx` - CREATE
- `components/ui/LoadingTable.tsx` - CREATE

#### K. Error & Empty States
**Status:** ⚠️ Partial
**Missing:** Standardized error/empty component

**Files:**
- `components/ui/EmptyState.tsx` - CREATE
- `components/ui/ErrorState.tsx` - CREATE
- `components/ui/NotFound.tsx` - CREATE

#### L. Tooltips & Help Text
**Status:** ❌ Missing
**Missing:** Tooltip component, contextual help

**Files:**
- `components/ui/Tooltip.tsx` - CREATE
- `components/ui/HelpText.tsx` - CREATE

---

## 🎨 UI Components Status Summary

| Component | Status | Priority |
|-----------|--------|----------|
| **Layout** | | |
| Sidebar | ✅ 80% | - |
| TopBar | ⚠️ 50% | HIGH |
| Layout Grid | ✅ 100% | - |
| **Navigation** | | |
| Menu Items | ✅ 100% | - |
| Breadcrumb | ❌ 0% | MEDIUM |
| Tabs | ❌ 0% | MEDIUM |
| **Forms** | | |
| Input | ✅ 60% | HIGH |
| Select | ❌ 0% | HIGH |
| Checkbox | ❌ 0% | HIGH |
| Radio | ❌ 0% | HIGH |
| Textarea | ❌ 0% | MEDIUM |
| DatePicker | ❌ 0% | HIGH |
| TimePicker | ❌ 0% | MEDIUM |
| FileUpload | ❌ 0% | MEDIUM |
| FormField (wrapper) | ❌ 0% | HIGH |
| **Data Display** | | |
| Table | ⚠️ 30% | HIGH |
| DataGrid | ❌ 0% | HIGH |
| Card | ✅ 80% | - |
| Stat Card | ✅ 100% | - |
| Badge | ✅ 80% | MEDIUM |
| **Charts** | | |
| AreaChart | ✅ 100% | - |
| BarChart | ✅ 100% | - |
| PieChart | ✅ 100% | - |
| LineChart | ❌ 0% | MEDIUM |
| ScatterChart | ❌ 0% | LOW |
| RadarChart | ❌ 0% | LOW |
| **Feedback** | | |
| Modal/Dialog | ✅ 100% | - |
| ConfirmDialog | ❌ 0% | HIGH |
| Toast/Alert | ❌ 0% | HIGH |
| Spinner | ❌ 0% | HIGH |
| Skeleton | ❌ 0% | HIGH |
| **States** | | |
| EmptyState | ❌ 0% | MEDIUM |
| ErrorState | ❌ 0% | MEDIUM |
| NotFound (404) | ❌ 0% | MEDIUM |
| **Helpers** | | |
| Tooltip | ❌ 0% | LOW |
| HelpText | ❌ 0% | LOW |
| Dropdown | ❌ 0% | MEDIUM |
| Menu | ❌ 0% | MEDIUM |

---

## 📋 Implementation Priority & Roadmap

### Phase 1: Critical Components (Week 1-2)
- [ ] Complete TopBar (search, notifications, user menu)
- [ ] Form Field wrapper with error display
- [ ] Select component
- [ ] DatePicker component
- [ ] ConfirmDialog component
- [ ] Toast/Alert system
- [ ] LoadingStates (Spinner, Skeleton)

### Phase 2: Core Dashboards (Week 3-4)
- [ ] Admin Dashboard - Users tab
- [ ] Admin Dashboard - Roles & Permissions tab
- [ ] Admin Dashboard - Audit Logs tab
- [ ] Provider Dashboard - Appointments
- [ ] Provider Dashboard - Patients
- [ ] Provider Dashboard - Telehealth

### Phase 3: Support & Secondary (Week 5-6)
- [ ] Support Dashboard - Ticket Queue
- [ ] Support Dashboard - FAQ Management
- [ ] Caregiver Dashboard - Core features
- [ ] Tester Dashboard - Infrastructure Status

### Phase 4: Polish & Enhancement (Week 7-8)
- [ ] Advanced table features (sort, filter, bulk actions)
- [ ] All remaining UI components
- [ ] Accessibility audit
- [ ] Responsive design refinement
- [ ] Dark mode (optional)

---

## 🛠️ Tech Stack & Dependencies

**Already Installed:**
- Next.js 16
- React 19
- TypeScript 5
- Tailwind CSS 4
- Lucide React (icons)
- Recharts (charts)
- Framer Motion (animations)

**Recommended Additions:**
- `react-hook-form` - Form state management
- `zod` or `yup` - Schema validation
- `date-fns` - Date utilities
- `react-hot-toast` - Toast notifications
- `cmdk` - Command palette/search
- `react-select` - Advanced select component
- `react-table` or `tanstack/react-table` - Advanced table
- `react-calendar` or `react-date-picker` - Date picker
- `file-saver` - Export to CSV/PDF
- `jspdf` - PDF generation

---

## 📁 Frontend Directory Structure

```
gmnc-next-admins/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── signup/                    ← CREATE
│   │   ├── otp/
│   │   ├── forgot-password/
│   │   ├── reset-password/
│   │   ├── verify-email/              ← CREATE
│   │   ├── two-factor/                ← CREATE
│   │   ├── check-email/
│   │   ├── error/                     ← ENHANCE
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── admin/
│   │   │   ├── page.tsx               ← ENHANCE
│   │   │   ├── users/                 ← CREATE
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── roles/                 ← CREATE
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── audit/                 ← CREATE
│   │   │   │   └── page.tsx
│   │   │   ├── referrals/             ← CREATE
│   │   │   │   └── page.tsx
│   │   │   ├── integrations/          ← CREATE
│   │   │   │   └── page.tsx
│   │   │   └── providers/             ← CREATE
│   │   │       └── page.tsx
│   │   ├── provider/
│   │   │   ├── page.tsx               ← ENHANCE
│   │   │   ├── appointments/          ← CREATE
│   │   │   ├── patients/              ← CREATE
│   │   │   ├── referrals/             ← CREATE
│   │   │   ├── telehealth/            ← CREATE
│   │   │   ├── billing/               ← CREATE
│   │   │   ├── support/               ← CREATE
│   │   │   ├── workflows/             ← CREATE (optional)
│   │   │   └── settings/              ← CREATE
│   │   ├── caregiver/
│   │   │   ├── page.tsx               ← ENHANCE
│   │   │   ├── telehealth/            ← CREATE
│   │   │   ├── games/                 ← CREATE
│   │   │   ├── rewards/               ← CREATE
│   │   │   ├── help/                  ← CREATE
│   │   │   └── settings/              ← CREATE
│   │   ├── support/
│   │   │   ├── page.tsx               ← REWRITE
│   │   │   ├── tickets/               ← CREATE
│   │   │   ├── faqs/                  ← CREATE
│   │   │   ├── users/                 ← CREATE
│   │   │   └── metrics/               ← CREATE
│   │   ├── tester/
│   │   │   └── page.tsx               ← REWRITE
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── notifications/             ← CREATE
│   │   │   └── page.tsx
│   │   ├── settings/                  ← CREATE (global settings)
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── access-denied/
│   │   └── page.tsx                   ← ENHANCE
│   ├── api/                           ← For mock data endpoints
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── auth/
│   │   ├── AuthBackground.tsx         ✅ EXISTS
│   │   ├── ProtectedRoute.tsx         ✅ EXISTS
│   │   ├── RequirePermission.tsx      ✅ EXISTS
│   │   ├── SignupForm.tsx             ← CREATE
│   │   ├── EmailVerification.tsx      ← CREATE
│   │   └── TwoFactorSetup.tsx         ← CREATE
│   ├── layout/
│   │   ├── AppShell.tsx               ✅ EXISTS
│   │   ├── Sidebar.tsx                ✅ EXISTS (partial)
│   │   ├── TopBar.tsx                 ⚠️ ENHANCE
│   │   └── Breadcrumb.tsx             ← CREATE
│   ├── dashboards/
│   │   ├── AdminDashboard.tsx         ⚠️ EXISTS (partial)
│   │   ├── ProviderDashboard.tsx      ⚠️ EXISTS (stub)
│   │   ├── CaregiverDashboard.tsx     ⚠️ EXISTS (stub)
│   │   ├── SupportDashboard.tsx       ⚠️ EXISTS (partial)
│   │   ├── TesterDashboard.tsx        ⚠️ EXISTS (stub)
│   │   ├── admin/                     ← CREATE (sub-components)
│   │   │   ├── UserManagement.tsx
│   │   │   ├── UserTable.tsx
│   │   │   ├── UserDetail.tsx
│   │   │   ├── RoleManagement.tsx
│   │   │   ├── PermissionEditor.tsx
│   │   │   ├── AuditViewer.tsx
│   │   │   ├── ReferralManagement.tsx
│   │   │   └── IntegrationStatus.tsx
│   │   ├── provider/                  ← CREATE
│   │   │   ├── AppointmentCalendar.tsx
│   │   │   ├── AppointmentList.tsx
│   │   │   ├── AppointmentDetail.tsx
│   │   │   ├── BookAppointment.tsx
│   │   │   ├── PatientList.tsx
│   │   │   ├── PatientDetail.tsx
│   │   │   ├── AddPatient.tsx
│   │   │   ├── ReferralList.tsx
│   │   │   ├── SendReferral.tsx
│   │   │   ├── TelehealthRoom.tsx
│   │   │   ├── SessionHistory.tsx
│   │   │   ├── BillingStatus.tsx
│   │   │   ├── SupportPanel.tsx
│   │   │   ├── ProviderSettings.tsx
│   │   │   └── WorkflowBuilder.tsx
│   │   ├── caregiver/                 ← CREATE
│   │   │   ├── TelehealthUI.tsx
│   │   │   ├── GameLibrary.tsx
│   │   │   ├── GameCard.tsx
│   │   │   ├── RewardsDashboard.tsx
│   │   │   ├── HelpCenter.tsx
│   │   │   └── CaregiverSettings.tsx
│   │   ├── support/                   ← CREATE
│   │   │   ├── TicketQueue.tsx
│   │   │   ├── TicketDetail.tsx
│   │   │   ├── FAQManagement.tsx
│   │   │   ├── FAQEditor.tsx
│   │   │   ├── UserLookup.tsx
│   │   │   └── SupportMetrics.tsx
│   │   └── NotificationsCenter.tsx    ← CREATE
│   ├── ui/
│   │   ├── Modal.tsx                  ✅ EXISTS
│   │   ├── Input.tsx                  ✅ EXISTS (basic)
│   │   ├── Badge.tsx                  ✅ EXISTS
│   │   ├── Button.tsx                 ✅ EXISTS (implied)
│   │   ├── OryxStatCard.tsx           ✅ EXISTS
│   │   ├── ChartContainer.tsx         ✅ EXISTS
│   │   ├── Select.tsx                 ← CREATE
│   │   ├── Checkbox.tsx               ← CREATE
│   │   ├── Radio.tsx                  ← CREATE
│   │   ├── Textarea.tsx               ← CREATE
│   │   ├── DatePicker.tsx             ← CREATE
│   │   ├── TimePicker.tsx             ← CREATE
│   │   ├── FileUpload.tsx             ← CREATE
│   │   ├── FormField.tsx              ← CREATE
│   │   ├── ConfirmDialog.tsx          ← CREATE
│   │   ├── Toast.tsx                  ← CREATE
│   │   ├── Alert.tsx                  ← CREATE
│   │   ├── Spinner.tsx                ← CREATE
│   │   ├── Skeleton.tsx               ← CREATE
│   │   ├── LoadingCard.tsx            ← CREATE
│   │   ├── LoadingTable.tsx           ← CREATE
│   │   ├── Table.tsx                  ← ENHANCE
│   │   ├── DataGrid.tsx               ← CREATE
│   │   ├── EmptyState.tsx             ← CREATE
│   │   ├── ErrorState.tsx             ← CREATE
│   │   ├── NotFound.tsx               ← CREATE
│   │   ├── Tooltip.tsx                ← CREATE
│   │   ├── HelpText.tsx               ← CREATE
│   │   ├── Dropdown.tsx               ← CREATE
│   │   ├── Menu.tsx                   ← CREATE
│   │   ├── Tabs.tsx                   ← CREATE
│   │   ├── Pagination.tsx             ← CREATE
│   │   ├── Breadcrumb.tsx             ← CREATE
│   │   ├── Stepper.tsx                ← CREATE
│   │   ├── ProgressBar.tsx            ← CREATE
│   │   └── Avatar.tsx                 ← CREATE
│   ├── shared/
│   │   ├── GlobalSearch.tsx           ← CREATE
│   │   ├── SearchBar.tsx              ← CREATE
│   │   └── PageHeader.tsx             ← CREATE
│   └── icons/                         ← Icons if needed
├── hooks/
│   ├── usePermissions.ts              ✅ EXISTS
│   ├── useAuth.ts                     ← ENHANCE (export from context)
│   ├── useModal.ts                    ← CREATE
│   ├── useToast.ts                    ← CREATE
│   ├── useFetch.ts                    ← CREATE
│   ├── useTableState.ts               ← CREATE
│   ├── usePagination.ts               ← CREATE
│   ├── useSearch.ts                   ← CREATE
│   ├── useFilter.ts                   ← CREATE
│   └── useDebounce.ts                 ← CREATE
├── lib/
│   ├── context/
│   │   ├── AuthContext.tsx            ✅ EXISTS
│   │   ├── LayoutContext.tsx          ✅ EXISTS
│   │   ├── UIContext.tsx              ✅ EXISTS
│   │   └── ToastContext.tsx           ← CREATE
│   ├── data/
│   │   ├── mockData.ts                ✅ EXISTS (expand)
│   │   ├── adminData.ts               ← CREATE
│   │   ├── providerData.ts            ← CREATE
│   │   ├── caregiverData.ts           ← CREATE
│   │   ├── supportData.ts             ← CREATE
│   │   └── testerData.ts              ← CREATE
│   ├── rbac.ts                        ✅ EXISTS
│   ├── utils.ts                       ✅ EXISTS
│   ├── constants.ts                   ← CREATE
│   ├── types.ts                       ← CREATE
│   └── formatters.ts                  ← CREATE
├── public/
│   ├── logo.png                       ✅ EXISTS
│   └── [other assets]
├── styles/
│   └── globals.css                    ✅ EXISTS
├── .env.local                         ← CREATE
├── tsconfig.json                      ✅ EXISTS
├── tailwind.config.ts                 ✅ EXISTS
├── next.config.ts                     ✅ EXISTS
└── package.json                       ✅ EXISTS
```

---

## 🚀 Getting Started

### Step 1: Install Additional Dependencies
```bash
cd gmnc-next-admins
pnpm add react-hook-form zod date-fns react-hot-toast cmdk jspdf file-saver
pnpm add -D @types/file-saver
```

### Step 2: Create Base Components
Start with critical UI components (Select, DatePicker, FormField, etc.)

### Step 3: Build Admin Dashboard Features
User management, roles/permissions, audit logs

### Step 4: Build Provider Dashboard Features
Appointments, patients, telehealth, billing

### Step 5: Build Support & Caregiver Dashboards

---

## 📋 Checklist for Implementation

### Phase 1: Foundational Components
- [ ] Install additional dependencies
- [ ] Create UI component library structure
- [ ] Build Select component
- [ ] Build DatePicker component
- [ ] Build FormField wrapper
- [ ] Build Toast/Alert system
- [ ] Build Loading states (Spinner, Skeleton)
- [ ] Build ConfirmDialog component
- [ ] Create utility hooks (useModal, useToast, useFetch)
- [ ] Create type definitions (lib/types.ts)
- [ ] Create constants (lib/constants.ts)

### Phase 2: Main Dashboards
- [ ] Admin Dashboard - Users management
- [ ] Admin Dashboard - Roles & permissions
- [ ] Admin Dashboard - Audit logs
- [ ] Admin Dashboard - Referrals
- [ ] Admin Dashboard - Integrations
- [ ] Provider Dashboard - Appointments
- [ ] Provider Dashboard - Patients
- [ ] Provider Dashboard - Telehealth (placeholder)
- [ ] Provider Dashboard - Settings

### Phase 3: Support & Caregiver
- [ ] Support Dashboard - Tickets
- [ ] Support Dashboard - FAQ management
- [ ] Support Dashboard - Metrics
- [ ] Caregiver Dashboard - Games
- [ ] Caregiver Dashboard - Telehealth (placeholder)
- [ ] Caregiver Dashboard - Rewards
- [ ] Caregiver Dashboard - Help/FAQ

### Phase 4: Polish & Enhancement
- [ ] Advanced table features (sorting, filtering, bulk actions)
- [ ] Responsive design fixes
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Performance optimization
- [ ] Dark mode (optional)
- [ ] Localization (optional)

---

## 🎯 Success Criteria

✅ All dashboard pages have functional UI
✅ RBAC-based menu/route rendering
✅ Form components with validation display
✅ Tables with sorting & filtering
✅ Working search across all dashboards
✅ Mobile responsive (tablet & mobile)
✅ Dark mode support (optional)
✅ Accessibility compliance (WCAG 2.1 AA)
✅ Performance: Lighthouse score > 80
✅ All interactions connected to mock data

---

## 📚 Reference Documentation

- [Next.js App Router](https://nextjs.org/docs/app)
- [React 19](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Lucide Icons](https://lucide.dev)
- [Recharts](https://recharts.org)
- [Framer Motion](https://www.framer.com/motion)
- [React Hook Form](https://react-hook-form.com)
- [Zod Validation](https://zod.dev)

---

## 📞 Questions?

Refer to this document when implementing features. Break down each section into manageable tasks and implement component by component.
