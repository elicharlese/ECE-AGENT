---
description: Bootstraps the Kilo CI/CD pipeline automation
---

# ⚙️ Pipeline Workflow

## Workflow: `/pipeline`

### Description  
Bootstraps the Kilo CI/CD pipeline automation. It:

- Verifies or generates the `.vercel/project.json` file using `vercel link --yes` (non-interactive),
- Reads `projectId` and `orgId` from that file,
- Validates secrets are set,
- Creates a GitHub Actions CI YAML file wiring in **Vercel**, **NPM**, and **semantic-release** automation,
- Commits the new workflow and tags the first version.

This requires the GitHub Actions **secrets**: `VERCEL_TOKEN`, `NPM_TOKEN`, plus optional `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` (but `project.json` can auto-generate them).

### Steps

1. **Install Vercel CLI (if missing)**
2. **Ensure `.vercel/project.json` exists & capture IDs**
3. **Validate GitHub Secrets**
4. **Generate GitHub Actions YAML (kilo-pipeline.yml)**
5. **Commit pipeline config**

### GitHub Actions Pipeline

The pipeline includes:
- **commit-lint**: Validates commit message format
- **build-and-test**: Runs lint, typecheck, tests, and build
- **release**: Performs semantic versioning and releases
- **deploy**: Deploys to Vercel production

### Required Secrets

- `VERCEL_TOKEN`: Vercel deployment token
- `NPM_TOKEN`: NPM publishing token
- `GITHUB_TOKEN`: Automatically provided by GitHub Actions

### Environment Variables

- `VERCEL_ORG_ID`: Auto-extracted from `.vercel/project.json`
- `VERCEL_PROJECT_ID`: Auto-extracted from `.vercel/project.json`

---

Once pushed to main, Kilo CI/CD enforces commit lint rules, builds and tests the project, performs semantic versioning, and deploys to Vercel—all according to your Windsurf/Kilo governance system.
