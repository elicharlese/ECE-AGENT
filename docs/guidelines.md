---
title: Documentation Guidelines
created: {{DATE}}
---

## 1. File Structure & Naming

All patch and batch documentation files must be stored under:

docs/
├─ guidelines.md
├─ batches/
└─ patches/

Files must use these names:

- `PATCHN_CHECKLIST.md`, `PATCHN_SUMMARY.md` in `docs/patches/patch-N/`
- `BATCHN_CHECKLIST.md`, `BATCHN_SUMMARY.md` in `docs/batches/batch-N/`

Checklist files should include at least these sections:

- **Summary**
- **Feature List**
- **To Do / Implementation Plan**
- **Tests to Write**
- **Notes & Links**

#### Checklist format

Use Markdown checklist notation:

- [ ] Feature A implemented
- [ ] Tests passing
- [ ] UI matches design spec

### 2. Docs Syntax & Templates

- Always include front-matter YAML (`title`, `created`, optional `reviewed:`).
- Use `## H2`, `### H3`, `#### H4` for hierarchy.
- Link to other docs using relative paths:  
  e.g. `[Patch 2 Summary](../patches/patch‑2/PATCH2_SUMMARY.md)`.
- Keep lines under ~80 characters for readability.
- Maintain change logs and file diffs inside summary docs or in the commit message, never mix them with main documentation.

### 3. Reference in Rules File

In your `global_rules.md`, ensure there's a line like:

[tag: DS] Cascade must use docs/guidelines.md as the source of truth for docs/content formatting and checklist generation.
