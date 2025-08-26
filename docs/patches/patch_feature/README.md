# Feature Patch Root

Feature-focused patch documentation lives here. Each subfolder represents a feature area mapped from `END_GOAL.md`.

## Structure

```text
patch_feature/
  feature-name/
    patch-number/
      PATCH_CHECKLIST.md
      PATCH_SUMMARY.md
```

## Current Features

- admin_login — Authentication and admin security features
- responsive_ui — UI components and responsive design
- mobile_desktop_consistency — Cross-platform design consistency
- nx_routing — Nx workspace and routing configuration
- test_coverage — Testing implementation and expansion
- zod_validation — Runtime validation with Zod schemas
- ci_cd_deployment — Deployment pipeline and automation
- documentation_mapping — Documentation organization and tracking
- keyboard_shortcuts — Global hotkeys, command palette, help overlay

## How to add a patch

1. Choose the related feature directory.
2. Create `patch-<n>/` (next sequential number within that feature).
3. Add `PATCH_CHECKLIST.md` and `PATCH_SUMMARY.md` following `docs/patches/PATCH_GUIDELINES.md`.
4. Cross-reference `END_GOAL.md` and link affected files/components.
