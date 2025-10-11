# Design Guidelines - Bureau Social

## Design Approach

**Public Site**: Reference-based approach inspired by modern institutional websites like the European Commission portal, UN organizations, and professional associations - emphasizing trust, professionalism, and accessibility.

**Member Portal**: Material Design system for data-heavy applications with clear hierarchy, efficient workflows, and intuitive interactions.

## Core Design Principles

1. **Institutional Credibility**: Professional, trustworthy aesthetic that reflects the organization's social impact mission
2. **Dual Identity**: Distinct but cohesive design language between public site and member portal
3. **Accessibility First**: WCAC AA compliant, clear contrast, readable typography
4. **Progressive Disclosure**: Information revealed strategically without overwhelming users

## Color Palette

### Public Site
- **Primary**: 220 70% 45% (Deep institutional blue - trust and professionalism)
- **Secondary**: 200 60% 35% (Darker blue for depth)
- **Accent**: 25 85% 55% (Warm terracotta for CTAs and highlights - social warmth)
- **Neutrals**: 
  - Background Light: 0 0% 98%
  - Background Dark: 220 15% 12%
  - Text Dark: 220 20% 15%
  - Text Light: 0 0% 95%

### Member Portal
- **Primary**: Same institutional blue for brand consistency
- **Success**: 142 70% 45% (voting approved)
- **Warning**: 45 90% 55% (pending votes)
- **Error**: 0 70% 50% (rejected items)
- **Info**: 200 80% 50% (notifications)

## Typography

**Font Families**:
- Headlines: 'Inter', system-ui - clean, modern, professional
- Body: 'Inter', system-ui - exceptional readability
- Data/Tables: 'JetBrains Mono', monospace - for assembly data and voting results

**Hierarchy**:
- Hero Headlines: text-5xl md:text-6xl lg:text-7xl, font-bold
- Section Headlines: text-3xl md:text-4xl, font-semibold
- Subsections: text-2xl md:text-3xl, font-medium
- Body Large: text-lg md:text-xl
- Body: text-base
- Small/Meta: text-sm
- Micro/Labels: text-xs

## Layout System

**Spacing Units**: Use Tailwind units of 4, 8, 12, 16, 20, 24, 32 for consistency
- Component padding: p-4 md:p-8
- Section spacing: py-16 md:py-24 lg:py-32
- Card spacing: p-6 md:p-8
- Grid gaps: gap-8 md:gap-12

**Breakpoints**:
- Mobile: base (< 768px)
- Tablet: md (768px - 1024px)
- Desktop: lg (1024px+)
- Wide: xl (1280px+)

**Container Strategy**:
- Full-width hero: w-full with max-w-7xl inner container
- Content sections: max-w-6xl mx-auto
- Portal dashboard: max-w-7xl with sidebar layout

## Public Site Components

### Hero Section
- Full-width with subtle gradient overlay (primary to secondary)
- Large hero image showing social impact work or team collaboration
- Centered headline with institutional tagline
- Two CTAs: primary (Associar-se) + secondary outline (Saber Mais)
- Height: min-h-[600px] md:min-h-[700px]

### Navigation
- Sticky header with logo left, nav center, user menu right
- Transparent on hero, solid white/dark bg on scroll
- Dropdown menus for Serviços and Recursos sections
- Mobile: Hamburger menu with slide-out panel

### Content Sections (Public Site)
1. **Missão & Valores** (2-column grid)
   - Icons + headline + description cards
   - Image gallery showing social projects
   
2. **Serviços** (3-column grid on desktop)
   - Service cards with icons, titles, brief descriptions
   - Hover effect: subtle lift and shadow increase
   
3. **Projetos Destacados** (Masonry grid or 2-column)
   - Project cards with images, titles, impact metrics
   - "Ver Todos" link to full project archive
   
4. **Números de Impacto** (4-column stats row)
   - Large numbers with animated count-up
   - Brief labels beneath
   
5. **Testemunhos** (Carousel or 2-column)
   - Quote cards with author photos
   - Organization/role beneath names
   
6. **Parceiros** (Logo grid)
   - Grayscale logos with color on hover
   - 4-6 columns responsive

7. **CTA Final** (Full-width colored section)
   - Centered headline + subtext
   - Primary CTA button
   - Background: accent color with subtle pattern

