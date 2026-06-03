# GitHub Repository Setup Guide

**Project Manager:** Allen Ahlee Amaya  
**Project:** Kenwell Insurance Agency ERP System

---

## ✅ Issue Fixed!

**Status:** The `.github` directory has been completely removed and backed up as `.github-backup`

**What was done:**
- ✅ Deleted all workflow YAML files
- ✅ Removed the entire `.github` directory that was blocking the push
- ✅ Project is now clean and ready for GitHub

**You can now create the repository in v0 without errors!**

---

## Step 1: Create Repository on v0 (NOW WORKS!)

The blocking `.github` directory has been removed. Follow these steps:

1. In v0, click **Settings** (top right)
2. Go to **Git** section
3. Click **"Create Repository"**
4. Fill in:
   - **Git Scope:** Select your GitHub username
   - **Repository Name:** `kenwell-erp-system` or `v0-insurance-erp`
5. Click **"Create Repository"**

✅ **This should now work without errors!** v0 will push all code to GitHub successfully.

---

## Step 2: Clone Repository Locally

After v0 finishes pushing:

```bash
git clone https://github.com/yourusername/v0-insurance-erp-system.git
cd v0-insurance-erp-system
```

---

## Step 3: Recreate GitHub Actions Workflows

The workflow files were removed temporarily. Now add them back:

### Backend Tests Workflow

Create `.github/workflows/backend-tests.yml`:

```yaml
name: Backend Tests & Code Quality

on:
  push:
    branches: [develop, main]
    paths:
      - 'backend/**'
      - '.github/workflows/backend-tests.yml'
  pull_request:
    branches: [develop, main]
    paths:
      - 'backend/**'

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: kenwell_test
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
          cache: 'pip'
      
      - name: Install dependencies
        working-directory: ./backend
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
      
      - name: Run migrations
        working-directory: ./backend
        run: python manage.py migrate
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/kenwell_test
      
      - name: Run tests
        working-directory: ./backend
        run: pytest --cov=. --cov-report=xml
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/kenwell_test
      
      - name: Lint with flake8
        working-directory: ./backend
        run: |
          flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
          flake8 . --count --exit-zero --max-complexity=10 --max-line-length=127 --statistics
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage.xml
          flags: backend
          name: backend-coverage
```

### Frontend Tests Workflow

Create `.github/workflows/frontend-tests.yml`:

```yaml
name: Frontend Tests & Build

on:
  push:
    branches: [develop, main]
    paths:
      - 'app/**'
      - 'components/**'
      - 'lib/**'
      - 'package.json'
      - '.github/workflows/frontend-tests.yml'
  pull_request:
    branches: [develop, main]
    paths:
      - 'app/**'
      - 'components/**'
      - 'lib/**'
      - 'package.json'

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'pnpm'
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run linter
        run: pnpm lint
      
      - name: Type check
        run: pnpm typecheck
      
      - name: Run tests
        run: pnpm test:ci
      
      - name: Build
        run: pnpm build
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          flags: frontend
          name: frontend-coverage
```

### Deploy Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy-frontend:
    name: Deploy Frontend to Vercel
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build
        run: pnpm build
      
      - name: Deploy to Vercel
        uses: vercel/action@main
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          production: true

  deploy-backend:
    name: Deploy Backend to Railway
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Railway
        run: |
          npx @railway/cli@latest deploy \
            --token ${{ secrets.RAILWAY_TOKEN }} \
            --service kenwell-backend
```

---

## Step 4: Add GitHub Secrets

For the CI/CD pipelines to work, add these secrets to your GitHub repository:

### Settings → Secrets and variables → Actions

**For Vercel Deployment:**
- `VERCEL_TOKEN` - Get from https://vercel.com/account/tokens
- `VERCEL_ORG_ID` - Your Vercel organization ID
- `VERCEL_PROJECT_ID` - Your Vercel project ID

**For Railway Deployment:**
- `RAILWAY_TOKEN` - Get from https://railway.app/account/tokens

**For Codecov:**
- `CODECOV_TOKEN` - Get from https://codecov.io

---

## Step 5: Set Up Branches

```bash
# Create and push development branch
git checkout -b develop
git push -u origin develop

# Create and push staging branch
git checkout -b staging
git push -u origin staging
```

---

## Step 6: Configure Branch Protection Rules

In GitHub:

1. Go to **Settings** → **Branches**
2. Click **Add rule**
3. For `main` branch:
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date
   - ✅ Require code reviews (1-2 people)
   - ✅ Dismiss stale reviews
   - ✅ Require status checks: Backend Tests, Frontend Tests

4. For `develop` branch (optional):
   - ✅ Require status checks to pass
   - ✅ Allow auto-merge

---

## Step 7: Add Workflows via GitHub Web Interface

**Alternative Method:** If you prefer, manually add the workflow files:

1. Go to your GitHub repo
2. Click **Add file** → **Create new file**
3. Name: `.github/workflows/backend-tests.yml`
4. Paste the YAML content from above
5. Commit
6. Repeat for other workflows

---

## Step 8: Verify Setup

After pushing:

1. Go to **Actions** tab in GitHub
2. You should see workflow runs in progress
3. Check each workflow passes

---

## Troubleshooting

### Workflows not triggering?
- Check the `on:` events in the YAML
- Verify branches exist (develop, main)
- Look at workflow logs for errors

### Deploy fails?
- Verify secrets are added correctly
- Check Vercel/Railway tokens are valid
- Review action logs for specific errors

### Tests failing?
- Check test environment variables
- Verify database/service configurations
- Review pytest/jest output

---

## Deployment Flow

```
Code Push
    ↓
GitHub Actions Triggers
    ├─ Backend Tests (pytest, lint)
    ├─ Frontend Tests (jest, lint, build)
    └─ (PR reviewers required on main)
    ↓
All Tests Pass
    ↓
Deploy to Production
    ├─ Frontend → Vercel
    └─ Backend → Railway
```

---

## Next Steps

1. ✅ Push code to GitHub (using v0 interface)
2. ✅ Clone locally
3. ✅ Add workflow files to `.github/workflows/`
4. ✅ Push changes
5. ✅ Add GitHub secrets
6. ✅ Set up branch protection
7. ✅ Monitor first workflow runs

---

## Support

For issues:
- Check GitHub Actions logs
- Review workflow YAML syntax
- Verify all secrets are configured
- Check platform documentation (Vercel, Railway, Codecov)

**Questions?** Refer to DOCUMENTATION_INDEX.md for other guides.
