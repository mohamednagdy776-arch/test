# GQA-005: `/mockups` overflows horizontally on mobile

| Field | Value |
|-------|-------|
| **Severity** | Medium (low user impact — `/mockups` is a demo page) |
| **Area** | Web / Responsive |
| **Route** | `/mockups` |
| **Status** | Confirmed (375×812 viewport) |

## What happens
At a 375px-wide mobile viewport the document is ~230px wider than the viewport
(`scrollWidth - clientWidth ≈ 230`). The desktop mockup layout doesn't reflow:
the theme-selector row (Fresh Natural / Luxe Premium / … / Soft Dreamy) and the
absolutely-positioned "PAGES" panel spill outside, and hero text wraps
letter-by-letter into a thin column.

## Evidence
`../screenshots/mockups-mobile.png`

## Reproduce
1. Open `/mockups` on a 375px-wide viewport (mobile or devtools device mode).
2. Note the horizontal scrollbar / content cut off to the right.

## Impact
Demo/showcase page only; not part of the core product flow, but it looks broken
on phones.

> Report only — not fixed.
