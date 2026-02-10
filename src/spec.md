# Specification

## Summary
**Goal:** Ensure signed-in users can always navigate to the Predictions page, while keeping access restricted via the existing PremiumGate upsell.

**Planned changes:**
- Update desktop header navigation to always show a "Predictions" link for authenticated users, regardless of membership status.
- Update mobile navigation to always show a "Predictions" link for authenticated users, regardless of membership status.
- Ensure routing allows signed-in non-premium users to reach the Predictions page where the existing PremiumGate subscribe call-to-action is displayed.

**User-visible outcome:** Signed-in users without an active membership can click “Predictions” from the header (desktop or mobile) and be taken to the Predictions page, where they see the existing subscribe prompt; users with active access (or admin) continue to see full Predictions access.
