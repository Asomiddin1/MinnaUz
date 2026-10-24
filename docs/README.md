# MinnaUz 2.0 — Official Documentation

> **Source of Truth for MinnaUz Architecture, Business Logic, Database Design, API Contract, and Development Decisions.**

---

## 1. About MinnaUz

**MinnaUz** is a modern, full-stack Japanese language learning platform tailored for Uzbek and Central Asian learners. The platform provides structured, interactive JLPT (Japanese Language Proficiency Test) courses (from N5 to N1), Hiragana/Katakana basics, interactive vocabulary/grammar/kanji/practice modules, AI-powered conversational speaking practice (Kaiwa), study goal tracking, multi-device account security, notification broadcasting, and an integrated content management administration portal.

---

## 2. Main Applications & Repositories

The project is structured as a monorepo containing two core services:

```text
minnauz-2.0/
├── api/          # Backend API service (NestJS, TypeScript, Prisma, PostgreSQL)
├── web/          # Web frontend & Admin portal (Next.js 15 App Router, React, Tailwind CSS, TypeScript)
└── docs/         # Official project documentation and architectural source of truth
```

### Core Technology Stack

| Layer | Technologies |
|---|---|
| **Backend API** | Node.js, NestJS, TypeScript, Prisma ORM, PostgreSQL, Passport JWT, Nodemailer, Swagger |
| **Frontend Web & Admin** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Radix UI, Lucide Icons |
| **Authentication** | Passwordless Email OTP (6-digit), Google OAuth 2.0, Multi-device session manager (Max 3 devices) |
| **Internationalization (i18n)** | Uzbek (Latin default), Russian, English |
| **Media & Storage** | Local static video/audio upload directory (`/uploads`), YouTube embedding fallback |
| **AI Integration** | Kaiwa conversational roleplay engine, pronunciation & grammar feedback |

---

## 3. Documentation Index

Explore the detailed documentation files:

| Document | Description |
|---|---|
| [architecture.md](file:///c:/Users/WhiteDuke/Desktop/Projects/minnauz-2.0/docs/architecture.md) | High-level system architecture, service communication, and component interactions |
| [database.md](file:///c:/Users/WhiteDuke/Desktop/Projects/minnauz-2.0/docs/database.md) | PostgreSQL schema, Prisma models, relations, enums, indexes, and constraints |
| [api.md](file:///c:/Users/WhiteDuke/Desktop/Projects/minnauz-2.0/docs/api.md) | Complete REST API contract, endpoints, DTOs, parameters, and responses |
| [authentication.md](file:///c:/Users/WhiteDuke/Desktop/Projects/minnauz-2.0/docs/authentication.md) | Email OTP, Google OAuth, JWT tokens, 3-device session limit, and RBAC |
| [users.md](file:///c:/Users/WhiteDuke/Desktop/Projects/minnauz-2.0/docs/users.md) | User lifecycle, roles (`USER`, `TEACHER`, `ADMIN`, `SUPER_ADMIN`), study statistics & plans |
| [plans.md](file:///c:/Users/WhiteDuke/Desktop/Projects/minnauz-2.0/docs/plans.md) | Free vs. Premium tiers, feature gates, and usage limits |
| [subscriptions.md](file:///c:/Users/WhiteDuke/Desktop/Projects/minnauz-2.0/docs/subscriptions.md) | Subscription billing logic, payment providers (Payme, Click, Uzum), and lifecycle |
| [ai.md](file:///c:/Users/WhiteDuke/Desktop/Projects/minnauz-2.0/docs/ai.md) | AI models, prompt engineering, scenario configuration, and token management |
| [speaking.md](file:///c:/Users/WhiteDuke/Desktop/Projects/minnauz-2.0/docs/speaking.md) | AI Speaking (Kaiwa) request flow, speech-to-text, LLM dialog, feedback, and TTS |
| [courses.md](file:///c:/Users/WhiteDuke/Desktop/Projects/minnauz-2.0/docs/courses.md) | JLPT levels, 5-section lesson methodology (Kotoba, Bunpou, Kanji, Renshuu, Kaiwa), progress tracking |
| [admin.md](file:///c:/Users/WhiteDuke/Desktop/Projects/minnauz-2.0/docs/admin.md) | Admin dashboard, course/lesson CMS, user management, banner manager, notification center |
| [environment.md](file:///c:/Users/WhiteDuke/Desktop/Projects/minnauz-2.0/docs/environment.md) | Environment variables catalog for API and Web services |
| [deployment.md](file:///c:/Users/WhiteDuke/Desktop/Projects/minnauz-2.0/docs/deployment.md) | Deployment guidelines, Docker containers, Nginx reverse proxy, and Prisma migrations |
| [security.md](file:///c:/Users/WhiteDuke/Desktop/Projects/minnauz-2.0/docs/security.md) | Security protocols, authentication guards, data validation, rate limits, and CORS |
| [quality-launch.md](file:///c:/Users/WhiteDuke/Desktop/Projects/minnauz-2.0/docs/quality-launch.md) | Launch-readiness checklist for e2e critical path, accessibility, monitoring, alerting, backup/restore, and security sign-off |
| [decisions.md](file:///c:/Users/WhiteDuke/Desktop/Projects/minnauz-2.0/docs/decisions.md) | Architectural Decision Records (ADRs) and technical rationale |
| [changelog.md](file:///c:/Users/WhiteDuke/Desktop/Projects/minnauz-2.0/docs/changelog.md) | Major release log and architectural changes |

---

## 4. Fundamental Development Rules

### Rule 1: The Documentation is the Source of Truth
Before adding or modifying any database model, API endpoint, authentication flow, or business logic, consult `docs/`. Never introduce conflicting architecture without documented justification.

### Rule 2: Synchronize Changes Immediately
Whenever you alter database schemas, API contracts, user permissions, or system capabilities, you **must update the relevant `docs/` files immediately** in the same change.

### Rule 3: Do Not Duplicate Systems
Before writing a new service, guard, component, or utility, check the existing codebase and documentation. Re-use and extend existing systems wherever possible.

### Rule 4: Zero Exposure of Secrets
Never commit passwords, API keys, JWT secrets, or production credentials to documentation or git. Use template environment variables documented in `environment.md`.

---

## 5. Current Project Status

- **API (`api/`)**: Fully functional NestJS backend with Swagger documentation at `/api/docs`, Prisma ORM connection, OTP authentication with Nodemailer, Google Auth endpoint, Course & 5-section Lesson management, Study Plan and Streak tracking, Notification center, Dynamic Banner manager, and Video upload storage.
- **Web App (`web/`)**: Next.js 15 application with multi-language i18n (`/uz`, `/ru`), Student Dashboard (`/dashboard`), Course Roadmap & 5-tab Lesson Studio (`/dashboard/courses`), Notification inbox (`/dashboard/notifications`), Profile & Study Plan manager, and full-featured Admin Panel (`/admin`).
