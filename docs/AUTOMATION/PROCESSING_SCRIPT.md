# 🚀 Processing Script Documentation

## Overview

TrendiTools provides a comprehensive processing script (`process-tools.js`) for extracting, enriching, and processing tool data from URLs.

The script is an advanced processing pipeline with robust progress tracking, resume functionality, and granular error recovery - perfect for processing large datasets (1000+ URLs) with confidence.

## Features

- 🔍 **AI-Powered Extraction**: Uses Firecrawl AI to analyze website content
- 📸 **Automated Screenshots**: Captures high-quality website screenshots
- ☁️ **Cloud Integration**: Uploads to Convex storage and database
- 🎯 **Batch Processing**: Handles multiple URLs with rate limiting
- 🔄 **Dry Run Mode**: Test without making changes
- 📊 **Progress Tracking**: Real-time processing feedback

## Advanced Script Features

The processing script includes:

### 🎯 **Granular Progress Tracking**
- Tracks 9 distinct processing stages per URL
- Persistent state saved to `data/processing-progress.json`
- Field-level completion status (extraction, screenshot, upload, etc.)

### 🔄 **Resume Functionality**
- Automatically resumes from interruption point
- Skips already completed stages
- No re-processing or re-uploading of existing data

### 🛠️ **Advanced Error Recovery**
- Field-specific retry capabilities
- Selective processing of failed fields only
- Detailed error tracking and reporting

### 📊 **Enhanced Monitoring**
- Real-time progress indicators
- Comprehensive status reporting
- Processing stage breakdown

## Usage

```bash
# Dry run with progress tracking
npm run process-tools:dry

# Live processing with progress tracking
npm run process-tools

# Resume interrupted processing
npm run process-tools:resume

# Retry only failed fields
npm run process-tools:retry

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

Edit `scripts/process-tools.js` to modify:

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
  screenshotDir: path.join(__dirname, '../data/screenshots'),
  batchSize: 5,                    // Process 5 URLs at a time
  delayBetweenRequests: 2000,      // 2 seconds between requests
  screenshotTimeout: 30000,        // 30 seconds max per screenshot
  maxRetries: 3                    // Retry failed requests
};
```

### Progress Tracking States
The script tracks these 9 processing stages:

```javascript
const PROCESSING_STAGES = {
  PENDING: 'pending',           // Initial state
  EXTRACTING: 'extracting',     // AI data extraction
  EXTRACTED: 'extracted',       // Data extraction complete
  SCREENSHOT: 'screenshot',     // Taking screenshot
  SCREENSHOT_DONE: 'screenshot_done', // Screenshot complete
  UPLOADING: 'uploading',       // Uploading to Convex
  UPLOADED: 'uploaded',         // Upload complete
  SAVING: 'saving',            // Saving to database
  COMPLETED: 'completed'        // Fully processed
};
```

### Progress File Structure
```json
{
  "lastProcessedIndex": 45,
  "totalUrls": 658,
  "startTime": "2024-01-15T10:30:00.000Z",
  "urlProgress": {
    "https://example.com": {
      "status": "completed",
      "toolId": "kg2abc123...",
      "extractedData": { /* ... */ },
      "screenshotPath": "data/screenshots/example_com.png",
      "storageId": "kg2def456...",
      "lastUpdated": "2024-01-15T10:32:15.000Z",
      "processingTime": 12.5,
      "errors": []
    }
  },
  "summary": {
    "completed": 45,
    "failed": 2,
    "pending": 611
  }
}
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
5. Save to `data/screenshots/` directory

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

### Field-Specific Recovery
The script can retry individual processing stages:

```bash
# Retry only failed extractions
npm run process-tools:retry -- --stage=extraction

# Retry only failed screenshots
npm run process-tools:retry -- --stage=screenshot

# Retry only failed uploads
npm run process-tools:retry -- --stage=upload
```

### Automatic Resume
```javascript
// Script automatically detects interruptions
const resumeProcessing = async () => {
  const progress = await loadProgress();
  const lastIndex = progress.lastProcessedIndex || 0;
  
  console.log(`🔄 Resuming from URL ${lastIndex + 1}/${progress.totalUrls}`);
  
  // Skip completed URLs, process remaining
  return processFromIndex(lastIndex + 1);
};
```

### Granular Error Tracking
```json
{
  "url": "https://example.com",
  "status": "failed",
  "errors": [
    {
      "stage": "screenshot",
      "error": "Timeout after 30s",
      "timestamp": "2024-01-15T10:32:00.000Z",
      "retryCount": 3
    }
  ],
  "completedStages": ["extracted", "uploaded"],
  "failedStages": ["screenshot"]
}
```

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

## Script Output

### Progress Monitoring
```
╔══════════════════════════════════════════════════════════════╗
║                🚀 TOOL PROCESSOR v2.0                       ║
╚══════════════════════════════════════════════════════════════╝

📊 Processing Status
═════════════════════════════════════════════════════════════════
   🎯 Progress: 45/658 URLs (6.8%)
   ✅ Completed: 43
   ❌ Failed: 2
   ⏳ Pending: 613
   🔄 Current: Extracting data from https://example.com
   ⏱️  Elapsed: 12m 34s
   📈 Success rate: 95.6%
```

### Results Files

**Progress File**: `data/processing-progress.json`
- Real-time processing state
- Granular field completion status
- Resume capability data

**Results File**: `data/processing-results.json`
- Final processing summary
- Detailed error analysis
- Performance metrics

### Stage-by-Stage Reporting
```json
{
  "stageBreakdown": {
    "extraction": { "completed": 45, "failed": 2, "pending": 611 },
    "screenshot": { "completed": 43, "failed": 4, "pending": 611 },
    "upload": { "completed": 43, "failed": 0, "pending": 615 },
    "database": { "completed": 43, "failed": 0, "pending": 615 }
  },
  "retryAnalysis": {
    "totalRetries": 8,
    "successfulRetries": 6,
    "failedRetries": 2
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
find data/screenshots/ -name "*.png" -mtime +30 -delete

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

## Script Usage Recommendations

### Ideal Use Cases
- **Large datasets** (100+ URLs)
- **Production environments**
- **Long-running processes** (>30 minutes)
- **Critical data processing** where interruption recovery is important
- **Batch processing** with monitoring requirements
- **Small datasets** for testing or prototyping
- **Development environments**

### Resume Capability
The script automatically detects existing data and can resume processing:

```bash
# Resume interrupted processing
npm run process-tools:resume

# The script will:
#    - Skip already processed URLs
#    - Continue from where it left off
#    - Provide detailed progress tracking
```

---

*This script is the core automation engine for TrendiTools data processing. It transforms raw URLs into rich, searchable tool data with automated screenshots and AI-powered content analysis, providing enterprise-grade reliability and monitoring for large-scale processing.*