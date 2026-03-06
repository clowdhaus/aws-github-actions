# Modernize Tooling Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Align aws-github-actions monorepo tooling with argo-cd-action and terraform-min-max codebases — replace yarn/lerna with npm workspaces, replace semantic-release with git-cliff, modernize configs, clean up stale artifacts.

**Architecture:** Keep monorepo with npm workspaces (replacing yarn workspaces + lerna). Each action sub-directory keeps its own `package.json`, `action.yml`, and `dist/`. Root manages shared devDependencies, linting, and building. Release management moves to git-cliff + GitHub Releases.

**Tech Stack:** npm workspaces, ncc, TypeScript, ESLint flat config, Vitest, git-cliff, GitHub Actions

---

### Task 1: Remove stale artifacts and legacy configs

**Files:**
- Delete: `CHANGELOG.md`
- Delete: `awscli/CHANGELOG.md`
- Delete: `cloudfront_invalidate/CHANGELOG.md`
- Delete: `iam_access_credentials/CHANGELOG.md`
- Delete: `packages/awscli-core/CHANGELOG.md`
- Delete: `s3_sync/CHANGELOG.md`
- Delete: `commitlint.config.js`
- Delete: `lerna.json`
- Delete: `yarn.lock`

**Step 1: Delete all stale files**

```bash
rm -f CHANGELOG.md awscli/CHANGELOG.md cloudfront_invalidate/CHANGELOG.md iam_access_credentials/CHANGELOG.md packages/awscli-core/CHANGELOG.md s3_sync/CHANGELOG.md commitlint.config.js lerna.json yarn.lock
```

**Step 2: Commit**

```bash
git add -A
git commit -m "chore: remove stale CHANGELOG.md files, commitlint, lerna config, and yarn.lock"
```

---

### Task 2: Update .gitignore to match reference projects

**Files:**
- Modify: `.gitignore`

**Step 1: Replace .gitignore with clean version**

```gitignore
# Dependency directory
node_modules

# Logs
logs
*.log
npm-debug.log*
lerna-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage
coverage
*.lcov
.nyc_output

# Compiled binary addons
build/Release

# TypeScript cache
*.tsbuildinfo

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Output of 'npm pack'
*.tgz

# dotenv environment variables file
.env
.env.test

# Plan files
docs/plans/

# OS metadata
.DS_Store
Thumbs.db
```

**Step 2: Commit**

```bash
git add .gitignore
git commit -m "chore: clean up .gitignore to match reference projects"
```

---

### Task 3: Update .gitattributes

**Files:**
- Modify: `.gitattributes`

**Step 1: Update .gitattributes to remove stale references and keep dist markers**

```gitattributes
awscli/dist/* linguist-generated
cloudfront_invalidate/dist/* linguist-generated
iam_access_credentials/dist/* linguist-generated
s3_sync/dist/* linguist-generated
packages/awscli-core/lib/* linguist-generated
```

**Step 2: Commit**

```bash
git add .gitattributes
git commit -m "chore: clean up .gitattributes, remove references to deleted config files"
```

---

### Task 4: Modernize root package.json — migrate from yarn/lerna to npm workspaces

**Files:**
- Modify: `package.json`

**Step 1: Rewrite root package.json**

```json
{
  "name": "aws-github-actions",
  "version": "0.0.0",
  "private": true,
  "description": "GitHub actions for AWS services",
  "keywords": [
    "github",
    "actions",
    "aws",
    "cloudfront",
    "s3"
  ],
  "homepage": "https://github.com/clowdhaus/aws-github-actions#readme",
  "bugs": {
    "url": "https://github.com/clowdhaus/aws-github-actions/issues"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/clowdhaus/aws-github-actions.git"
  },
  "license": "Apache-2.0",
  "author": "Clowd Haus, LLC",
  "workspaces": [
    "awscli",
    "cloudfront_invalidate",
    "iam_access_credentials",
    "packages/*",
    "s3_sync"
  ],
  "scripts": {
    "all": "npm run lint && npm run test && npm run build && npm run compile",
    "build": "npm run build --workspace=packages/awscli-core",
    "test": "vitest run",
    "compile": "npm run compile --workspaces --if-present",
    "lint": "eslint . --quiet --fix"
  },
  "dependencies": {
    "@actions/core": "^3.0.0"
  },
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "@types/node": "^25.0.2",
    "@vercel/ncc": "^0.38.4",
    "eslint": "^10.0.0",
    "typescript": "^5.9.3",
    "typescript-eslint": "^8.47.0",
    "vitest": "^4.0.18"
  }
}
```

