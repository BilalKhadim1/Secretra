# Project Master Guide: Personal Secretary

This document is the "Source of Truth" for the Personal Secretary project. It is designed to provide full context to any LLM session to avoid redundant explanations about the stack, progress, or architecture.

---

## 1. Core Technology Stack

### Backend
- **Runtime**: Node.js v22.14.0 (Native `fetch` available)
- **Framework**: Express.js
- **API Protocol**: **tRPC** (End-to-end type safety)
- **ORM**: Prisma (using stable version v6.x)
- **Job Queue**: BullMQ + ioredis (for background tasks & reminders)
- **Security**: `helmet`, `cors`, `bcryptjs`, `jsonwebtoken`
- **Logging**: `morgan` (request logging)

### Database
- **Engine**: PostgreSQL (AWS RDS)
- **Key Extensions**: `uuid-ossp`, `pg_trgm` (fuzzy search), `pgvector` (future AI search)
- **Migrations**: Pre-applied SQL DDL; Prisma managed moving forward.

### Frontend (Upcoming)
- **Web**: Next.js 14 (App Router), Tailwind CSS, shadcn/ui
- **Mobile**: Expo (React Native), NativeWind v4

---

## 2. Progress Checklist

### ✅ Completed Milestones
- [x] **Project Analysis**: Extracted and analyzed requirements from `hr.docx` and `PersonalSecretaryApp.docx`.
- [x] **Database Design**: Generated full PostgreSQL DDL for 11 core tables.
- [x] **Consolidated Documentation**: Created `Project_Details.md` as a technical blueprint.
- [x] **Monorepo Initialization**: Set up **Turborepo** with npm workspaces.
- [x] **Backend Scaffolding**: Structured `apps/api` (Express/tRPC) and `packages/db` (Prisma).
- [x] **Dependency Finalization**: Added industry-standard packages and resolved all IDE module errors.

### 🚀 Upcoming Tasks
- [ ] **Authentication**: JWT-based login for mobile and NextAuth for web.
- [ ] **User Profile**: CRUD for user settings and preferences.
- [ ] **Calendar Integration**: Google Calendar OAuth and event sync.
- [ ] **Task Management**: Fractional indexing for drag-and-drop support.
- [ ] **AI Features**: Claude API integration for drafting and summaries.

---

## 3. Architecture & MVC Mapping

The project follows a **Modified MVC Pattern** where components are separated into packages for better type-safety and scalability:

| Layer | Monorepo Location | Role |
| :--- | :--- | :--- |
| **Model** | `packages/db` | Prisma schema, Entity definitions, database connection. |
| **Controller** | `apps/api` | tRPC procedures, Business logic, Auth services, Job workers. |
| **View (Web)** | `apps/web` | UI components, Client-side state (Zustand/TanStack). |
| **View (Mobile)** | `apps/mobile` | Native screens, Biometric auth, Push notifications. |

---

## 4. Key Architectural Decisions
- **tRPC vs Axios**: tRPC is used for the internal Web/Mobile-to-API communication to provide compile-time type safety. Axios or native `fetch` is used only for external API calls (Google, Anthropic).
- **Fractional Indexing**: Used in the `tasks` table to allow real-time drag-and-drop reordering without bulk database updates.
- **Background Jobs**: All scheduled tasks (Daily Digest, Reminders) are offloaded to **BullMQ** to ensure they survive server restarts and scale independently.

---

## 5. Instructions for Future LLM Sessions
- **Root Directory**: `c:\Users\BILAL\Desktop\Hr\personal-secretary`
- **Primary Configuration**: `package.json` (root), `turbo.json`, `packages/db/prisma/schema.prisma`.
- **Always Verify**: If missing modules appear in the IDE, run `npm install` and `npx prisma generate` in their respective packages.
