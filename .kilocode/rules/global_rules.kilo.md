Here’s the fully updated global_rules.kilo.md file, integrating all your changes and extensions for the modern Kilo CI/CD system:

⸻


# 🌍 Kilo Agent Global Rules  
**Activation:** Always-On, alongside Windsurf.

Work out of plan.kilo.md in docs folder.

---

## 🧪 Quality + CI (tag: QC)

- On **any push to `main`** or merged PR:
  - Run `lint`, `typecheck`, `format`, `test`, and `build`.
  - Execute semantic checks and AI self-verification (if enabled).
  - Validate `.env`, `.vercel/project.json`, and environment secrets.

- Commits and PRs **must conform to [Conventional Commits spec]**  
  (e.g. `fix(ui): handle null case`)  
  → Enforced via `commitlint` and PR title linting.

- Automatically run **Vercel wait logic** to verify `READY` state post-deploy.  
  Fail CI if Vercel is not live within 5 minutes.

---

## 🏷️ Semantic Versioning (tag: GT)

- Use `semantic-release` or `standard-version` to bump versions:
  - `feat:` → Minor bump  
  - `fix:` → Patch bump  
  - `BREAKING CHANGE:` → Major bump

- Auto-generate and publish `CHANGELOG.md` from commit log.
- Support rollback tags (e.g. `rollback@1.2.3`) and semver traceability.

---

## 🔄 Release & Deployment (tag: DP)

- On `main` merges:
  - Build and deploy to **Vercel** production.
  - CI must pass and Vercel must report `READY` status.

- Deploy preview for **every PR**, including patch branches.
- Use **`UnlyEd/github-action-await-vercel`** for deployment confirmation.
- Optional: Post-deploy E2E smoke tests for quality gate.

---

## 📦 Branching & Hotfix Strategy (tag: BR)

- `main` is always production-ready.
- All changes land via `feature/`, `patch/`, or `hotfix/` branches.
- Urgent hotfixes:
  - Use `hotfix/x.y.z` from `main`.
  - Merge to `main`, then cherry-pick into active Windsurf sprint branches.

---

## 🧩 Integration with Windsurf (tag: WS)

- Windsurf leads patch/batch development on isolated branches.
- Kilo:
  - Merges only Windsurf-reviewed PRs.
  - Maintains **CI parity** and **deployment readiness** on `main`.
  - Never alters Windsurf’s patch structure or END_GOAL logic.

---

## 🛠 PR Validation (tag: PR)

- PR Titles must follow **Conventional Commit** syntax.
- Use:
  ```yaml
  uses: amannn/action-semantic-pull-request@v3

to enforce feat(x):, fix(y):, etc.
	•	Require a Windsurf agent/human review before merging:
	•	Enforce presence of label: Windsurf-approved
	•	Block merge if label is missing or reviewers not tagged @windsurf

⸻

🔁 Production Health & QA (tag: QA)
	•	After each deploy:
	•	Confirm Vercel status is READY.
	•	Run optional smoke or integration test suite.
	•	Fail deploy if post-deploy checks don’t pass in time.
	•	CI must always be green before version tag or merge to main.

⸻

📣 Post-Release Notifications (tag: DX)
	•	After successful deploy:
	•	Post to Slack/Discord via webhook.
	•	Include:
	•	Release version (v1.2.3)
	•	Deployed timestamp
	•	Deployment URL
	•	Add this info as a comment in the GitHub Release Notes

⸻

🔄 Optional Kilo Workflows

You may also include these GitHub workflows for full automation:

Workflow	Purpose
verify-pr.yml	Lints PR titles and commits with commitlint, checks reviewers
release-check.yml	Runs build → deploy → waits for Vercel → optional Slack notify
hotfix.yml	Handles hotfix branches, rollbacks, and rebasing to Windsurf


⸻

🔐 Environment Secrets

Ensure these secrets exist in each GitHub repo for Kilo CI/CD:

VERCEL_TOKEN=<your token>
VERCEL_ORG_ID=elicharlese
VERCEL_PROJECT_ID=from .vercel/project.json
NPM_TOKEN=<npm publish token>

You may also optionally include:

SLACK_WEBHOOK_URL=<for post-release notifications>


⸻

This file governs all agentic production, versioning, deploy, and QA behavior for Kilo.
It complements global_rules.md for Windsurf. Both systems run in harmony across the same repo.