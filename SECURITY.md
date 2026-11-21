# Security Policy — SPManchester / Northgate Dental

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 1.x (current) | ✅ Actively maintained |
| < 1.0   | ❌ No longer supported |

---

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you discover a security vulnerability in this project, please report it responsibly via our private channel:

### 📧 Contact

**Email:** [info@spmanchester.com](mailto:info@spmanchester.com)  
**Subject line:** `[SECURITY] spm-web-dental-clinic — <brief description>`

We treat all security reports seriously and will respond promptly.

### What to Include

Please provide as much of the following as possible:

| Field | Details |
|---|---|
| **Vulnerability type** | XSS, CSRF, information disclosure, etc. |
| **Location** | File name, line number, section |
| **Steps to reproduce** | Proof-of-concept or screenshots |
| **Potential impact** | What could an attacker achieve? |
| **Suggested fix** | Optional but appreciated |

### Response Timeline

| Stage | Timeline |
|---|---|
| Acknowledgement | Within 48 hours |
| Initial assessment | Within 5 business days |
| Resolution (critical) | Within 30 days |
| Resolution (non-critical) | Within 90 days |
| Public disclosure | Coordinated with the reporter |

We will credit responsible disclosures in CHANGELOG.md unless you prefer anonymity.

---

## Known Demo Limitations (Not Security Bugs)

The following are **intentional, documented trade-offs** of the concept/demo version. Please do not report these as vulnerabilities:

| ID | Limitation | Demo Status | Live-Build Requirement |
|---|---|---|---|
| S3 | User input echoed into HTML without sanitisation | ⚠️ Demo shortcut — acceptable for local, self-only demo | **Must sanitise all user input before DOM insertion** |
| S4 | No Content-Security-Policy, X-Content-Type-Options, or Referrer-Policy headers | Host-dependent | Configure at the hosting / CDN level |
| S5 | No server-side validation | N/A — no server in demo | Required in live build — mirror client-side rules |
| S6 | No CSRF protection | N/A — no server in demo | Required in live build |
| S7 | No rate limiting | N/A — no server in demo | Required in live build (60 req/hour per IP) |

These are documented in the Technical Requirements Document (TRD §7) as accepted, known demo trade-offs.

---

## Security Principles (Live Build)

For any production deployment of this codebase, the following **must** be implemented:

1. **HTTPS everywhere** — HSTS with `max-age=31536000; includeSubDomains; preload`
2. **Input sanitisation** — All user input escaped/encoded before rendering
3. **CSP header** — Restrict scripts, styles and connections to known origins
4. **CSRF protection** — Synchronised token or SameSite cookie on all state-changing requests
5. **Rate limiting** — 60 form submissions/hour per IP; block after 5 failed validation attempts
6. **Spam protection** — Cloudflare Turnstile (or hCaptcha) + honeypot field
7. **No personal data stored by the site itself** — route phone numbers to the PMS system of record only
8. **Dependencies pinned** — Any live-build library pinned to an exact version and reviewed

---

## Scope

This policy covers:
- `src/index.html`, `src/styles.css`, `src/script.js`
- All documentation files in this repository

**Out of scope:**
- Third-party services referenced in the TRD (Dentally, Twilio, Google APIs, etc.) — report those directly to the respective providers
- The SPManchester company website (spmanchester.com) — report separately to [info@spmanchester.com](mailto:info@spmanchester.com)

---

*SPManchester Private Limited — [spmanchester.com](https://spmanchester.com/) — Manchester, UK*
