# Automated Tool Processing System

This system automates the entire process of adding new tools to the TrendiTools database using Firecrawl for data extraction, Puppeteer for screenshots, and Convex for storage.

## Overview

The automation script (`scripts/process-tools.js`) processes URLs from a CSV file and:

1. **Extracts structured data** using Firecrawl's advanced extraction API
2. **Takes screenshots** using Puppeteer with optimized settings
3. **Uploads everything** to Convex database with proper error handling

## Setup

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in the required values:

```bash
cp .env.example .env.local
```

Required environment variables:

- `FIRECRAWL_API_KEY`: Get from [Firecrawl.dev](https://firecrawl.dev)
- `CONVEX_URL`: Your Convex deployment URL
- `OPENAI_API_KEY`: For any AI-powered features (optional for this script)

### 3. Firecrawl Setup

1. Sign up at [Firecrawl.dev](https://firecrawl.dev)
2. Get your API key from the dashboard
3. Add it to your `.env.local` file

**Why Firecrawl?**
- Advanced web scraping with JavaScript rendering
- Built-in LLM extraction capabilities
- Handles complex websites and SPAs
- Structured data extraction with schemas
- Rate limiting and error handling built-in

## Usage

### 1. Prepare Your CSV File

Update `data/Trendi Tools - Final.csv` with URLs you want to process:

```csv
URL,name,tagline,summary,descriptor,screenshot,tags
https://example.com,,,,,
https://another-tool.com,,,,,
```

**Note**: Only the URL column needs to be filled. The script will automatically populate all other fields.

### 2. Run the Script

```bash
npm run process-tools
```

The script will:
- Process URLs in batches of 5 (configurable)
- Add delays between requests to be respectful
- Show detailed progress and error reporting
- Save results to `data/processing-results.json`

### 3. Monitor Progress

The script provides detailed logging:

```
🎯 Starting automated tool processing...
📋 Found 5 URLs in CSV file
🚀 Processing: https://example.com
🔍 Extracting data from: https://example.com
✅ Successfully extracted data for: Example Tool
📸 Taking screenshot of: https://example.com
✅ Screenshot saved: /path/to/screenshot.png
✅ File uploaded to Convex storage: abc123
✅ Tool saved to database: Example Tool
🎉 Successfully processed: Example Tool
```

## Features

### Intelligent Data Extraction

The script uses Firecrawl's extraction API with a comprehensive prompt:

- **Name**: Product/service/company name
- **Tagline**: Short catchy phrase (1-2 sentences)
- **Summary**: Comprehensive description (500+ words)
- **Descriptor**: Brief 1-2 sentence description
- **Tags**: Relevant category tags array

### Smart Screenshot Capture

- Optimized viewport (1200x800)
- Waits for network idle and dynamic content
- Handles SPAs and JavaScript-heavy sites
- Automatic filename generation from tool names

### Robust Error Handling

- Continues processing even if individual URLs fail
- Detailed error reporting and logging
- Automatic retries for transient failures
- Graceful degradation (saves tools even without screenshots)

### Batch Processing

- Configurable batch sizes (default: 5)
- Rate limiting between requests
- Progress tracking and reporting
- Results saved to JSON for analysis

## Configuration

Edit the `CONFIG` object in `scripts/process-tools.js`:

```javascript
const CONFIG = {
  csvPath: path.join(__dirname, '../data/Trendi Tools - Final.csv'),
  firecrawlApiKey: process.env.FIRECRAWL_API_KEY,
  convexUrl: process.env.CONVEX_URL,
  screenshotDir: path.join(__dirname, '../screenshots'),
  batchSize: 5, // Process 5 URLs at a time
  delayBetweenRequests: 2000 // 2 seconds between requests
};
```

## Troubleshooting

### Common Issues

1. **"FIRECRAWL_API_KEY environment variable is required"**
   - Make sure you've added your Firecrawl API key to `.env.local`

2. **"CONVEX_URL environment variable is required"**
   - Ensure your Convex deployment URL is in `.env.local`

3. **"Tool with URL already exists"**
   - The script prevents duplicates. Remove existing tools or use different URLs

4. **Screenshot failures**
   - Some sites block automated browsers. The script continues without screenshots

5. **Extraction failures**
   - Some sites may be difficult to parse. Check the Firecrawl dashboard for details

### Debug Mode

For more detailed logging, you can modify the script to run Puppeteer in non-headless mode:

```javascript
browser = await puppeteer.launch({
  headless: false, // Change to false for debugging
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
```

## Cost Considerations

### Firecrawl Pricing
- Free tier: 500 requests/month
- Paid plans start at $20/month for 10,000 requests
- Each URL processed = 1 request

### Optimization Tips
- Process URLs in smaller batches during development
- Use the `--dry-run` flag (if implemented) for testing
- Monitor your Firecrawl usage in their dashboard

## Extending the Script

### Adding Custom Fields

1. Update the Convex schema in `convex/schema.ts`
2. Modify the extraction prompt in the script
3. Update the `toolData` object preparation

### Custom Processing Logic

```javascript
// Add custom validation
if (extractedData.name.length < 3) {
  console.log('⚠️ Tool name too short, skipping...');
  return null;
}

// Add custom categorization
const category = categorizeByTags(extractedData.tags);
toolData.category = category;
```

### Integration with Other Services

```javascript
// Example: Send to Slack when processing completes
if (savedTool) {
  await sendSlackNotification(`New tool added: ${extractedData.name}`);
}
```

## Best Practices

1. **Start Small**: Test with 2-3 URLs first
2. **Monitor Costs**: Keep track of Firecrawl usage
3. **Backup Data**: The script saves results to JSON for recovery
4. **Review Results**: Always review extracted data for quality
5. **Rate Limiting**: Respect website rate limits and terms of service

## Future Enhancements

- [ ] Dry-run mode for testing
- [ ] Resume functionality for interrupted processing
- [ ] Custom extraction prompts per domain
- [ ] Integration with content moderation APIs
- [ ] Automatic categorization based on content
- [ ] Webhook notifications for completion
- [ ] Dashboard for monitoring processing status

## Support

If you encounter issues:

1. Check the console output for detailed error messages
2. Review the `data/processing-results.json` file
3. Verify your environment variables are set correctly
4. Check Firecrawl dashboard for API usage and errors
5. Ensure Convex deployment is running and accessible