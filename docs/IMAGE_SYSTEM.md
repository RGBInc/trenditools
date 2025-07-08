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
  data/screenshots/*.png  kg2abc123...         https://site.com/image?id=...
```

## Components

### 1. Screenshot Generation
**Location**: `scripts/process-tools.js`

- Uses Puppeteer to capture website screenshots
- Saves to `data/screenshots/` directory locally
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

- Uploads screenshots from data/screenshots/ to Convex cloud storage
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
data/screenshots/example_com.png

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
  directory: 'data/screenshots/',
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

4. **Slow Image Loading on Detail Pages**
   - **Cause**: Images not preloaded, causing delayed downloads
   - **Fix**: Implemented preloading with `Image()` constructor
   - **Prevention**: Use `loading="eager"` for above-the-fold images

5. **Layout Shifts During Image Load**
   - **Cause**: Container size changes when image loads
   - **Fix**: Fixed aspect ratio containers (`aspect-video`)
   - **Prevention**: Always define container dimensions before image loads

6. **Inconsistent Loading States**
   - **Cause**: Different loading patterns between components
   - **Fix**: Standardized loading indicators and error handling
   - **Prevention**: Use consistent state management across components

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

### Frontend Loading Optimizations

#### Image Preloading (Tool Detail Pages)
**Location**: `components/ToolPage.tsx`

Implemented aggressive preloading for tool detail pages to eliminate loading delays:

```javascript
// Preload image using native Image() constructor
useEffect(() => {
  if (tool?.screenshot) {
    setImageLoading(true);
    setImageError(false);
    
    const img = new Image();
    img.onload = () => {
      setImageLoading(false);
    };
    img.onerror = () => {
      setImageError(true);
      setImageLoading(false);
    };
    img.src = transformScreenshotUrl(tool.screenshot, ctx);
  }
}, [tool?.screenshot]);
```

#### Layout Stability
**Fixed aspect ratio containers** prevent layout shifts during image loading:

```javascript
// Consistent 16:9 aspect ratio
<div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
  {/* Image content */}
</div>
```

#### Loading Strategy by Component

| Component | Strategy | Attributes | Use Case |
|-----------|----------|------------|----------|
| `ToolPage.tsx` | Eager preloading | `loading="eager"`, `decoding="async"` | Detail pages - immediate visibility |
| `ToolCard.tsx` | Lazy loading | `loading="lazy"`, `decoding="async"` | Grid views - performance |

#### Enhanced Loading States

**Animated Loading Indicators**:
```javascript
// Pulse animation for loading state
<div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
  <ImageIcon className="w-12 h-12 text-gray-400" />
</div>
```

**Error Handling with Overlays**:
```javascript
// Error state with retry capability
{imageError && (
  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
    <div className="text-center text-gray-500">
      <ImageIcon className="w-8 h-8 mx-auto mb-2" />
      <p className="text-sm">Failed to load preview</p>
    </div>
  </div>
)}
```

### Caching Strategy
- Browser cache: 1 year (`max-age=31536000`)
- CDN-friendly headers for global distribution
- Lazy loading in frontend components
- Preloading for critical above-the-fold images

### Image Optimization
- PNG format for screenshot clarity
- Consistent viewport for uniform sizing
- Compression during upload process
- Optimized loading attributes for browser performance

## Future Enhancements

1. **WebP Format Support**: Smaller file sizes
2. **Multiple Resolutions**: Responsive image serving
3. **Automatic Retries**: Handle failed screenshots
4. **Image Analysis**: Automated quality scoring
5. **CDN Integration**: Global image distribution

---

*This documentation covers the complete image system workflow from capture to serving. For implementation details, see the respective source files.*