Key changes:
- Remove commitizen, cz-conventional-changelog, lerna dependencies
- Remove `config.commitizen`, `command`, `resolutions` sections
- Add vitest
- Set version to `"0.0.0"` (git-cliff manages versions via tags)
- Update scripts to use `npm run` instead of `yarn`/`lerna run`
- Add `"main": "src/index.ts"` is NOT applicable here (monorepo root)

**Step 2: Run npm install to generate package-lock.json**

```bash
npm install
```

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: migrate from yarn/lerna to npm workspaces, add vitest"
```

---

### Task 5: Modernize tsconfig.json

**Files:**
- Modify: `tsconfig.json`

**Step 1: Update tsconfig.json to use `strict: true` and match reference projects**

```json
{
  "compilerOptions": {
    "target": "esnext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "removeComments": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  },
  "include": ["packages/**/*.ts", "awscli/**/*.ts", "cloudfront_invalidate/**/*.ts", "iam_access_credentials/**/*.ts", "s3_sync/**/*.ts"],
  "exclude": ["node_modules", "**/dist/**", "**/lib/**"]
}
```

**Step 2: Commit**

```bash
git add tsconfig.json
git commit -m "chore: modernize tsconfig.json - use strict mode, match reference projects"
```

---

### Task 6: Update eslint.config.mjs to match reference projects

**Files:**
- Modify: `eslint.config.mjs`

**Step 1: Update eslint config to add test ignores**

```javascript
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['**/dist/**', '**/*.js', '**/lib/**', '**/test/**'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
);
```

**Step 2: Commit**

```bash
git add eslint.config.mjs
git commit -m "chore: update eslint config to ignore test and lib directories"
```

---

### Task 7: Fix TypeScript strict mode errors in source files

**Files:**
- Modify: `awscli/index.ts`
- Modify: `cloudfront_invalidate/index.ts`
- Modify: `iam_access_credentials/index.ts`
- Modify: `s3_sync/index.ts`
- Modify: `packages/awscli-core/index.ts`

**Step 1: Run `npx tsc --noEmit` to identify strict mode errors**

```bash
npx tsc --noEmit
```

**Step 2: Fix errors — primarily `error.message` on unknown catch types and nullable access**

For all files with `catch (error)`, change to `catch (error: unknown)` and use type guard:

In `awscli/index.ts`:
```typescript
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error));
  }
```

In `cloudfront_invalidate/index.ts`:
```typescript
    const invalidationId = invalidation.Invalidation?.Id;
    core.setOutput('invalidation-id', invalidationId);
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error));
  }
```

In `iam_access_credentials/index.ts`:
```typescript
    envValues.accessKeyId = role.Credentials!.AccessKeyId!;
    envValues.secretAccessKey = role.Credentials!.SecretAccessKey!;
    envValues.sessionToken = role.Credentials!.SessionToken;
```
And the catch:
```typescript
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error));
  }
```

In `s3_sync/index.ts`:
```typescript
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error));
  }
