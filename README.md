# Payroll Web

Angular client for a payroll management system — employee records, monthly attendance
entry, payroll generation and approval, and printable reports.

Backend: [Payroll_API](https://github.com/AhmedSanad1/Payroll_API) (ASP.NET Core + SQL Server).

## Stack

| Concern | Choice |
|---|---|
| Framework | Angular 22, standalone components, lazy-loaded routes |
| State | Angular signals for component state; `inject()` throughout |
| Data grid | AG Grid 36 |
| Charts | ApexCharts (`ng-apexcharts`) |
| i18n | `@ngx-translate` — Arabic / English with RTL support |
| Styling | SCSS, one shared stylesheet |
| Tests | Vitest + jsdom |
| Language | TypeScript 6 (strict) |

## Structure

```
src/app/
  core/
    guards/         authGuard — route protection
    interceptors/   auth (bearer + refresh-on-401), error (toast surfacing)
    models/         typed request/response contracts per domain area
    services/       one HTTP service per API resource
  features/
    auth/           login
    dashboard/      summary tiles and charts
    employees/      list + create/edit form
    departments/    department CRUD with incentive percentages
    attendance/     monthly absence grid, bulk save
    payroll/        run list, run detail with payslip breakdown
    reports/        four reports, on-screen and PDF
    settings/       job-grade salaries, attendance rules, service incentive tiers
  layout/shell/     sidebar, topbar, language switcher
  shared/           AG Grid theming and cell renderers, confirm dialog,
                    pagination, toasts, PDF opening
```

Every route is lazy-loaded via `loadComponent`, so each feature is its own chunk.

## Notable details

- **Token refresh** — `auth.interceptor.ts` attaches the bearer token and, on a 401,
  refreshes once and replays the original request rather than bouncing the user to the
  login screen mid-task. If the refresh itself fails the session is genuinely gone, so it
  redirects to login carrying a `returnUrl` — the route guard alone would not catch this,
  since it only runs on navigation and would leave someone stranded on a dead page.
- **Language flows to the server** — the same interceptor sends `Accept-Language` on every
  request, so API validation and error messages come back already localised rather than
  being re-translated on the client.
- **API base URL** — in development `environment.apiUrl` is the relative `/api` and
  `proxy.conf.json` forwards it to the API host, which keeps the browser on one origin so
  the `SameSite=Strict` refresh cookie is sent. The production environment currently
  points at an absolute URL instead; see the note below.
- **Bilingual + RTL** — translations live in `public/i18n/{ar,en}.json`; switching
  language flips document direction, and the AG Grid theme follows.
- **Shared grid layer** — column theming, badge and row-action cell renderers, and print
  handling are centralised in `shared/ag-grid/` instead of repeated per screen.

## Getting started

Requires Node 20+ and a running instance of the API.

```bash
git clone https://github.com/AhmedSanad1/Payroll_Angular.git
cd Payroll_Angular
npm install
npm start
```

The app runs at `http://localhost:4200`. `proxy.conf.json` forwards `/api` to
`https://localhost:7290` — adjust the target if the API is listening elsewhere.

## Scripts

```bash
npm start        # dev server with proxy
npm run build    # production build to dist/
npm run watch    # rebuild on change, development configuration
npm test         # Vitest unit tests
```

## Known issue: production API URL

`src/environments/environment.prod.ts` sets `apiUrl` to an absolute
`http://216.219.83.248:550/api`, replacing the relative `/api` used in development. Two
consequences, both worth fixing before this is deployed anywhere real:

- **The refresh cookie stops being sent.** The cookie is `SameSite=Strict`, so it only
  travels on same-site requests. Once the SPA and the API sit on different origins the
  browser withholds it and the silent-refresh path in `auth.interceptor.ts` cannot work.
- **Credentials cross the network in the clear.** The scheme is plain `http`, so bearer
  tokens and the login payload are unencrypted in transit.

The fix is to keep `apiUrl` relative and host the API under the same site as the built
SPA (reverse-proxying `/api`), which is what the development setup already models — or,
if the two must stay split, move to `https` and switch the cookie to
`SameSite=None; Secure` with an explicit CORS origin allowlist.

## Deployment

`npm run build` emits to `dist/`. `public/web.config` is included for hosting the built
output under IIS, with the URL-rewrite rule needed for client-side routing.
