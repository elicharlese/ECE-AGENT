---
description: Pipeline
---

# Pipeline Workflow

Sets up CI/CD pipeline with GitHub Actions for Nx monorepo with web, mobile, and desktop apps.

## Steps

### 1. Create Kilo Pipeline Configuration

```bash
cat > .github/workflows/kilo-pipeline.yml << 'EOF'
name: Kilo CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NX_CLOUD_ACCESS_TOKEN: ${{ secrets.NX_CLOUD_ACCESS_TOKEN }}

jobs:
  main:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - run: npm ci

      - uses: nrwl/nx-set-shas@v4

      - run: npx nx format:check
      - run: npx nx affected -t lint --parallel=3
      - run: npx nx affected -t test --parallel=3 --configuration=ci
      - run: npx nx affected -t build --parallel=3

  deploy:
    needs: main
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npx nx build web --prod
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./dist/apps/web
EOF
```

### 2. Update Nx Configuration

```bash
cat > nx.json << 'EOF'
{
  "$schema": "./node_modules/nx/schemas/nx-schema.json",
  "namedInputs": {
    "default": ["{projectRoot}/**/*", "sharedGlobals"],
    "production": [
      "default",
      "!{projectRoot}/**/?(*.)+(spec|test).[jt]s?(x)?(.snap)",
      "!{projectRoot}/tsconfig.spec.json",
      "!{projectRoot}/.eslintrc.json",
      "!{projectRoot}/eslint.config.js"
    ],
    "sharedGlobals": []
  },
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["production", "^production"],
      "cache": true
    },
    "test": {
      "inputs": ["default", "^production", "{workspaceRoot}/jest.preset.js"],
      "cache": true
    },
    "lint": {
      "inputs": ["default", "{workspaceRoot}/.eslintrc.json"],
      "cache": true
    }
  },
  "plugins": [
    {
      "plugin": "@nx/eslint/plugin",
      "options": {
        "targetName": "lint"
      }
    },
    {
      "plugin": "@nx/next/plugin",
      "options": {
        "startTargetName": "start",
        "buildTargetName": "build",
        "devTargetName": "dev"
      }
    },
    {
      "plugin": "@nx/playwright/plugin",
      "options": {
        "targetName": "e2e"
      }
    },
    {
      "plugin": "@nx/expo/plugin",
      "options": {
        "startTargetName": "start",
        "serveTargetName": "serve",
        "runIosTargetName": "run-ios",
        "runAndroidTargetName": "run-android",
        "exportTargetName": "export",
        "prebuildTargetName": "prebuild",
        "installTargetName": "install",
        "buildTargetName": "build"
      }
    }
  ]
}
EOF
```

### 3. Create Project Configurations

```bash
# Web app project.json
cat > project.json << 'EOF'
{
  "name": "ece-agent",
  "$schema": "node_modules/nx/schemas/project-schema.json",
  "projectType": "application",
  "sourceRoot": ".",
  "targets": {
    "build": {
      "executor": "@nx/next:build",
      "outputs": ["{options.outputPath}"],
      "defaultConfiguration": "production",
      "options": {
        "outputPath": "dist/apps/web"
      },
      "configurations": {
        "development": {
          "outputPath": "dist/apps/web"
        },
        "production": {
          "outputPath": "dist/apps/web"
        }
      }
    },
    "serve": {
      "executor": "@nx/next:dev",
      "defaultConfiguration": "development",
      "options": {
        "buildTarget": "ece-agent:build",
        "dev": true
      },
      "configurations": {
        "development": {
          "buildTarget": "ece-agent:build:development",
          "dev": true
        },
        "production": {
          "buildTarget": "ece-agent:build:production",
          "dev": false
        }
      }
    }
  }
}
EOF

# Desktop app project.json
cat > apps/desktop/project.json << 'EOF'
{
  "name": "desktop",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "projectType": "application",
  "sourceRoot": "apps/desktop/src",
  "targets": {
    "build": {
      "executor": "nx:run-commands",
      "options": {
        "command": "tsc",
        "cwd": "apps/desktop"
      }
    },
    "serve": {
      "executor": "nx:run-commands",
      "options": {
        "command": "npm run dev",
        "cwd": "apps/desktop"
      }
    },
    "package": {
      "executor": "nx:run-commands",
      "options": {
        "command": "npm run dist",
        "cwd": "apps/desktop"
      }
    }
  }
}
EOF

# Shared UI library project.json
cat > libs/shared-ui/project.json << 'EOF'
{
  "name": "shared-ui",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "projectType": "library",
  "sourceRoot": "libs/shared-ui/src",
  "targets": {
    "build": {
      "executor": "@nx/js:tsc",
      "outputs": ["{options.outputPath}"],
      "options": {
        "outputPath": "dist/libs/shared-ui",
        "tsConfig": "libs/shared-ui/tsconfig.lib.json",
        "packageJson": "libs/shared-ui/package.json"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint"
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
      "options": {
        "jestConfig": "libs/shared-ui/jest.config.ts"
      }
    }
  }
}
EOF
```

### 4. Commit and Tag

```bash
git add .github/workflows/kilo-pipeline.yml nx.json project.json apps/desktop/project.json libs/shared-ui/project.json
git commit -m "feat(ci): add Kilo CI/CD pipeline with Nx support"
git tag -a v0.1.0 -m "CI/CD pipeline setup with Nx monorepo support"
```
