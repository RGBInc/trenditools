# Processing Pipeline Documentation

## Overview

This document provides comprehensive documentation of the URL processing pipeline functionality discovered through codebase analysis. The system implements a sophisticated batch processing architecture for extracting data from URLs, taking screenshots, and storing results in a Convex database.

## Core Architecture

### Processing Pipeline Components

The main processing script `scripts/process-tools.js` implements a multi-stage pipeline:

1. **URL Loading**: Reads URLs from CSV file
2. **Data Extraction**: Uses Firecrawl API for content extraction
3. **Screenshot Capture**: Uses Puppeteer for visual capture
4. **File Upload**: Stores screenshots in Convex storage
5. **Database Storage**: Saves tool data to Convex database

### State Management System

The system uses two primary JSON files for state tracking:

#### `processing-progress.json` (Live State Tracking)
- **Purpose**: Real-time tracking of processing state across sessions
- **Persistence**: Accumulates data across multiple runs
- **Structure**:
  ```json
  {
    "totalUrls": 657,
    "urls": {
      "https://example.com": {
        "status": "completed|failed|in_progress",
        "attempts": 1,
        "lastAttempt": "2024-01-15T10:30:00.000Z",
        "stages": {
          "extracting": { "success": true, "timestamp": "..." },
          "extracted": { "success": true, "timestamp": "..." },
          "screenshotting": { "success": true, "timestamp": "..." },
          "screenshot_taken": { "success": true, "timestamp": "..." },
          "uploading": { "success": true, "timestamp": "..." },
          "uploaded": { "success": true, "timestamp": "..." },
          "saving": { "success": true, "timestamp": "..." }
        },
        "extractedData": { /* tool data */ },
        "screenshotPath": "data/screenshots/example.PNG",
        "screenshotUrl": "https://...",
        "savedToolId": "convex_id",
        "error": "error message if failed"
      }
    }
  }
  ```

#### `processing-results.json` (Final Report)
- **Purpose**: Comprehensive report generated after each run completion
- **Persistence**: Overwritten with each run (snapshot of current run only)
- **Structure**:
  ```json
  {
    "timestamp": "2024-01-15T12:00:00.000Z",
    "startTime": "2024-01-15T10:00:00.000Z",
    "endTime": "2024-01-15T12:00:00.000Z",
    "configuration": {
      "batchSize": 5,
      "maxRetries": 3,
      "dryRun": false,
      "resume": false,
      "retryFailed": false
    },
    "analytics": {
      "overview": {
        "total": 657,
        "processed": 646,
        "completed": 649,
        "failed": 299,
        "pending": 11,
        "successRate": 98.8
      },
      "stageBreakdown": { /* stage statistics */ },
      "errorPatterns": { /* error frequency analysis */ },
      "retryStatistics": { /* retry attempt analysis */ }
    },
    "detailedResults": { /* complete URL results from progressState.urls */ }
  }
  ```

## Processing Stages

The pipeline implements granular stage tracking for each URL:

### Stage Definitions
```javascript
const STAGES = {
  EXTRACTING: 'extracting',
  EXTRACTED: 'extracted', 
  SCREENSHOTTING: 'screenshotting',
  SCREENSHOT_TAKEN: 'screenshot_taken',
  UPLOADING: 'uploading',
  UPLOADED: 'uploaded',
  SAVING: 'saving'
};
```

### Stage Flow
1. **EXTRACTING**: Initiating Firecrawl API extraction
2. **EXTRACTED**: Content extraction completed successfully
3. **SCREENSHOTTING**: Starting Puppeteer screenshot capture
4. **SCREENSHOT_TAKEN**: Screenshot captured and saved locally
5. **UPLOADING**: Uploading screenshot to Convex storage
6. **UPLOADED**: File upload completed, URL obtained
7. **SAVING**: Saving complete tool data to Convex database

## Smart Resume and Retry Logic

### Incremental Processing
The system implements intelligent URL deduplication:
- Reads all URLs from `Trendi Tools - Final.csv`
- Compares against existing progress state
- Processes only new/failed URLs
- Skips already completed URLs automatically

### Resume Capability
The `canResumeFromStage()` function determines resumption points:
- URLs can resume from any incomplete stage
- Prevents redundant work on partial completions
- Maintains data integrity across interruptions

