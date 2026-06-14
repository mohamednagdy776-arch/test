# ISSUE-028: profile edit form uses different visual theme from profile view

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Category** | UX / Visual Consistency |
| **Route / Page** | `/profile` (when editing) |
| **Component** | `ProfileEditForm` |
| **File** | `web/src/features/profile/components/ProfileEditForm.tsx:52,59,141-142` |
| **Status** | Open |

## Description

When a user clicks "تعديل الملف" (Edit Profile), `ProfileView` unmounts the header card and mounts `ProfileEditForm` in its place. The edit form uses an entirely different visual design system — plain white backgrounds, blue primary colour (`border-primary`, `bg-primary`), and standard gray borders — while the rest of the profile page uses the brand colour palette (`bg-[#FDFAF5]`, `#213448`, `#547792`, `shadow-card-hover`).

The switch is jarring: the user goes from a warm, branded UI to what looks like a generic form widget from a different application.

## Current Behavior

**Profile view uses:**
- Background: `bg-[#FDFAF5]` (warm off-white)
- Primary colour: `#213448` (dark navy) / `#547792` (steel blue)
- Shadows: `shadow-card-hover`, `shadow-glow`
- Inputs: custom focused ring with `#547792`

**ProfileEditForm uses:**
- Background: `bg-white` (plain white)
- Primary colour: `border-primary` / `bg-primary` (Tailwind blue — `#2563EB`)
- Shadows: `shadow-sm` (generic)
- Inputs: `focus:border-primary focus:ring-primary`

## Expected Behavior

The edit form should use the same colour tokens and visual language as the rest of the profile page. The transition into and out of edit mode should feel seamless.

## Affected Files

```
web/src/features/profile/components/ProfileEditForm.tsx

Line 52:  focus:border-primary focus:ring-primary   ← blue, not brand navy
Line 59:  focus:border-primary                       ← blue, not brand navy
Line 142: <div className="rounded-xl bg-white shadow-sm overflow-hidden">
                                        ^^^^^^^^    ← should be bg-[#FDFAF5] shadow-card-hover
Line 157: border-primary text-primary               ← active tab uses blue primary
Line 189: bg-primary ... hover:bg-blue-700          ← submit button uses blue
```

## Suggested Fix

Replace all `primary` colour references in `ProfileEditForm` with the brand tokens used throughout the profile components:

```diff
// Line 142 — wrapper card
- <div className="rounded-xl bg-white shadow-sm overflow-hidden">
+ <div className="rounded-xl bg-[#FDFAF5] shadow-card-hover border border-[#C8D8DF]/60 overflow-hidden">

// Line 52 — text inputs
- focus:border-primary focus:ring-1 focus:ring-primary
+ focus:border-[#547792] focus:ring-1 focus:ring-[#547792]/30

// Line 157 — active tab
- border-primary text-primary
+ border-[#213448] text-[#213448]

// Line 189 — submit button
- className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 ..."
+ className="rounded-lg bg-gradient-to-r from-[#213448] to-[#547792] px-6 py-2 text-sm font-semibold text-[#FDFAF5] hover:shadow-glow ..."
```

## Notes

- The `Tailwind CSS` config likely defines `primary` as a blue tone (the default or a custom blue). This was not aligned with the profile module's colour system when the edit form was written.
- This requires only CSS class changes — no logic changes needed.
