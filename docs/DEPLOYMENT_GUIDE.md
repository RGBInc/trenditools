# 🚀 Deployment Guide

## Overview

This guide walks through deploying TrendiTools to production using Vercel for the frontend and Convex for the backend.

## Prerequisites

- [x] Node.js 18+ installed
- [x] Git repository set up
- [x] Vercel account
- [x] Convex account
- [x] API keys for external services

## 📋 Pre-Deployment Checklist

### Code Preparation
- [x] All features tested locally
- [x] No console.log statements in production code
- [x] Environment variables documented
- [x] Security audit completed
- [x] Documentation up to date

### Environment Setup
- [ ] Production Convex deployment created
- [ ] Production API keys obtained
- [ ] Vercel project configured
- [ ] Domain name ready (optional)

## 🔧 Step 1: Convex Production Setup

### 1.1 Create Production Deployment

```bash
# Navigate to project directory
cd /path/to/trenditools

# Login to Convex (if not already)
npx convex login

# Create production deployment
npx convex deploy --prod
```

### 1.2 Configure Production Environment

```bash
# Set production environment variables
npx convex env set FIRECRAWL_API_KEY fc-your-production-key --prod
npx convex env set OPENAI_API_KEY sk-your-production-key --prod
```

### 1.3 Get Production URL

```bash
# Get your production Convex URL
npx convex dashboard --prod
```

Save the URL (format: `https://your-deployment.convex.cloud`)

## 🌐 Step 2: Vercel Deployment

### 2.1 Install Vercel CLI

```bash
npm install -g vercel
```

### 2.2 Login to Vercel

```bash
vercel login
```

### 2.3 Configure Project

```bash
# Initialize Vercel project
vercel

# Follow prompts:
# ? Set up and deploy "~/trenditools"? [Y/n] y
# ? Which scope do you want to deploy to? [Your Account]
# ? Link to existing project? [y/N] n
# ? What's your project's name? trenditools
# ? In which directory is your code located? ./
```

### 2.4 Set Environment Variables

```bash
# Set production environment variables
vercel env add VITE_CONVEX_URL
# Enter: https://your-production-deployment.convex.cloud
# Select: Production

# Optional: Set for preview/development
vercel env add VITE_CONVEX_URL
# Enter: https://your-dev-deployment.convex.cloud
# Select: Preview, Development
```

### 2.5 Deploy to Production

```bash
# Deploy to production
vercel --prod
```

## 📁 Step 3: GitHub Repository Setup

### 3.1 Create Repository

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: TrendiTools application"

# Create GitHub repository (replace with your username)
gh repo create trenditools --public --source=. --remote=origin --push
```

### 3.2 Configure GitHub Integration

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to Settings → Git
4. Connect to your GitHub repository
5. Enable automatic deployments

### 3.3 Set Up Branch Protection

```bash
# Create development branch
git checkout -b development
git push -u origin development

# Set main as default branch for production
git checkout main
```

## 🔒 Step 4: Security Configuration

### 4.1 Create vercel.json

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 4.2 Update .gitignore

```gitignore
# Dependencies
node_modules/

# Production builds
dist/
build/

# Environment variables
.env
.env.local
.env.production
.env.development

# Convex
.convex/

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Screenshots (local development)
screenshots/

# Processing results
data/processing-results*.json

# Temporary files
*.tmp
*.temp
```

## 🧪 Step 5: Testing Production Deployment

### 5.1 Functionality Tests

```bash
# Test production URL
curl -I https://your-app.vercel.app

# Check security headers
curl -I https://your-app.vercel.app | grep -E "X-|Strict-Transport"
```

### 5.2 Manual Testing Checklist

- [ ] **Homepage loads correctly**
- [ ] **Search functionality works**
- [ ] **Tool cards display with images**
- [ ] **Categories filter properly**
- [ ] **Individual tool pages load**
- [ ] **Responsive design on mobile**
- [ ] **No console errors**
- [ ] **Images load from Convex storage**

### 5.3 Performance Testing

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run performance audit
lighthouse https://your-app.vercel.app --output=html --output-path=./lighthouse-report.html
```

## 📊 Step 6: Monitoring Setup

### 6.1 Vercel Analytics

1. Go to Vercel Dashboard
2. Select your project
3. Navigate to Analytics tab
4. Enable Web Analytics

### 6.2 Error Monitoring

Add to `src/main.tsx`:

```typescript
// Production error tracking
if (import.meta.env.PROD) {
  window.addEventListener('error', (event) => {
    console.error('Production error:', {
      message: event.error?.message,
      stack: event.error?.stack,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
  });
}
```

## 🔄 Step 7: Continuous Deployment

### 7.1 GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build project
        run: npm run build
        env:
          VITE_CONVEX_URL: ${{ secrets.VITE_CONVEX_URL }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### 7.2 Branch Strategy

```bash
# Development workflow
git checkout development
git pull origin development

# Make changes
git add .
git commit -m "feat: add new feature"
git push origin development

# Create pull request to main
gh pr create --title "Add new feature" --body "Description of changes"

# After review, merge to main triggers production deployment
```

## 🌍 Step 8: Custom Domain (Optional)

### 8.1 Add Domain to Vercel

1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Domains
4. Add your custom domain
5. Configure DNS records as instructed

### 8.2 SSL Certificate

Vercel automatically provisions SSL certificates for custom domains.

## 📈 Step 9: Post-Deployment Tasks

### 9.1 Update Documentation

```markdown
# Update README.md with production URLs
- Live Site: https://your-app.vercel.app
- GitHub: https://github.com/yourusername/trenditools
- Documentation: /docs/
```

### 9.2 SEO Setup

Update `index.html`:

```html
<meta name="description" content="Discover and explore the latest trending tools and services">
<meta name="keywords" content="tools, productivity, AI, trending, discovery">
<meta property="og:title" content="TrendiTools - Discover Trending Tools">
<meta property="og:description" content="Explore the latest trending tools and services">
<meta property="og:url" content="https://your-app.vercel.app">
<meta property="og:type" content="website">
```

### 9.3 Analytics Setup

Add Google Analytics (optional):

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Check build locally
   npm run build
   
   # Check TypeScript errors
   npm run type-check
   ```

2. **Environment Variable Issues**
   ```bash
   # Verify Vercel env vars
   vercel env ls
   
   # Check Convex env vars
   npx convex env list --prod
   ```

3. **Image Loading Issues**
   - Verify Convex deployment is active
   - Check VITE_CONVEX_URL is correct
   - Test image URLs directly

4. **Search Not Working**
   - Check Convex functions are deployed
   - Verify database has data
   - Check browser console for errors

### Debug Commands

```bash
# Check deployment status
vercel ls

# View deployment logs
vercel logs https://your-app.vercel.app

# Check Convex status
npx convex dashboard --prod
```

## 📞 Support

- **Vercel Documentation**: https://vercel.com/docs
- **Convex Documentation**: https://docs.convex.dev
- **Project Issues**: GitHub Issues tab

---

**Deployment Complete! 🎉**

Your TrendiTools application is now live and ready for users to discover trending tools and services.

**Next Steps**:
1. Share your application URL
2. Monitor performance and usage
3. Collect user feedback
4. Plan future enhancements

**Live URLs**:
- Production: `https://your-app.vercel.app`
- GitHub: `https://github.com/yourusername/trenditools`
- Convex Dashboard: `https://dashboard.convex.dev`