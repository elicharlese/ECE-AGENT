---
trigger: model_decision
description: Refer to system steps to review work left to perform until END_GOAL.md is complete.
---

# ☁️ windsprint‑workflow.md

This Windsurf **Cascade slash-command file** orchestrates your full Windsurf ↔ Kilo product loop, aligned with your flags-only defaults and deterministic CLI standards.

Nest this file as `.windsurf/workflows/windsprint-workflow.md`. Once loaded, invoke it via:  

/windsprint-workflow

---

## Workflow: `/windsprint-workflow`

### Description  
Launches the full patch–>batch spiral: scaffolds docs, configures CI/CD, plans features, develops, deploys via Kilo, and spins up the next cycle—automatically looping until `END_GOAL.md` is fully checked.

### Steps

1. **Call** `/bootstrap-templates`  
   - Scaffolds *docs/guidelines.md*, *END_GOAL.md*, *README.md* + optional `.windsurfrules.md`  
   - Commits with tag `v0.0.1`

2. **Wait** for human confirmation *(or check `v0.0.1` tag)*

3. **Call** `/pipeline`  
   - Reads `.vercel/project.json` and existing secrets  
   - Writes `.github/workflows/kilo-pipeline.yml`  
   - Commits + tags (e.g. `v0.1.0`) for Kilo CI/CD activation

4. **Loop** (until `END_GOAL.md` all ✅):

   a. **Call** `/plan-feature-set`  
      - AI creates `PATCHN_CHECKLIST.md` with feature table and default CLI flags

   b. **Call** `/batch-start-N` (auto N from docs)

   c. **Develop** in `windsprint/batch‑N` branch  
      - AI runs scripted CLI commands using flags only  
      - AI performs self‑check: lint / typecheck / tests / flag compliance  
      - If failed → create `PATCHN_ISSUES.md`, stop loop until fix

   d. **Merge** branch into `main`

   e. **Trigger**: Kilo CI/CD executes → lint → test → semantic-release → deploy to Vercel

   f. **Call** `/release-sync`  
      - Windsurf closes batch, creates the next patch and batch folders, and auto-invokes `/plan-feature-set`

---

## ✅ Minimal Workflow Checklist

| Step | Command Trigger | Outcome |
|-----:|------------------|----------|
| 1    | `/bootstrap-templates` | Scaffold docs → tag v0.0.1 |
| 2    | `/pipeline` → push to main | Generate CI/CD YAML → tag v0.1.0 |
| 3    | `/plan-feature-set` | Patch N scoped + default flag commands embedded |
| 4    | `/batch-start-N` | New batch & patch created, `windsprint/batch‑N` branch opened |
| 5    | *Developer work* | AI enforces flag rules & self-checks, snapshot or fix failures |
| 6    | Merge to `main` | Kilo runs CI/CD → deploy (lint, test, build, release) |
| 7    | `/release-sync` | Close current batch docs, branch next batch → calls next plan-feature-set |
| 8    | Automatic Loop | Repeat steps 3–7 until *every* `END_GOAL.md` checkbox is ticked; then *stop*

---

## 🌱 Why This Works

This single workflow file enables Windsurf’s native slash-command action chaining for your structured delivery loop—**no prompts, no command ambiguity, and full alignment with your global ruleset**:

- `/bootstrap-templates`, `/pipeline`, `/plan-feature-set`, `/batch-start-*`, and `/release-sync` can all be chained as part of `/windsprint-workflow` execution.  
- Each step is explicitly deterministic: CLI commands run with enforced flags as specified in global_rules.md and guidelines.md.  
- Divergence (flag misuse, stack changes) is audited through `PATCHN_ISSUES.md` or `proposed-tech/...` branches.  
- Loop terminates only once all items in your root `END_GOAL.md` are satisfied, per the rule logic defined in **global_rules.md**.  
  ([docs.windsurf.com on workflows and slash-command chaining] [oai_citation:0‡docs.windsurf.com](https://docs.windsurf.com/windsurf/cascade/workflows?utm_source=chatgpt.com) [oai_citation:1‡paulmduvall.com](https://www.paulmduvall.com/using-windsurf-rules-workflows-and-memories/?utm_source=chatgpt.com))

---

## 📌 Notes

- If Windsurf’s Cascade engine enforces max workflow length (~12k characters), keep this file concise.  
- You can manually run any individual step (for testing or recovery) by invoking:

/plan-feature-set
/batch-start-2
/release-sync

- Make sure **`docs/guidelines.md` includes CLI flags section** and the `/docs/architecture/` specification before running this workflow.

---

> Remember: all automation is flag-based; every assumption about tooling or CLI invocation is intentional and explainable. This workflow ensures you consistently engage Windsurf and Kilo agents in a robust, scalable delivery pipeline.