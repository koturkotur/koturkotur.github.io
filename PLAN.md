# Portfolio Website Redesign Plan

## Milorad Koturović — Personal Portfolio

**Stack**: Plain HTML / CSS / JavaScript (no frameworks, no build step)
**Theme**: Dark mode default + Light mode toggle, blue accent (`#030ffc`)

---

## 1. Design System & Foundations

### 1.1 Color Tokens (CSS Custom Properties)

```
Dark Theme (default):
  --bg-primary:       #0a0a0a       (page background)
  --bg-surface:       #141414       (card surfaces)
  --bg-elevated:      #1e1e1e       (elevated elements, dropdowns)
  --text-primary:     #f5f5f5       (headings, primary text)
  --text-secondary:   #a0a0a0       (descriptions, muted text)
  --text-tertiary:    #666666       (timestamps, metadata)
  --accent:           #030ffc       (blue accent — active states, links)
  --accent-hover:     #2a35ff       (lighter blue on hover)
  --border:           #2a2a2a       (subtle borders)
  --shadow:           rgba(0,0,0,0.4) (shadow base)
  --pill-bg:          #1e1e1e       (pill labels on cards)
  --pill-shadow:      rgba(0,0,0,0.5)

Light Theme:
  --bg-primary:       #ffffff
  --bg-surface:       #ffffff
  --bg-elevated:      #f5f5f5
  --text-primary:     #111111
  --text-secondary:   #666666
  --text-tertiary:    #999999
  --accent:           #030ffc
  --accent-hover:     #0015e6
  --border:           #e5e5e5
  --shadow:           rgba(0,0,0,0.075)
  --pill-bg:          #ffffff
  --pill-shadow:      rgba(0,0,0,0.25)
```

### 1.2 Typography