### Retry Logic
- Failed URLs are tracked with error messages and attempt counts
- `--retry-failed` flag re-processes all previously failed URLs
- Maximum retry attempts configurable via `maxRetries`
- Cross-session retry tracking maintains failure history

## Configuration System

### Environment Variables
- `FIRECRAWL_API_KEY`: Required for content extraction
- `VITE_CONVEX_URL`: Required for database operations

### File Paths
```javascript
const CONFIG = {
  csvPath: path.join(__dirname, '../data/Trendi Tools - Final.csv'),
  progressPath: path.join(__dirname, '../data/processing-progress.json'),
  resultsPath: path.join(__dirname, '../data/processing-results.json'),
  screenshotsDir: path.join(__dirname, '../data/screenshots'),
  failedReportPath: path.join(__dirname, '../data/failed_urls_report.csv')
};
```

## Batch Processing

### Batch Configuration
- Default batch size: 5 URLs
- Configurable delay between batches
- Progress saved after each batch completion
- Graceful handling of API rate limits

### Progress Tracking
- Real-time console dashboard
- Periodic progress state persistence
- Analytics generation for performance monitoring

## Error Handling and Reporting

### Error Categories
- **Extraction Errors**: Firecrawl API failures, timeouts
- **Screenshot Errors**: Puppeteer navigation/capture failures
- **Upload Errors**: Convex storage failures
- **Database Errors**: Convex database operation failures

### Error Reporting
- `failed_urls_report.csv`: Summary of all failed URLs with reasons
- Detailed error messages stored in progress state
- Error pattern analysis in final results

## Data Extraction Schema

The Firecrawl extraction returns structured data:
```javascript
{
  name: "Tool Name",
  tags: ["tag1", "tag2"],
  summary: "Tool description",
  tagline: "Brief tagline",
  category: "Tool category",
  descriptor: "Additional description"
}
```

## Usage Patterns

### Fresh Start
```bash
node scripts/process-tools.js
```
- Processes all URLs from CSV
- Skips already completed URLs
- Resumes interrupted URLs

### Retry Failed URLs
```bash
node scripts/process-tools.js --retry-failed
```
- Re-processes only previously failed URLs
- Increments attempt counters
- Updates failure reasons

### Dry Run Mode
```bash
node scripts/process-tools.js --dry-run
```
- Simulates processing without actual operations
- Useful for testing and validation

## Performance Characteristics

### Success Metrics
- Typical success rate: ~98.8%
- Average processing time: ~2 hours for 657 URLs
- Batch processing reduces API rate limit issues

### Failure Patterns
- Common failures: Navigation timeouts, extraction timeouts
- Retry logic handles transient failures effectively
- Persistent failures logged for manual investigation

## File Management

### Screenshot Storage
- Local storage: `data/screenshots/`
- Naming convention: URL-based with `.PNG` extension
- Automatic upload to Convex storage
- Local files retained for backup

### CSV Input Format
Expected CSV structure:
- Single column containing URLs
- Header row optional
- Whitespace automatically trimmed

## Integration Points

### Convex Database
- Tool data stored in `tools` table
- Screenshot URLs stored as Convex storage references
- Automatic ID generation and conflict handling

### External APIs
- **Firecrawl**: Content extraction and structured data
- **Puppeteer**: Headless browser for screenshots
- **Convex**: Database and file storage

## Monitoring and Analytics

### Real-time Dashboard
- Progress percentage
- Current batch status
- Success/failure counts
- Estimated completion time

### Post-processing Analytics
- Stage-by-stage breakdown
- Error pattern analysis
- Retry statistics
- Performance metrics

## Maintenance and Troubleshooting

### Common Issues
1. **API Key Issues**: Verify environment variables
2. **Network Timeouts**: Adjust timeout configurations
3. **Storage Limits**: Monitor Convex storage usage
4. **Memory Issues**: Reduce batch size for large datasets

### Recovery Procedures
1. **Interrupted Processing**: Simply restart - automatic resume
2. **Corrupted Progress**: Delete progress file for fresh start
3. **Failed Batches**: Use `--retry-failed` flag

## Future Enhancements

### Potential Improvements
- Parallel processing within batches
- Advanced error categorization
- Real-time web dashboard
- Automated retry scheduling
- Enhanced analytics and reporting

This documentation captures the complete functionality of the URL processing pipeline as implemented in the codebase, providing a comprehensive reference for understanding, maintaining, and extending the system.