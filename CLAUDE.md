# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

This repo contains a single app in [`modal-clone`](./modal-clone) — a React/Vite marketing site (a clone of fello.agency, currently branded "QuantEdgeDataSolutions"). All commands below are run from `modal-clone/`. There is no root-level app; older files at the repo root (`index.html`, `src/`, `package.json`) are legacy/deleted and superseded by `modal-clone/`.

## Commands

```bash
cd modal-clone
npm install
npm run dev       # vite dev server on http://localhost:5173 (auto-opens)
npm run build     # production build to modal-clone/dist
npm run preview   # preview the production build
```

There is no lint or test setup configured in this project.

## Architecture

**Stack:** React 18 + React Router 7 (`BrowserRouter`), Vite, GSAP (`ScrollTrigger`, `SplitText`, `@gsap/react`'s `useGSAP`) for scroll/entrance animation, and Lenis for smooth scrolling.

**App shell (`src/App.jsx`):** wraps everything in `BrowserRouter` → `TransitionProvider` → `ReactLenis` (`autoRaf: true`) → `LenisScrollSync` + `Navbar` / `AppRoutes` / `Footer`. Routes live in `src/routes/AppRoutes.jsx`: `/`, `/about`, `/contact`, `/services/:slug`, `/career`, plus `/terms` and `/privacy` via a generic `SimplePage`.

**Page transitions:** `src/providers/TransitionProvider.jsx` implements a custom route-transition animation (a grid of full-height blocks that wipes in/out with GSAP, revealing a `SplitText`-animated `{BRAND}.` heading) instead of relying on router-level transitions. Any in-app navigation link should use `src/components/TransitionLink.jsx` (wraps `react-router-dom`'s `Link`) rather than `Link` directly, so it calls `usePageTransition().transitionTo(to)` and preventDefaults the normal navigation. Plain `Link`/`navigate` is only used where no visual transition is wanted (e.g. `ServicePage`'s `Navigate` redirect for unknown slugs).

**GSAP setup:** `src/lib/gsap.js` is the single place plugins are registered (`useGSAP`, `ScrollTrigger`) and should be imported from (`import { gsap, useGSAP, ScrollTrigger } from '../lib/gsap'`) rather than importing `gsap` directly elsewhere. `TransitionProvider` separately registers `CustomEase`/`SplitText` and defines the `'hop'` custom ease used across transition/scroll animations. `LenisScrollSync` bridges Lenis scroll events into `ScrollTrigger.update()` so pinned/scrubbed ScrollTrigger animations stay in sync with Lenis's smooth scroll.

**Content/data separation:** All copy, nav structure, and service definitions live under `src/data/*.js` (`brand.js`, `nav.js`, `home.js`, `about.js`, `contact.js`, `footer.js`, `services.js`) and are re-exported from `src/data/index.js`. Sections/pages import data from `'../data'` rather than hardcoding copy — follow this pattern when adding or editing content instead of inlining strings in JSX.

**Sections vs. pages:** `src/pages/*` compose a route's `<main>` from one or more section components. Sections are split by scope under `src/sections/home/`, `src/sections/services/`, and `src/sections/shared/` (e.g. `Contact` and `Faqs` are shared). `ServicePage.jsx` looks up `SERVICE_PAGES[slug]` from `data/services.js` and renders a dedicated layout per known slug (`digital-growth`, `data-solutions`, `web-software-development`). Unknown slugs redirect to `/`.

**Styling:** No CSS modules/Tailwind — plain CSS imported once via `src/index.css` → `src/styles/index.css`, which `@import`s each stylesheet in cascade order (`tokens.css` → `base.css` → `forms.css` → `transition.css` → `nav.css` → `home.css` → `about.css` → `contact-page.css` → `career.css` → `service.css` → `admin.css` → `footer.css` → `responsive.css`, with `responsive.css` last so its media queries win). Design tokens (colors, fonts, site max-width/gutters) are CSS custom properties in `styles/tokens.css` — reuse `var(--...)` tokens rather than hardcoding colors/spacing. Class names are global and matched by section (e.g. `.hero`, `.faq-section`, `.ws-hero`), so keep new section styles scoped by a distinct root class to avoid collisions.

**Scroll-reveal pattern:** `src/components/Reveal.jsx` + `src/hooks/useInView.js` provide a lightweight, non-GSAP fade/slide-in-on-scroll wrapper (IntersectionObserver-based, toggles an `in` class) used for simpler reveal effects; more complex pinned/scrubbed sequences (e.g. `WhatWeDo`) use `useGSAP`/`ScrollTrigger` with `gsap.matchMedia()` to branch behavior at `901px`/`900px` breakpoints (desktop pin-and-scrub sequence vs. a simpler mobile version).

**Static assets:** images/video referenced from data or JSX (e.g. `heroImage` in `services.js`, hero video, about/contact images) live in `public/assets/` and are referenced by absolute path (`/assets/...`), not imported as modules.
