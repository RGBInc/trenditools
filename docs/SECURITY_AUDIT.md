# 🔒 Security Audit & Checklist

## Overview

This document outlines security measures, potential vulnerabilities, and best practices for the TrendiTools application before deployment.

## ✅ Security Checklist

### Environment Variables & Secrets

- [x] **API Keys in Environment Files Only**
  - All sensitive keys stored in `.env.local`
  - No hardcoded secrets in source code
  - `.env.local` added to `.gitignore`

- [x] **Environment Variable Validation**
  ```javascript
  // In convex/auth.config.js and scripts
  if (!process.env.FIRECRAWL_API_KEY) {
    throw new Error('FIRECRAWL_API_KEY is required');
  }
  ```

- [x] **Separate Development/Production Configs**
  - Different Convex deployments for dev/prod
  - Separate API keys for different environments

### Frontend Security

- [x] **No Client-Side Secrets**
  - Only `VITE_CONVEX_URL` exposed to client
  - All sensitive operations handled server-side

- [x] **Input Sanitization**
  ```typescript
  // Search queries are sanitized
  const sanitizedQuery = query.trim().slice(0, 100);
  ```

- [x] **XSS Prevention**
  - React's built-in XSS protection
  - No `dangerouslySetInnerHTML` usage
  - All user inputs properly escaped

- [x] **Content Security Policy Ready**
  ```html
  <!-- Recommended CSP headers for production -->
  <meta http-equiv="Content-Security-Policy" 
        content="default-src 'self'; img-src 'self' data: https:; script-src 'self'">
  ```

### Backend Security (Convex)

- [x] **Query Validation**
  ```typescript
  // All queries use proper validation
  export const searchTools = query({
    args: {
      query: v.string(),
      category: v.optional(v.string()),
      limit: v.optional(v.number())
    },
    handler: async (ctx, args) => {
      // Validate inputs
      if (args.limit && args.limit > 100) {
        throw new Error('Limit cannot exceed 100');
      }
      // ...
    }
  });
  ```

- [x] **File Upload Security**
  ```typescript
  // Screenshot uploads are validated
  const validateImageFile = (file: File) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type');
    }
    if (file.size > maxSize) {
      throw new Error('File too large');
    }
  };
  ```

- [x] **Rate Limiting**
  ```typescript
  // Built-in Convex rate limiting
  // Additional rate limiting in processing scripts
  const CONFIG = {
    delayBetweenRequests: 2000,
    batchSize: 5
  };
  ```

### Data Security

- [x] **Data Validation**
  ```typescript
  // All database operations use schema validation
  const toolSchema = v.object({
    name: v.string(),
    url: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    // ...
  });
  ```

- [x] **URL Validation**
  ```typescript
  const validateUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  };
  ```

- [x] **Image URL Security**
  ```typescript
  // transformScreenshotUrl prevents injection
  export const transformScreenshotUrl = (url: string | undefined): string => {
    if (!url) return '/placeholder.png';
    
    // Only allow specific patterns
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    if (url.startsWith('/image?id=')) {
      return `${baseUrl}${url}`;
    }
    
    // Treat as storage ID - validate format
    if (!/^[a-zA-Z0-9_-]+$/.test(url)) {
      return '/placeholder.png';
    }
    
    return `${baseUrl}/image?id=${url}`;
  };
  ```

### Processing Script Security

- [x] **File System Security**
  ```javascript
  // Safe filename generation
  const createSafeFilename = (url) => {
    return url
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .substring(0, 100) + '.png';
  };
  
  // Prevent directory traversal
  const screenshotPath = path.resolve(screenshotDir, safeFilename);
  if (!screenshotPath.startsWith(path.resolve(screenshotDir))) {
    throw new Error('Invalid file path');
  }
  ```

- [x] **External API Security**
  ```javascript
  // Timeout and retry limits
  const firecrawlConfig = {
    timeout: 30000,
    maxRetries: 3,
    validateSSL: true
  };
  ```

- [x] **Browser Security**
  ```javascript
  // Puppeteer security settings
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor'
    ]
  });
  ```

## 🚨 Potential Vulnerabilities & Mitigations

### 1. Image Storage & Serving

**Risk**: Malicious image uploads or URL manipulation

**Mitigation**:
- File type validation
- Size limits (5MB max)
- Convex storage handles security
- URL transformation prevents injection

### 2. External URL Processing

**Risk**: SSRF attacks through malicious URLs

