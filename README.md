# Milorad Koturović — Portfolio

A personal portfolio website built with plain HTML/CSS/JS (no frameworks or build tools).

---

## Tech Stack

- **Pure HTML/CSS/JS** — no build tools, no frameworks
- **Fonts**: General Sans from Fontshare CDN
- **Icons**: Custom SVG (inline and assets)
- **Theme**: Dark mode default with light mode toggle
- **Accent Color**: `#030ffc` (blue)

---

## Design System

### Colors
- `--text-primary`: `#f3f4f2` (dark) / `#1a1a1a` (light)
- `--text-secondary`: `#a6a6a6` (dark) / `#666666` (light)
- `--bg-primary`: `#121212` (dark) / `#f3f4f2` (light)
- `--bg-secondary`: `#1a1a1a` (dark) / `#ffffff` (light)
- `--accent`: `#030ffc` (blue)

### Typography
- **Font**: General Sans (400, 500, 600, 700)
- **Headings**: 700 weight, tight tracking
- **Body**: 400 weight, relaxed line-height

### Responsive Breakpoints
- Desktop: 1025px+ (3-column grid)
- Tablet: 768px–1024px (2-column grid)
- Mobile: <768px (1-column list)

---

## Project Structure

```
project/
├── index.html                      # Main work/portfolio page
├── css/
│   ├── reset.css                   # CSS reset (normalize, box-sizing)
│   ├── tokens.css                  # CSS custom properties (colors, spacing, shadows)
│   ├── base.css                    # Font import, base element styles
│   ├── layout.css                  # Grid system, responsive breakpoints, filter bar positioning
│   ├── components.css              # Navigation, cards, filter pills, footer
│   ├── animations.css              # Keyframes, scroll animations, hover transitions
│   └── project-page.css            # Project detail page styles (hero, overview, gallery, prev/next nav)
├── js/
│   ├── theme.js                    # Dark/light toggle with localStorage persistence
│   ├── filter.js                   # Category filtering with scrollable pill bar + drag
│   ├── animations.js               # Animation system (cards reveal on load)
│   ├── card-hover.js               # Card image swap + parallax on hover; mobile centered flip
│   └── nav.js                      # Mobile menu + scroll-based nav hide/show
├── projects/
│   ├── alluel.html                 # Project detail: Alluel
│   ├── philanthropic-agenda.html   # Project detail: Philanthropic Agenda
│   ├── prohibition-partners.html   # Project detail: Prohibition Partners LIVE
│   ├── stadion-shopping.html       # Project detail: Stadion Shopping Center
│   └── cannabis-oceania.html       # Project detail: Cannabis Oceania
└── assets/images/projects/         # Project images (SVG placeholders for now)
    ├── alluel/
    ├── philanthropic-agenda/
    ├── prohibition-partners/
    ├── stadion-shopping/
    └── cannabis-oceania/
```

---

## Features

### Layout
- Floating navigation centered horizontally with logo, nav links (Projects, About, Contact), theme toggle
- Full-width project grid (responsive 3→2→1 column) with consistent edge spacing
- Fixed filter bar at bottom center (Baker Studio style)
- Footer with email, LinkedIn, and copyright

### Project Cards
- 2 images per card: cover (default) + hover reveal
- Parallax effect on hover (images move in opposite directions)
- Category pills slide in on hover
- Mobile: centered card shows hover state + pills (auto-flips every 1s)

### Filter Bar
- **Desktop**: Horizontal pill buttons (All + 6 categories)
- **Mobile**: Same pill bar with horizontal drag/scroll
- **Position**: Fixed at bottom center of viewport
- Categories: Web, Branding, Video Editing, Editorial Design, Poster, Social Media

### Project Detail Pages
- Full case study layout:
  - Hero image (full-width)
  - Overview + Project Details grid
  - Challenge section
  - Gallery (3 full-width images)
  - Solution section
  - Previous/Next project navigation
  - Back to top + back to work links

