# Specification

## Summary
**Goal:** Ensure the configured creator principal always has permanent premium access and can access all admin-only backend features and the Admin Dashboard (including Admin Support) after login.

**Planned changes:**
- Update backend admin authorization to treat the configured creator principal as admin-equivalent for all admin-only backend methods, even if not listed in the AccessControl admin set.
- Update the backend admin-check method used by the frontend (actor.isCallerAdmin()) to return true for the creator principal.
- Verify and adjust frontend admin gating so the creator principal can reliably access the Admin Dashboard route and Admin Support UI without seeing an “Access Denied” screen, while keeping non-creator/non-admin behavior unchanged.

**User-visible outcome:** When logged in as the configured creator principal, the user can always access premium features and open/use the Admin Dashboard (including Admin Support) without authorization blocks; all other users’ premium and admin restrictions remain the same.
