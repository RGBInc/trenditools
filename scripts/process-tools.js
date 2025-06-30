#!/usr/bin/env node

/**
 * TrendiTools Processing Pipeline
 * 
 * ╔══════════════════════════════════════════════════════════════╗
 * ║                    🚀 AUTOMATED TOOL PROCESSOR               ║
 * ║                                                              ║
 * ║  Extracts, screenshots, and enriches tool data from URLs    ║
 * ║  using Firecrawl AI and saves to Convex database            ║
 * ╚══════════════════════════════════════════════════════════════╝
 * 
 * Features:
 * • 🔍 AI-powered content extraction with Firecrawl
 * • 📸 Automated screenshot capture with Puppeteer
 * • ☁️ Cloud storage integration with Convex
 * • 🎯 Batch processing with rate limiting
 * • 🔄 Dry run mode for testing
 * • 📊 Comprehensive progress tracking
 * 
 * DATA STRUCTURE & FIELD HIERARCHY:
 * ┌─────────────────────────────────────────────────────────────┐
 * │ EXTRACTED FIELDS (from AI analysis):                       │
 * │                                                             │
 * │ • name: Tool/service name                                   │
 * │ • tagline: Short catchy phrase (1-2 sentences)             │
 * │ • summary: Concise paragraph (max 300 words)               │
 * │   └─ INFORMATIVE CONTENT for understanding                 │
 * │ • descriptor: Brief 1-2 sentence description               │
 * │   └─ SEARCH INDEX field for quick matching                 │
 * │ • category: Single broad classification                     │
 * │   └─ BROAD: "AI", "Productivity", "Design", etc.          │
 * │ • tags: Array of specific use-case keywords                │
 * │   └─ SPECIFIC: ["machine learning", "automation", etc.]   │
 * │                                                             │
 * │ HIERARCHY: Category (broad) > Tags (specific use cases)    │
 * └─────────────────────────────────────────────────────────────┘
 * 
 * Usage:
 *   npm run process-tools        # Live mode
 *   npm run process-tools:dry    # Dry run mode
 * 
 * Requirements:
 *   - .env.local with FIRECRAWL_API_KEY and CONVEX_URL
 *   - CSV file with URLs in 'data/Trendi Tools - Final.csv'
 *   - Convex project deployed and configured
 */

// Load environment variables from .env.local
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import csv from 'csv-parser';
import { createReadStream } from 'fs';
import puppeteer from 'puppeteer';
// Note: Using native FormData instead of form-data package to avoid deprecation warnings
import fetch from 'node-fetch';
import { ConvexHttpClient } from 'convex/browser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local from project root
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Check for dry run mode
const isDryRun = process.argv.includes('--dry-run') || process.argv.includes('-d');

// Configuration
const CONFIG = {
  csvPath: path.join(__dirname, '../data/Trendi Tools - Final.csv'),
  firecrawlApiKey: process.env.FIRECRAWL_API_KEY,
  convexUrl: process.env.VITE_CONVEX_URL,
  screenshotDir: path.join(__dirname, '../screenshots'),
  batchSize: 5, // Process 5 URLs at a time
  delayBetweenRequests: 2000, // 2 seconds between requests
  dryRun: isDryRun
};

// Initialize Convex client (only if not in dry run mode)
let convex = null;
if (!CONFIG.dryRun) {
  convex = new ConvexHttpClient(CONFIG.convexUrl);
}

// Validation (relaxed for dry run mode)
if (!CONFIG.dryRun) {
  if (!CONFIG.firecrawlApiKey) {
    console.error('❌ FIRECRAWL_API_KEY environment variable is required');
    process.exit(1);
  }

  if (!CONFIG.convexUrl) {
    console.error('❌ VITE_CONVEX_URL environment variable is required');
    process.exit(1);
  }
} else {
  console.log('🔍 DRY RUN: Skipping environment variable validation');
}

/**
 * Poll extraction job until completion
 */
