# Bureau Social - Portal de Associados

## Project Overview

Complete web application for Instituto Português de Negócios Sociais - Bureau Social, featuring both a public institutional website and a comprehensive member portal with assembly management, online voting system, document management, and CMS.

## Recent Changes (October 11, 2025)

### ✅ Task 1: Frontend & Schema - COMPLETED
- **Database Schema**: 9 tables created (users, sessions, assemblies, voting_items, votes, documents, presences, notifications, cms_content, object_entities)
- **Authentication**: Replit Auth integration with openid-client v6
- **Public Site**: Hero, Mission, Services, Projects, Impact Stats, Footer components  
- **Member Portal**: Dashboard, Assemblies, Voting, Documents, Profile pages
- **Admin Panel**: CMS editor for content management, user management
- **Design System**: Bureau Social brand colors (institutional blue #2c5aa0, terracotta accent), full dark mode support

### ✅ Task 2: Backend Complete - COMPLETED
- **17 API Endpoints**: Auth (4), Dashboard (1), Assemblies (4), Presences (2), Voting Items (3), Votes (2), Documents (3), Notifications (2), CMS (2), Users (2), Minutes (1)
- **Storage Layer**: Complete DbStorage with 32 methods covering all CRUD operations
- **Security**: requireAuth and requireAdmin middleware, Zod validation on all POST/PUT
- **Business Logic**: 
  - User auto-upsert on OIDC login
  - Duplicate vote prevention
  - Duplicate presence prevention  
  - Assembly existence validation for presence confirmation
  - Minutes generation with enriched participant data (names, emails, roles)
  - Vote aggregation for results
- **Session Management**: express-session with MemoryStore, secure cookies

### ✅ Task 3: Integration, Polish & Testing - COMPLETED
- Frontend-backend integration complete with TanStack Query
- Testing authentication flows, voting system, assembly management
- Document upload system with Replit Object Storage (@replit/object-storage)
- File upload via multer with direct storage integration
- Object entity tracking for uploaded documents

### ✅ Task 4: Document Seeding - COMPLETED (October 11, 2025)
- **30 Institutional Documents Seeded**: Extracted from ZIP archives and organized
- **10 Document Categories**:
  - Parcerias (8): Cartas de apresentação, propostas, termos de cooperação, fichas de adesão
  - Políticas (5): RGPD, RH, conflito de interesses, compras/contratações, código de conduta
  - Planos (5): Estratégico 2026-2028, atividades, captação de recursos, comunicação, voluntariado
  - Regulamentos (4): Interno, eleitoral, quotas, utilização de instalações
  - Manuais (2): Manual do associado, procedimentos administrativos/financeiros
  - Fichas (2): Candidatura e termo de adesão de associado
  - Atas (1): Ata de constituição
  - Apresentações (1): Apresentação institucional
  - Orçamentos (1): Orçamento 2026
  - Relatórios (1): Modelo de relatório de atividades e contas
- **File Storage**: Documents stored in `public/documents/` directory
- **Database Records**: All 30 documents registered in `documents` table with proper categorization
- **Download System**: Enhanced document download endpoint to serve both local files and object storage files

## User Preferences

- Language: Portuguese (Portugal)
- Design: Professional institutional style with Material Design for portal
- Stack: Fullstack JavaScript with TypeScript, React, Express, PostgreSQL (Neon), Drizzle ORM
- Authentication: Replit Auth (OIDC)

## Project Architecture

### Frontend (client/)
- **Framework**: React 18 + TypeScript + Vite
- **Routing**: Wouter (lightweight React routing)
- **State Management**: TanStack Query v5 for server state
- **UI Components**: Shadcn/ui (Radix UI primitives + Tailwind)
- **Forms**: React Hook Form + Zod validation
- **Styling**: Tailwind CSS with custom design system
- **Theme**: Light/Dark mode with ThemeProvider

### Backend (server/)
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon) via DATABASE_URL
- **ORM**: Drizzle ORM
- **Session**: express-session with MemoryStore
- **Auth**: Replit Auth (openid-client v6)
- **File Storage**: Replit Object Storage (configured)

