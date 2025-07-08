# 🚀 Tool Processing System

A robust, resumable tool processing pipeline with granular progress tracking and recovery capabilities.

## ✨ Key Features

### 🎯 **Granular Progress Tracking**
- **Field-level tracking**: Each processing stage is tracked individually
- **Resume capability**: Pick up exactly where you left off after interruptions
- **Detailed analytics**: Comprehensive reporting on processing status
- **Error categorization**: Understand what went wrong and where

### 🔄 **Processing Stages**
Each URL goes through these tracked stages:
1. **Extracting** - Data extraction with Firecrawl
2. **Extracted** - Data extraction completed
3. **Screenshotting** - Screenshot capture in progress
4. **Screenshot Taken** - Screenshot captured successfully
5. **Uploading** - File upload to Convex storage
6. **Uploaded** - File uploaded successfully
7. **Saving** - Database save in progress
8. **Completed** - Fully processed and saved
9. **Failed** - Processing failed (with detailed error info)

### 💾 **Persistent State Management**
- **Progress file**: `data/processing-progress.json` - Real-time state tracking
- **Results file**: `data/processing-results.json` - Final comprehensive report
- **Auto-save**: Progress saved every 5 processed items and after each batch

## 🚀 Quick Start

### 1. Environment Setup

First, ensure you have the required environment variables:

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local and add your API keys:
# FIRECRAWL_API_KEY=your_firecrawl_api_key_here
# VITE_CONVEX_URL=your_convex_url_here
# CONVEX_TOKEN=your_convex_token_here
```

### 2. Prepare Your Data

Ensure your CSV file is ready:
- **Location**: `data/Trendi Tools - Final.csv`
- **Required column**: `URL` (containing the URLs to process)
- **Other columns**: Can be empty (will be populated by the script)

### 3. Choose Your Processing Mode

#### 🔍 **Dry Run Mode** (Recommended First)
```bash
# Test the system without making real API calls
npm run process-tools:dry
```

#### 🎯 **Live Processing**
```bash
# Process all URLs from scratch
npm run process-tools

# Process with custom batch size
npm run process-tools -- --batch-size=5
```

#### 🔄 **Resume Processing**
```bash
# Resume from where you left off after interruption
npm run process-tools:resume
```

#### 🔁 **Retry Failed URLs**
```bash
# Only retry URLs that previously failed
npm run process-tools:retry
```

## 📊 Progress Tracking

### Real-time Dashboard
The script provides a beautiful real-time dashboard showing:
- **Overview**: Total URLs, completed, failed, pending, success rate
- **Stage Breakdown**: How many URLs are at each processing stage
- **Retry Statistics**: Success rates and retry patterns
- **Error Patterns**: Most common error types

### Progress Files

#### `data/processing-progress.json`
```json
{
  "startTime": "2024-01-15T10:30:00.000Z",
  "totalUrls": 1000,
  "processedCount": 49,
  "completedCount": 45,
  "failedCount": 4,
  "currentBatch": 17,
  "urls": {
    "https://example.com": {
      "status": "completed",
      "attempts": 1,
      "lastAttempt": "2024-01-15T10:35:00.000Z",
      "stages": {
        "extracting": { "timestamp": "...", "success": true },
        "screenshotting": { "timestamp": "...", "success": true },
        "uploading": { "timestamp": "...", "success": true },
        "saving": { "timestamp": "...", "success": true }
      },
      "data": {
        "extractedData": { "name": "Tool Name", ... },
        "screenshotPath": "/path/to/screenshot.png",
        "screenshotUrl": "/image?id=storage-id",
        "savedTool": { "_id": "tool-id", ... }
      }
    }
  }
}
```

## 🛠️ Advanced Usage

### Custom Batch Sizes
```bash
# Process in smaller batches (better for monitoring)
npm run process-tools -- --batch-size=2

# Process in larger batches (faster but less granular tracking)
npm run process-tools -- --batch-size=10
```

### Combining Modes
```bash
# Resume processing with custom batch size
npm run process-tools:resume -- --batch-size=3

