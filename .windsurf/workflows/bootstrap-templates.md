---
description: Bootstrap Templates
---

# Bootstrap Templates

Scaffolds baseline docs and architecture structure:
- Downloads files from Cascade-Wash
- Adds docs/guidelines.md, architecture/, END_GOAL.md, README.md
- Optional .windsurfrules.md
- Tags v0.0.1

## Steps

### 1. Fetch template files from Cascade-Wash

```bash
TEMPLATE_REPO="https://raw.githubusercontent.com/elicharlese/Cascade-Wash/main"

declare -A FILES_TO_FETCH=(
  [".windsurf/rules/windsprint-workflow.md"]=".windsurf/rules/windsprint-workflow.md"
  [".github/workflows/hotfix.yml"]=".github/workflows/hotfix.yml"
  [".github/workflows/release-check.yml"]=".github/workflows/release-check.yml"
  [".github/workflows/verify-pr.yml"]=".github/workflows/verify-pr.yml"
  ["docs/guidelines.md"]="docs/guidelines.md"
)

echo "🌀 Fetching Windsurf/Kilo template files from Cascade-Wash..."

for path in "${!FILES_TO_FETCH[@]}"; do
  dest="${FILES_TO_FETCH[$path]}"
  mkdir -p "$(dirname "$dest")"
  curl -sSfL "$TEMPLATE_REPO/$path" -o "$dest"
  if [[ $? -eq 0 ]]; then
    echo "✅ Downloaded: $dest"
  else
    echo "❌ Failed to download: $path"
  fi
done
```

### 2. Scaffold architecture files

```bash
mkdir -p docs/architecture docs/batches docs/patches
for file in context containers components; do
  cat > docs/architecture/$file.md << ARCH
# $(echo $file | sed 's/.*/\u&/')

\`\`\`mermaid
architecture-beta
  %% Diagram of $file
\`\`\`
ARCH
done
```

### 3. Scaffold END_GOAL.md

```bash
cat > END_GOAL.md << 'EOG'
# ✅ END GOAL – Acceptance Criteria

- [ ] Admin login (\`admin/admin123\`) works securely
- [ ] Responsive UI using React + Tailwind
- [ ] Mobile + desktop exhibits consistent design
- [ ] Routing works via Nx app layouts
- [ ] ≥ 90% test coverage
- [ ] Zod-based runtime validation
- [ ] CI/CD deploys via Kilo pipeline successfully
- [ ] All checklist items created and mapped in docs
EOG
```

### 4. Scaffold README.md

```bash
cat > README.md << 'EOR'
# 🚀 Windsurf + Kilo Workflow

### Slash Commands

- \`/bootstrap-templates\`
- \`/pipeline\`
- \`/plan-feature-set\`
- \`/batch-start-N\`
- \`/release-sync\`

### Automation Flags

All CLI commands (Nx, Expo, Vercel) must run non-interactively with flags:

\`\`\`bash
npx create-nx-workspace … --no-interactive
nx g @nx/expo:app mobile --no-interactive
\`\`\`

See \`docs/guidelines.md\` (Section 5) for details.

### Flow Overview

1. \`/bootstrap-templates\`
2. \`/pipeline\`
3. \`/plan-feature-set\`
4. \`/batch-start-N\`
5. Develop → PR → merge
6. \`/release-sync\`
7. Repeat until \`END_GOAL.md\` is complete

EOR
```

### 5. Optionally scaffold .windsurfrules.md

```bash
echo "# Project‑level override rules (optional)" > .windsurfrules.md
```

### 6. Commit docs and tag

```bash
git add docs/ .github/ .windsurf/ END_GOAL.md README.md .windsurfrules.md
git commit -m "feat(docs): scaffold baseline templates & CLI flag guidance"
git tag -a v0.0.1 -m "Initial docs scaffold with CLI automation standards"
```