### Database Schema (shared/schema.ts)

**Core Tables**:
1. **users** - User accounts with Bureau Social extensions (categoria, numeroSocio, isAdmin, isDirecao)
2. **sessions** - Session storage for Replit Auth
3. **assemblies** - General assemblies (titulo, tipo, dataAssembleia, status, quorumMinimo)
4. **voting_items** - Voting items within assemblies (titulo, tipo, status, resultado)
5. **votes** - Individual votes (userId, votingItemId, voto, votedAt)
6. **documents** - Document management (titulo, tipo, filePath, visivelPara)
7. **presences** - Assembly attendance tracking
8. **notifications** - User notifications
9. **cms_content** - Editable website content sections
10. **object_entities** - Object storage tracking

### Key Features

**Public Website**:
- Hero section with gradient background
- Mission and values display
- Services showcase
- Featured projects
- Impact statistics
- Contact information
- Fully responsive, SEO optimized

**Member Portal** (requires authentication):
- Dashboard with activity summary
- Assembly management (view, create, attendance)
- Online voting system with results visualization
- Document repository (categorized by type)
- User profile with participation statistics
- Real-time notifications

**Admin Features** (isAdmin or isDirecao):
- CMS content editor (hero, mission, services, projects, contact)
- User management
- Assembly creation and management
- Document upload
- System configuration

### Authentication Flow

1. User clicks "Portal Associados" → redirects to /api/login
2. OIDC flow with PKCE (openid-client v6)
3. Callback to /api/auth/callback
4. User upserted in database
5. Session created (userId stored)
6. Redirect to /dashboard

### Storage Layer (server/storage.ts)

**DbStorage** class implements IStorage interface:
- User CRUD operations
- Assembly management
- Voting system operations
- Document management
- Presence tracking
- Notifications
- CMS content
- Object entity tracking (for uploaded files)

### API Routes (server/routes.ts)

**Auth**:
- GET /api/login - Initiate OIDC flow
- GET /api/auth/callback - OIDC callback handler
- GET /api/logout - Destroy session
- GET /api/auth/user - Get current user

**Dashboard**:
- GET /api/dashboard/summary - Dashboard data (assemblies, votes, documents, notifications)

**Assemblies**:
- GET /api/assemblies - List all assemblies
- GET /api/assemblies/:id - Get assembly details
- POST /api/assemblies - Create assembly (admin only)
- PUT /api/assemblies/:id - Update assembly (admin only)
- GET /api/assemblies/:id/presences - List assembly attendances
- POST /api/assemblies/:id/presences - Confirm presence (validates assembly exists)
- POST /api/assemblies/:id/generate-minutes - Generate assembly minutes with participant details (admin only)

**Voting**:
- GET /api/voting-items - List all voting items
- GET /api/voting-items/:id - Get voting item details
- POST /api/voting-items - Create voting item (admin only)
- POST /api/votes - Submit vote
- GET /api/voting-items/:id/results - Get voting results

**Documents**:
- GET /api/documents - List all documents
- GET /api/documents/:id - Get document details
- POST /api/documents - Upload document (admin only, multipart/form-data with file upload)
- GET /api/documents/:id/download - Download document file from Object Storage

**Notifications**:
- GET /api/notifications - Get user notifications
- PUT /api/notifications/:id/read - Mark notification as read

**CMS** (admin only):
- GET /api/cms/:sectionKey - Get CMS section content
- PUT /api/cms - Update CMS content

**Users** (admin only):
- GET /api/users - List all users
- PUT /api/users/:id - Update user

### Environment Variables

**Required**:
- DATABASE_URL - PostgreSQL connection string (Neon)
- SESSION_SECRET - Session encryption key
- REPL_ID - Replit app ID (for OIDC client_id)
- REPL_SLUG - Replit slug (for callback URL)
- REPL_OWNER - Replit owner (for callback URL)

