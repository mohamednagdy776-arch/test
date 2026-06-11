# Tayyibt Web — Playwright E2E Test Suite

Standards-based ([Playwright](https://playwright.dev)) end-to-end tests covering
**every page** of the web app, run against the live deployment.

## What it covers

For all 36 routes (public, auth, main app, settings, dynamic), each page gets a
battery of independent checks:

- loads without server error / crash and has a `<title>`
- no uncaught JavaScript exceptions
- no `console.error` output
- correct Arabic RTL document (`lang=ar`, `dir=rtl`)
- renders meaningful content + its expected heading
- no broken images
- no horizontal overflow on a 375px mobile viewport

Plus: auth-guard redirect checks for every gated route, and interaction tests
for login, register, forgot-password, search, dashboard shell, and settings nav.

Total: **150+ test cases.**

## Run

```bash
cd web-tests
npm install
npx playwright install chromium
npm run test            # runs the suite against https://145-14-158-100.sslip.io
npm run report:issues   # turns failures into issues/ (one file per issue)
```

Override the target with `BASE_URL=...` and credentials with
`TEST_EMAIL` / `TEST_PASSWORD`.

## Output

- `results/results.json` + `results/html` — raw Playwright report
- `issues/` — one Markdown file per failing check, plus `SUMMARY.md`

This suite only **reports** problems; it does not fix anything.
