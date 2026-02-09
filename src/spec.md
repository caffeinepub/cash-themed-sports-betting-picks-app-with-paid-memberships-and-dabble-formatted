# Specification

## Summary
**Goal:** Add admin-generated referral codes that users can redeem for configurable-duration premium access, without disrupting existing Stripe-based subscriptions or premium gating.

**Planned changes:**
- Add Motoko backend referral-code management: admin-only create (configurable duration; optional max uses; optional expiration), list (including usage counts and active/revoked state), and revoke/disable.
- Add backend user method to redeem a referral code for the caller, enforcing code validity/limits and applying/extending premium access deterministically.
- Update backend subscription/premium access model so referral-granted access is recognized by existing premium gating while keeping Stripe subscriptions working unchanged.
- Update Admin page with a “Referral Codes” section to generate codes, copy to clipboard, view existing codes, and revoke codes (admin-gated).
- Update Account page with a signed-in “Redeem referral code” flow with clear English success/error messaging and refreshed subscription status after redemption.
- Add React Query hooks for create/list/revoke/redeem referral codes and invalidate/refetch relevant queries (referral codes list; `['subscription']`) after mutations.

**User-visible outcome:** Admins can generate, view, and revoke referral codes; signed-in users can redeem a code from their Account page to gain/extend premium access, and premium-gated features recognize the updated access immediately.
