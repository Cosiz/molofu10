# UX/UI Standards

## Applies to

Stages 1 (spec — UX surfaces called out), 3 (implementation), 4 (Costrict UX checks if configured).

## Purpose

Enforce UX consistency and accessibility floor so AI-generated UI does not become a patchwork of inconsistent components. Most agent-built UIs feel "almost right but uncanny" because each screen is locally reasonable but the system has no shared language. These rules counter that.

## Rules

### 1. Information architecture

**1.1** Every screen has one primary job, stated in the spec. If users would describe two equally-important goals on a screen, split it.

**1.2** Maximum 7±2 primary navigation items at any level. Cull or group ruthlessly.

**1.3** Progressive disclosure: show what 80% of users need first, hide the rest behind clear affordances.

**1.4** Empty states, loading states, and error states are designed deliberately, not as afterthoughts. Every list, every form, every async surface must spec all three.

### 2. Interaction

**2.1** Every action has feedback within 100ms (perceived responsiveness). If the actual work takes longer, show an optimistic state, a skeleton, or a progress indicator immediately.

**2.2** Destructive actions require confirmation. Confirmations name the specific object being destroyed ("Delete order #1234?" not "Are you sure?").

**2.3** Undo over confirm where possible. A 5-second undo toast beats a modal for routine reversible actions.

**2.4** Forms validate inline on blur, not just on submit. Submit errors point to the first invalid field and scroll it into view.

**2.5** Keyboard reachable: every interactive element is operable with keyboard alone. Visible focus indicator on every focusable element. Tab order matches visual order.

### 3. Visual system

**3.1** Design tokens, not hard-coded values. Colors, spacing, typography, radii, shadows all come from a tokens file. No magic hex codes in component code.

**3.2** Spacing scale: stick to a single scale (e.g., 4/8/12/16/24/32/48/64). No off-scale values without justification.

**3.3** Type scale: ≤6 type sizes across the whole app. More than that is almost always accidental.

**3.4** Color: semantic names (`color-danger`, `color-text-muted`), never raw names (`red-500`). Dark mode parity from day one if dark mode is in scope at all.

**3.5** Components from one library (or one in-house system). No mixing Material + shadcn + ad-hoc.

### 4. Accessibility (the floor)

**4.1** WCAG 2.2 AA as the minimum bar. Costrict UX pass should flag violations.

**4.2** Color contrast: 4.5:1 for body text, 3:1 for large text and UI components. Test with actual tooling, not by eye.

**4.3** All images, icons-as-buttons, and inputs have accessible names (`alt`, `aria-label`, associated `<label>`).

**4.4** Headings form a logical outline: one `<h1>` per page, no skipped levels.

**4.5** Motion respects `prefers-reduced-motion`. Disable non-essential animations when the user has opted out.

**4.6** Screen reader smoke test on every new flow: tab through it with VoiceOver/NVDA. If it's incomprehensible, it's broken.

### 5. Content

**5.1** Plain language. Microcopy is written before the UI is built (spec stage), not after. Bad microcopy is usually a UX problem in disguise.

**5.2** Error messages: what happened, why, what to do. Never just "Something went wrong."

**5.3** Localization-ready: strings live in a single location with stable keys. No string concatenation that breaks in other languages.

**5.4** Numbers, dates, currencies: locale-aware formatting from day one. Hardcoded `MM/DD/YYYY` is a bug.

### 6. Performance as UX

**6.1** Core Web Vitals budget (web): LCP < 2.5s, INP < 200ms, CLS < 0.1. Spec must declare the budget for any user-facing surface.

**6.2** Bundle budget per route. Document it in the spec. Costrict architecture pass can flag regressions.

**6.3** No layout shift after initial paint. Reserve space for async content.

**6.4** Optimistic UI for any action where the success rate is >95%. Roll back on failure with a clear toast.

## Costrict enforcement

If a Costrict UX preset is available, run it as a third pass at stage 4 (in addition to security and architecture). Otherwise, the spec must include a UX checklist referencing these rules, completed during stage 1.

## Sources

- WCAG 2.2 (W3C)
- Refactoring UI (Adam Wathan, Steve Schoger)
- *About Face* (Cooper, Reimann)
- Nielsen Norman Group heuristics
- Inclusive Components (Heydon Pickering)
- Core Web Vitals (web.dev)
- *Inspirations to add as you adopt them.*

## Changelog

- **1.0.0** — Initial UX/UI standards.
