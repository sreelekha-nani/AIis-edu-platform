---
name: Admin user management
description: How admin CRUD for users was implemented — spec change + codegen required
---

## What was added
- `DELETE /users/{id}` added to OpenAPI spec → generates `useDeleteUser` hook
- `role` field added to `UserUpdate` schema → allows admin to promote/demote users via `useUpdateUser`
- `POST /users` added to backend `users.ts` → admin can create users with any role
- Backend `PATCH /users/:id` updated to accept `role` field in body

## Implementation notes
- Admin user creation uses the `useRegister` hook (not a separate createUser hook) — register endpoint accepts `role`
- Delete guard: server prevents deleting your own account (compares requesting userId with target id)
- After any spec change, must run: `pnpm --filter @workspace/api-spec run codegen` then `pnpm --filter @workspace/api-server run build`

**Why:** The original spec had no delete-user or role-update support. Admin panel needed full CRUD.

**How to apply:** Any time admin needs to manage user roles or create users, these hooks are available.
