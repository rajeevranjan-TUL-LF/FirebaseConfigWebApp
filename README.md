# ConfigHub — Remote Configuration Management Platform

ConfigHub is a developer-focused, production-grade SaaS platform for managing application configuration centrally and serving runtime configurations to Android, iOS, Web, and backend microservices via a single API response.

---

## Deployment Guide from GitHub

Because ConfigHub is built with **React 19 + Vite + Tailwind CSS**, it compiles down to high-performance static assets (`/dist`) that can be hosted on any modern hosting provider or containerized for Cloud Run / Kubernetes.

Choose the deployment method that fits your infrastructure:

---

### Option 1: Vercel (Recommended — Fastest & Zero Config)

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of ConfigHub"
   git branch -M main
   git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO_NAME>.git
   git push -u origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
   - Click **Add New** → **Project**.
   - Select your ConfigHub GitHub repository.
   - Vercel automatically detects **Vite**:
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `npm install`
   - Click **Deploy**.

---

### Option 2: GitHub Pages (Free via GitHub Actions)

To host ConfigHub for free on GitHub Pages:

1. In your repository on GitHub, go to **Settings** → **Pages**.
2. Under **Build and deployment** → **Source**, select **GitHub Actions**.
3. Add the workflow file `.github/workflows/deploy.yml` (already included in this repository):

```yaml
name: Deploy ConfigHub to GitHub Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

> **Note for GitHub Pages**: If your repo is named `my-repo` and hosted at `https://<username>.github.io/my-repo/`, set `base: '/my-repo/'` in `vite.config.ts`.

---

### Option 3: Docker & Google Cloud Run / AWS ECS

A multi-stage `Dockerfile` is included for containerized hosting:

1. **Build and test locally**:
   ```bash
   docker build -t confighub:latest .
   docker run -p 8080:80 confighub:latest
   ```

2. **Deploy to Google Cloud Run directly from GitHub**:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/run).
   - Click **Create Service**.
   - Choose **Continuously deploy from a repository** (select your GitHub repository and `main` branch).
   - Select **Build Type**: Dockerfile.
   - Click **Create**. Cloud Build will automatically build and deploy whenever you push commits to GitHub.

---

### Option 4: Netlify / Cloudflare Pages

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: `20` or higher

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start development server (Port 3000)
npm run dev

# 3. Build for production
npm run build

# 4. Preview production build locally
npm run preview
```
