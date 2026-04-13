# Implementation Plan: Backend Foundation (Phase 1)

This plan outlines the steps to initialize the monorepo and scaffold the backend API for the Personal Secretary application.

## 1. Monorepo & Tooling Setup
We will use **Turborepo** with **npm workspaces** to manage the `web`, `mobile`, `api`, and shared packages.

### Proposed Changes
#### [NEW] [turbo.json](file:///c:/Users/BILAL/Desktop/Hr/personal-secretary/turbo.json)
Configure the pipeline for `build`, `lint`, `dev`, and `test`.

#### [NEW] [package.json](file:///c:/Users/BILAL/Desktop/Hr/personal-secretary/package.json)
Root package file with workspace definitions.

---

## 2. Shared Database Package (`packages/db`)
Centralized Prisma client and schema for both the API and Web apps.

### Proposed Changes
#### [NEW] [schema.prisma](file:///c:/Users/BILAL/Desktop/Hr/personal-secretary/packages/db/prisma/schema.prisma)
Define the PostgreSQL schema using the tables identified in [Project_Details.md](file:///C:/Users/BILAL/.gemini/antigravity/brain/74ff8b51-ebf2-4cc4-b643-a34e3e9260e1/Project_Details.md).

---

## 3. API Scaffold (`apps/api`)
Express server with tRPC for typed API endpoints.

### Proposed Changes
#### [NEW] [index.ts](file:///c:/Users/BILAL/Desktop/Hr/personal-secretary/apps/api/src/index.ts)
Main entry point for the Express server.
#### [NEW] [trpc.ts](file:///c:/Users/BILAL/Desktop/Hr/personal-secretary/apps/api/src/trpc.ts)
Initialize tRPC and define the base router.
#### [NEW] [auth.service.ts](file:///c:/Users/BILAL/Desktop/Hr/personal-secretary/apps/api/src/services/auth.service.ts)
JWT signing and verification logic.
#### [NEW] [auth.middleware.ts](file:///c:/Users/BILAL/Desktop/Hr/personal-secretary/apps/api/src/middleware/auth.middleware.ts)
Extract user from headers/cookies and inject into tRPC context.
#### [NEW] [user.ts](file:///c:/Users/BILAL/Desktop/Hr/personal-secretary/apps/api/src/routers/user.ts)
tRPC router for profile management with Zod validation.

---

## 4. Verification Plan

### Automated Tests
- **Prisma Validation**: Run `npx prisma validate` to ensure the schema is correct.
- **tRPC Connectivity**: Run a sample health-check tRPC query from a script.
- **Build Check**: Run `turbo build` from the root to ensure all packages build correctly.

### Manual Verification
1. **Database Migration**: Run `npx prisma migrate dev` and verify table creation in pgAdmin.
2. **API Health Check**: Access `http://localhost:4000/trpc/health` to verify server start.
3. **Authentication Check**: Manually test the auth middleware with a mock JWT.
