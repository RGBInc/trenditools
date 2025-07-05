# 🤖 Automation

This section covers TrendiTools' data processing and automation capabilities, including AI-powered tool extraction and batch processing systems.

## 📚 Documentation in This Section

### [Processing Script Documentation](PROCESSING_SCRIPT.md)
**Main processing script for tool data extraction**
- Comprehensive processing pipeline
- AI-powered extraction with Firecrawl
- Automated screenshot capture
- Cloud integration and storage
- Progress tracking and resume functionality
- Error recovery and retry mechanisms

### [Enhanced Processing Guide](ENHANCED-PROCESSING.md)
**Advanced processing features and workflows**
- Granular progress tracking
- Resumable processing pipeline
- Field-level error recovery
- Batch processing strategies
- Monitoring and analytics
- Manual recovery procedures

## 🎯 Automation Overview

### Core Processing Pipeline

```
CSV Input → AI Extraction → Screenshot Capture → Cloud Upload → Database Save
    ↓            ↓              ↓                ↓            ↓
Tool URLs → Tool Metadata → Visual Previews → File Storage → Searchable Data
```

### Key Features

#### 🔍 **AI-Powered Extraction**
- Uses Firecrawl AI to analyze website content
- Extracts tool names, descriptions, categories, and tags
- Intelligent content summarization
- Automatic categorization

#### 📸 **Automated Screenshots**
- High-quality website screenshots with Puppeteer
- Optimized viewport settings (1200x800)
- Error handling and retry logic
- Local storage with cloud backup

#### ☁️ **Cloud Integration**
- Seamless Convex storage integration
- Automatic file uploads and URL generation
- Database synchronization
- Real-time progress tracking

#### 🔄 **Resume Functionality**
- Persistent progress tracking
- Automatic interruption recovery
- Field-level completion status
- No duplicate processing

## 🚀 Quick Start Guide

### 1. Environment Setup
```bash
# Required environment variables
FIRECRAWL_API_KEY=your_api_key
VITE_CONVEX_URL=your_convex_url
OPENAI_API_KEY=your_openai_key  # Optional
```

### 2. Basic Usage
```bash
# Test run (recommended first)
npm run process-tools:dry

# Full processing
npm run process-tools

# Resume interrupted processing
npm run process-tools:resume

# Retry failed items
npm run process-tools:retry
```

### 3. Data Preparation
- Place CSV file at `data/Trendi Tools - Final.csv`
- Ensure URL column is present
- Other columns will be populated automatically

## 📊 Processing Stages

Each tool goes through these tracked stages:

1. **Pending** - Initial state
2. **Extracting** - AI data extraction in progress
3. **Extracted** - Data extraction completed
4. **Screenshot** - Screenshot capture in progress
5. **Screenshot Done** - Screenshot captured
6. **Uploading** - File upload to cloud storage
7. **Uploaded** - Upload completed
8. **Saving** - Database save in progress
9. **Completed** - Fully processed

## 🛠️ Advanced Features

### Batch Processing
- Configurable batch sizes (default: 5 URLs)
- Rate limiting to respect API limits
- Parallel processing within batches
- Progress monitoring and reporting

### Error Recovery
- Automatic retry with exponential backoff
- Field-specific error tracking
- Manual retry capabilities
- Detailed error reporting

### Monitoring
- Real-time progress dashboard
- Processing statistics
- Error pattern analysis
- Performance metrics

## 🎯 Use Cases

### For Data Managers
1. **Large Dataset Processing**: Handle 1000+ URLs efficiently
2. **Data Quality**: AI-powered extraction ensures consistency
3. **Progress Tracking**: Monitor processing status in real-time
4. **Error Recovery**: Handle failures gracefully

### For Developers
1. **Development Testing**: Dry run mode for safe testing
2. **Incremental Updates**: Resume processing after code changes
3. **Debugging**: Detailed error logs and retry mechanisms
4. **Integration**: Easy integration with existing workflows

### For Operations
1. **Scheduled Processing**: Run automated data updates
2. **Monitoring**: Track processing health and performance
3. **Recovery**: Handle interruptions and failures
4. **Scaling**: Process large datasets efficiently

## 🔗 Related Documentation

- **Architecture**: [System Design](../ARCHITECTURE/README.md)
- **Features**: [Image System](../FEATURES/IMAGE_SYSTEM.md)
- **Getting Started**: [Developer Guide](../GETTING_STARTED/README.md)
- **Security**: [Processing Security](../SECURITY/README.md)

## 📈 Performance Tips

### For Large Datasets (1000+ URLs)
1. Start with dry run to validate setup
2. Use smaller batch sizes for better monitoring
3. Plan for interruptions (resume capability)
4. Monitor API rate limits
5. Use retry functionality for failed items

### Optimization Settings
```javascript
const CONFIG = {
  batchSize: 3,              // Smaller for better tracking
  delayBetweenRequests: 2000, // Respect rate limits
  maxRetries: 3,              // Handle temporary failures
  saveProgressInterval: 5     // Frequent progress saves
};
```

---

**Get Started**: Begin with the [Processing Script Documentation](PROCESSING_SCRIPT.md) for comprehensive setup and usage instructions.