# Retry failed with dry run to see what would be retried
npm run process-tools:retry -- --dry-run
```

## 🔧 Configuration Options

### Script Configuration
Edit `scripts/process-tools.js` to modify:

```javascript
const CONFIG = {
  batchSize: 3,              // URLs per batch
  delayBetweenRequests: 2000, // 2 seconds between requests
  delayBetweenBatches: 5000,  // 5 seconds between batches
  maxRetries: 3,              // Maximum retries per URL
  saveProgressInterval: 5     // Save progress every N items
};
```

## 🚨 Error Handling & Recovery

### Automatic Recovery
- **Network failures**: Automatic retry with exponential backoff
- **API rate limits**: Built-in delays and retry logic
- **Partial failures**: Continue processing other URLs
- **Interruption recovery**: Resume from exact point of failure

### Manual Recovery

#### If Processing Gets Stuck
1. **Stop the process**: `Ctrl+C`
2. **Check progress**: Review `data/processing-progress.json`
3. **Resume**: `npm run process-tools:resume`

#### If Many URLs Fail
1. **Analyze errors**: Check the dashboard error patterns
2. **Fix issues**: Update environment variables, check network
3. **Retry failed**: `npm run process-tools:retry`

#### If You Need to Start Over
1. **Delete progress files**:
   ```bash
   rm data/processing-progress.json
   rm data/processing-results.json
   ```
2. **Start fresh**: `npm run process-tools`

## 📈 Monitoring Large Batches

### For 1000+ URLs
1. **Start with dry run**: Test with a few URLs first
2. **Use small batches**: `--batch-size=2` for better monitoring
3. **Monitor progress**: Check `processing-progress.json` regularly
4. **Plan for interruptions**: The system is designed to handle them
5. **Use resume mode**: If anything goes wrong, just resume

### Recommended Workflow
```bash
# 1. Test with dry run
npm run process-tools:dry

# 2. Start processing with small batches
npm run process-tools -- --batch-size=2

# 3. If interrupted, resume
npm run process-tools:resume

# 4. If some fail, retry them
npm run process-tools:retry
```

## 📊 Analytics & Reporting

### Dashboard Metrics
- **Success Rate**: Percentage of successfully processed URLs
- **Stage Distribution**: Where URLs are in the pipeline
- **Error Patterns**: Most common failure reasons
- **Retry Statistics**: How many URLs needed multiple attempts

### Export Results
After processing, you'll have:
- **CSV with populated data**: Original CSV with all fields filled
- **Progress state**: Detailed tracking information
- **Analytics report**: Comprehensive processing statistics

## 🔍 Troubleshooting

### Common Issues

#### "FIRECRAWL_API_KEY not found"
- Ensure `.env.local` exists and contains your API key
- Check the key is valid and has sufficient credits

#### "Failed to upload to Convex"
- Verify `VITE_CONVEX_URL` is correct
- Ensure Convex project is deployed and accessible

#### "Screenshot timeout"
- Some websites are slow to load
- The script will retry automatically
- Consider increasing timeout in the script

#### "Too many failures"
- Check your internet connection
- Verify API keys are valid
- Some URLs might be invalid or unreachable

### Getting Help

1. **Check the progress file**: `data/processing-progress.json`
2. **Review error patterns**: Look at the dashboard output
3. **Try dry run mode**: Test without making real changes
4. **Use smaller batches**: Easier to identify specific issues

## 🎯 Best Practices

### For Large Datasets (1000+ URLs)
1. **Always start with dry run**
2. **Use small batch sizes** (2-5 URLs)
3. **Monitor progress regularly**
4. **Plan for interruptions**
5. **Keep backups** of your progress files

### For Production Use
1. **Test thoroughly** with dry runs
2. **Monitor API usage** and costs
3. **Set up proper error alerting**
4. **Regular progress backups**
5. **Document your specific configuration**

---

## 🚀 Ready to Process 1000 Tools?

With this enhanced system, you can confidently process 1000 tools knowing that:
- ✅ **Every step is tracked** - No lost progress
- ✅ **Failures are recoverable** - Resume from any point
- ✅ **Detailed analytics** - Know exactly what happened
- ✅ **Flexible retry options** - Fix issues and continue
- ✅ **Production ready** - Built for large-scale processing

Start with a dry run, then process in small batches, and use the resume functionality whenever needed!