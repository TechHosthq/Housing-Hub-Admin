# Housing-Hub-Admin — internal admin dashboard

Next.js 16 (App Router) + Tailwind v4 + TypeScript. Staff-facing dashboard for
Housing Hub, a Nigerian proptech platform.

Talks to `HousingHub.Admin.API` in the **`HousingHub`** repo (`../HousingHub`) —
a *different* API and a different JWT secret from the consumer app.

**This app approves verification cases, reviews KYC documents and promotes
staff.** Its mistakes are more expensive than the consumer app's: a wrong
decision here grants a badge that a renter will rely on when handing over money.
Treat changes to the review flow accordingly.

---

## Commands

```bash
npm run dev
npm run build
npm run lint
npx tsc --noEmit
```

No test suite. `tsc --noEmit` plus a real build is the verification available.

---

## Environment variables

`.env.example` is the reference. Two are **required for a production build** and
throw rather than falling back:

- `NEXT_PUBLIC_ADMIN_API_URL` — includes the stage path (`/admin`)
- `NEXT_PUBLIC_S3_ORIGIN` — origin serving uploaded documents

They throw for a specific reason: these are baked in at build time, and a
reviewer approving cases against the wrong environment while believing they are
on the right one is the worst failure this app has.

Deployed on **Vercel**. Production ← `master`.

---

## Structure

```
src/
  app/admin/    Every real route. Route = folder path.
  components/   Grouped by feature.
  services/     One module per domain. Thin axios wrappers, typed.
  hooks/        One per domain. TanStack Query lives here.
  store/        Zustand — auth, KYC draft, toasts. Client state only.
  types/        Shared interfaces mirroring backend DTOs.
```

Same **service → hook → component** pattern as `Housing-Hub-FE`; that repo's
CLAUDE.md describes it in full. Components never call a service directly and
never construct a query key.

### Routes

`/admin` dashboard · `customers` · `owners` · `properties` (+ `duplicates`,
`add`) · `inspections` · `kyc-review` · `verification` · `messages` ·
`settings`.

---

## Authorization model

The admin API's **default policy requires an authenticated user with
`role=Admin`** — endpoints opt *out* with `[AllowAnonymous]`, rather than opting
in. Two consequences worth holding onto:

- A new admin endpoint is protected unless someone actively unprotects it. Good.
- `SuperAdminOnly` is a separate policy for staff management. The UI must hide
  what the API will refuse, or reviewers hit unexplained 403s.

Admin auth is **OTP-only** — there is no Google sign-in here, which is why the
CSP is tighter than the consumer app's.

---

## The verification review flow

The most consequential screen in the app. `../HousingHub/docs/business-verification-walkthrough.md`
is the full walkthrough. What matters when changing it:

- **Claiming** a case moves it to `UnderReview` and records who. A second admin
  is refused — this is what stops two people reviewing in parallel.
- **View** mints a presigned URL valid for 10 minutes and opens a new tab. The
  URL is a bearer credential; never store it in the page or in state.
- **Name match** is advisory and must stay advisory. It reports
  `Exact/Partial/None/Unknown`. Nigerian names legitimately vary between
  documents — a middle name on one and not the other, a maiden name, a diacritic
  dropped by a registry that only accepts ASCII. Auto-rejecting on a string
  mismatch would decline honest applicants at a high rate.
- **`Unknown` is styled neutrally, not as a warning.** It is a data gap, not a
  red flag, and treating it as one buries the real mismatches in noise.
- **Approve is disabled** until every document is reviewed and none is rejected.
  The button explains which condition is unmet — keep that. A disabled control
  with no reason is a support ticket.
- **Escalate** is a distinct outcome from reject, deliberately: it is the
  strongest signal of attempted impersonation and should be visible as its own
  thing rather than buried among ordinary rejections.
- **Escalation notifies nobody.** Telling a suspected impersonator which check
  caught them teaches them what to fix.

---

## Things that have actually gone wrong

**CSP is enforcing and fails silently.** Built in `next.config.ts`. Here it also
covers `frame-src`, because the document preview renders a presigned S3 URL in
an iframe — a wrong value there shows a blank preview, which reads as a corrupt
file rather than a blocked request. Walk the review flow with the console open
after touching anything that loads an external resource.

**A CSP source carrying a path matches only that exact path.** Every dashboard
API call once failed with `(blocked:csp)` because `NEXT_PUBLIC_ADMIN_API_URL`
ends in `/admin` and went into `connect-src` verbatim. Always use `toOrigin()`.

**Computed and rendered nowhere.** Several backend fields were calculated
correctly and shown to no one. If you are adding a field that represents a claim
about a user, trace it to a rendered pixel.

**No real-time.** The admin API registers `NoOpRealtimeNotifiers` — there are no
SignalR hubs on this side at all. Anything live is polling.

---

## Conventions

- **Comments explain why, not what.** Match the existing code.
- Tailwind core utilities only; `lucide-react` for icons.
- Errors surface through `useToastStore` via the axios interceptor.
- **Never use `localStorage` for server data.**

---

## Related

| Repo | Path | Notes |
|---|---|---|
| `HousingHub` | `../HousingHub` | Both APIs, and all design docs under `docs/` |
| `Housing-Hub-FE` | `../Housing-Hub-FE` | Consumer app; the applicant side of verification |

Verification has two user interfaces — the applicant's in `Housing-Hub-FE` and
the reviewer's here. A change to the case state machine usually touches both.
