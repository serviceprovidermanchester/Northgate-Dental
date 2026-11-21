# Product Requirements Document (PRD) — Northgate Dental

| Field | Detail |
|---|---|
| Project | **Northgate Dental** — Family & cosmetic dentistry in Didsbury, Manchester |
| Document | Product Requirements Document (PRD) |
| Version | 1.0 (first issue, alongside the built concept website) |
| Date | 10 November 2026 |
| Prepared by | SPManchester — Web Design & Development (https://spmanchester.com/) |
| Portfolio service | 01 · Web Design & Development (project folder `spm-web-dental-clinic`) |
| Status | Concept / demo project — approved for portfolio, GitHub and client-pitch use |
| Companion documents | Technical Requirements Document (TRD.md) — how it is built and how it goes live; PROJECT-DETAILS.md — pitch, portfolio entry and LinkedIn draft; README.md — how to run |

> **Concept notice:** Northgate Dental is a **fictional business** created by SPManchester as a portfolio
> concept project. Names, prices, reviews and figures are illustrative samples, chosen to be
> realistic for the Manchester market. Nothing in this document claims a real client engagement.


## 1. Executive summary
A trust-first clinic website with transparent published fees, treatment explainers written for anxious patients, and a working appointment-request flow (treatment, clinician, preferred date and time slot) that returns an instant on-screen confirmation with a booking reference — the enquiry engine a real practice plugs into its diary system.

**Pitch in one line:** Dental practices lose patients at the phone. This site turns a brochure into a booking engine with transparent fees and a 60-second appointment request.

This PRD defines the product as built (the working concept website in this folder) and the
requirements a live client version must meet. It is written so that (a) a client in this trade
can see exactly what they would get, and (b) any developer can build the live version without
re-deciding the product.

## 2. The market problem
Independent dental practices lose patients at the phone: reception is busy, fees are hidden, and nervous patients put off calling. Most clinic websites are digital leaflets with no booking path, so enquiries leak to chains that offer online booking.

### 2.1 Why now
- Buyers in this market research on mobile, outside business hours, and choose whoever answers
  first with a price or a booking — not whoever has the nicest brochure.
- The concept is designed to 2026 expectations (instant answers, transparent pricing, one-tap
  actions) so it stays pitchable through 2028 without a redesign of the core journeys.
- For SPManchester, this project is portfolio proof for the Web Design & Development service:
  working code, a screenshot, this PRD and its companion TRD, ready for GitHub and LinkedIn.

## 3. Product vision & goals
**Vision:** Dental practices lose patients at the phone. This site turns a brochure into a booking engine with transparent fees and a 60-second appointment request.

| # | Goal | Why it matters |
|---|---|---|
| G1 | Convert visitors into enquiries/bookings on the website itself, 24/7 | The website must earn, not just describe |
| G2 | Answer the visitor's price/availability question instantly | Price silence is the top conversion killer in this market |
| G3 | Be fully usable one-handed on a phone | The majority of this market's traffic is mobile |
| G4 | Be credible enough to pitch to a real client in this trade as-is | This is a portfolio asset, not a mock-up |
| G5 | Define a clean upgrade path to a live, integrated product | A client who says yes should reach MVP without a rebuild |

## 4. Success metrics (live-build targets)
| Metric | Target |
|---|---|

| Appointment-request submissions | ≥ 40 per month in live use (baseline: phone-only) |
| Phone enquiries for routine bookings | −30% within 6 months of launch |
| Request-form completion rate | ≥ 60% of visitors who start the form |
| Time to complete a request | ≤ 60 seconds median |
| New-patient enquiries from organic search | +25% year on year (local SEO) |

| Portfolio metric (SPManchester) | Project is published with code, screenshot, PRD and TRD, and is used in at least one client pitch |

Targets are measured from launch of a live version (GA4 + the business's own booking/lead
records). The demo itself takes no measurements — see the TRD for the analytics requirements.

## 5. Target users

### 5.1 Nervous new patient
- **Goal:** Find a gentle dentist and book without phoning
- **Pain today:** Dental anxiety; fears unknown fees and judgement
- **Journey on this site:** Reads the story/FAQ sections, checks published fees, then submits the appointment request in under 60 seconds

### 5.2 Busy parent booking for the family
- **Goal:** Book check-ups for children outside surgery hours
- **Pain today:** No time to call during the working day; needs evening/weekend clarity
- **Journey on this site:** Uses the mobile site at night, picks clinician and time slot, receives a reference to quote when the practice confirms

### 5.3 Cosmetic patient (whitening / straightening)
- **Goal:** Compare treatments and prices before committing
- **Pain today:** High-value treatment; wants proof and transparent pricing first
- **Journey on this site:** Reads treatment explainers and reviews, then requests a consultation slot


## 6. Scope
### 6.1 In scope — as built (concept website, v1.0)
- Single-page, mobile-first website: story (Problem → Solution), treatments, book (appointment request), reviews, faq.
- Headline interactive feature: Appointment-request form: pick treatment, clinician, date & time slot and get an instant confirmation with a booking reference (client-side demo).
- Instant on-screen confirmation with a generated reference (prefix NGD-) for every
  submitted request — no data leaves the browser in the demo.
- Problem → Solution storytelling section, reviews/testimonials (sample), SEO-ready semantic
  markup, zero third-party dependencies, no build step.

### 6.2 Out of scope (deliberately excluded from the demo)

- Online payment or deposits
- Patient records, medical history forms or clinical data of any kind
- Live diary availability (demo uses fixed time-slot options)
- Multi-practice / multi-location support

### 6.3 Future scope (live client build)

- Phase 2 (live MVP): diary integration, SMS confirmation and reminders, verified reviews.
- Phase 3: online check-in forms, treatment-plan acceptance, finance/deposit payments.

## 7. Primary user journey (as built)
1. Visitor lands from Google/LinkedIn on the hero, which names the problem and the fix.
2. They read the Problem → Solution story section and the offer sections
   (story (Problem → Solution), treatments, book (appointment request), reviews, faq).
3. They use the headline feature: **Appointment-request form: pick treatment, clinician, date & time slot and get an instant confirmation with a booking reference (client-side demo).**
4. They submit the request form (name (text, required); phone (tel, required); treatment (select, required); clinician (select, required); date (date, required); time (select — time slot, required); notes (textarea, optional)).
5. They immediately see a confirmation panel repeating their own selections, with reference
   **NGD-XXXXX**, and a plain statement of what would happen next in a live build.
6. In a live build, the business receives the request in its existing system (see TRD §11)
   and the visitor receives an SMS/email confirmation — the demo simulates step 5 only.

## 8. Functional requirements
Priority key: **Must** = required for the product to work / be pitchable · **Should** = expected
in a live build · **Could** = enhancement backlog (§12).

### FR-01 — Published fees & treatment explainers (Must)
Every treatment card shows a plain-language description and a published fee, so no visitor has to call to find a price.
- **Acceptance criteria:** Each treatment in #treatments displays name, description and fee; no 'POA' anywhere on the page

### FR-02 — Appointment-request form (Must)
Visitor selects treatment, clinician, date and time slot and submits with name and phone number.
- **Acceptance criteria:** Submitting valid data shows the confirmation panel; empty required fields block submission via native validation

### FR-03 — Instant confirmation with reference (Must)
On submit, an on-screen confirmation repeats the chosen treatment, clinician, date and time and shows a unique reference (prefix NGD-).
- **Acceptance criteria:** Confirmation contains all four selections plus a reference matching NGD-XXXXX; panel scrolls into view automatically

### FR-04 — Problem → Solution story section (Should)
A short section names the phone-queue problem and presents online requesting as the fix — the pitch a practice owner can reuse.
- **Acceptance criteria:** Section #story renders above treatments on all viewports

### FR-05 — Reviews / testimonials (Should)
Sample patient reviews build trust for nervous visitors; clearly sample content in the demo.
- **Acceptance criteria:** Reviews section renders at least 3 reviews; in the live build these are replaced by verified Google reviews

### FR-06 — FAQ for anxious patients (Should)
Answers cost, pain, emergency and first-visit questions in plain English.
- **Acceptance criteria:** FAQ answers are readable without JavaScript and cover at least 5 questions

### FR-07 — Sticky navigation with call CTA (Must)
Mobile-first sticky nav keeps 'Book' and phone actions one tap away.
- **Acceptance criteria:** Nav remains visible on scroll at 360px width; Book anchor reaches #book

### FR-08 — Local SEO structure (Must)
Semantic HTML, meta description and location-rich headings targeting 'dentist Didsbury / Manchester'.
- **Acceptance criteria:** Single H1, descriptive meta description, location keywords in headings


## 9. Content requirements
- Voice: plain English, Manchester-local, written for a non-technical visitor; every price or
  figure labelled as sample content while the project is a concept.
- Sections and their content are fixed as built: story (Problem → Solution), treatments, book (appointment request), reviews, faq.
- Reviews/testimonials in the demo are sample content and are labelled as such in
  PROJECT-DETAILS.md; a live build must replace them with verified reviews.
- Imagery: the demo uses CSS-based visuals (see TRD Known Limitations). A live build requires
  licensed or owned photography supplied or approved by the client.

## 10. Data requirements (product level)
No database in the demo. Treatment and clinician options are hard-coded <option> lists in index.html; the booking exists only in the confirmation panel (nothing is stored or transmitted). Sample fees, reviews and figures are illustrative.

- The demo stores **nothing**: no cookies, no local storage, no analytics, no transmission.
- A live build must collect the minimum personal data needed for the transaction, show a
  privacy notice at the point of collection, and route data into the business's existing
  system of record (TRD §11) rather than a new silo.

## 11. Non-functional requirements (product level)
| Area | Requirement |
|---|---|
| Responsive | Fully usable at 360px wide and on desktop; no horizontal scrolling; tap targets ≥ 44px |
| Performance | Static page, zero dependencies; live-build budget: LCP ≤ 2.5s on a mid-range phone (4G) |
| Accessibility | Live build targets WCAG 2.2 AA; demo keeps semantic structure, labelled fields and visible focus |
| SEO | One H1, meta description, location/service headings; live build adds LocalBusiness schema and Google Business Profile alignment |
| Trust | Every figure labelled sample in the concept; live build shows only verifiable claims |
| Availability (live) | Static hosting (≥ 99.9% typical) — no server to maintain |

## 12. Client feedback incorporated & enhancement backlog
Ali (SPManchester) reviewed the built websites on 10 November 2026 and judged the designs functional but
**not yet special enough** visually. That feedback is accepted and recorded here rather than
argued with. The following enhancements are therefore part of this product's backlog, in
priority order:
1. **Real photography / richer imagery** in place of CSS-gradient and flat visuals.
2. **Stronger visual identity per project** — distinctive typography, motion/animation on
   scroll, and a more premium hero treatment.
3. **Deeper interactivity** — the live-build integrations in the TRD (real availability,
   payments, CRM routing) replacing client-side simulation.
4. Additional screenshots (mobile + key-feature states) for GitHub/LinkedIn presentation.
These PRD/TRD documents were commissioned in the same review, to make each project
client-presentable as a complete package even before the visual upgrade lands.

## 13. Risks & assumptions
| Risk / assumption | Handling |
|---|---|
| Sample prices drift from real market rates | Labelled sample everywhere; recalibrate with the client at live-build kickoff |
| Demo confirmations could be mistaken for real bookings | Every confirmation states it is a demo and that nothing was booked/charged |
| Fictional business mistaken for a real client | Concept notice in README, PROJECT-DETAILS and this PRD |
| Regulatory specifics change (see TRD §13) | Recheck at live-build kickoff; this document states the position at 10 November 2026 |

## 14. Compliance & trust requirements (summary)

- UK GDPR: phone numbers are personal data — live build needs a privacy notice, lawful basis (performance of a contract / legitimate interests) and diary-system DPA.
- No medical data is collected by the demo form beyond the chosen treatment; the live build must avoid free-text health disclosures in 'notes' or handle them as special-category data.
- Accessibility: WCAG 2.2 AA target for the live build (NHS-style clarity is the benchmark patients compare against).

## 15. Deliverables & sign-off
Delivered with this PRD: the working website (`index.html`, `styles.css`, `script.js`),
`README.md`, `PROJECT-DETAILS.md`, `TRD.md`, screenshots folder, and a ZIP of the whole
project — packaged for Google Drive, GitHub and the spmanchester.com portfolio.

| Role | Name | Decision |
|---|---|---|
| Prepared by | SPManchester (Harbor) | Issued v1.0, 10 November 2026 |
| Reviewed by | Ali — SPManchester | Designs reviewed 10 November 2026; PRD/TRD commissioned and added |
| Client sign-off (live build) | — | To be completed when a real client commissions the live version |
