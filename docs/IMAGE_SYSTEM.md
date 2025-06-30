# 🖼️ Image System Documentation

## Overview

The TrendiTools image system provides automated screenshot capture, storage, and serving for tool websites. It uses a hybrid approach combining local screenshot generation with cloud storage and URL transformation.

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Puppeteer     │───▶│   Convex Storage │───▶│  Frontend URLs  │
│  (Screenshot)   │    │   (Cloud Files)  │    │ (Transformed)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                        │                        │
        ▼                        ▼                        ▼
  Local PNG Files         Storage IDs              Full Image URLs
  screenshots/*.png       kg2abc123...         https://site.com/image?id=...
```

## Components

### 1. Screenshot Generation
**Location**: `scripts/process-tools.js`

- Uses Puppeteer to capture website screenshots
- Saves to `screenshots/` directory locally
- Generates PNG files with sanitized filenames
- Viewport: 1200x800 pixels for optimal quality

```javascript
// Screenshot capture process
const screenshot = await page.screenshot({
  path: screenshotPath,
  fullPage: false,
  clip: { x: 0, y: 0, width: 1200, height: 800 }
});
```

### 2. Cloud Storage
**Location**: `convex/storage.ts`

- Uploads screenshots to Convex cloud storage
- Returns storage IDs (e.g., `kg2abc123def456...`)
- Handles file metadata and access permissions

### 3. URL Transformation
**Location**: `convex/tools.ts` - `transformScreenshotUrl()`

Transforms storage references into accessible URLs:

```javascript
function transformScreenshotUrl(screenshot, ctx) {
  // Case 1: Already full URL → return as-is
  if (screenshot.startsWith('http')) {
    return screenshot;
  }
  
  // Case 2: Relative URL → convert to full URL
  if (screenshot.startsWith('/image?id=')) {
    return `${baseUrl}${screenshot}`;
  }
  
  // Case 3: Storage ID → create image URL
  return `${baseUrl}/image?id=${screenshot}`;
}
```

### 4. Image Serving
**Location**: `convex/http.ts`

- HTTP endpoint: `/image?id={storageId}`
- Streams files directly from Convex storage
- Handles CORS and caching headers

## Data Flow

### Processing Pipeline
1. **URL Input** → CSV file with website URLs
2. **Screenshot** → Puppeteer captures PNG
3. **Upload** → File stored in Convex cloud
4. **Storage ID** → Returned and saved to database
5. **Transform** → ID converted to accessible URL
6. **Serve** → Frontend displays image

### URL Evolution
```
Website URL:
https://example.com

↓ (Screenshot)
Local File:
screenshots/example_com.png

↓ (Upload)
Storage ID:
kg2abc123def456ghi789

↓ (Transform)
Relative URL:
/image?id=kg2abc123def456ghi789

↓ (Serve)
Full URL:
https://watchful-gazelle-766.convex.cloud/image?id=kg2abc123def456ghi789
```

## Configuration

### Environment Variables
```bash
# Required for image system
VITE_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_SITE_URL=https://your-deployment.convex.cloud
```

### Screenshot Settings
```javascript
// In process-tools.js
const SCREENSHOT_CONFIG = {
  viewport: { width: 1200, height: 800 },
  directory: 'screenshots/',
  format: 'png',
  quality: 90
};
```

## Security Considerations

### Access Control
- Images served through Convex HTTP endpoints
- No direct file system access from frontend
- Storage IDs are non-guessable (cryptographically secure)

### CORS Configuration
```javascript
// Proper CORS headers for image serving
response.headers.set('Access-Control-Allow-Origin', '*');
response.headers.set('Cache-Control', 'public, max-age=31536000');
```

## Troubleshooting

### Common Issues

1. **Double `/image?id=` in URLs**
   - **Cause**: URL being transformed multiple times
   - **Fix**: Check `transformScreenshotUrl()` logic
   - **Prevention**: Validate input format before transformation

2. **404 Image Errors**
   - **Cause**: Storage ID not found or expired
   - **Fix**: Re-run processing script to regenerate
   - **Debug**: Check storage ID format and existence

3. **Screenshot Quality Issues**
   - **Cause**: Viewport size or timing problems
   - **Fix**: Adjust viewport dimensions or wait times
   - **Optimize**: Use `waitForSelector()` for dynamic content

### Debug Commands
```bash
# Check screenshot URLs in database
node scripts/check-urls.js

# Fix malformed URLs
node scripts/fix-screenshots.js

# Re-process specific tools
node scripts/process-tools.js --url="https://example.com"
```

## Performance Optimization

### Caching Strategy
- Browser cache: 1 year (`max-age=31536000`)
- CDN-friendly headers for global distribution
- Lazy loading in frontend components

### Image Optimization
- PNG format for screenshot clarity
- Consistent viewport for uniform sizing
- Compression during upload process

## Future Enhancements

1. **WebP Format Support**: Smaller file sizes
2. **Multiple Resolutions**: Responsive image serving
3. **Automatic Retries**: Handle failed screenshots
4. **Image Analysis**: AI-powered quality scoring
5. **CDN Integration**: Global image distribution

---

*This documentation covers the complete image system workflow from capture to serving. For implementation details, see the respective source files.*