# TrendiTools Data Enrichment Script

This script automatically generates comprehensive metadata for tools from their URLs, including names, taglines, summaries, descriptors, screenshots, and tags.

## Features

- **AI-Powered Generation**: Uses OpenAI GPT-4o-mini to generate high-quality metadata
- **Fallback Extraction**: Falls back to web scraping when AI is unavailable
- **Screenshot Capture**: Automatically captures and uploads screenshots
- **Batch Processing**: Processes tools in batches for efficiency
- **Dry Run Mode**: Test changes before applying them
- **Smart Tag Detection**: Extracts relevant technology tags
- **Category Classification**: Automatically categorizes tools

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

**Note**: The script will work without an OpenAI API key but will use fallback metadata extraction instead of AI-powered generation.

### 3. Get OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Go to API Keys section
4. Create a new API key
5. Add it to your `.env` file

## Usage

### Dry Run (Recommended First)

Test the script without making changes:

```bash
# Process 5 tools in dry run mode
npm run enrich:dry

# Process specific number of tools
node scripts/enrich-tools.js --dry-run --limit 10
```

### Live Mode

Apply changes to the database:

```bash
# Process all tools
node scripts/enrich-tools.js --live

# Process specific number of tools
node scripts/enrich-tools.js --live --limit 20
```

### Command Line Options

- `--dry-run`: Preview changes without applying them
- `--live`: Apply changes to the database
- `--limit N`: Process only N tools (default: all)

## Generated Metadata

For each tool URL, the script generates:

1. **Name**: Clear, concise tool name (2-4 words)
2. **Tagline**: Compelling tagline (under 60 characters)
3. **Summary**: Rich, informative paragraph (100-200 words)
4. **Descriptor**: Brief one-sentence description (under 100 characters)
5. **Screenshot**: Automatically captured and uploaded
6. **Tags**: 5-8 relevant technology tags
7. **Category**: Automatically classified category

## AI vs Fallback Mode

### With OpenAI API Key (Recommended)
- Uses GPT-4o-mini for intelligent content generation
- Creates comprehensive, contextual metadata
- Better quality names, taglines, and summaries
- More accurate tag extraction

### Without OpenAI API Key (Fallback)
- Extracts metadata from page elements (title, description, etc.)
- Uses predefined keyword matching for tags
- Basic category detection
- Still functional but less sophisticated

## Output Example

```
🔍 DRY RUN - Would update Figma:
   Name: Figma
   Tagline: Collaborative Interface Design Tool
   Summary: Figma is a web-based design tool that enables teams to collaborate in real-time on interface design, prototyping, and design systems. It offers powerful vector editing capabilities, component libraries, and seamless handoff features for developers.
   Descriptor: Collaborative design platform for UI/UX teams
   Tags: design, collaboration, prototyping, ui, ux, interface
   Category: Design
```

## Troubleshooting

### Common Issues

1. **"puppeteer is required but not installed"**
   ```bash
   npm install puppeteer
   ```

2. **"OpenAI API key missing"**
   - Add your API key to `.env` file
   - Or run without AI (fallback mode will be used)

3. **"page.waitForTimeout is not a function"**
   - This has been fixed in the latest version
   - Ensure you're using the updated script

4. **Network timeouts**
   - The script includes retry logic
   - Some tools may fail due to anti-bot measures

### Performance Tips

- Use `--limit` to process tools in smaller batches
- Run dry mode first to identify potential issues
- Monitor the console output for errors
- The script includes delays to avoid rate limiting

## Script Architecture

- **Web Scraping**: Uses Puppeteer for page content extraction
- **AI Processing**: OpenAI GPT-4o-mini for metadata generation
- **Fallback Logic**: Web scraping when AI is unavailable
- **Batch Processing**: Processes tools in configurable batches
- **Error Handling**: Comprehensive retry and fallback mechanisms
- **Screenshot Management**: Automatic capture and upload

## Contributing

To modify the script:

1. Edit `scripts/enrich-tools.js`
2. Test with `--dry-run` first
3. Adjust AI prompts in `generateAIMetadata()` function
4. Modify fallback logic in `generateEnrichedData()` function

## Security Notes

- Never commit your `.env` file to version control
- Keep your OpenAI API key secure
- Monitor API usage to avoid unexpected charges
- The script respects robots.txt and includes delays