async function pollExtractJob(jobId, maxAttempts = 30, delayMs = 2000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(`https://api.firecrawl.dev/v1/extract/${jobId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${CONFIG.firecrawlApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Status check failed: ${response.status} ${response.statusText}`);
      }

      const statusResult = await response.json();
      
      console.log(`🔄 Job ${jobId} status: ${statusResult.status} (attempt ${attempt}/${maxAttempts})`);
      
      if (statusResult.status === 'completed') {
        if (statusResult.success && statusResult.data) {
          return statusResult.data;
        } else {
          throw new Error(`Job completed but no data returned: ${JSON.stringify(statusResult)}`);
        }
      } else if (statusResult.status === 'failed') {
        throw new Error(`Extraction job failed: ${JSON.stringify(statusResult)}`);
      } else if (statusResult.status === 'processing') {
        // Continue polling
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      } else {
        console.warn(`Unknown status: ${statusResult.status}`);
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    } catch (error) {
      console.error(`❌ Error checking job status (attempt ${attempt}):`, error.message);
      if (attempt === maxAttempts) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  throw new Error(`Extraction job timed out after ${maxAttempts} attempts`);
}

/**
 * Extract data using Firecrawl API
 */
async function extractDataWithFirecrawl(url) {
  console.log(`🔍 ${CONFIG.dryRun ? '[DRY RUN] ' : ''}Extracting data from: ${url}`);
  
  if (CONFIG.dryRun) {
    console.log(`🔍 [DRY RUN] Would extract data from Firecrawl API`);
    return {
      name: "Sample Tool Name",
      tagline: "Sample tagline for testing",
      summary: "This is a sample summary that would be extracted from the website. In a real run, this would contain detailed information about the tool, its features, benefits, and use cases.",
      descriptor: "A sample tool for demonstration purposes",
      tags: ["Sample", "Testing", "Demo"]
    };
  }
  
  try {
    // Submit extraction job
    const response = await fetch('https://api.firecrawl.dev/v1/extract', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CONFIG.firecrawlApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        urls: [url],
        prompt: `Extract the following information from this website:
        - name: The product/service/company name
        - tagline: A short catchy phrase or slogan (1-2 sentences)
        - summary: A concise paragraph (maximum 300 words) describing what the tool does, its key features, main benefits, and primary use cases. Should be informative but not overly detailed.
        - descriptor: A brief 1-2 sentence description of what this tool is (used for search indexing)
        - category: A single broad category that best describes this tool (e.g., "AI", "Productivity", "Design", "Development", "Marketing", "Analytics", etc.)
        - tags: An array of specific use-case tags that are more granular than the category (e.g., for an AI tool: ["machine learning", "text generation", "automation", "content creation"])
        
        IMPORTANT: 
        - Summary should be a brief paragraph (max 300 words) covering core functionality, features, and benefits
        - Category should be broad and general
        - Tags should be specific to use cases and features
        - Descriptor is brief for search purposes, Summary provides adequate detail for understanding`,
        schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            tagline: { type: "string" },
            summary: { type: "string" },
            descriptor: { type: "string" },
            category: { type: "string" },
            tags: { 
              type: "array",
              items: { type: "string" }
            }
          },
          required: ["name", "tagline", "summary", "descriptor", "category", "tags"]
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Firecrawl API error: ${response.status} ${response.statusText}`);
    }

    const jobResult = await response.json();
    
    if (!jobResult.success || !jobResult.id) {
      throw new Error(`Failed to submit extraction job: ${JSON.stringify(jobResult)}`);
    }

    console.log(`🔍 Extraction job submitted with ID: ${jobResult.id}`);
    
    // Poll for job completion
    const extractedData = await pollExtractJob(jobResult.id);
    
    if (extractedData) {
      console.log(`✅ Successfully extracted data for: ${extractedData.name || 'Unknown'}`);
      return extractedData;
    } else {
      throw new Error('No data returned from completed extraction job');
    }
  } catch (error) {
    console.error(`❌ Error extracting data from ${url}:`, error.message);
    return null;
  }
}

/**
 * Take screenshot using Puppeteer
 */
async function takeScreenshot(url, filename) {
  console.log(`📸 ${CONFIG.dryRun ? '[DRY RUN] ' : ''}Taking screenshot of: ${url}`);
  
  if (CONFIG.dryRun) {
    console.log(`📸 [DRY RUN] Would take screenshot and save as ${filename}.PNG`);
    return `/fake/screenshot/path/${filename}.PNG`;
  }
  
  let browser;
  try {
    // Ensure images directory exists
    await fs.mkdir(CONFIG.screenshotDir, { recursive: true });
    
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });
    
    // Navigate with timeout and wait for network idle
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Wait a bit more for dynamic content
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const screenshotPath = path.join(CONFIG.screenshotDir, `${filename}.PNG`);
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: false,
      type: 'png'
    });
    
    console.log(`✅ Screenshot saved: ${screenshotPath}`);
    return screenshotPath;
  } catch (error) {
    console.error(`❌ Error taking screenshot of ${url}:`, error.message);
    return null;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Upload file to Convex storage and return the public URL
 */
async function uploadToConvexStorage(filePath) {
  if (CONFIG.dryRun) {
    console.log(`☁️ [DRY RUN] Would upload file to Convex storage: ${path.basename(filePath)}`);
    return 'https://fake-convex-site.com/image?id=fake-storage-id-12345';
  }
  
  try {
    const fileBuffer = await fs.readFile(filePath);
    const fileName = path.basename(filePath);
    
    // Get upload URL from Convex
    const uploadUrl = await convex.mutation('storage:generateUploadUrl', {});
    
    // Upload file directly as binary data with proper content type
    // This avoids the multipart/form-data wrapper that was causing MIME type issues
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      body: fileBuffer,
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': fileBuffer.length.toString()
      }
    });
    
    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload file: ${uploadResponse.statusText}`);
    }
    
    const result = await uploadResponse.json();
    const storageId = result.storageId;
    
    console.log(`✅ File uploaded to Convex storage: ${storageId}`);
    
    // Create public URL using the HTTP route that serves images
    const publicImageUrl = `/image?id=${storageId}`;
    console.log(`🔗 Public image URL: ${publicImageUrl}`);
    
    return publicImageUrl;
  } catch (error) {
    console.error(`❌ Error uploading file to Convex:`, error.message);
    return null;
  }
}

