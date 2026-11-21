# Technical Requirements Document (TRD) — Northgate Dental

| Field | Detail |
|---|---|
| Project | **Northgate Dental** — Family & cosmetic dentistry in Didsbury, Manchester |
| Document | Technical Requirements Document (TRD) |
| Version | 1.0 (first issue, alongside the built concept website) |
| Date | 10 November 2026 |
| Prepared by | SPManchester — Web Design & Development (https://spmanchester.com/) |
| Portfolio service | 01 · Web Design & Development (project folder `spm-web-dental-clinic`) |
| Status | Concept / demo project — approved for portfolio, GitHub and client-pitch use |
| Companion documents | Product Requirements Document (PRD.md) — what it must do and why; PROJECT-DETAILS.md — pitch, portfolio entry and LinkedIn draft; README.md — how to run |

> **Concept notice:** Northgate Dental is a **fictional business** created by SPManchester as a portfolio
> concept project. Names, prices, reviews and figures are illustrative samples, chosen to be
> realistic for the Manchester market. Nothing in this document claims a real client engagement.


## 1. Purpose & current state
This TRD describes the website **as actually built** in this folder (verified by code
inspection on 10 November 2026), the standards it must keep, and the technical path to a live,
integrated production version. Where the demo deliberately simulates behaviour (no backend,
no storage), this document says so plainly.

**As-built file inventory**
| File | Role |
|---|---|
| `index.html` | Page structure and all content (semantic HTML5) |
| `styles.css` | All styling — CSS custom properties, grid/flex layouts, media queries, mobile-first |
| `script.js` | All interactivity — vanilla JavaScript, no libraries, no build step |
| `README.md` | Pitch and run instructions |
| `PROJECT-DETAILS.md` | Problem/solution, portfolio entry text, LinkedIn draft |
| `PRD.md` | Product Requirements Document (companion) |
| `TRD.md` | This document |
| `screenshots/` | Preview image(s) of the finished design |

## 2. Architecture (as built)
```
Browser (any modern device)
└── Single static page — no server, no database, no build step
    ├── index.html ──► styles.css (presentation)
    └── script.js  ──► in-page data objects + DOM rendering
                       form handlers ──► in-page confirmation (no network call)
```
- **Pattern:** static single-page site; content sections in HTML; data-driven widgets rendered
  by JavaScript from in-file data structures; form submissions intercepted client-side.
- **Hosting:** any static host (GitHub Pages, Netlify, ordinary web hosting) or opened
  directly from disk. HTTPS required in production.
- **External calls:** none. The page makes zero network requests beyond its own three files.

## 3. Technology stack
| Layer | Choice (as built) | Constraint |
|---|---|---|
| Markup | HTML5, semantic elements, one H1, meta description | No frameworks |
| Styling | CSS3 — custom properties (design tokens), grid & flexbox, media queries | Single stylesheet; mobile-first |
| Behaviour | Vanilla JavaScript (ES6) | Zero dependencies; must pass `node --check` |
| Data | In-file JS objects/arrays + HTML option values (see §5) | No database, no localStorage, no cookies |
| Assets | CSS gradients / styled placeholders | No external images in the demo (see §14) |

## 4. Component breakdown
| Component | Implementation |
|---|---|
| Sticky navigation | HTML + CSS; anchor links to #story, #treatments, #book, #reviews, #faq |
| Story section (#story) | Static HTML — Problem → Solution pitch narrative |
| Interactive feature | Appointment-request form: pick treatment, clinician, date & time slot and get an instant confirmation with a booking reference (client-side demo). |
| Request form(s) | Fields: name (text, required); phone (tel, required); treatment (select, required); clinician (select, required); date (date, required); time (select — time slot, required); notes (textarea, optional) |
| Form handling | window.bookDental(fd) → showResult('dental-result', …) with refCode('NGD') |
| Confirmation system | Shared helpers `showResult(id, html)` (inject HTML, add `.show`, smooth-scroll into view) and `refCode(prefix)` (prefix + '-' + 5 random base-36 chars, upper-cased) |
| Reviews/content sections | Static HTML, sample content labelled per the PRD |

### 4.1 Interactive logic — exact behaviour
Form routing is generic: every <form data-demo> is intercepted, preventDefault() is applied, and the function named in the data-demo attribute is called with a FormData object. bookDental() reads name, treatment, clinician, date, time and phone, generates a reference with refCode('NGD') — 'NGD-' + 5 random base-36 characters, upper-cased — and renders the confirmation via showResult(), which injects the HTML, adds the .show class and smooth-scrolls the panel into view. No validation beyond native HTML required attributes; no persistence.

## 5. Data model (as built)
| Entity | Fields |
|---|---|

| BookingRequest (demo, in-memory only) | name, phone, treatment, clinician, date, time, notes, reference (generated) |
| Treatment (static HTML) | name, description, published fee |
| Clinician (static HTML) | name (select option) |

- **Persistence:** none. All demo entities are transient (DOM / JS variables).
- **Personal data in the demo:** form inputs are read into a `FormData` object, echoed into
  the confirmation, and discarded on navigation/reload. Nothing is transmitted or stored.

## 6. Forms & validation requirements
- Use native HTML validation (`required`, `type=email`, `type=tel`, `type=date`) — the demo
  relies on it and the live build must keep it as the first line of defence.
- Every form carries `data-demo="<handler>"`; a single delegated listener calls
  `window[handler](new FormData(form))` after `preventDefault()`.
- Live build additions (mandatory): server-side validation mirroring the client rules,
  CSRF protection, rate limiting and spam control (e.g. Turnstile/hCaptcha + honeypot),
  and error messages that name the field and the fix.

## 7. Security requirements
| # | Requirement (live build) | Demo status |
|---|---|---|
| S1 | HTTPS everywhere (HSTS) | Host-dependent |
| S2 | No personal data stored by the website itself; route to the system of record | ✅ Nothing stored or sent |
| S3 | Escape/encode all user input before rendering (the demo echoes form values into HTML — acceptable only because it is a local, self-only demo; **the live build must sanitise**) | ⚠️ Known demo shortcut — flagged, must fix for production |
| S4 | Security headers (CSP, X-Content-Type-Options, Referrer-Policy) on the host | Host configuration at launch |
| S5 | Payments, if any, only via hosted PCI-compliant pages — never handle card data | N/A in demo (no payments) |
| S6 | Dependency risk: zero third-party JS in the demo; any live-build library must be pinned and reviewed | ✅ Zero dependencies |

## 8. Performance requirements
- Page weight budget (live build): ≤ 500 KB total initial load excluding photography;
  photography in WebP/AVIF with responsive `srcset` and lazy loading.
- Core Web Vitals targets: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 on a mid-range Android over 4G.
- The demo's zero-dependency, single-file-per-layer structure is the baseline — do not add a
  framework for the live build without a recorded reason in a TRD revision.

## 9. Accessibility requirements
- Target: **WCAG 2.2 AA** for any live/public-sector-adjacent deployment; the demo keeps
  semantic landmarks, labelled inputs, keyboard-reachable controls and visible focus.
- Interactive widgets (chips, filters, lightboxes, calculators) must be fully keyboard
  operable in the live build, with state conveyed to assistive technology (`aria-pressed`,
  `aria-live` on result panels and counts).
- Result/confirmation panels should use `role="status"` in the live build so screen readers
  announce them.

## 10. SEO & analytics requirements
- As built: semantic HTML, single H1, meta description, descriptive section headings.
- Live build: LocalBusiness (or sector-equivalent) JSON-LD, Open Graph tags, sitemap,
  Google Business Profile alignment, and GA4 (or privacy-friendly equivalent) events for:
  feature use, form start, form submit, confirmation shown, call/CTA clicks — mapped to the
  PRD §4 metrics. Consent mode required before marketing cookies.

## 11. Production upgrade path (live build)
The demo is the front-end of the live product. Going live adds a thin backend/integration
layer; the page structure, content and interaction patterns carry over unchanged.

**Target production architecture**
```
Browser ──► Static site (as built, hardened per §6–§10)
              │  HTTPS JSON
              ▼
        API layer (serverless functions or small service)
              ├──► Business system of record (below)
              ├──► Messaging (SMS/email confirmations)
              └──► Analytics / CRM lead capture
```

**Sector integrations required**

- **Practice diary / PMS:** Dentally or Software of Excellence API — real availability replaces static time slots; confirmed requests write straight into the diary
- **SMS confirmations & reminders:** Twilio (or PMS-native) — confirmation text on submission, reminder 24h before, to cut DNAs (did-not-attends)
- **Reviews:** Google Reviews API / widget replacing sample testimonials with verified reviews
- **Analytics:** GA4 events on form start, form submit and call clicks to measure the KPIs in the PRD

**Indicative API contract (live build)**
| Endpoint | Purpose |
|---|---|

| `POST /api/appointment-requests` | Create a request {name, phone, treatmentId, clinicianId, date, time, notes} → 201 {reference, status: 'requested'} |
| `GET /api/availability?clinicianId=&date=` | Return bookable slots from the practice diary |
| `POST /api/appointment-requests/{reference}/confirm` | Practice-side confirmation; triggers SMS to the patient |

All endpoints: JSON over HTTPS, server-side validation, references in the same

`NGD-XXXXX` format the demo already issues, and idempotency keys on create calls so a
double-tap never creates two requests.

## 12. Testing requirements & test cases
Release gate for any version: all cases below pass, `node --check script.js` is clean, and
the page is checked at 360px, 768px and 1280px widths.
| # | Test case | Expected result |
|---|---|---|

| T01 | Submit a complete appointment request | Confirmation shows the exact treatment, clinician, date and time chosen and a reference starting NGD- |
| T02 | Submit with an empty required field | Browser blocks submission; no confirmation panel appears |
| T03 | Open index.html with JavaScript disabled | All content (fees, FAQ, reviews) still readable; form simply does not submit |
| T04 | Resize to 360px width | Sticky nav, treatment cards and form stack without horizontal scrolling |
| T05 | Click Book in the nav | Page scrolls to #book |
| T06 | Check page source / meta | Meta description present; exactly one H1 |
| T07 | Run node --check on script.js | No syntax errors (verified 2026-11-10) |
| T08 | Keyboard-only navigation | All form fields and the submit button reachable and visibly focused in order |

## 13. Compliance (technical implications)

- UK GDPR: phone numbers are personal data — live build needs a privacy notice, lawful basis (performance of a contract / legitimate interests) and diary-system DPA.
- No medical data is collected by the demo form beyond the chosen treatment; the live build must avoid free-text health disclosures in 'notes' or handle them as special-category data.
- Accessibility: WCAG 2.2 AA target for the live build (NHS-style clarity is the benchmark patients compare against).

## 14. Known limitations of the demo (honest list)
1. **Visual richness:** Ali's review (10 November 2026) — the designs work but are 'not special enough'
   yet. Imagery is CSS-based; a production pass needs real photography, stronger typography
   and motion. Recorded in the PRD §12 backlog; it is the top enhancement priority.
2. **No backend:** confirmations are simulated in the browser; references are random and not
   stored or verifiable.
3. **No real availability/pricing source:** all data is sample data in code (see §5).
4. **Input echo without sanitisation** (see S3) — demo-only shortcut, must be fixed live.
5. **Single page:** a live build may split long content into sub-pages for SEO depth.

## 15. Deployment & maintenance
- **Deploy (demo/portfolio):** copy the folder to any static host, or open `index.html`.
  For GitHub: one repository per project under
  https://github.com/serviceprovidermanchester named `spm-web-dental-clinic`, with README,
  PROJECT-DETAILS, PRD and TRD included (this package).
- **Versioning:** semantic versioning on this TRD/PRD pair; any change to the interactive
  logic in §4.1 requires a TRD revision note and re-running §12 tests.
- **Maintenance (live):** quarterly review of prices/sample data, monthly checks of form
  routing and confirmations, annual accessibility and compliance re-check (§13).

| Role | Name | Decision |
|---|---|---|
| Prepared by | SPManchester (Harbor) | Issued v1.0, 10 November 2026 |
| Reviewed by | Ali — SPManchester | Commissioned 10 November 2026 after reviewing the built websites |
