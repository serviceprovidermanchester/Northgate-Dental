# Contributing to Northgate Dental — SPManchester Portfolio

Thank you for your interest in contributing! This is an open portfolio project by [SPManchester Private Limited](https://spmanchester.com/). We welcome improvements that make the codebase better, more accessible, and more useful as a client demonstration.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Commit Conventions](#commit-conventions)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Coding Standards](#coding-standards)
- [Contact](#contact)

---

## Code of Conduct

This project follows our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold these standards. Report unacceptable behaviour to [info@spmanchester.com](mailto:info@spmanchester.com).

---

## Getting Started

```bash
# 1. Fork the repository on GitHub
# 2. Clone your fork locally
git clone https://github.com/YOUR_USERNAME/spm-web-dental-clinic.git
cd spm-web-dental-clinic

# 3. Open the site — no build step required
open src/index.html   # macOS
start src/index.html  # Windows
xdg-open src/index.html  # Linux
```

**No package manager, no bundler, no Node.js required** to run the project.  
`node --check src/script.js` is used only to validate script syntax — Node is not required to open the site.

---

## How to Contribute

### Welcome Contributions

| Area | Examples |
|---|---|
| **Accessibility** | ARIA labels, keyboard navigation, focus management, `role="status"` on result panel |
| **Performance** | CSS optimisation, specificity reduction, font loading strategy |
| **SEO** | JSON-LD LocalBusiness schema, Open Graph improvements, semantic markup |
| **Visual improvements** | Scroll animations, mobile layout polish, stronger typography |
| **Documentation** | README improvements, code comments, new test cases |
| **Bug fixes** | Form behaviour, responsive layout issues, browser compatibility |
| **Security hardening** | Input sanitisation patterns, CSP recommendations |

### Out of Scope (for this repo)

- Backend / server-side code (tracked separately for the live-build phase)
- Changing the fictional Northgate Dental business details
- Adding third-party JavaScript libraries, npm packages, or CDN imports

---

## Commit Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <short description in lowercase>

[optional body — wrap at 72 chars]

[optional footer — Closes #123]
```

### Types

| Type | When to use |
|---|---|
| `feat` | New feature or enhancement |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | CSS/visual changes — no logic change |
| `refactor` | Code restructuring, no feature change |
| `a11y` | Accessibility improvement |
| `perf` | Performance improvement |
| `test` | Adding or updating test cases |
| `chore` | Maintenance (gitignore, tooling config) |

### Examples

```bash
git commit -m "feat(form): add scroll-triggered confirmation reveal animation"
git commit -m "fix(nav): sticky header overlaps anchor targets on mobile"
git commit -m "a11y(form): add aria-live polite region to confirmation panel"
git commit -m "docs(readme): add Netlify one-click deploy badge"
git commit -m "style(cards): increase treatment card border-radius for premium look"
git commit -m "perf(css): reduce specificity; remove redundant cascade layers"
```

---

## Pull Request Process

1. **Branch naming:** `feat/description`, `fix/description`, `docs/description`, `a11y/description`
2. **Test your changes** against all T01–T08 test cases listed in the README
3. **Run the syntax check:** `node --check src/script.js`
4. **Check responsive layouts** at 360px, 768px, and 1280px widths
5. **Update documentation** if your change affects the README, PRD, or TRD
6. **Update CHANGELOG.md** — add your entry under `[Unreleased]`
7. **Link the issue** in the PR description: `Closes #123`
8. A maintainer from SPManchester will review and merge approved PRs

### PR Checklist

```
- [ ] T01 — Complete form submission works (NGD-XXXXX reference appears)
- [ ] T02 — Empty required field blocks submission (no confirmation shown)
- [ ] T03 — JavaScript disabled — all content still readable
- [ ] T04 — 360px width — no horizontal scrolling
- [ ] T05 — "Book" nav link scrolls to #book
- [ ] T06 — Page source has single H1 and meta description
- [ ] T07 — node --check src/script.js passes with zero errors
- [ ] T08 — Keyboard-only navigation — all fields and submit reachable with visible focus
- [ ] No external dependencies introduced
- [ ] Commit message follows Conventional Commits
- [ ] CHANGELOG.md updated under [Unreleased]
- [ ] Documentation updated where applicable
```

---

## Issue Reporting

### Bug Reports

Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md). Include:
- Browser and OS version
- Steps to reproduce
- Expected vs actual behaviour
- Screenshot if applicable
- Which test case (T01–T08) is affected

### Feature Requests

Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md). Include:
- The problem you're trying to solve
- Your proposed solution
- Alignment with project goals (G1–G5 from the README)
- Whether any dependencies are required (zero-dependency policy preferred)

### Security Vulnerabilities

**Do not open a public issue.** See [SECURITY.md](SECURITY.md) for responsible disclosure.

---

## Coding Standards

### HTML
- Semantic elements only: `<section>`, `<nav>`, `<article>`, `<main>`, `<header>`, `<footer>`, etc.
- One `<h1>` per page; logical heading hierarchy (h1 → h2 → h3)
- Every `<input>`, `<select>` and `<textarea>` must have an associated `<label>` (via `for`/`id`)
- Use `required`, `type`, `autocomplete`, and `aria-*` attributes where applicable
- Result/announcement panels must carry `role="status"` and `aria-live="polite"`

### CSS
- **Mobile-first:** use `min-width` media queries, never `max-width` (except layout collapse)
- Use CSS custom properties from `:root` — do not hardcode colour values
- No `!important` (treat any existing one as a bug to resolve)
- BEM-inspired naming for new block-level components (e.g. `.treatment-card__footer`)
- Keep specificity flat — prefer single class selectors

### JavaScript
- Vanilla ES6+ only — **no libraries, no frameworks, no CDN imports**
- Functions must be pure where possible
- Form handlers follow the existing `window.bookDental` pattern — add new handlers the same way
- Must pass `node --check src/script.js` with zero errors after every change
- No `eval()` — ever
- Sanitise user input before inserting into the DOM (the demo shortcuts this — flag and document if reproducing)

---

## Contact

| | |
|---|---|
| 🌐 Website | [spmanchester.com](https://spmanchester.com/) |
| 📧 Email | [info@spmanchester.com](mailto:info@spmanchester.com) |
| 🐙 GitHub | [@serviceprovidermanchester](https://github.com/serviceprovidermanchester) |
| 💼 LinkedIn | [linkedin.com/company/spmanchester](https://www.linkedin.com/company/spmanchester) |

---

*SPManchester Private Limited — Manchester, UK*
