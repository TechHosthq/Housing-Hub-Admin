---
description: Typecheck, build and walk the CSP before claiming a change works
---

There is no test suite here, so verification is these three things. Run them
all; do not report success on a step you skipped.

1. `npx tsc --noEmit`
2. `npm run build` — this is where a missing required env var surfaces
3. `git diff` — read it in full

Then check the diff against what actually breaks in this app:

- **CSP fails silently.** If the change loads anything external — a script, a
  font, an image host, an iframe, an API origin — it may be refused with no
  error anyone notices. The symptom is a blank panel or a dead button. Say
  explicitly whether the change needs a `next.config.ts` directive widened.
- **A CSP source carrying a path matches only that exact path.** Any URL going
  into the policy must pass through `toOrigin()` first. This is what once broke
  every API call with `(blocked:csp)`.
- **The S3 origin appears twice** — the CSP and `images.remotePatterns` — and
  both come from `NEXT_PUBLIC_S3_ORIGIN`. Keep it that way; the two failures
  look nothing alike.
- **Required env vars.** `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_S3_ORIGIN`
  throw in a production build. If the change adds another build-time variable,
  it needs the same treatment and a line in `.env.example`.
- **Server data does not go in Zustand.** TanStack Query owns it.
- **No `localStorage` for server data.**
- **Components do not call services directly** and do not construct query keys.

If a change touched the CSP or anything visual, say which pages a human should
open with the console before trusting it. Do not claim to have checked a page
you did not render.

**If the change touches the verification review flow**, re-read the invariants
in `CLAUDE.md` before finishing. In particular: name matching stays advisory,
`Unknown` stays styled neutrally, Approve stays disabled until every document is
reviewed, escalation stays a distinct outcome, and escalation still notifies
nobody.
