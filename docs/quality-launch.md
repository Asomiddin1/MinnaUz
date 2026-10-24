# MinnaUz 2.0 — Quality & Launch Readiness Checklist

This document captures the pre-launch readiness checks for the critical learning path, accessibility, and production operations.

---

## 1. Critical E2E Learning Path (Auth → Course → Lesson → Quiz → Progress)

### 1.1 Scope
- Login via OTP or Google auth
- Open course roadmap
- Open a lesson
- Complete quiz/practice in the lesson
- Verify progress is saved and reflected in dashboard/course progress

### 1.2 Test Checklist
- [ ] User can authenticate and receive a valid session.
- [ ] Authenticated user can open `/[locale]/dashboard/courses`.
- [ ] User can open course detail and lesson pages.
- [ ] User can submit quiz/test answers from lesson/test pages.
- [ ] User progress updates after quiz completion.
- [ ] Progress remains after refresh and re-login.

### 1.3 Execution Notes
- API regression command: `cd api && npm run test:e2e`
- Web smoke checks: login, course navigation, lesson navigation, quiz submission, progress verification
- Record execution date, environment, and owner before launch sign-off

---

## 2. Mobile, Keyboard Navigation, and Accessibility

### 2.1 Mobile QA Checklist
- [ ] Dashboard, courses, lessons, and quiz UI work on common mobile breakpoints (360x800, 390x844, 412x915).
- [ ] No blocked interactions due to overlays/modals on touch devices.
- [ ] Core pages remain usable in portrait mode without horizontal overflow.

### 2.2 Keyboard Navigation Checklist
- [ ] All interactive controls are reachable with `Tab`/`Shift+Tab`.
- [ ] Visible focus indicator is present on primary actions and navigation.
- [ ] Modal open/close flows are keyboard accessible (`Enter`, `Esc`).

### 2.3 Accessibility Checklist
- [ ] Inputs have accessible labels and actionable controls expose accessible names.
- [ ] Color contrast on key UI states (default/hover/focus/error) is acceptable.
- [ ] Form validation and auth failures provide readable error feedback.
- [ ] Verify key pages with browser accessibility tree and screen-reader smoke check.

---

## 3. Observability & Operations Readiness

### 3.1 Monitoring & Alerting
- [ ] API health endpoint and uptime monitor configured.
- [ ] Error-rate alerts configured for auth, course, lesson, and quiz APIs.
- [ ] Latency alert thresholds set for critical user flows.
- [ ] Notification path for incidents documented (owner/channel/escalation).

### 3.2 Backup & Restore
- [ ] Database backup schedule defined (frequency + retention).
- [ ] Backup restore runbook documented and validated in non-production.
- [ ] Restore drill completed with measured RTO/RPO.
- [ ] Media/storage backup scope (uploads/assets) verified.

### 3.3 Security Launch Checklist
- [ ] Environment variables reviewed (no secrets in repo; production-only secrets in runtime).
- [ ] Auth, RBAC, validation, and throttling controls verified against `docs/security.md`.
- [ ] Dependency and code scanning checks are green in CI.
- [ ] Access controls for admin and teacher routes verified before release.

---

## 4. Launch Sign-off Template

- **Environment**: `staging` / `production`
- **QA Owner**:
- **Execution Date**:
- **Critical E2E Result**: pass / fail
- **Accessibility Result**: pass / fail
- **Observability/Backup/Security Result**: pass / fail
- **Go-Live Decision**: approved / blocked
