# Specification

## Summary
**Goal:** Ensure the configured creator/admin principal always has premium access in backend checks, and provide admin support tooling to diagnose and manage users’ premium status.

**Planned changes:**
- Update backend premium-check logic so the configured creator/admin principal is always treated as premium-active based solely on the caller principal, regardless of any stored/missing UserProfile or subscription/referral/manual flags.
- Add an admin-only backend API to diagnose a target user’s premium access by principal, returning the stored UserProfile (if any) plus a computed premium status/source consistent with premium gating logic, without mutating state.
- Extend the Admin page UI with an “Admin Support” section (visible only to admins) that lets an admin enter a Principal ID, fetch the diagnostic report, and display clear English status details with loading/error states.
- Extend admin manual premium tooling to support both granting and revoking manual premium for a specified Principal ID, and ensure the Admin Support UI refreshes immediately after changes (via cache invalidation/refetch).
- Ensure frontend premium gating relies on backend-reported premium status so the creator/admin principal never sees premium upsells on PremiumGate-protected screens and the Account page shows premium as Active for that principal.

**User-visible outcome:** The creator/admin account always has premium access across the app, and admins can look up any user by Principal ID to see a clear premium-status report and grant/revoke manual premium access with immediate UI updates.