```

**Step 3: Verify compilation passes**

```bash
npx tsc --noEmit
```

**Step 4: Commit**

```bash
git add awscli/index.ts cloudfront_invalidate/index.ts iam_access_credentials/index.ts s3_sync/index.ts packages/awscli-core/index.ts
git commit -m "fix: resolve TypeScript strict mode errors across all actions"
```

---

### Task 8: Add cliff.toml for release management

**Files:**
- Create: `cliff.toml`

**Step 1: Create cliff.toml (identical to reference projects)**

```toml
[changelog]
header = ""
body = """
{% for group, commits in commits | group_by(attribute="group") %}
    ### {{ group | striptags | trim | upper_first }}
    {% for commit in commits %}
        - {% if commit.scope %}*({{ commit.scope }})* {% endif %}\
            {% if commit.breaking %}[**breaking**] {% endif %}\
            {{ commit.message | upper_first }}\
    {% endfor %}
{% endfor %}
"""
trim = true

[git]
conventional_commits = true
filter_unconventional = true
split_commits = false
commit_parsers = [
  { message = "^feat", group = "Features" },
  { message = "^fix", group = "Bug Fixes" },
  { message = "^perf", group = "Performance" },
  { message = "^refactor", group = "Refactor" },
  { message = "^doc", group = "Documentation" },
  { message = "^style", group = "Styling" },
  { message = "^test", group = "Testing" },
  { message = "^chore\\(release\\)", skip = true },
  { message = "^chore\\(deps\\)", skip = true },
  { message = "^chore\\(deps-dev\\)", skip = true },
  { message = "^chore|^ci", group = "Miscellaneous Tasks" },
]
filter_commits = false
tag_pattern = "v[0-9].*"

[bump]
breaking_always_bump_major = true
```

**Step 2: Commit**

```bash
git add cliff.toml
git commit -m "chore: add cliff.toml for git-cliff release management"
```

---

### Task 9: Add release.yml workflow

**Files:**
- Create: `.github/workflows/release.yml`

**Step 1: Create release workflow matching reference projects**

```yaml
name: release

on:
  push:
    branches:
      - main
    paths:
      - '.github/workflows/release.yml'
      - 'awscli/**'
      - 'cloudfront_invalidate/**'
      - 'iam_access_credentials/**'
      - 'packages/**'
      - 's3_sync/**'
      - 'package.json'
      - 'package-lock.json'

permissions:
  contents: write

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: false

jobs:
  release:
    name: release
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6
        with:
          fetch-depth: 0
          persist-credentials: false

      - name: Determine next version
        id: git-cliff
        uses: orhun/git-cliff-action@c93ef52f3d0ddcdcc9bd5447d98d458a11cd4f72 # v4
        with:
          config: cliff.toml
          args: --bump --unreleased
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Create release
        if: steps.git-cliff.outputs.version != ''
        uses: softprops/action-gh-release@a06a81a03ee405af7f2048a818ed3f03bbf83c7b # v2
        with:
          tag_name: ${{ steps.git-cliff.outputs.version }}
          body: ${{ steps.git-cliff.outputs.content }}
          make_latest: "true"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Step 2: Commit**

```bash
git add .github/workflows/release.yml
git commit -m "chore: add git-cliff release workflow, replacing lerna versioning"
```

---

### Task 10: Modernize existing CI workflows with verify-build job and pinned actions

**Files:**
- Modify: `.github/workflows/awscli.yml`
- Modify: `.github/workflows/cloudfront_invalidate.yml`
- Modify: `.github/workflows/s3_sync.yml`

**Step 1: Update awscli.yml**

