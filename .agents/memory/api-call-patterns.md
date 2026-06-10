---
name: API call patterns
description: Correct hook call signatures for ALIS API client — many wrong patterns cause silent failures
---

## Query hooks
- `useListLessons(courseId: number)` — number directly, NOT `{ courseId }`
- `useListProgress({ courseId, studentId })` — no `enrollmentId` param
- `useGetStudentAnalytics(studentId: number, options?)`
- `useGetCourseAnalytics(courseId: number, options?)`
- `useGetRecommendations(studentId: number, options?)`
- `useGetParentChildren(parentId: number, options?)`
- `useListEnrollments({ studentId }, { query: { enabled } as any })`
- `useListTestResults({ studentId }, { query: { enabled } as any })`
- `useListTests({ teacherId }, { query: { enabled } as any })`
- `useListCourses({ teacherId }, { query: { enabled } as any })`

## Mutation hooks
- `useMarkLessonComplete().mutate({ data: { lessonId, courseId, studentId? } })` — no enrollmentId
- `useCreateLesson().mutate({ courseId, data: { title, type, ... } })` — courseId SEPARATE from data
- `useDeleteLesson().mutate({ id })` — just `id`, not `lessonId`
- `useDeleteCourse().mutate({ id })` — just `id`, not `courseId`
- `useDeleteLiveClass().mutate({ id })` — just `id`, not `liveClassId`
- `useCreateCourse().mutate({ data: { title, description, subject, level } })` — no teacherId in data
- `useCreateLiveClass().mutate({ data: { title, subject, scheduledAt, duration, meetingLink } })` — no teacherId
- `useCreateTest().mutate({ data: { title, subject, duration, questions } })` — no teacherId
- `useUpdateUser().mutate({ id, data: { name?, role?, grade?, subject? } })` — role change supported post-spec-update
- `useDeleteUser().mutate({ id })` — added via spec update
- `useRegister().mutate({ data: { name, email, password, role } })` — used for admin user creation

## Data shapes
- `AIProfile` / `useGetRecommendations` returns: top-level `learningStyle`, `learningSpeed`, `strongSubjects`, `weakSubjects`, `recommendations`
- NOT nested under `.profile`
- `Recommendation` has `.description` field (not `.message`)
- `useDeleteTest` does NOT exist — no delete test endpoint

**Why:** Generated from OpenAPI spec via Orval. Divergence from spec causes TS errors or runtime failures.
