# Bureau Social - Portal de Associados

## Overview

This project is a comprehensive web application for Instituto Português de Negócios Sociais - Bureau Social. It features a public institutional website and a full-fledged member portal designed to streamline operations and enhance member engagement. Key capabilities include assembly management, an online voting system with proxy delegation, secure document management, a Content Management System (CMS), and robust administrative tools. The project aims to provide a professional online presence and digitalize core institutional processes.

## User Preferences

- Language: Portuguese (Portugal)
- Design: Professional institutional style with Material Design for portal
- Stack: Fullstack JavaScript with TypeScript, React, Express, PostgreSQL (Neon), Drizzle ORM
- Authentication: Replit Auth (OIDC)

## System Architecture

The application employs a full-stack JavaScript/TypeScript architecture with a clear separation of concerns.

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
- **API Endpoints**: Comprehensive set of 19 API endpoints covering authentication, dashboard, assemblies, presences, voting, documents, notifications, CMS, users, and PDF generation/download.
- **Business Logic**: Includes user auto-upsert, duplicate vote/presence prevention, PDF minutes generation, enriched participant data, vote aggregation, and a robust storage layer (`DbStorage` class with 33 methods).

### Database Schema (shared/schema.ts)
The database includes 11 core tables: `users`, `sessions`, `assemblies`, `voting_items`, `votes`, `documents`, `presences`, `notifications`, `cms_content`, `object_entities`, and `proxies` (for vote delegation).

### Key Features
- **Public Website**: Dynamically loaded content for sections like Hero, Mission, Services, Projects, Impact Stats, Contact.
- **Member Portal**: Dashboard, Assembly management (create, view, attendance), Online voting with proxy system, Document repository, User profiles, Real-time notifications, PDF minutes generation/download.
- **Admin Features**: CMS content editor, user management (categories, permissions), assembly creation, document upload, PDF minutes generation (admin/direção), proxy auditing, and system configuration.
- **Authentication Flow**: OIDC with PKCE, user upsertion, session creation.
- **Document Management**: Upload, categorization, and download of documents, utilizing Replit Object Storage.
- **PDF Minutes Generation**: Institutional-branded PDF generation with assembly details, participants, voting results, stored in Object Storage.
- **Proxy/Delegation System**: Members can delegate their vote for specific assemblies. Includes anti-loop validation, vote weighting, visual badges, and admin auditing. Delegators cannot vote directly while a proxy is active.
- **Email Notification System**: Asynchronous email delivery via Resend for new assemblies, available minutes, received proxies, and new documents.
- **Admin User Management**: Interface for listing, searching, filtering, and editing user data including categories, member numbers, and admin/direção permissions.

## External Dependencies

- **Replit Auth**: User authentication (OIDC).
- **PostgreSQL (Neon)**: Primary database.
- **Replit Object Storage**: Stores uploaded documents and PDF minutes.
- **PDFKit**: Generates PDF documents.
- **Resend**: Email service provider for transactional notifications.
- **TanStack Query**: Manages frontend server state.
- **Shadcn/ui**: UI components library.
- **openid-client**: OIDC client library.
- **express-session**: Session management for Express.
- **Drizzle ORM**: ORM for PostgreSQL.
- **Zod**: Schema validation.
- **multer**: Handles `multipart/form-data` for file uploads.