```yaml
name: awscli

on:
  pull_request:
    branches:
      - main
    paths:
      - '.github/workflows/**'
      - 'awscli/**'
      - 'packages/awscli-core/**'
      - 'package.json'
      - 'package-lock.json'
  push:
    branches:
      - main
    paths:
      - '.github/workflows/**'
      - 'awscli/**'
      - 'packages/awscli-core/**'
      - 'package.json'
      - 'package-lock.json'

permissions:
  contents: read

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  verify-build:
    name: Verify dist is up to date
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6
        with:
          persist-credentials: false

      - name: Setup Node.js
        uses: actions/setup-node@53b83947a5a98c8d113130e565377fae1a50d02f # v6
        with:
          node-version: 24

      - name: Install, test, and build
        run: |
          npm ci --ignore-scripts
          npm run all

      - name: Check for uncommitted changes
        run: |
          if ! git diff --quiet awscli/dist/ cloudfront_invalidate/dist/ iam_access_credentials/dist/ s3_sync/dist/ packages/awscli-core/lib/; then
            echo "::error::dist is out of date. Run 'npm run all' and commit the result."
            git diff --stat
            exit 1
          fi

  awscli:
    name: Execute some awscli invocations
    needs: verify-build
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [macos-latest, windows-latest, ubuntu-latest]
    steps:
      - name: Checkout
        uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6
        with:
          persist-credentials: false

      - name: Configure AWS Credentials
        uses: ./iam_access_credentials
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: List us-east-1 DHCP option set values w/ default json output
        uses: ./awscli
        with:
          cli-command: ec2
          cli-subcommand: describe-dhcp-options
          cli-parameters: --query DhcpOptions[0].DhcpConfigurations[*].Values[0].Value
          aws-region: us-east-1
```

**Step 2: Update s3_sync.yml**

```yaml
name: s3_sync

on:
  pull_request:
    branches:
      - main
    paths:
      - '.github/workflows/**'
      - 's3_sync/**'
      - 'packages/awscli-core/**'
      - 'package.json'
      - 'package-lock.json'
  push:
    branches:
      - main
    paths:
      - '.github/workflows/**'
      - 's3_sync/**'
      - 'packages/awscli-core/**'
      - 'package.json'
      - 'package-lock.json'

permissions:
  contents: read

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  s3-sync:
    name: Sync assets to S3
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [macos-latest, windows-latest, ubuntu-latest]
    steps:
      - name: Checkout
        uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6
        with:
          persist-credentials: false

      - name: Configure AWS Credentials
        uses: ./iam_access_credentials
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Sync to S3
        uses: ./s3_sync
        with:
          local-path: s3_sync/dist
          bucket-name: ${{ secrets.S3_BUCKET_NAME }}
          path-prefix: my/new/prefix
          args: --delete
```

**Step 3: Update cloudfront_invalidate.yml**

```yaml
name: cloudfront_invalidate

on:
  pull_request:
    branches:
      - main
    paths:
      - '.github/workflows/**'
      - 'cloudfront_invalidate/**'
      - 'package.json'
      - 'package-lock.json'
  push:
    branches:
      - main
    paths:
      - '.github/workflows/**'
      - 'cloudfront_invalidate/**'
      - 'package.json'
      - 'package-lock.json'

permissions:
  contents: read

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  cloudfront-invalidate:
    name: Invalidate CloudFront cache
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6
        with:
          persist-credentials: false

      - name: Configure AWS Credentials
        uses: ./iam_access_credentials
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: CloudFront invalidation
        uses: ./cloudfront_invalidate
        with:
          distribution-id: ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }}
          paths: |
            /index.html
            /error.html
            /static/*
```

**Step 4: Commit**

```bash
git add .github/workflows/awscli.yml .github/workflows/cloudfront_invalidate.yml .github/workflows/s3_sync.yml
git commit -m "chore: modernize CI workflows - add PR triggers, pinned actions, permissions, concurrency"
```

---

### Task 11: Update .github/README.md to remove stale references

**Files:**
- Modify: `.github/README.md`

**Step 1: Update README to remove lerna/yarn/commitizen references**

Replace the "Getting Started" and badge sections. Remove lerna badge, commitizen badge. Remove the Prerequisites section about yarn and lerna. Update to reference npm.

