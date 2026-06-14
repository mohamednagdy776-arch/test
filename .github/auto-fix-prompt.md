You are running headless in CI (auto mode) on a self-hosted runner, inside this repo's working tree.

`open-issues.md` in the repo root lists the currently OPEN GitHub issues. Fix the ones that are
REAL and SAFE, with minimal correct changes.

HARD RULES — do NOT violate:
- Do NOT make DB schema/entity changes: column types, FK constraints, `onDelete` cascade, or
  enabling/disabling TypeORM `synchronize`. The live DB syncs on boot — a bad ALTER takes
  production down.
- Do NOT change auth behavior that would log existing users out (e.g. enforcing email
  verification, shortening access-token lifetime without a working silent-refresh).
- Do NOT add anything requiring credentials you don't have (SMTP, OAuth provider keys,
  third-party action commit SHAs). Skip those issues.
- After reading the actual code, SKIP issues that are false positives or duplicates. It is
  correct and expected to skip issues — do not force a change that breaks a working feature.
- Do NOT commit, push, or open PRs, and do NOT touch `.github/workflows/`. Only edit source
  files. The workflow handles git.

For each issue you fix:
- Make the smallest correct change.
- Typecheck the package you changed IF its dependencies are available. If
  `node_modules` is missing, run `npm ci` in that package first (network
  permitting): `cd <pkg> && npx tsc --noEmit` (backend uses `-p tsconfig.json`).
  If your change doesn't typecheck, REVERT it. If you genuinely can't install
  deps, keep the change minimal and well-scoped — the PR's review and CI will
  catch type errors before merge.

When finished, write `FIX_SUMMARY.md` listing, concisely:
- FIXED: `#<num> — one line` for each issue you changed.
- SKIPPED: `#<num> — reason` for each you deliberately left.
