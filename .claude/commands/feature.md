---
description: Add a feature that needs a new API call, following the repo's layering
argument-hint: "<what the feature should do>"
---

Feature: $ARGUMENTS

Check first whether the endpoint already exists in `../HousingHub`. If it does
not, this spans two repos and the backend comes first — use `/endpoint` there
rather than guessing at a contract.

Once the endpoint exists, the layering here is not optional. Every domain
already follows it:

1. **Type** in `src/types/` mirroring the backend DTO.
2. **Service function** in the matching `src/services/xService.ts` — a thin
   typed axios wrapper returning `response.data`. No React, no caching, no error
   handling beyond what the interceptor does.
3. **Query or mutation** in `src/hooks/useX.ts`. Queries that take arguments are
   nested factory functions so components can pass them. Mutations invalidate
   the keys they affect.
4. **Component** calls the hook. It never calls a service directly and never
   constructs a query key.

Prefer invalidating a query over updating the cache by hand. The server
recomputes derived state — what is still missing, whether something can be
submitted — and reconstructing that client-side gets it wrong.

State goes where it belongs: server data in TanStack Query, session/theme/toasts
in Zustand, one component's UI state in `useState`. Server data in Zustand is a
bug.

If the feature loads anything external — an image host, a script, an iframe —
check whether the CSP in `next.config.ts` permits it. It is enforcing and it
fails silently.

Finish with `/verify`.