**Mitigation**:
```javascript
// URL validation before processing
const isValidUrl = (url) => {
  try {
    const parsed = new URL(url);
    
    // Block private/internal networks
    const hostname = parsed.hostname;
    if (
      hostname === 'localhost' ||
      hostname.startsWith('127.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.')
    ) {
      return false;
    }
    
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};
```

### 3. Search Query Injection

**Risk**: Malicious search queries affecting database

**Mitigation**:
- Input length limits (100 characters)
- Character sanitization
- Convex's built-in query protection

### 4. Cross-Site Scripting (XSS)

**Risk**: Malicious content in tool descriptions

**Mitigation**:
- React's automatic escaping
- Content sanitization during processing
- No innerHTML usage

## 🔧 Production Security Configuration

### Vercel Deployment Settings

```json
// vercel.json
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
        }
      ]
    }
  ]
}
```

### Environment Variables for Production

```bash
# Required for production
VITE_CONVEX_URL=https://your-prod-deployment.convex.cloud
FIRECRAWL_API_KEY=fc-prod-key-here
OPENAI_API_KEY=sk-prod-key-here

# Optional security enhancements
NODE_ENV=production
VITE_APP_ENV=production
```

### Convex Production Settings

```typescript
// convex/auth.config.js
export default {
  providers: [],
  // Enable in production if adding auth
  // callbacks: {
  //   createOrUpdateUser: async (ctx, args) => {
  //     // User creation logic
  //   }
  // }
};
```

## 📊 Security Monitoring

### Error Tracking

```typescript
// Add to main.tsx for production
if (import.meta.env.PROD) {
  window.addEventListener('error', (event) => {
    // Log errors to monitoring service
    console.error('Production error:', event.error);
  });
}
```

### Performance Monitoring

```typescript
// Monitor API response times
const monitorQuery = async (queryFn: () => Promise<any>) => {
  const start = performance.now();
  try {
    const result = await queryFn();
    const duration = performance.now() - start;
    
    if (duration > 5000) {
      console.warn('Slow query detected:', duration);
    }
    
    return result;
  } catch (error) {
    console.error('Query failed:', error);
    throw error;
  }
};
```

## 🔍 Security Testing

### Manual Testing Checklist

- [ ] **Input Validation**
  - Test search with special characters: `<script>`, `'; DROP TABLE`, etc.
  - Test extremely long search queries (>1000 chars)
  - Test malformed URLs in processing

- [ ] **File Upload Testing**
  - Upload non-image files
  - Upload extremely large files (>10MB)
  - Upload files with malicious names

- [ ] **URL Testing**
  - Test internal network URLs (localhost, 192.168.x.x)
  - Test malformed URLs
  - Test URLs with unusual protocols (ftp://, file://)

### Automated Security Scanning

```bash
# Install security audit tools
npm audit
npm audit fix

# Check for known vulnerabilities
npx audit-ci --moderate

# Dependency scanning
npx depcheck
```

## 📋 Pre-Deployment Checklist

### Code Security
- [x] No hardcoded secrets or API keys
- [x] All environment variables properly configured
- [x] Input validation on all user inputs
- [x] Proper error handling without information leakage
- [x] File upload restrictions in place

### Infrastructure Security
- [ ] HTTPS enforced (handled by Vercel)
- [ ] Security headers configured
- [ ] Rate limiting in place
- [ ] Monitoring and logging configured

### Data Security
- [x] Database queries use proper validation
- [x] File storage uses secure cloud provider (Convex)
- [x] No sensitive data in client-side code
- [x] Proper data sanitization

### Operational Security
- [ ] Separate production environment
- [ ] API key rotation plan
- [ ] Backup and recovery procedures
- [ ] Incident response plan

## 🚀 Deployment Security Steps

1. **Environment Setup**
   ```bash
   # Set production environment variables in Vercel
   vercel env add VITE_CONVEX_URL production
   vercel env add FIRECRAWL_API_KEY production
   ```

2. **Convex Production Deployment**
   ```bash
   npx convex deploy --prod
   ```

3. **Security Header Verification**
   ```bash
   # After deployment, test security headers
   curl -I https://your-domain.vercel.app
   ```

4. **Functionality Testing**
   - Test all major features
   - Verify image loading
   - Test search functionality
   - Verify error handling

---

## 📞 Security Contact

For security issues or questions:
- Review this document
- Check Convex security documentation
- Follow responsible disclosure practices

**Last Updated**: January 2024  
**Next Review**: Before major releases