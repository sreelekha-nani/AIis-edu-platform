---
name: Parent children route alias
description: The generated API client hook calls /parent/:id/children but the OpenAPI spec defines it at /users/:id/children — both routes must exist in the server.
---

## Rule
`artifacts/api-server/src/routes/users.ts` must expose BOTH:
- `GET /users/:id/children`  (OpenAPI spec path)
- `GET /parent/:id/children` (what the generated client actually calls)

**Why:** The OpenAPI spec has the path as `/users/{id}/children` but somewhere in codegen the URL becomes `/parent/{id}/children`. Regenerating the client or updating the spec alone is error-prone — maintaining both routes is the safe fix.

**How to apply:** If you ever re-run codegen or change the OpenAPI spec path for this endpoint, verify the generated URL in `lib/api-client-react/src/generated/api.ts` around the `getGetParentChildrenUrl` function and ensure the server matches.
