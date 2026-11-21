## Description

Brief, clear description of what this PR does and why.

**Closes #<!-- issue number -->**

---

## Type of Change

- [ ] `feat` — New feature or enhancement
- [ ] `fix` — Bug fix
- [ ] `docs` — Documentation only
- [ ] `style` — CSS/visual changes (no logic change)
- [ ] `refactor` — Code restructuring (no feature change)
- [ ] `a11y` — Accessibility improvement
- [ ] `perf` — Performance improvement
- [ ] `test` — Test case addition or update
- [ ] `chore` — Maintenance

---

## Test Cases Verified

All 8 test cases from the README must pass before merge:

- [ ] **T01** — Submit complete appointment request → confirmation panel appears with `NGD-XXXXX` reference
- [ ] **T02** — Submit with empty required field → browser blocks submission, no confirmation
- [ ] **T03** — Open with JavaScript disabled → all content (fees, FAQ, reviews) readable
- [ ] **T04** — Resize to 360px width → nav, cards, form stack without horizontal scrolling
- [ ] **T05** — Click "Book appointment" in nav → page scrolls to `#book`
- [ ] **T06** — Inspect page source → exactly one `<h1>`, meta description present
- [ ] **T07** — `node --check src/script.js` → zero syntax errors
- [ ] **T08** — Keyboard-only navigation → all fields and submit button reachable, focus visible

---

## Zero-Dependency Check

- [ ] I have **not** introduced any external JavaScript libraries, CDN links, or npm packages

---

## Responsive Check

- [ ] Tested at **360px** (mobile)
- [ ] Tested at **768px** (tablet)
- [ ] Tested at **1280px** (desktop)

---

## Accessibility Check (if UI change)

- [ ] New elements use semantic HTML
- [ ] New interactive elements are keyboard reachable
- [ ] Any new announcement/result uses `role="status"` or `aria-live`
- [ ] Colour contrast meets 4.5:1 for normal text

---

## Documentation Updated

- [ ] `CHANGELOG.md` — entry added under `[Unreleased]`
- [ ] `README.md` — updated if applicable
- [ ] `docs/PRD.md` or `docs/TRD.md` — updated if interactive logic or architecture changed

---

## Screenshots (required for visual changes)

| Before | After |
|---|---|
| _paste screenshot_ | _paste screenshot_ |

---

## Additional Notes

Any context for the reviewer — edge cases, browser quirks, decisions made.
