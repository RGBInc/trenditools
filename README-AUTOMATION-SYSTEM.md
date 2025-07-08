# TrendiTools Automation System

## Project Overview

TrendiTools is an automated web scraping and data processing system designed to extract, process, and store information about various online tools. The system combines web scraping, screenshot capture, and database storage into a cohesive pipeline with intelligent state management and resume capabilities.

## System Architecture

### Core Components

1. **Web Scraping Engine** (`scripts/process-tools.js`)
   - Firecrawl API integration for content extraction
   - Puppeteer for screenshot capture
   - Batch processing with rate limiting

2. **State Management System**
   - `processing-progress.json`: Live state tracking across sessions
   - `processing-results.json`: Final run reports and analytics
   - Intelligent resume and retry capabilities

3. **Database Integration**
   - Convex backend for data storage
   - File storage for screenshots
   - Automatic conflict resolution

4. **Data Pipeline**
   - CSV input processing
   - Multi-stage processing workflow
   - Error handling and recovery

### Technology Stack

- **Backend**: Node.js with Convex
- **Web Scraping**: Firecrawl API, Puppeteer
- **Data Storage**: Convex database and file storage
- **State Management**: JSON-based persistence
- **Input Format**: CSV files

## Directory Structure

```
trenditools/
├── scripts/
│   └── process-tools.js          # Main processing pipeline
├── data/
│   ├── Trendi Tools - Final.csv  # Input URLs
│   ├── processing-progress.json  # Live state tracking
│   ├── processing-results.json   # Final run reports
│   ├── failed_urls_report.csv    # Failed URLs summary
│   └── screenshots/              # Local screenshot storage
├── convex/                       # Convex backend configuration
├── PROCESSING_PIPELINE_DOCUMENTATION.md  # Detailed technical docs
└── README-AUTOMATION-SYSTEM.md   # This file
```

## Quick Start

### Prerequisites

1. **Environment Setup**
   ```bash
   # Required environment variables
   FIRECRAWL_API_KEY=your_firecrawl_api_key
   VITE_CONVEX_URL=your_convex_url
   ```

2. **Dependencies**
   ```bash
   npm install
   ```

3. **Input Data**
   - Add URLs to `data/Trendi Tools - Final.csv`
   - One URL per row

### Basic Usage

#### Process All URLs (Fresh Start)
```bash
node scripts/process-tools.js
```
- Automatically skips already processed URLs
- Resumes interrupted processing
- Processes only new URLs

#### Retry Failed URLs
```bash
node scripts/process-tools.js --retry-failed
```
- Re-processes only previously failed URLs
- Maintains failure history and attempt counts

#### Dry Run (Testing)
```bash
node scripts/process-tools.js --dry-run
```
- Simulates processing without actual operations
- Useful for validation and testing

## Key Features

### 🔄 Smart Incremental Processing
- **Automatic Deduplication**: Skips already processed URLs
- **Resume Capability**: Continues from interruption points
- **Stage-Level Tracking**: Granular progress monitoring
- **Cross-Session Memory**: Persistent state across runs

### 📊 Comprehensive Analytics
- **Real-Time Dashboard**: Live progress monitoring
- **Success Rate Tracking**: Performance metrics
- **Error Pattern Analysis**: Failure categorization
- **Retry Statistics**: Attempt tracking

### 🛡️ Robust Error Handling
- **Automatic Retries**: Configurable retry logic
- **Graceful Degradation**: Continues processing on failures
- **Detailed Error Reporting**: Comprehensive failure logs
- **Recovery Mechanisms**: Multiple recovery strategies

### ⚡ Performance Optimization
- **Batch Processing**: Efficient API usage
- **Rate Limiting**: Respects API constraints
- **Memory Management**: Optimized for large datasets
- **Parallel Operations**: Concurrent processing where possible

## Processing Workflow

### Stage-by-Stage Breakdown

1. **URL Loading**
   - Read URLs from CSV file
   - Validate and normalize URLs
   - Compare against existing progress

2. **Content Extraction**
   - Use Firecrawl API for structured data extraction
   - Extract: name, tags, summary, tagline, category, descriptor
   - Handle extraction timeouts and errors

3. **Screenshot Capture**
   - Navigate to URL using Puppeteer
   - Capture full-page screenshots
   - Save locally with URL-based naming

4. **File Upload**
   - Upload screenshots to Convex storage
   - Generate permanent storage URLs
   - Handle upload failures and retries

5. **Database Storage**
   - Save complete tool data to Convex database
   - Include extracted data and screenshot URLs
   - Handle conflicts and duplicates

### Success Metrics
- **Typical Success Rate**: ~98.8%
- **Processing Speed**: ~300 URLs/hour
- **Error Recovery**: ~90% of failures resolved on retry

## State Management

### Progress Tracking (`processing-progress.json`)
- **Purpose**: Live state tracking across sessions
- **Persistence**: Accumulates data across multiple runs
- **Contains**: URL status, attempt counts, stage completion, error messages

