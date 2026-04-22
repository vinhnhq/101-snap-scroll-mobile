# Plan: Fluid Responsive Content Sizing

## Context

The snap scroll app uses `h-lvh` for slide height (fixed, stable snap points). But all content inside slides — font sizes, padding, button sizes, corner element positions — currently uses hardcoded `px` or fixed `rem` values. This looks fine on an iPhone 15 Pro Max but cramped or oversized on an iPhone SE or older Android devices.

This sprint introduces fluid sizing so content scales gracefully across all screen sizes without hardcoded breakpoints.

**Stack:** Next.js 16, React 19, Tailwind 3.4, CSS custom properties.

---

## Key concept

The slide container height is viewport-locked (`lvh`) and must never change. Only the *content inside* slides needs to scale. There are three options — this sprint implements Option A (root font-size) as the baseline and Option C (composition wrapper) as the component-level pattern.

```
Slide container  → lvh (fixed, never touch)
Corner positions → vh / %
Font sizes       → clamp() via scaled root or em via wrapper
Padding / gaps   → em relative to container font-size
```

---

## Tasks

### Task 1: Scale root font-size with `clamp()`
**File:** `app/globals.css`

Add to `:root`:
```css
html {
  font-size: clamp(14px, 2vw + 1vh, 18px);
}
```

All existing `rem` values in slide content now scale automatically between ~14px (SE) and ~18px (Pro Max).

**Acceptance:** No layout breakage. Slide snap still works. Text scales visibly when Chrome DevTools device is toggled between iPhone SE and iPhone 15 Pro Max.

**Verify:**
- Unit: `bun test` — existing tests pass (no regression)
- Browser: DevTools iPhone SE (375×667) → font visibly smaller than on Pro Max (430×932)

---

### Task 2: Create `MobileSlide` composition wrapper
**File:** `components/mobile-slide.tsx`

```tsx
interface MobileSlideProps {
  children: React.ReactNode;
  className?: string;
  'data-testid'?: string;
}

export function MobileSlide({ children, className, 'data-testid': testId }: MobileSlideProps) {
  return (
    <section
      data-testid={testId}
      className={`snap-start snap-always h-lvh w-full flex flex-col pt-safe pb-safe-min ${className ?? ''}`}
    >
      {children}
    </section>
  );
}
```

This centralises the snap + safe area boilerplate. The `font-size` from Task 1 propagates into all `em`-based children.

**Acceptance:** All 5 slides refactored to use `<MobileSlide>`. Existing `data-testid` attributes unchanged. Playwright tests still pass.

**Verify:**
- Unit: `bun test` — `data-testid` selectors unchanged, all tests green
- Browser: DevTools → each slide renders, snap still engages, safe area padding visible on notch device

---

### Task 3: Apply `clamp()` to corner/edge positioned elements
**File:** `app/globals.css` or inline styles where applicable

Any element pinned to a corner (badges, CTAs, floating labels) should use:
```css
.corner-cta {
  bottom: max(env(safe-area-inset-bottom), clamp(1.5rem, 5vh, 3rem));
}
```

Audit the existing slides and update any hardcoded `bottom`/`top` values.

**Acceptance:** Corner elements clear the home indicator on iPhone SE and don't float too far from the edge on Pro Max.

**Verify:**
- Unit: `bun test` — no regression
- Browser: DevTools iPhone SE → corner element above home indicator; Pro Max → not floating excessively

---

### Task 4: Smoke Test — pre-merge browser verification

Full smoke test against the sprint success criteria. Run after Tasks 1–3 are complete.

**Commands:**
```bash
bun build          # must pass with no errors
bun test           # all Playwright tests green
```

**Browser checklist (Chrome DevTools, mobile emulation):**

| Check | iPhone SE (375×667) | iPhone 15 Pro Max (430×932) |
|-------|--------------------|-----------------------------|
| All 5 snaps scroll and engage | ✓ | ✓ |
| No text overflow or truncation | ✓ | ✓ |
| Corner elements above home indicator | ✓ | ✓ |
| Font feels proportional (not cramped, not huge) | ✓ | ✓ |
| Entrance animations fire on scroll-in | ✓ | ✓ |
| No console errors on load | ✓ | ✓ |
| Reduce Motion: animations off, content still visible | ✓ | ✓ |

**Merge gate:** all rows checked on both device sizes.

---

## Dependency Graph

```
Task 1 (root font-size) ──→ Task 2 (MobileSlide wrapper)
                                       ↓
Task 3 (corner clamp) ─────────→ Task 4 (verify)
```

---

## Verification

1. `bun build` — no errors
2. `bun test` — all previously passing tests still pass
3. DevTools: iPhone SE → no overflow, no cramped text
4. DevTools: iPhone 15 Pro Max → no excessive whitespace
5. DevTools: Reduce Motion → animations off, content still visible and sized correctly