- **Primary font**: General Sans (via Fontshare CDN, weights: 400, 500, 600, 700)
- **Fallback stack**: `'General Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- **Scale**:
  - Hero name: 48px (desktop) / 28px (mobile)
  - Section headings: 32px / 24px
  - Card titles: 18px / 16px
  - Body text: 16px / 14px
  - Small/meta: 14px / 12px
- **Line height**: 1.2em (headings), 1.5em (body)
- **Weight**: 500 (Medium) as default UI weight

### 1.3 Spacing & Layout

- **Page max-width**: 1200px (centered)
- **Page padding**: 20px (desktop), 16px (tablet), 12px (mobile)
- **Grid gap**: 16px (desktop), 8px (mobile)
- **Border radius**: 24px (cards), 40px (pills/buttons), 16px (smaller elements)
- **Multi-layer shadow** (signature stack):
  ```css
  box-shadow:
    0px 0.8px 2.4px -0.6px var(--shadow),
    0px 2.4px 7.2px -1.2px var(--shadow),
    0px 6.4px 19px -1.9px var(--shadow),
    0px 20px 60px -2.5px var(--shadow);
  ```

### 1.4 Breakpoints

| Name     | Range            | Grid Cols | Layout Notes                    |
|----------|------------------|-----------|---------------------------------|
| Mobile   | ≤ 767px          | 1 (list)  | List view, hamburger nav        |
| Tablet   | 768px – 1199px   | 2         | Grid view, full nav             |
| Desktop  | 1200px – 1699px  | 3         | Grid view, full nav             |
| XLarge   | ≥ 1700px         | 3         | Wider container (1400px)        |

---

## 2. File Structure

```
project/
├── index.html                    # Main work/portfolio page
├── projects/
│   ├── alluel.html               # Project detail: Alluel
│   ├── philanthropic-agenda.html # Project detail: Philanthropic Agenda
│   ├── prohibition-partners.html # Project detail: Prohibition Partners LIVE
│   ├── stadion-shopping.html     # Project detail: Stadion Shopping Center
│   └── cannabis-oceania.html     # Project detail: Cannabis Oceania
├── css/
│   ├── reset.css                 # CSS reset / normalize
│   ├── tokens.css                # CSS custom properties (colors, spacing, typography)
│   ├── base.css                  # Base element styles, font imports
│   ├── layout.css                # Grid system, page structure, responsive
│   ├── components.css            # Cards, pills, buttons, nav, footer
│   ├── animations.css            # Keyframes, scroll animations, transitions
│   └── project-page.css          # Project detail page specific styles
├── js/
│   ├── theme.js                  # Dark/light theme toggle + persistence
│   ├── filter.js                 # Category filtering logic
│   ├── animations.js             # Scroll-triggered animations (IntersectionObserver)
│   ├── card-hover.js             # Card image swap on hover
│   └── nav.js                    # Mobile menu toggle, sticky nav behavior
├── assets/
│   ├── images/
│   │   ├── projects/             # Project images (placeholder initially)
│   │   │   ├── alluel/
│   │   │   │   ├── cover.webp    # Main card image
│   │   │   │   ├── hover.webp    # Hover reveal image
│   │   │   │   ├── hero.webp     # Project page hero
│   │   │   │   ├── gallery-1.webp
│   │   │   │   ├── gallery-2.webp
│   │   │   │   └── gallery-3.webp
│   │   │   ├── philanthropic-agenda/
│   │   │   ├── prohibition-partners/
│   │   │   ├── stadion-shopping/
│   │   │   └── cannabis-oceania/
│   │   └── icons/                # SVG icons (arrow, menu, theme toggle, etc.)
│   └── fonts/                    # Self-hosted General Sans (optional fallback)
├── PLAN.md                       # This file
└── README.md
```

---

## 3. Component Breakdown

### 3.1 Header / Navigation

**Desktop (≥768px)**: Floating pill-shaped nav bar, fixed at top center
```
┌──────────────────────────────────────────────────────────┐
│  MILORAD KOTUROVIĆ    Work  About  Contact    ☀/🌙      │
└──────────────────────────────────────────────────────────┘
```
- `position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 100`
- Background: `var(--bg-elevated)` with backdrop-filter blur
- Border-radius: 42px
- Multi-layer shadow
- Active page indicated by accent-colored dot/underline
- Theme toggle button (sun/moon icon) on the right
- Entrance animation: fade + slide down with spring easing

**Mobile (<768px)**: Compact header + hamburger menu
```
┌─────────────────────────────────┐
│  MILORAD K.                  ☰  │
└─────────────────────────────────┘
```
- Hamburger opens full-screen overlay menu
- Menu items animate in with staggered slide-from-right
- Theme toggle inside mobile menu

### 3.2 Project Card (Grid View — Tablet/Desktop)

```
┌──────────────────────────────┐
│                              │
│     [pill: Project Name]     │  ← slides in from top on hover
│                              │
│                              │
│      1:1 Square Image        │
│      (cover → hover swap)    │
│                              │
│                              │
│     [pill: Category Tag]     │  ← slides in from bottom on hover
│                              │
└──────────────────────────────┘
```

- **Dimensions**: Fluid within grid column, 1:1 aspect ratio
- **Background**: `var(--bg-surface)`
- **Border-radius**: 24px
- **Shadow**: Multi-layer soft shadow
- **Overflow**: hidden
- **Hover behavior**:
  1. Cover image fades/scales slightly
  2. Hover image fades in on top (opacity transition)
  3. Top pill (project name) slides from `top: -50px` to `top: 16px`
  4. Bottom pill (category) slides from `bottom: -50px` to `bottom: 16px`
  5. Subtle scale transform on the whole card (1.0 → 1.02)
- **Click**: Navigates to project detail page

### 3.3 Project Card (List View — Mobile)

```
┌──────────────────────────────────────────┐
│                                          │
│           Full-width Image               │
│           (16:10 aspect ratio)           │
│                                          │
├──────────────────────────────────────────┤
│  Project Name          [Category Tag]    │
│  Brief description text...               │
│  View project →                          │
└──────────────────────────────────────────┘
```

- Stacked vertically, full-width
- Image on top, text content below
- Category shown as pill/badge
- "View project →" link with hover arrow animation
- Gap between cards: 32px

### 3.4 Category Filter Bar

**Desktop**: Horizontal pill bar below the header area
```
┌─────────────────────────────────────────────────────────┐
│  ● All    Web    Branding    Motion    Print    ...     │
└─────────────────────────────────────────────────────────┘
```
- Sticky position: `position: sticky; top: 80px; z-index: 50`
- Pill-shaped container with same shadow treatment
- Active filter has accent-colored dot indicator
- Click filters cards with fade animation (JS-based, not route-based)
- Horizontal scroll on mobile if categories overflow

**Mobile**: Dropdown accordion
```
┌──────────────────────┐
│  All            ▼    │
├──────────────────────┤
│  All                 │
│  Web                 │
│  Branding            │
│  Motion              │
│  Print               │
│  Advertising         │
└──────────────────────┘
```

### 3.5 Footer

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  Let's work together                                         │
│                                                              │
│  kotur3@outlook.com                                          │
│  linkedin.com/in/milorad-koturovic                           │
│                                                              │
│  ─────────────────────────────────────────────────────────── │
│  © 2025 Milorad Koturović                                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```
- Background: `var(--bg-elevated)`
- Top border-radius: 24px
- "Let's work together" as a large heading
- Email as a clickable `mailto:` link
- LinkedIn as external link
- Copyright at bottom