/**
 * Check if a tool name already exists in the database
 */
async function checkToolNameExists(toolName) {
  if (CONFIG.dryRun) {
    console.log(`🔍 [DRY RUN] Would check for duplicate name: ${toolName}`);
    return false;
  }
  
  try {
    const existingTool = await convex.query('tools:getByName', { name: toolName });
    return existingTool !== null;
  } catch (error) {
    console.log(`⚠️ Could not check for duplicate name: ${error.message}`);
    return false;
  }
}

/**
 * Save tool data to Convex database
 */
async function saveToolToConvex(toolData) {
  if (CONFIG.dryRun) {
    console.log(`💾 [DRY RUN] Would save tool to database:`, {
      name: toolData.name,
      url: toolData.url,
      tagline: toolData.tagline,
      descriptor: toolData.descriptor,
      category: toolData.category,
      tags: toolData.tags,
      screenshot: toolData.screenshot
    });
    return { _id: 'fake-id-12345', ...toolData };
  }
  
  try {
    // Check for duplicate tool name
    const nameExists = await checkToolNameExists(toolData.name);
    if (nameExists) {
      console.log(`🚨 \x1b[33mWARNING: Tool name "${toolData.name}" already exists in database!\x1b[0m`);
      // Continue with save but alert the user
    }
    
    // First check if tool already exists by URL
    const existingTool = await convex.query('tools:getByUrl', { url: toolData.url });
    
    if (existingTool) {
      // Update existing tool
      const result = await convex.mutation('tools:updateTool', {
        id: existingTool._id,
        ...toolData
      });
      console.log(`✅ Tool updated in database: ${toolData.name}`);
      return result;
    } else {
      // Create new tool
      const result = await convex.mutation('tools:createTool', toolData);
      console.log(`✅ Tool created in database: ${toolData.name}`);
      return result;
    }
  } catch (error) {
    console.error(`❌ Error saving tool to Convex:`, error.message);
    return null;
  }
}

