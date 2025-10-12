# Bureau Social - Portal de Associados

## Overview

This project is a complete web application for Instituto Português de Negócios Sociais - Bureau Social. It features a public institutional website and a comprehensive member portal. The member portal includes functionalities for assembly management, an online voting system, document management, and a Content Management System (CMS). The project aims to streamline the institution's operations, enhance member engagement through digital tools, and provide a professional online presence.

## User Preferences

- Language: Portuguese (Portugal)
- Design: Professional institutional style with Material Design for portal
- Stack: Fullstack JavaScript with TypeScript, React, Express, PostgreSQL (Neon), Drizzle ORM
- Authentication: Replit Auth (OIDC)

## System Architecture

The application is built with a clear separation of concerns, utilizing a full-stack JavaScript/TypeScript architecture.

### Frontend (client/)
- **Framework**: React 18 + TypeScript + Vite
- **Routing**: Wouter
- **State Management**: TanStack Query v5
- **UI Components**: Shadcn/ui (Radix UI primitives + Tailwind)
- **Forms**: React Hook Form + Zod validation
- **Styling**: Tailwind CSS with a custom design system, including full dark mode support.
- **Theme**: Light/Dark mode with ThemeProvider.
- **Design System**: Bureau Social brand colors (institutional blue #2c5aa0, terracotta accent) with consistent typography (Inter font) and component styling.

### Backend (server/)
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle ORM
- **Session Management**: `express-session` with MemoryStore and secure cookies.
- **Authentication**: Replit Auth using `openid-client v6` with `requireAuth`, `requireAdmin`, and `requireAdminOrDirecao` middleware.
- **File Storage**: Replit Object Storage integrated for document uploads via `multer` and PDF storage.
- **PDF Generation**: PDFKit library for generating assembly minutes with institutional branding.
- **API Endpoints**: Comprehensive set of 19 API endpoints covering authentication, dashboard, assemblies, presences, voting items, votes, documents, notifications, CMS, users, PDF minutes generation, and PDF download.
- **Business Logic**: Includes user auto-upsert on OIDC login, duplicate vote/presence prevention, assembly existence validation, PDF minutes generation with institutional template, enriched participant data with roles, vote aggregation, and PDF storage in Object Storage.
- **Storage Layer**: A `DbStorage` class implements an `IStorage` interface with 33 methods for all CRUD operations across core entities.

### Database Schema (shared/schema.ts)
The database comprises 10 core tables:
- **users**: User accounts with Bureau Social-specific extensions (e.g., `isAdmin`, `isDirecao`).
- **sessions**: Stores user session data.
- **assemblies**: Manages general assembly details.
- **voting_items**: Defines items for voting within assemblies.
- **votes**: Records individual votes.
- **documents**: Manages institutional documents with categorization and access control.
- **presences**: Tracks attendance at assemblies.
- **notifications**: Handles user notifications.
- **cms_content**: Stores editable content for website sections.
- **object_entities**: Tracks files stored in Replit Object Storage.

### Key Features
- **Public Website**: Hero, Mission, Services, Projects, Impact Stats, Contact, Footer sections, all dynamically loaded from CMS.
- **Member Portal**: Dashboard, Assembly management (view, create, attendance), Online voting with results, Document repository (categorized), User profile, Real-time notifications, PDF minutes generation and download.
- **Admin Features**: CMS content editor, user management, assembly creation, document upload, PDF minutes generation (admin/direção), and system configuration.
- **Authentication Flow**: OIDC with PKCE, user upsertion, session creation, and redirection to dashboard.
- **Document Management**: Upload, categorization, and download of documents, supporting both local and object storage files.
- **PDF Minutes Generation**: Institutional-branded PDF generation with assembly details, participants (with roles), voting items, and results. Stored in Object Storage with download functionality.
- **CMS Content Seeding**: Pre-populated content for landing page sections with robust fallbacks.

## External Dependencies

- **Replit Auth**: Used for user authentication (OIDC).
- **PostgreSQL (Neon)**: The primary database for all application data.
- **Replit Object Storage**: Utilized for storing uploaded documents and PDF minutes.
- **PDFKit**: Library for generating PDF documents (assembly minutes).
- **TanStack Query**: Manages server state in the frontend.
- **Shadcn/ui**: Provides UI components based on Radix UI primitives and Tailwind CSS.
- **openid-client**: OIDC client library for authentication flows.
- **express-session**: Middleware for session management in Express.
- **Drizzle ORM**: ORM for interacting with the PostgreSQL database.
- **Zod**: Schema validation library used for API requests and forms.
- **multer**: Middleware for handling `multipart/form-data`, primarily for file uploads.

## Testing & Quality Assurance

### E2E Test Coverage (October 2025)
Comprehensive end-to-end testing completed using Playwright:

1. **Authentication & Dashboard** ✅
   - OIDC login flow with Replit Auth
   - Dashboard navigation and admin verification
   - User auto-upsert on first login

2. **Assemblies Module** ✅
   - Assembly creation flow (bug fixed: date conversion)
   - Assembly listing and visualization
   - Navigation to voting items

3. **Voting System** ✅
   - Voting items visualization
   - Vote counting and results display
   - Integration with assemblies

4. **Document Management** ✅
   - Document listing (30 seeded documents)
   - Download functionality
   - Admin-only upload restrictions

5. **User Profile** ✅
   - Profile information display
   - Category badges (Fundador, Efetivo, Contribuinte)
   - Participation statistics

### Bug Fixes Applied
- **Date Conversion Bug** (NovaAssembleia.tsx): Changed from `.toISOString()` to `new Date()` for proper backend schema compatibility
- **Testability Improvements**: Added comprehensive data-testid attributes across all pages

### Production Readiness
- All critical user flows tested and verified
- No security concerns identified
- Performance validated
- PDF generation and download validated (2556 bytes, correct headers)
- Ready for deployment

## Recent Updates (October 12, 2025)

### PDF Minutes Generation - COMPLETED ✅
**Implementation Details:**
1. **Backend (server/pdfGenerator.ts)**:
   - `generateAssemblyMinutesPDF()` function with institutional Bureau Social branding
   - Header with institutional blue (#2c5aa0)
   - Content includes: assembly title, date/time, location, participants with roles (Direção, Fundador, etc.), voting items with results
   - Returns Buffer for upload to Object Storage

2. **API Endpoints (server/routes.ts)**:
   - `POST /api/assemblies/:id/generate-minutes` (requireAdminOrDirecao middleware)
     - Generates PDF, uploads to Object Storage (PRIVATE_OBJECT_DIR/atas/), creates document record, sets ataGerada=true
   - `GET /api/assemblies/:id/download-minutes` (requireAuth)
     - Downloads PDF from Object Storage with proper Content-Type and Content-Disposition headers

3. **Middleware**:
   - `requireAdminOrDirecao`: Allows both admin (isAdmin=true) OR direção (isDirecao=true) users to generate minutes

4. **Storage Enhancement**:
   - Added `getDocumentsByAssembly(assemblyId: number): Promise<Document[]>` to IStorage interface and DbStorage implementation
   - Used to fetch minutes document for download

5. **Frontend (client/src/pages/Assemblies.tsx)**:
   - "Gerar Ata" button (visible for admin/direção on encerradas assemblies without ata)
   - "Download Ata" button (visible for all users on assemblies with ata)
   - "Ata Disponível" badge when ataGerada=true
   - Mutation with proper error handling and cache invalidation

**Testing:**
- E2E test passed: PDF generation and download working (2556 bytes, status 200)
- Headers validated: Content-Type: application/pdf, Content-Disposition with proper filename
- UI validated: Badges and buttons appear correctly based on permissions and assembly state

**Bug Fixes:**
1. Fixed apiRequest call signature: changed from (url, method, data) to (method, url, data)
2. Fixed PDF download buffer handling: proper destructuring [fileBytes] = result.value
3. Added missing getDocumentsByAssembly storage method