### Theme System
- Detects system `prefers-color-scheme` on first load
- Respects manual toggle (stored in `localStorage`)
- Smooth transitions on all color properties

### Animations
- Cards fade in on page load (no scroll-based reveal)
- Scroll reveal utilities still available: `.anim-fade-up`, `.anim-fade-in`
- Hover transitions on cards, pills, buttons
- Mobile menu slide animations

---

## How to Run

No build step required — just serve the files:

```bash
# Python 3
python3 -m http.server 8080

# Or open index.html directly in browser
```

Visit `http://localhost:8080`

---

## Build History

### Completed Tasks (from PLAN.md)

1. **CSS Foundation** — reset, tokens (colors/spacing/typography), base styles
2. **Layout System** — responsive grid, container, breakpoints
3. **Main HTML Structure** — index.html with nav, grid, footer
4. **Component Styles** — nav, cards, filter, footer
5. **Animation System** — keyframes, scroll reveals, hover effects
6. **Interactive JS** — theme toggle, filtering, scroll animations, card hover
7. **Project Page Template** — alluel.html + project-page.css
8. **Remaining Project Pages** — 4 additional project HTML files
9. **Placeholder Assets** — 30 SVG images (6 per project: cover, hover, hero, gallery-1/2/3)
10. **Final Integration & QA** — bug fixes for:
    - Color Level 5 CSS syntax → explicit rgba
    - Responsive visibility classes with `!important`
    - Animation system function name mismatch
    - Navigation scroll classes

### Post-Build Changes

- Filter bar moved to fixed bottom center and nudged up for better balance
- Full-width grid layout with matched edge spacing (desktop + mobile)
- Navigation centered horizontally and no longer shrinks on scroll
- Card hover image bleed added to avoid edge cutoffs during parallax
- Hover tag styling adjusted (no dark background on tags)
- Mobile filter bar uses scrollable pill row with drag-to-scroll
- Mobile cards use centered “hover state” (pills + image swap) with fade and 1s auto-flip
- Cards reveal on page load instead of on scroll

---

## TODO

### High Priority
- [ ] **Replace placeholder SVGs with real project images**
  - All 30 SVG placeholders need to be replaced
  - Format: Recommended WebP, or JPG/PNG
  - Structure: 6 images per project (cover.svg, hover.svg, hero.svg, gallery-1.svg, gallery-2.svg, gallery-3.svg)
  - Projects: Alluel, Philanthropic Agenda, Prohibition Partners LIVE, Stadion Shopping Center, Cannabis Oceania

- [ ] **Review project metadata**
  - Verify dates, client names, and roles in each project HTML
  - Check category assignments match actual work

### Medium Priority
- [ ] **Performance optimization**
- Consider image optimization pipeline
- Add `fetchpriority="high"` to hero images

- [ ] **Accessibility audit**
  - Verify all images have descriptive alt text
  - Check color contrast ratios
  - Test keyboard navigation
  - Add skip links if needed

### Low Priority / Nice to Have
- [ ] **Smooth page transitions**
  - Add fade-in/out when navigating between pages

- [ ] **404 page**
  - Create custom 404.html with same styling

- [ ] **Analytics**
  - Add privacy-friendly analytics (Plausible, Fathom, or similar)

- [ ] **Meta tags / SEO**
  - Add Open Graph tags to all pages
  - Add Twitter Card metadata
  - Create favicon set (16x16, 32x32, apple-touch-icon)

- [ ] **Contact form**
  - If needed, integrate Formspree or similar for contact.html

---

## Troubleshooting

### Theme not persisting?
- Check browser isn't in private/incognito mode (localStorage disabled)
- Theme is stored in `localStorage` key `theme`

### Images not showing?
- All images use `.svg` extension currently (placeholders)
- When replacing with real images, ensure paths match exactly

### CSS not updating?
- Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+F5` (Windows)
- Check if browser cache is interfering

---

## Git Notes

- Uses `--no-gpg-sign` flag for commits (GPG signing not configured)
- Main branch is `main`

---

**Last updated**: 2026-02-12
