# Specification

## Summary
**Goal:** Reduce predictions data auto-refresh frequency to every 30 minutes on the Predictions list and detail pages, without changing gating behavior or live score polling.

**Planned changes:**
- Update the `/predictions` page predictions query refetch interval to 30 minutes (1,800,000 ms) instead of 10 seconds.
- Update the `/predictions/$id` page prediction query refetch interval to 30 minutes (1,800,000 ms) instead of 10 seconds.
- Keep PremiumGate and TermsAcceptanceGate behavior unchanged on both pages, and keep live score polling cadence unchanged.

**User-visible outcome:** Predictions content updates automatically every 30 minutes on the list and detail pages, while access gating and live score updates continue to behave as they do today.
