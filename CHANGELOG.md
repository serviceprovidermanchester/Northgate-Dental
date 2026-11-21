# Changelog — Northgate Dental

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] — 2026-11-10

### Added
- Initial concept website release by **SPManchester Private Limited**
- Mobile-first, fully responsive single-page design (360px → desktop)
- Sticky navigation with anchor links: Our Approach, Treatments, Reviews, FAQ, Book
- Hero section with headline, Problem → Solution CTAs and four key statistics
- Problem → Solution storytelling section (`#story`) with benefit bullet lists
- Six treatment cards with transparent published fees and plain-language descriptions:
  - Check-up & hygiene (from £58)
  - Teeth whitening (from £349)
  - Invisalign® aligners (from £2,495)
  - Implants & crowns (from £1,150)
  - Children's dentistry (Free*)
  - Emergency care (from £75)
- Fully working appointment-request form (seven fields with native HTML validation):
  - Full name (text, required)
  - Phone (tel, required)
  - Treatment (select with fees shown, required)
  - Preferred clinician (select, required)
  - Preferred date (date, min=today, required)
  - Preferred time slot (select with labels, required)
  - Notes (textarea, optional)
- Instant on-screen confirmation panel with unique `NGD-XXXXX` booking reference
- Animated slide-down confirmation reveal with ARIA `role="status"` live region
- Date formatter: displays full weekday + date in confirmation (e.g. "Thursday, 15 January 2026")
- Auto-sets date input minimum to today
- Three sample patient reviews (clearly labelled as fictional sample content)
- Six-question FAQ section using native `<details>/<summary>` (fully JS-free)
- Local SEO: single H1, meta description, Open Graph tags, location keywords in headings
- Custom `select` dropdown arrow via inline SVG background-image
- CSS custom property design token system (trivial to rebrand for a real client)
- Demo banner clearly labelling the project as a concept (removes easily for live build)
- Professional section-label pills above each section heading
- Hover animations on treatment cards and review cards
- Zero external dependencies — opens from disk or any static host
- Professional footer with three-column layout (brand, navigation, contact)

### Documentation Added
- `PRD.md` — Product Requirements Document (market problem, personas, 8 functional requirements with acceptance criteria, KPIs, scope, roadmap)
- `TRD.md` — Technical Requirements Document (exact interactive logic, data model, 8 test cases, production API contract, integrations)
- `README.md` — Comprehensive pitch + run instructions
- `PROJECT-DETAILS.md` — Full project brief, portfolio entry text and LinkedIn draft
- `LICENSE` — MIT Licence, © 2026 SPManchester Private Limited
- `CONTRIBUTING.md` — Contribution guidelines and commit conventions
- `CODE_OF_CONDUCT.md` — Community standards
- `SECURITY.md` — Vulnerability reporting policy
- `CHANGELOG.md` — This file
- `.gitignore` — Standard ignore rules
- `.env.example` — Live-build environment variable reference
- `docs/API.md` — Live-build API contract (future integration reference)
- `docs/ACCESSIBILITY.md` — WCAG 2.2 AA compliance notes and testing checklist
- `.github/ISSUE_TEMPLATE/bug_report.md` — Bug report template
- `.github/ISSUE_TEMPLATE/feature_request.md` — Feature request template
- `.github/PULL_REQUEST_TEMPLATE.md` — PR checklist template

### Known Limitations (Accepted — see TRD §14)
- CSS-based visual placeholders (no real photography — Backlog Priority 1)
- Confirmations are simulated; no backend storage or transmission
- User input echoed without sanitisation (demo-only — flagged for live build, see TRD §7/S3)
- Static time slots (no real diary availability)
- Mobile nav collapses without hamburger menu (hamburger planned for v1.1)

---

## [Unreleased] — Visual Upgrade

### Planned (Backlog Priority 1 — from Ali's review, 10 November 2026)
- Real photography / licensed imagery replacing CSS gradient placeholders
- Premium hero treatment with animation-on-scroll
- Distinctive typography system (custom font pairing)
- Hamburger / drawer mobile navigation
- Additional screenshots (mobile viewport + key-feature states)

---

*SPManchester Private Limited — [spmanchester.com](https://spmanchester.com/) — Manchester, UK*
