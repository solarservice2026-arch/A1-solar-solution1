# Dependency security report

Reviewed 2026-07-28; next review due 2026-08-28 or immediately when a patched
release is published.

| Advisory | Package | Installed | Dependency path | Exposure | Result |
|---|---|---|---|---|---|
| GHSA-qwww-vcr4-c8h2, RSC-mode CSRF bypass | `react-router` | 7.18.1 | `react-router-dom@7.18.1 > react-router@7.18.1` | This application is a Vite client SPA and does not use React Router RSC mode or server actions, so the reported vulnerable path is not currently exercised | Unresolved audit blocker |

`npm audit` reports two high vulnerability entries because the direct
`react-router-dom` package inherits the transitive `react-router` advisory.
The advisory range is `>=7.12.0 <8.3.0`; npm registry did not provide 8.3.0.
The suggested 7.11.0 downgrade was tested and produced broader high-severity
advisories, so it was rejected. Current 7.18.1 was restored, the lockfile was
updated, and typecheck, tests, Playwright, and build pass.

No audit ignore was added. Residual risk is formally documented, but the audit
gate remains failed until a patched release is available and verified.

## Phase 2B reassessment

A fresh registry audit on 2026-07-28 still reports GHSA-qwww-vcr4-c8h2 twice
through the direct/transitive dependency path. The application does not enable
React Router RSC mode or server actions. Backend authentication and authorization
are enforced independently by Express and Supabase. Post-login redirects use an
internally captured pathname, recovery redirects use the fixed current origin
plus `/reset-password`, and no untrusted absolute URL is passed to navigation.
The reviewed version remains lockfile-pinned through `package-lock.json`.

Dependency advisory: Unresolved upstream; application exposure reviewed and
mitigations documented.