/**
 * Process a single URL
 */
async function processUrl(url) {
  const urlDisplay = url.length > 50 ? url.substring(0, 47) + '...' : url;
  console.log(`\n│ 🚀 \x1b[1mProcessing:\x1b[0m \x1b[34m${urlDisplay}\x1b[0m`);
  
  try {
    // Step 1: Extract data with Firecrawl
    const extractedData = await extractDataWithFirecrawl(url);
    if (!extractedData) {
      console.log(`⚠️ Skipping ${url} - failed to extract data`);
      return null;
    }
    
    // Step 2: Take screenshot
    const screenshotFilename = extractedData.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
    
    const screenshotPath = await takeScreenshot(url, screenshotFilename);
    
    // Step 3: Upload screenshot to Convex and get public URL
    let screenshotUrl = null;
    if (screenshotPath) {
      screenshotUrl = await uploadToConvexStorage(screenshotPath);
      // Keep local screenshot files for debugging/backup
      // if (!CONFIG.dryRun) {
      //   await fs.unlink(screenshotPath).catch(() => {});
      // }
    }
    
    // Step 4: Prepare tool data
    const toolData = {
      url,
      name: extractedData.name,
      tagline: extractedData.tagline,
      summary: extractedData.summary,
      descriptor: extractedData.descriptor,
      category: extractedData.category,
      screenshot: screenshotUrl,
      tags: extractedData.tags
    };
    
    // Step 5: Save to Convex database
    const savedTool = await saveToolToConvex(toolData);
    
    if (savedTool) {
      console.log(`│ 🎉 \x1b[32m\x1b[1mSuccess:\x1b[0m ${extractedData.name}`);
      return toolData;
    } else {
      console.log(`│ ⚠️ \x1b[33mFailed to save:\x1b[0m ${extractedData.name}`);
      return null;
    }
  } catch (error) {
    console.error(`│ ❌ \x1b[31mError:\x1b[0m ${error.message}`);
    return null;
  }
}

/**
 * Read URLs from CSV file
 */
async function readUrlsFromCsv() {
  return new Promise((resolve, reject) => {
    const urls = [];
    
    createReadStream(CONFIG.csvPath)
      .pipe(csv())
      .on('data', (row) => {
        if (row.URL && row.URL.trim()) {
          urls.push(row.URL.trim());
        }
      })
      .on('end', () => {
        console.log(`📋 Found ${urls.length} URLs in CSV file`);
        resolve(urls);
      })
      .on('error', reject);
  });
}

/**
 * Process URLs in batches with delay
 */
async function processBatch(urls, startIndex, batchSize) {
  const batch = urls.slice(startIndex, startIndex + batchSize);
  const results = [];
  
  for (const url of batch) {
    const result = await processUrl(url);
    results.push(result);
    
    // Add delay between requests to be respectful
    if (batch.indexOf(url) < batch.length - 1) {
      console.log(`⏳ Waiting ${CONFIG.delayBetweenRequests}ms before next request...`);
      await new Promise(resolve => setTimeout(resolve, CONFIG.delayBetweenRequests));
    }
  }
  
  return results;
}

/**
 * Main execution function
 */
