# Activity Records V1

## Purpose

`Activity Records` is the first working operational vertical of VRC Quality Connect.
It stores atomic work entries and acts as the source of truth for dashboard and summary reporting.

## Location

- Backend API and business logic: `backend/src/modules/activity-records`
- Reporting read models: `backend/src/modules/reports`
- Reference data transport endpoints: `backend/src/modules/users`, `departments`, `activity-types`, `activity-results`
- Frontend page and UI blocks: `frontend/src/pages/activity-records`, `frontend/src/modules/activity-records`
- Dashboard summary UI: `frontend/src/pages/dashboard`, `frontend/src/modules/dashboard`
- Persistence schema: `backend/prisma/schema.prisma`

## Integration Boundaries

- `ActivityRecord` depends on `User`, `Department`, `ActivityType`, and `ActivityResult`.
- Reports aggregate only from `ActivityRecord` data and do not create primary records.
- Dictionary data is loaded through dedicated API endpoints and is not hardcoded in the frontend.
- License, support, and integration modules remain isolated and are not part of the V1 vertical slice.
