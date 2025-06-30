# 🚀 Processing Script Documentation

## Overview

The `process-tools.js` script is an automated pipeline that extracts, enriches, and processes tool data from URLs using AI-powered analysis and screenshot capture.

## Features

- 🔍 **AI-Powered Extraction**: Uses Firecrawl AI to analyze website content
- 📸 **Automated Screenshots**: Captures high-quality website screenshots
- ☁️ **Cloud Integration**: Uploads to Convex storage and database
- 🎯 **Batch Processing**: Handles multiple URLs with rate limiting
- 🔄 **Dry Run Mode**: Test without making changes
- 📊 **Progress Tracking**: Real-time processing feedback

## Usage

### Basic Commands
```bash
# Process all URLs in CSV file
npm run process-tools

# Dry run (test without saving)
npm run process-tools:dry

# Process specific URL
node scripts/process-tools.js --url="https://example.com"
```

### Package.json Scripts
```json
{
  "scripts": {
    "process-tools": "node scripts/process-tools.js",
    "process-tools:dry": "node scripts/process-tools.js --dry-run"
  }
}
```

## Configuration

### Environment Variables
```bash
# Required in .env.local
FIRECRAWL_API_KEY=fc-your-api-key-here
VITE_CONVEX_URL=https://your-deployment.convex.cloud
OPENAI_API_KEY=sk-your-openai-key-here  # Optional for enhanced analysis
```

### Script Configuration
```javascript
const CONFIG = {
  csvPath: path.join(__dirname, '../data/Trendi Tools - Final.csv'),
  screenshotDir: path.join(__dirname, '../screenshots'),
  batchSize: 5,                    // Process 5 URLs at a time
  delayBetweenRequests: 2000,      // 2 seconds between requests
  screenshotTimeout: 30000,        // 30 seconds max per screenshot
  maxRetries: 3                    // Retry failed requests
};
```

## Data Processing Pipeline

### 1. Input Stage
```
CSV File (data/Trendi Tools - Final.csv)
├── URL column (required)
├── Name column (optional - will be extracted if missing)
└── Other metadata columns
```

### 2. AI Extraction Stage
**Service**: Firecrawl AI

```javascript
// Extraction prompt for AI analysis
const extractionPrompt = `
Analyze this website and extract:
1. Tool/service name
2. Tagline (1-2 sentences)
3. Summary (max 300 words)
4. Descriptor (brief 1-2 sentences for search)
5. Category (broad classification)
6. Tags (specific use-case keywords)
`;
```

**Extracted Fields**:
- **name**: Tool/service name
- **tagline**: Short catchy phrase
- **summary**: Detailed description (max 300 words)
- **descriptor**: Brief search-friendly description
- **category**: Broad classification ("AI", "Productivity", etc.)
- **tags**: Array of specific keywords

### 3. Screenshot Stage
**Service**: Puppeteer

```javascript
// Screenshot configuration
const screenshotConfig = {
  viewport: { width: 1200, height: 800 },
  waitUntil: 'networkidle2',
  timeout: 30000,
  fullPage: false,
  quality: 90
};
```

**Process**:
1. Launch headless browser
2. Navigate to URL
3. Wait for page load
4. Capture screenshot
5. Save to `screenshots/` directory

### 4. Storage Stage
**Service**: Convex Cloud Storage

```javascript
// Upload process
const storageId = await ctx.storage.store(screenshotBlob);
// Returns: kg2abc123def456ghi789...
```

### 5. Database Stage
**Service**: Convex Database

```javascript
// Tool record structure
const toolRecord = {
  name: extractedData.name,
  url: originalUrl,
  tagline: extractedData.tagline,
  summary: extractedData.summary,
  descriptor: extractedData.descriptor,
  category: extractedData.category,
  tags: extractedData.tags,
  screenshot: storageId,  // Storage ID for image
  createdAt: Date.now(),
  updatedAt: Date.now()
};
```

## Error Handling

### Retry Logic
```javascript
const processWithRetry = async (url, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await processUrl(url);
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await delay(attempt * 1000); // Exponential backoff
    }
  }
};
```