### Results Reporting (`processing-results.json`)
- **Purpose**: Comprehensive run reports
- **Persistence**: Overwritten with each run
- **Contains**: Analytics, configuration, detailed results

### Failed URLs Report (`failed_urls_report.csv`)
- **Purpose**: Summary of processing failures
- **Format**: CSV with URL, error message, attempts
- **Usage**: Manual review and troubleshooting

## Configuration Options

### Processing Parameters
```javascript
// Configurable in process-tools.js
const CONFIG = {
  batchSize: 5,           // URLs per batch
  maxRetries: 3,          // Maximum retry attempts
  delayBetweenBatches: 2000, // Milliseconds
  screenshotTimeout: 30000,  // Screenshot timeout
  extractionTimeout: 60000   // Extraction timeout
};
```

### Environment Variables
```bash
# Required
FIRECRAWL_API_KEY=your_api_key
VITE_CONVEX_URL=your_convex_url

# Optional
PROCESSING_BATCH_SIZE=5
PROCESSING_MAX_RETRIES=3
```

## Monitoring and Debugging

### Real-Time Monitoring
- Console dashboard with live progress
- Batch completion notifications
- Error alerts and warnings
- Performance metrics

### Log Analysis
- Detailed console logging
- Error categorization
- Performance timing
- API response tracking

### Troubleshooting Common Issues

#### API Key Issues
```bash
# Verify environment variables
echo $FIRECRAWL_API_KEY
echo $VITE_CONVEX_URL
```

#### Network Timeouts
- Increase timeout values in configuration
- Check network connectivity
- Verify API service status

#### Memory Issues
- Reduce batch size
- Monitor system resources
- Clear screenshot directory if needed

#### Corrupted State
```bash
# Reset progress (use with caution)
rm data/processing-progress.json
```

## Data Formats

### Input CSV Format
```csv
url
https://example1.com
https://example2.com
https://example3.com
```

### Extracted Data Schema
```json
{
  "name": "Tool Name",
  "tags": ["tag1", "tag2"],
  "summary": "Detailed description",
  "tagline": "Brief tagline",
  "category": "Tool category",
  "descriptor": "Additional info"
}
```

### Database Schema (Convex)
```javascript
// tools table
{
  _id: "convex_generated_id",
  name: "Tool Name",
  url: "https://example.com",
  tags: ["tag1", "tag2"],
  summary: "Description",
  tagline: "Brief tagline",
  category: "Category",
  descriptor: "Additional info",
  screenshotUrl: "https://convex_storage_url",
  createdAt: "2024-01-15T10:30:00.000Z",
  updatedAt: "2024-01-15T10:30:00.000Z"
}
```

## Performance Optimization

### Best Practices
1. **Batch Size Tuning**: Start with 5, adjust based on performance
2. **Timeout Configuration**: Balance speed vs. reliability
3. **Resource Monitoring**: Watch memory and network usage
4. **Error Analysis**: Review failed URLs for patterns

### Scaling Considerations
- **Large Datasets**: Process in smaller chunks
- **API Limits**: Respect rate limiting
- **Storage Costs**: Monitor Convex usage
- **Processing Time**: Plan for long-running operations

## Maintenance

### Regular Tasks
1. **Monitor Failed URLs**: Review and retry as needed
2. **Clean Screenshots**: Remove old local files
3. **Update Dependencies**: Keep packages current
4. **Backup Data**: Export important results

### Health Checks
```bash
# Verify system health
node scripts/process-tools.js --dry-run

# Check API connectivity
curl -H "Authorization: Bearer $FIRECRAWL_API_KEY" https://api.firecrawl.dev/v1/
```

## Security Considerations

### API Key Management
- Store keys in environment variables
- Never commit keys to version control
- Rotate keys regularly
- Monitor API usage

### Data Privacy
- Review extracted content for sensitive data
- Implement data retention policies
- Secure screenshot storage
- Comply with website terms of service

## Future Enhancements

### Planned Features
- [ ] Web-based dashboard
- [ ] Automated scheduling
- [ ] Advanced analytics
- [ ] Multi-source input support
- [ ] Real-time notifications
- [ ] Enhanced error recovery

### Integration Opportunities
- Slack/Discord notifications
- Email reporting
- Database exports
- API endpoints
- Webhook support

## Support and Documentation

- **Technical Details**: See `PROCESSING_PIPELINE_DOCUMENTATION.md`
- **Project Overview**: See `PROJECT_OVERVIEW.md`
- **Usage Guide**: See `USAGE.md`
- **API Documentation**: See `convex/README.md`

## Contributing

1. Follow existing code patterns
2. Add comprehensive error handling
3. Update documentation
4. Test with dry-run mode
5. Monitor performance impact

---

**Note**: This system is designed for ethical web scraping. Always respect robots.txt, rate limits, and website terms of service.