```markdown
<p align="center">
  <img src="./images/aws-actions.png" alt="aws-actions" height="196px">
</p>
<h1 style="font-size: 56px; margin: 0; padding: 0;" align="center">
  aws-github-actions
</h1>
<p align="center">
  <img src="https://badgen.net/badge/TypeScript/strict%20%F0%9F%92%AA/blue" alt="Strict TypeScript">
</p>

Collection of GitHub actions for interacting with AWS services.

| Action                                                                                    | Local Action Tests                                                                                                      |
| ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| [`clowdhaus/aws-github-actions/awscli@main`](../awscli)                                 | ![AWS Command Line Interface](https://github.com/clowdhaus/aws-github-actions/workflows/awscli/badge.svg)               |
| [`clowdhaus/aws-github-actions/cloudfront_invalidate@main`](../cloudfront_invalidate)   | ![CloudFront Invalidate](https://github.com/clowdhaus/aws-github-actions/workflows/CloudFront%20Invalidation/badge.svg) |
| [`clowdhaus/aws-github-actions/iam_access_credentials@main`](../iam_access_credentials) | ![IAM Access Credentials](https://github.com/clowdhaus/aws-github-actions/workflows/IAM%20Credentials/badge.svg)        |
| [`clowdhaus/aws-github-actions/s3_sync@main`](../s3_sync)                               | ![S3 Sync](https://github.com/clowdhaus/aws-github-actions/workflows/S3%20Sync/badge.svg)                               |

## Usage

See individual action directory for details on usage and examples.

- [AWS Command Line Interface](../awscli) - execute awscli commands
- [CloudFront Invalidate](../cloudfront_invalidate) - invalidate AWS CloudFront distribution to force cache refresh
- [IAM Access Credentials](../iam_access_credentials) - ensure GitHub actions workflow environment has necessary AWS IAM credentials available for subsequent AWS actions
- [S3 Sync](../s3_sync) - synchronize local files to remote AWS S3 bucket

## Getting Started

This project uses [npm workspaces](https://docs.npmjs.com/cli/using-npm/workspaces) to manage the monorepo. Install dependencies:

```bash
npm install
```

Build all actions:

```bash
npm run all
```

## Contributing

Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for details on our code of conduct and the process for submitting pull requests.
```

**Step 2: Commit**

```bash
git add .github/README.md
git commit -m "chore: update README - remove lerna/yarn references, document npm workspaces"
```

---

### Task 12: Rename dependabot.yaml to dependabot.yml for consistency

**Files:**
- Rename: `.github/dependabot.yaml` → `.github/dependabot.yml`

**Step 1: Rename file**

```bash
git mv .github/dependabot.yaml .github/dependabot.yml
```

**Step 2: Commit**

```bash
git add -A
git commit -m "chore: rename dependabot.yaml to dependabot.yml for consistency"
```

---

### Task 13: Rebuild dist files and verify

**Step 1: Install dependencies and build**

```bash
npm ci --ignore-scripts
npm run build
npm run compile
```

**Step 2: Verify no TypeScript errors**

```bash
npx tsc --noEmit
```

**Step 3: Verify lint passes**

```bash
npm run lint
```

**Step 4: Commit any updated dist files**

```bash
git add awscli/dist/ cloudfront_invalidate/dist/ iam_access_credentials/dist/ s3_sync/dist/ packages/awscli-core/lib/
git commit -m "chore: rebuild dist files with updated tooling"
```

---

### Task 14: Update action.yml files to use node22

**Files:**
- Modify: `awscli/action.yml`
- Modify: `cloudfront_invalidate/action.yml`
- Modify: `iam_access_credentials/action.yml`
- Modify: `s3_sync/action.yml`

**Step 1: Update `runs.using` from `node20` to `node22` in all action.yml files**

In each file, change:
```yaml
runs:
  using: node20
```
to:
```yaml
runs:
  using: node22
```

**Step 2: Commit**

```bash
git add awscli/action.yml cloudfront_invalidate/action.yml iam_access_credentials/action.yml s3_sync/action.yml
git commit -m "chore: update action runtime from node20 to node22"
```