### Common Error Types
1. **Network Timeouts**: Retry with exponential backoff
2. **AI Extraction Failures**: Skip to manual fallback
3. **Screenshot Failures**: Continue without image
4. **Storage Failures**: Retry upload process
5. **Database Failures**: Log and continue

## Output and Reporting

### Console Output
```
╔══════════════════════════════════════════════════════════════╗
║                    🚀 AUTOMATED TOOL PROCESSOR               ║
╚══════════════════════════════════════════════════════════════╝

📊 Processing Summary
═════════════════════════════════════════════════════════════════
   ✅ Successfully processed: 5
   ❌ Failed: 0
   📈 Success rate: 100.0%
   🎯 Total URLs processed: 5
```

### Results File
**Location**: `data/processing-results.json`

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "totalProcessed": 5,
  "successful": 5,
  "failed": 0,
  "results": [
    {
      "url": "https://example.com",
      "status": "success",
      "toolId": "kg2abc123...",
      "extractedData": { /* ... */ },
      "processingTime": 12.5
    }
  ],
  "errors": [],
  "summary": {
    "successRate": 100,
    "averageProcessingTime": 12.5,
    "totalDuration": 62.3
  }
}
```

## Performance Optimization

### Rate Limiting
```javascript
// Batch processing with delays
const processBatch = async (urls, batchSize = 5) => {
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    await Promise.all(batch.map(processUrl));
    
    if (i + batchSize < urls.length) {
      await delay(CONFIG.delayBetweenRequests);
    }
  }
};
```

### Memory Management
```javascript
// Clean up browser instances
process.on('exit', async () => {
  if (browser) {
    await browser.close();
  }
});
```

## Monitoring and Debugging

### Debug Mode
```bash
# Enable verbose logging
DEBUG=true node scripts/process-tools.js
```

### Log Levels
- **INFO**: General processing updates
- **WARN**: Non-critical issues (missing data, etc.)
- **ERROR**: Critical failures requiring attention
- **DEBUG**: Detailed execution information

### Health Checks
```javascript
// Pre-flight checks
const validateEnvironment = () => {
  const required = ['FIRECRAWL_API_KEY', 'VITE_CONVEX_URL'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
};
```

## Security Considerations

### API Key Management
- Store keys in `.env.local` (never commit)
- Use environment-specific configurations
- Rotate keys regularly

### Data Validation
```javascript
// Sanitize extracted data
const sanitizeData = (data) => {
  return {
    name: sanitizeString(data.name),
    url: validateUrl(data.url),
    tags: data.tags?.filter(tag => isValidTag(tag)) || []
  };
};
```

### File System Security
```javascript
// Safe filename generation
const createSafeFilename = (url) => {
  return url
    .replace(/[^a-zA-Z0-9]/g, '_')
    .substring(0, 100) + '.png';
};
```

## Maintenance

### Regular Tasks
1. **Clean Screenshots**: Remove old local files
2. **Update Dependencies**: Keep packages current
3. **Monitor API Usage**: Track Firecrawl consumption
4. **Backup Results**: Archive processing data

### Cleanup Commands
```bash
# Remove old screenshots
find screenshots/ -name "*.png" -mtime +30 -delete

# Clean processing results
rm -f data/processing-results-*.json
```

## Troubleshooting

### Common Issues

1. **"API Key not found"**
   - Check `.env.local` file exists
   - Verify `FIRECRAWL_API_KEY` is set
   - Ensure no extra spaces in key

2. **"Screenshot timeout"**
   - Increase `screenshotTimeout` value
   - Check website loading speed
   - Verify network connectivity

3. **"Convex upload failed"**
   - Check `VITE_CONVEX_URL` is correct
   - Verify Convex deployment is active
   - Check file size limits

4. **"CSV parsing error"**
   - Verify CSV file format
   - Check for proper URL column
   - Ensure UTF-8 encoding

### Debug Commands
```bash
# Test single URL
node scripts/process-tools.js --url="https://example.com" --debug

# Validate environment
node -e "console.log(process.env.FIRECRAWL_API_KEY ? 'API Key found' : 'API Key missing')"

# Check CSV format
head -5 "data/Trendi Tools - Final.csv"
```

---

*This script is the core automation engine for TrendiTools data processing. It transforms raw URLs into rich, searchable tool data with automated screenshots and AI-powered content analysis.*