# Accessibility Notes — Northgate Dental

**Target standard:** WCAG 2.2 AA — required for the live build; the demo keeps semantic structure as a baseline.

---

## Status Summary (v1.0 Demo)

| Criterion | Demo Status | Live-Build Requirement |
|---|---|---|
| Semantic HTML landmarks | ✅ `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>` used | Maintain |
| Single H1 per page | ✅ One H1 in the hero section | Maintain |
| Labelled form inputs | ✅ Every field has an associated `<label for="...">` | Maintain |
| Native HTML validation | ✅ `required`, `type=tel`, `type=date`, `min=today` on date | Add server-side mirror |
| Keyboard navigation | ✅ All fields and CTAs reachable via Tab | Verify with NVDA + VoiceOver |
| Visible focus | ✅ `:focus-visible` outline via CSS | Increase offset/contrast if borderline |
| Minimum tap targets | ✅ Buttons ≥ 44px; inputs 44px height | Maintain |
| Colour contrast | ⚠️ Check #0e7c7b on #fff — may be borderline AA (4.5:1) | Test with Colour Contrast Analyser |
| Alt text for images | ✅ No images in demo (CSS gradients / emoji only) | Required for all photography in live build |
| FAQ without JS | ✅ `<details>/<summary>` — works without JavaScript | Maintain |
| Result panel announcement | ✅ `role="status"` and `aria-live="polite"` on `#dental-result` | Maintain and test with screen reader |
| Skip navigation link | ⚠️ Not present in v1.0 | Add for live build (see below) |
| Field error messages | ⚠️ Native browser only | Add custom `role="alert"` messages for live build |
| Screen reader testing | ⚠️ Not formally tested in v1.0 | NVDA + Chrome; VoiceOver + Safari required pre-launch |

---

## Live Build Requirements

### 1. Skip Navigation Link

Add before `<header>` to let keyboard/screen reader users jump to main content:

```html
<a href="#main-content" class="skip-link">Skip to main content</a>
```

```css
.skip-link {
  position: absolute;
  left: -9999px;
  top: 0;
  z-index: 999;
  background: var(--brand);
  color: #fff;
  padding: 12px 20px;
  border-radius: 0 0 8px 0;
  font-weight: 700;
  text-decoration: none;
}
.skip-link:focus {
  left: 0;
}
```

### 2. ARIA Live Region on Confirmation (already in v1.0)

The result panel carries `role="status"` and `aria-live="polite"` — maintain this in all live-build iterations.

```html
<div class="result" id="dental-result"
     role="status" aria-live="polite" aria-atomic="true"></div>
```

### 3. Field-Level Error Messages

Native browser validation is acceptable for the demo. The live build must add custom messages:

```html
<div class="field">
  <label for="patient-phone">
    Phone number <span class="req" aria-label="required">*</span>
  </label>
  <input id="patient-phone" name="phone" type="tel" required
         aria-describedby="phone-error"
         aria-invalid="false">
  <span id="phone-error" class="field-error" role="alert" hidden>
    Please enter a valid UK phone number (e.g. 07700 900123).
  </span>
</div>
```

### 4. Photography Alt Text

Every image added in the live build requires a descriptive `alt` attribute:

```html
<!-- Good -->
<img src="dr-patel.jpg" alt="Dr Patel, principal dentist at Northgate Dental, smiling in the surgery">

<!-- Bad -->
<img src="dr-patel.jpg" alt="doctor">
<img src="dr-patel.jpg" alt="image">
<img src="dr-patel.jpg" alt="">  <!-- only acceptable for purely decorative images -->
```

### 5. Mobile Navigation

When a hamburger menu is added (v1.1), it must be fully accessible:

```html
<button class="nav-toggle"
        aria-expanded="false"
        aria-controls="primary-nav"
        aria-label="Open navigation menu">
  <!-- hamburger icon (SVG, not text) -->
</button>
<nav id="primary-nav" aria-label="Primary navigation">
  <!-- links -->
</nav>
```

---

## Colour Contrast Reference

Test with [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/):

| Foreground | Background | Required Ratio | Use |
|---|---|---|---|
| `#0e7c7b` | `#ffffff` | 4.5:1 (AA normal text) | Brand links on white |
| `#ffffff` | `#0e7c7b` | 4.5:1 | Button text on brand background |
| `#5b6b7a` | `#ffffff` | 4.5:1 | Muted body/lead text |
| `#ffffff` | `#14202b` | 4.5:1 | Demo banner, footer text |
| `#3d4f5c` | `#f4f8fb` | 4.5:1 | Card body text on page background |

---

## Pre-Launch Testing Checklist

### Automated

```
- [ ] axe DevTools browser extension — zero critical or serious violations
- [ ] WAVE (wave.webaim.org) — zero errors
- [ ] Lighthouse Accessibility score ≥ 95
- [ ] HTML validator (validator.w3.org) — zero errors
```

### Manual

```
- [ ] Keyboard-only: navigate full page, complete and submit appointment form
- [ ] NVDA + Chrome (Windows): confirm all labels read, confirmation panel announced
- [ ] VoiceOver + Safari (macOS): confirm all labels read, confirmation announced
- [ ] VoiceOver + Safari (iOS): test on real device at 360px
- [ ] 200% browser zoom: no content clipped or horizontally scrolling
- [ ] Windows High Contrast mode: all content visible and readable
- [ ] Reduced motion: check no animations cause discomfort (use prefers-reduced-motion)
```

### Prefers Reduced Motion

Add to `src/styles.css` for the live build:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    transition-duration: .01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

*SPManchester Private Limited — [spmanchester.com](https://spmanchester.com/) — Manchester, UK*