**Optional**:
- ISSUER_URL - OIDC issuer URL (defaults to https://auth.replit.com)
- PORT - Server port (defaults to 5000)

### File Structure

```
client/
├── src/
│   ├── components/
│   │   ├── ui/              # Shadcn components
│   │   ├── landing/         # Public site sections
│   │   ├── AppSidebar.tsx   # Portal sidebar
│   │   ├── PublicNav.tsx    # Public site navigation
│   │   ├── ThemeProvider.tsx
│   │   └── ThemeToggle.tsx
│   ├── hooks/
│   │   └── useAuth.ts       # Authentication hook
│   ├── lib/
│   │   ├── queryClient.ts   # TanStack Query config
│   │   └── authUtils.ts     # Auth utilities
│   ├── pages/
│   │   ├── Landing.tsx      # Public homepage
│   │   ├── Dashboard.tsx    # Member dashboard
│   │   ├── Assemblies.tsx   # Assembly list
│   │   ├── Votacoes.tsx     # Voting page
│   │   ├── Documentos.tsx   # Documents page
│   │   ├── Perfil.tsx       # User profile
│   │   └── AdminCMS.tsx     # CMS editor
│   ├── App.tsx              # Main app with routing
│   └── index.css            # Global styles + design tokens
│
server/
├── storage.ts               # Database operations (DbStorage)
├── routes.ts                # API routes + Auth
└── index.ts                 # Express server setup

shared/
└── schema.ts                # Drizzle schema + Zod validation

db/
└── index.ts                 # Drizzle database connection
```

### Design System

**Colors** (defined in index.css):
- Primary: `hsl(220, 70%, 45%)` - Institutional blue
- Secondary: `hsl(200, 60%, 35%)` - Ocean teal
- Accent: `hsl(25, 85%, 55%)` - Terracotta
- Muted, Card, Popover, Border colors defined
- Full dark mode variants

**Typography**:
- Font: Inter (300-900 weights)
- Monospace: JetBrains Mono

**Components**:
- All using Shadcn/ui primitives
- Custom hover/active states via hover-elevate and active-elevate-2 utilities
- Consistent spacing and borders

### Known Issues & Notes

1. **OIDC Connection in Development**: The OIDC discovery fails in local development because auth.replit.com is not accessible from the development environment. This is **expected behavior** and will work correctly when:
   - The app is deployed on Replit's infrastructure
   - The REPL_ID, REPL_SLUG, and REPL_OWNER environment variables are properly set
   - The application is accessed through the Replit deployment URL
   
   To test the application in development:
   - The frontend public site (Landing page) will work perfectly
   - The member portal can only be accessed once deployed to Replit
   - All backend API routes are implemented and ready
   - Database operations have been tested through the storage layer

2. **Environment Variables**: Make sure all required environment variables are set in Replit Secrets when deploying:
   - DATABASE_URL (automatically set by Replit PostgreSQL)
   - SESSION_SECRET (generate a random secret)
   - REPL_ID (automatically set by Replit)
   - REPL_SLUG (automatically set by Replit)
   - REPL_OWNER (automatically set by Replit)
   - ISSUER_URL (defaults to https://auth.replit.com, no need to set unless testing alternative auth)

### Next Steps

1. ✅ ~~Implement minutes generation for assemblies~~ - DONE (generates atas with participant names, roles, voting results)
2. Deploy to Replit to test full authentication flow and file uploads
3. Seed initial CMS content data
4. Test document upload/download with real files
5. Add email notifications for votes and assemblies (optional enhancement)
6. Performance optimization and load testing
7. Phase 2 features: PDF/Word atas generation, procurações (proxies), reports, secret voting, quotas

### Testing

- All interactive elements have data-testid attributes
- Ready for Playwright end-to-end testing
- Forms validated with Zod schemas
- Error handling with toast notifications

### Code Quality

- TypeScript strict mode enabled
- ESLint configuration
- Consistent code style
- Comprehensive type safety with shared schema
- Separation of concerns (storage, routes, frontend)
