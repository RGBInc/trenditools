# Tool Processing Script Usage

This script automates the process of extracting tool data from URLs and adding them to your Convex database.

## Quick Start

### 1. Test with Dry Run (Recommended)
```bash
npm run process-tools:dry-run
```

This will:
- ✅ Read URLs from your CSV file
- ✅ Show what data would be extracted (using sample data)
- ✅ Show what screenshots would be taken
- ✅ Show what would be uploaded to Convex
- ❌ **No actual API calls or database changes**

### 2. Run for Real
```bash
npm run process-tools
```

This will:
- 🔥 Make real Firecrawl API calls
- 📸 Take actual screenshots with Puppeteer
- ☁️ Upload files to Convex storage
- 💾 Save tools to your database

## Requirements

### Environment Variables (for real runs)
```bash
FIRECRAWL_API_KEY=your_firecrawl_api_key
CONVEX_URL=your_convex_deployment_url
```

### CSV File
Ensure your CSV file is at: `data/Trendi Tools - Final.csv`
With a column named `URL` containing the tool URLs.

## Features

- **Intelligent Data Extraction**: Uses Firecrawl's AI to extract structured data
- **Smart Screenshots**: Captures high-quality screenshots with Puppeteer
- **Batch Processing**: Processes URLs in batches with delays to be respectful
- **Error Handling**: Continues processing even if individual URLs fail
- **Progress Tracking**: Shows detailed progress and summary statistics
- **Dry Run Mode**: Test everything without making changes

## Output

- Screenshots are temporarily saved to `screenshots/` (cleaned up after upload)
- Processing results are saved to `data/processing-results.json`
- Detailed logs show progress for each URL

## Tips

1. **Always test with dry run first** to verify your CSV and setup
2. Monitor the logs for any errors or issues
3. The script is designed to be respectful with delays between requests
4. Failed URLs are logged but don't stop the entire process