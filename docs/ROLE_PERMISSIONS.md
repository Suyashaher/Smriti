# Role Permissions & Authorization

Smriti enforces a strict role-based access control (RBAC) model.

## Roles

### Patient
- **Access:** Can only access the React application under the `/elderly` route.
- **Data:** Can view and mutate their own games, reminders, routines, and settings.
- **Restrictions:** Cannot view analytics, alerts, or any caregiver screens. Cannot view data of other patients.

### Caregiver
- **Access:** Can access the `/caregiver` route.
- **Data:** Can view analytics, alerts, and profiles **ONLY** for patients explicitly assigned to them via the `patient_caregiver` collection.
- **Restrictions:** Cannot view patients assigned to other caregivers.

### Healthcare Worker
- Similar to Caregiver, but typically assigned to a larger cohort of patients.

### Admin
- **Access:** System configuration and user management (Deferred to Phase 11).

## Implementation Details (Phase 9)
While full JWT authentication is deferred to Phase 11, Phase 9 fully implements the **Authorization** layer.
- Frontend requests to caregiver endpoints include an `X-Caregiver-Id` header.
- Backend routers (`caregivers.py`, `analytics.py`, `alerts.py`) verify that the requested `patient_id` exists in the `patient_caregiver` mapping for the provided `caregiver_id`.
- If the mapping does not exist, the API returns a `403 Forbidden`.
