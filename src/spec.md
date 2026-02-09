# Specification

## Summary
**Goal:** Make the app background fill the full viewport and look more vibrant with a cash-themed green + gold treatment, while keeping readability in light and dark modes.

**Planned changes:**
- Update `AppLayout` global background styling so it consistently extends to full viewport height across all routes and avoids any blank bands above/below content.
- Adjust the landing hero background treatment to keep using the existing cash pattern image but with more vivid opacity/overlay/gradient settings, and a smoother transition into the page background.
- Ensure no layout overflow is introduced (especially preventing unintended horizontal scrolling on mobile/desktop) and preserve text/card contrast in both light and dark themes.

**User-visible outcome:** All pages have a consistent, full-height, vibrant cash-themed background, and the landing hero feels more integrated and vivid without hurting readability in light or dark mode.