### Footer
- 4-column grid: About, Links, Contactos, Social
- Newsletter signup form
- Legal links row beneath
- Dark background (background-dark color)

## Member Portal Components

### Dashboard Layout
- Left sidebar navigation (fixed on desktop, slide-out on mobile)
  - Logo at top
  - Nav sections: Dashboard, Assembleias, Votações, Documentos, Perfil
  - Admin section (conditional): Gerir Associados, CMS, Configurações
- Main content area with breadcrumbs
- Top bar: search, notifications bell, user avatar menu

### Dashboard Cards
- Grid layout: 2x2 on desktop, stacked on mobile
- Card types:
  - Próximas Assembleias (calendar icon, date, attendance CTA)
  - Votações Pendentes (ballot icon, count badge, "Votar Agora" button)
  - Documentos Recentes (document list with download icons)
  - Notificações (list with unread indicators)

### Assemblies Interface
- Table view with filters (tipo, status, data)
- Columns: Título, Tipo, Data, Status, Presenças, Ações
- Row actions: Ver Detalhes, Confirmar Presença, Ver Ata
- Detail view: Tabs for Convocatória, Ordem do Dia, Votações, Presenças, Ata
- Status badges: color-coded (agendada=info, em_curso=warning, encerrada=neutral)

### Voting Interface
- Clean, focused layout when voting
- Item title and full description prominently displayed
- Large radio buttons: Aprovar (success), Rejeitar (error), Abstenção (neutral)
- Optional justification textarea
- Confirmation modal before submitting vote
- Results view: Horizontal bar chart with percentages
- Vote breakdown table (if not secret voting)

### Document Management
- Card grid view with thumbnails/icons
- Filters: Tipo, Categoria, Data
- Search bar prominent
- Document cards: thumbnail, title, type badge, date, download button
- Upload area (admin): Drag-and-drop zone with file type indicators

### CMS Editor (Admin)
- Live preview side-by-side with editor
- Section selector dropdown
- Inline editing fields:
  - Text: Rich text editor with formatting toolbar
  - Images: Upload button + crop/resize tools
  - Drag handles for reordering sections
- Save/Publish/Discard buttons sticky at top
- Change history sidebar (optional advanced feature)

## Visual Effects & Interactions

**Minimal Animations** (use sparingly):
- Navigation: smooth color transition on scroll (200ms)
- Cards: subtle hover lift (transform: translateY(-4px), 200ms)
- Buttons: color transition on hover (150ms)
- Modals: fade-in with slight scale (300ms)
- Avoid: parallax, auto-playing carousels, excessive motion

**Focus States**: 
- 2px solid ring in primary color
- Offset by 2px for visibility

**Loading States**:
- Skeleton screens for data loading (gray pulse animation)
- Spinner for actions (primary color, centered)

## Images

### Public Site Images
1. **Hero**: Large inspiring image of team members collaborating or community impact scene (1920x1080, high quality)
2. **Missão section**: 2-3 images showing different aspects of social work
3. **Projetos cards**: One image per project card showing project outcomes
4. **Testemunhos**: Headshot photos of members giving testimonials
5. **Parceiros**: Logo images of partner organizations

### Member Portal Images
- User avatars (circular, 40x40px thumbnails)
- Document thumbnails where applicable
- Placeholder images for missing content

## Accessibility & Dark Mode

- Full dark mode support throughout both public site and portal
- Dark mode toggle in user menu
- Consistent implementation:
  - Background: background-dark color
  - Cards: slightly lighter than background (220 15% 18%)
  - Text: text-light color
  - Borders: subtle (220 15% 25%)
- Form inputs maintain consistency in dark mode
- Ensure 4.5:1 contrast ratio minimum for all text

## Responsive Behavior

**Public Site**:
- Hero: full-width on all devices, text size scales down
- Grids: 3-col → 2-col → 1-col as screen narrows
- Navigation: horizontal → hamburger menu < 768px
- Typography: scale down by 1-2 sizes on mobile

**Member Portal**:
- Sidebar: fixed left → slide-out drawer on mobile
- Tables: horizontal scroll on mobile with sticky first column
- Cards: 2-col → 1-col on mobile
- Forms: single column on mobile, multi-column on desktop