async function main() {
  // Beautiful header
  console.log('\n' + '═'.repeat(65));
  console.log('🚀 \x1b[1m\x1b[36mTrendiTools Processing Pipeline\x1b[0m');
  console.log('═'.repeat(65));
  
  if (CONFIG.dryRun) {
    console.log('\n🔍 \x1b[33m\x1b[1mDRY RUN MODE ACTIVATED\x1b[0m');
    console.log('   \x1b[2mNo actual API calls or database changes will be made\x1b[0m');
    console.log('   \x1b[2mUse --dry-run or -d flag to enable dry run mode\x1b[0m\n');
  } else {
    console.log('\n🎯 \x1b[32m\x1b[1mLIVE MODE ACTIVATED\x1b[0m');
    console.log('   \x1b[2mProcessing tools and saving to database\x1b[0m\n');
  }
  
  // Configuration status with colors
  console.log('📋 \x1b[1mConfiguration Status:\x1b[0m');
  console.log(`   📁 CSV file: \x1b[2m${path.basename(CONFIG.csvPath)}\x1b[0m`);
  console.log(`   📸 Images: \x1b[2m${path.basename(CONFIG.screenshotDir)}\x1b[0m`);
  console.log(`   🔥 Firecrawl API: ${CONFIG.firecrawlApiKey ? '\x1b[32m✅ Configured\x1b[0m' : '\x1b[31m❌ Missing\x1b[0m'}`);
  console.log(`   💾 Convex: ${CONFIG.convexUrl ? '\x1b[32m✅ Configured\x1b[0m' : '\x1b[31m❌ Missing\x1b[0m'}`);
  console.log('─'.repeat(65));
  
  try {
    // Read URLs from CSV
    const urls = await readUrlsFromCsv();
    
    if (urls.length === 0) {
      console.log('⚠️ No URLs found in CSV file');
      return;
    }
    
    // Process URLs in batches
    const allResults = [];
    const totalBatches = Math.ceil(urls.length / CONFIG.batchSize);
    
    for (let i = 0; i < urls.length; i += CONFIG.batchSize) {
      const batchNumber = Math.floor(i / CONFIG.batchSize) + 1;
      const batchUrls = urls.slice(i, i + CONFIG.batchSize);
      
      console.log(`\n📦 \x1b[1m\x1b[35mBatch ${batchNumber}/${totalBatches}\x1b[0m \x1b[2m(${batchUrls.length} URLs)\x1b[0m`);
      console.log('┌' + '─'.repeat(63) + '┐');
      
      const batchResults = await processBatch(urls, i, CONFIG.batchSize);
      allResults.push(...batchResults);
      
      const batchSuccessful = batchResults.filter(r => r !== null).length;
      console.log('└' + '─'.repeat(63) + '┘');
      console.log(`   \x1b[32m✓ ${batchSuccessful}/${batchUrls.length} successful\x1b[0m in batch ${batchNumber}`);
      
      // Add delay between batches
      if (i + CONFIG.batchSize < urls.length) {
        console.log(`\n⏳ \x1b[2mWaiting ${CONFIG.delayBetweenRequests * 2}ms before next batch...\x1b[0m`);
        await new Promise(resolve => setTimeout(resolve, CONFIG.delayBetweenRequests * 2));
      }
    }
    
    // Beautiful summary with enhanced styling
    const successful = allResults.filter(r => r !== null).length;
    const failed = allResults.length - successful;
    const successRate = ((successful / urls.length) * 100).toFixed(1);
    
    console.log('\n' + '═'.repeat(65));
    console.log('📊 \x1b[1m\x1b[36mProcessing Summary\x1b[0m');
    console.log('═'.repeat(65));
    
    console.log(`\n   ✅ \x1b[32m\x1b[1mSuccessfully processed:\x1b[0m ${successful}`);
    console.log(`   ❌ \x1b[31m\x1b[1mFailed:\x1b[0m ${failed}`);
    console.log(`   📈 \x1b[1mSuccess rate:\x1b[0m \x1b[${successRate >= 80 ? '32' : successRate >= 50 ? '33' : '31'}m${successRate}%\x1b[0m`);
    console.log(`   🎯 \x1b[1mTotal URLs processed:\x1b[0m ${urls.length}`);
    
    // Save results to JSON file for reference
    const resultsFile = path.join(__dirname, '../data/processing-results.json');
    await fs.writeFile(resultsFile, JSON.stringify({
      timestamp: new Date().toISOString(),
      totalUrls: urls.length,
      successful,
      failed,
      successRate: parseFloat(successRate),
      results: allResults
    }, null, 2));
    
    console.log('\n─'.repeat(65));
    console.log(`💾 Results saved to: \x1b[2m${path.basename(resultsFile)}\x1b[0m`);
    console.log('🎉 \x1b[32m\x1b[1mProcessing complete!\x1b[0m');
    console.log('═'.repeat(65) + '\n');
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);

export {
  extractDataWithFirecrawl,
  takeScreenshot,
  uploadToConvexStorage,
  saveToolToConvex,
  processUrl
};