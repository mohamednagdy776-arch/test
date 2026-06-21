---
description: Systematically repair a broken feature or module. Usage: /focused-fix <feature-path-or-description>
argument-hint: <feature path or description>
---

Systematically repair the feature/module described in `$ARGUMENTS`.

If `$ARGUMENTS` is empty, ask which feature or module to fix.

Execute ALL 5 phases IN ORDER. Do not skip ahead.

## Phase 1 — SCOPE
Map the feature boundary:
- All files that are part of the feature (controllers, services, components, hooks, types)
- Entry points (routes, API endpoints, page components)
- Internal files (helpers, utils, validators)

## Phase 2 — TRACE
Map dependencies:
- **Inbound**: what calls into this feature (imports, API consumers, route links)
- **Outbound**: what this feature depends on (external APIs, DB entities, shared components)

## Phase 3 — DIAGNOSE
Before touching any code:
- Read each file identified in Phase 1
- Check for TypeScript errors, missing imports, wrong types
- Check runtime issues: wrong API paths, incorrect data shapes, broken state
- Check DB: does the entity match the actual production table? (TypeORM `synchronize: false`)
- Assign risk labels: **HIGH** (broken core path), **MED** (degraded UX), **LOW** (cosmetic)
- State root causes with evidence (file:line)

**Iron Law: No fixes before Phase 3 is complete.**

## Phase 4 — FIX
Repair in dependency order: external deps → types → logic → tests → integration.

- Fix one issue at a time
- After each fix, verify that specific issue is resolved before moving on
- If a fix introduces 3 new issues, STOP and re-diagnose

## Phase 5 — VERIFY
- Run `npm run lint` in the affected app (web/ or backend/)
- Run `npm run build` — confirm no TypeScript errors
- Check the golden path for the feature end-to-end
- Summarize: what was broken, what was fixed, file:line references