### 3.6 Project Detail Page Layout

```
┌──────────────────────────────────────────────────────────────┐
│  [← Back to Work]                              [Nav Bar]     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  PROJECT TITLE                                               │
│  ─────────────────────────────────────────                   │
│  Category Tag(s)                                             │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│                    HERO IMAGE                                │
│                    (full-width, 16:9)                         │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  OVERVIEW              │  DETAILS                            │
│  Brief project         │  Client: ...                        │
│  description and       │  Year: ...                          │
│  context paragraph.    │  Services: ...                      │
│                        │  Tools: ...                         │
│                        │  Live URL: ...                      │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  THE CHALLENGE                                               │
│  Paragraph describing the problem/brief...                   │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────┐  ┌────────────┐                              │
│  │  Gallery   │  │  Gallery   │                              │
│  │  Image 1   │  │  Image 2   │                              │
│  └────────────┘  └────────────┘                              │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  THE SOLUTION                                                │
│  Paragraph describing the approach/outcome...                │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────┐                            │
│  │      Full-width Gallery      │                            │
│  │         Image 3              │                            │
│  └──────────────────────────────┘                            │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ← Previous Project        Next Project →                    │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                         FOOTER                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. Animations Specification

### 4.1 Page Entrance (on load)

| Element          | Initial State                    | Final State        | Timing                                    |
|------------------|----------------------------------|--------------------|-------------------------------------------|
| Nav bar          | opacity: 0, y: -20px            | opacity: 1, y: 0   | 0.5s ease-out, delay: 0.1s               |
| Page title       | opacity: 0, y: 30px             | opacity: 1, y: 0   | 0.6s spring, delay: 0.2s                 |
| Filter bar       | opacity: 0, y: 20px             | opacity: 1, y: 0   | 0.5s ease-out, delay: 0.3s               |
| Project cards    | opacity: 0, y: 80px             | opacity: 1, y: 0   | 0.6s spring, stagger: 0.1s per card      |

### 4.2 Scroll Reveal (IntersectionObserver)

- Cards entering viewport: fade up (y: 60px → 0) with 0.5s spring
- Section headings: fade up with slight delay
- Images: fade in with subtle scale (0.95 → 1.0)
- Threshold: 0.15 (trigger when 15% visible)

### 4.3 Card Hover

| Property              | Default          | Hover             | Transition          |
|-----------------------|------------------|-------------------|---------------------|
| Card transform        | scale(1)         | scale(1.02)       | 0.4s cubic-bezier   |
| Cover image opacity   | 1                | 0                 | 0.3s ease           |
| Hover image opacity   | 0                | 1                 | 0.3s ease           |
| Top pill (name)       | top: -50px       | top: 16px         | 0.35s spring        |
| Bottom pill (category)| bottom: -50px    | bottom: 16px      | 0.35s spring        |

### 4.4 Filter Transition

- Cards being filtered out: fade out + scale down (0.8) over 0.3s, then `display: none`
- Cards being filtered in: `display: block`, then fade in + scale up (0.8 → 1.0) over 0.3s
- Stagger: 50ms between each card

### 4.5 Theme Toggle

- Smooth color transitions on all themed properties: `transition: background-color 0.3s, color 0.3s, border-color 0.3s`
- Toggle icon rotates 180° on switch

### 4.6 Page Transitions (Project Detail)

- Navigate to project: content fades out (0.2s), new page fades in (0.3s)
- Since plain HTML (no SPA), use CSS `@view-transition` API where supported, with graceful fallback

---

## 5. Project Data Model

Each project is defined as a data object (stored in a JS file or inline) with this structure:

```javascript
const projects = [
  {
    id: "alluel",
    title: "Alluel",
    slug: "alluel",
    categories: ["branding", "web"],
    description: "Brand identity and website redesign for a New York logistics company specializing in freight, moves, and furniture installations.",
    coverImage: "assets/images/projects/alluel/cover.webp",
    hoverImage: "assets/images/projects/alluel/hover.webp",
    // Detail page content:
    heroImage: "assets/images/projects/alluel/hero.webp",
    client: "Alluel",
    year: "2024",
    services: ["Brand Identity", "Web Design", "Development"],
    tools: ["Figma", "HTML/CSS", "JavaScript"],
    liveUrl: "https://alluel.com",
    challenge: "...",
    solution: "...",
    gallery: [
      "assets/images/projects/alluel/gallery-1.webp",
      "assets/images/projects/alluel/gallery-2.webp",
      "assets/images/projects/alluel/gallery-3.webp"
    ]
  },
  // ... more projects
];
```

---

## 6. Implementation Tasks (for @fixer agents)

### Phase 1: Foundation (Tasks 1-3, can run in parallel)

**Task 1: CSS Foundation**
- Create `css/reset.css` — modern CSS reset
- Create `css/tokens.css` — all CSS custom properties for both themes
- Create `css/base.css` — General Sans font import, base element styles, theme class definitions
- Files: `css/reset.css`, `css/tokens.css`, `css/base.css`

**Task 2: Layout System**
- Create `css/layout.css` — page container, CSS grid for project cards, responsive breakpoints
- Implement 3-col (desktop) → 2-col (tablet) → 1-col list (mobile) responsive grid
- Sticky filter bar positioning
- Fixed nav positioning
- Files: `css/layout.css`

**Task 3: Main HTML Structure**
- Create `index.html` — full page markup with semantic HTML
- Header/nav, filter bar, project grid, footer
- All 5 projects with placeholder content
- Proper meta tags, Open Graph, favicon placeholder
- Link all CSS files
- Files: `index.html`

### Phase 2: Components (Tasks 4-6, can run in parallel)

**Task 4: Component Styles**
- Create `css/components.css` — all component styles:
  - Navigation bar (floating pill, desktop + mobile hamburger)
  - Project cards (grid view + list view)
  - Pill labels (project name, category tags)
  - Filter bar (horizontal pills + mobile dropdown)
  - Footer
  - Theme toggle button
  - Buttons and links
- Multi-layer shadow mixin
- Files: `css/components.css`

**Task 5: Animation System**
- Create `css/animations.css` — all keyframes and transition definitions
- Create `js/animations.js` — IntersectionObserver for scroll-triggered reveals
- Page entrance animations
- Card hover transitions (CSS)
- Filter transition classes
- Scroll reveal system
- Files: `css/animations.css`, `js/animations.js`

**Task 6: Interactive JS**
- Create `js/theme.js` — dark/light toggle with localStorage persistence, system preference detection
- Create `js/filter.js` — category filtering with animated transitions
- Create `js/nav.js` — mobile menu toggle, scroll-based nav behavior
- Create `js/card-hover.js` — image swap on card hover
- Files: `js/theme.js`, `js/filter.js`, `js/nav.js`, `js/card-hover.js`

### Phase 3: Project Pages (Tasks 7-8, can run in parallel)

**Task 7: Project Page Template & Styles**
- Create `css/project-page.css` — project detail page styles
- Create one complete project page as template: `projects/alluel.html`
- Full case study layout: hero, overview/details split, challenge, gallery, solution, prev/next nav
- Responsive design for all breakpoints
- Files: `css/project-page.css`, `projects/alluel.html`

**Task 8: Remaining Project Pages**
- Create `projects/philanthropic-agenda.html`
- Create `projects/prohibition-partners.html`
- Create `projects/stadion-shopping.html`
- Create `projects/cannabis-oceania.html`
- All following the template from Task 7, with project-specific content
- Files: 4 HTML files

### Phase 4: Polish (Tasks 9-10, sequential)

**Task 9: Placeholder Assets & Icons**
- Create SVG icons inline or as files: menu hamburger, close X, arrow right, sun, moon, external link, back arrow
- Generate/source placeholder project images (or create colored gradient placeholders via CSS)
- Ensure all image paths are correct
- Files: `assets/images/icons/`, placeholder image setup

**Task 10: Final Integration & QA**
- Wire everything together
- Test all breakpoints (mobile 375px, tablet 768px, desktop 1200px, xlarge 1700px)
- Test theme toggle persistence
- Test filter functionality
- Test all navigation links
- Verify animations perform well (no jank)
- Add `prefers-reduced-motion` media query support
- Add `prefers-color-scheme` auto-detection
- Performance: lazy loading images, minimal JS
- Accessibility: focus states, ARIA labels, semantic HTML, keyboard navigation

---

## 7. Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Theme** | Dark default + light toggle | User preference; balances contrast and readability |
| **Grid → List responsive** | Grid on desktop/tablet, list on mobile | Matches user's existing mobile design; grid for visual impact on larger screens |
| **Filtering** | Client-side JS (not route-based) | Simpler for plain HTML; instant feedback; no page reloads |
| **Image hover** | 2 images (cover + reveal) | Good balance of visual interest vs. asset management |
| **Animations** | Spring-based, scroll-triggered | Polished motion; uses CSS + minimal JS |
| **Font** | General Sans via Fontshare | Free for commercial use; premium feel |
| **No build step** | Plain HTML/CSS/JS | User preference; simple deployment; no tooling overhead |
| **View Transition API** | Progressive enhancement | Smooth page transitions where supported; graceful fallback |

---

## 8. Deployment Notes

- **Static hosting**: Can be deployed to GitHub Pages, Netlify, Vercel, or any static host
- **No build step required**: Just upload files
- **Image optimization**: Convert all final images to WebP, provide multiple sizes via `srcset`
- **Performance budget**: < 500KB initial load (excluding images), < 3s LCP

---

## 9. Future Enhancements (Out of Scope)

- [ ] Blog/Insight section
- [ ] Contact form (currently just email link)
- [ ] CMS integration for easier project management
- [ ] Image lightbox/modal on project pages
- [ ] Cursor effects (custom cursor on hover)
- [ ] Page transition animations between routes (View Transitions API)
- [ ] Analytics integration
