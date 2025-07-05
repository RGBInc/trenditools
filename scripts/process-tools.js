#!/usr/bin/env node

/**
 * TrendiTools Enhanced Processing Pipeline with Progress Tracking
 * 
 * ╔══════════════════════════════════════════════════════════════╗
 * ║                🚀 ENHANCED AUTOMATED TOOL PROCESSOR          ║
 * ║                                                              ║
 * ║  Extracts, screenshots, and enriches tool data from URLs    ║
 * ║  with robust progress tracking and resume functionality      ║
 * ╚══════════════════════════════════════════════════════════════╝
 * 
 * NEW FEATURES:
 * • 📊 Granular progress tracking for each processing step
 * • 🔄 Resume functionality from any interruption point
 * • 💾 Persistent state management with detailed status
 * • 🎯 Field-specific retry capabilities
 * • 📈 Enhanced error reporting and recovery
 * • 🔍 Detailed processing analytics
 * 
 * PROGRESS TRACKING STATES:
 * ┌─────────────────────────────────────────────────────────────┐
 * │ PROCESSING STAGES (tracked individually):                  │
 * │                                                             │
 * │ • pending: Not yet processed                                │
 * │ • extracting: AI data extraction in progress               │
 * │ • extracted: Data extraction completed                      │
 * │ • screenshotting: Screenshot capture in progress           │
 * │ • screenshot_taken: Screenshot captured successfully        │
 * │ • uploading: File upload to storage in progress            │
 * │ • uploaded: File uploaded successfully                      │
 * │ • saving: Database save in progress                         │
 * │ • completed: Fully processed and saved                      │
 * │ • failed: Processing failed (with detailed error info)     │
 * │                                                             │
 * │ RESUME CAPABILITY: Can restart from any failed stage       │
 * └─────────────────────────────────────────────────────────────┘
 * 
 * Usage:
 *   npm run process-tools:enhanced        # Live mode with tracking
 *   npm run process-tools:enhanced:dry    # Dry run mode
 *   npm run process-tools:enhanced --resume  # Resume from last state
 *   npm run process-tools:enhanced --retry-failed  # Retry only failed items
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
import fetch from 'node-fetch';
import { ConvexHttpClient } from 'convex/browser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local from project root
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run') || args.includes('-d');
const isResume = args.includes('--resume') || args.includes('-r');
const retryFailed = args.includes('--retry-failed') || args.includes('--retry');
const batchSizeArg = args.find(arg => arg.startsWith('--batch-size='));
const customBatchSize = batchSizeArg ? parseInt(batchSizeArg.split('=')[1]) : null;

// Configuration
const CONFIG = {
  csvPath: path.join(__dirname, '../data/Trendi Tools - Final.csv'),
  progressPath: path.join(__dirname, '../data/processing-progress.json'),
  resultsPath: path.join(__dirname, '../data/processing-results.json'),
  firecrawlApiKey: process.env.FIRECRAWL_API_KEY,
  convexUrl: process.env.VITE_CONVEX_URL,
  screenshotDir: path.join(__dirname, '../data/screenshots'),
  batchSize: customBatchSize || 3, // Smaller batches for better tracking
  delayBetweenRequests: 2000, // 2 seconds between requests
  delayBetweenBatches: 5000, // 5 seconds between batches
  dryRun: isDryRun,
  resume: isResume,
  retryFailed: retryFailed,
  maxRetries: 3, // Maximum retries per URL
  saveProgressInterval: 5 // Save progress every 5 processed items
};

// Initialize Convex client (only if not in dry run mode)
let convex = null;
if (!CONFIG.dryRun) {
  convex = new ConvexHttpClient(CONFIG.convexUrl);
}

// Progress tracking state
let progressState = {
  startTime: null,
  lastSaveTime: null,
  totalUrls: 0,
  processedCount: 0,
  completedCount: 0,
  failedCount: 0,
  currentBatch: 0,
  urls: {}
  // urls structure: { "url": { status, data, error, attempts, lastAttempt, stages: {} } }
};

// Processing stages for granular tracking
const STAGES = {
  PENDING: 'pending',
  EXTRACTING: 'extracting',
  EXTRACTED: 'extracted',
  SCREENSHOTTING: 'screenshotting',
  SCREENSHOT_TAKEN: 'screenshot_taken',
  UPLOADING: 'uploading',
  UPLOADED: 'uploaded',
  SAVING: 'saving',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

/**
 * Load existing progress state from file
 */
async function loadProgressState() {
  try {
    const data = await fs.readFile(CONFIG.progressPath, 'utf8');
    const loaded = JSON.parse(data);
    
    // Merge with default structure
    progressState = {
      ...progressState,
      ...loaded,
      lastSaveTime: new Date().toISOString()
    };
    
    console.log(`📊 Loaded progress state: ${Object.keys(progressState.urls).length} URLs tracked`);
    return true;
  } catch (error) {
    console.log(`📊 No existing progress state found, starting fresh`);
    return false;
  }
}

/**
 * Save current progress state to file
 */
async function saveProgressState() {
  try {
    progressState.lastSaveTime = new Date().toISOString();
    await fs.writeFile(CONFIG.progressPath, JSON.stringify(progressState, null, 2));
    console.log(`💾 Progress saved (${progressState.processedCount}/${progressState.totalUrls})`);
  } catch (error) {
    console.error(`❌ Failed to save progress:`, error.message);
  }
}

/**
 * Update URL status and stage information
 */
function updateUrlStatus(url, status, stage = null, data = null, error = null) {
  if (!progressState.urls[url]) {
    progressState.urls[url] = {
      status: STAGES.PENDING,
      data: null,
      error: null,
      attempts: 0,
      lastAttempt: null,
      stages: {}
    };
  }
  
  const urlState = progressState.urls[url];
  urlState.status = status;
  urlState.lastAttempt = new Date().toISOString();
  
  if (stage) {
    urlState.stages[stage] = {
      timestamp: new Date().toISOString(),
      success: status !== STAGES.FAILED
    };
  }
  
  if (data) {
    urlState.data = { ...urlState.data, ...data };
  }
  
  if (error) {
    urlState.error = error;
    urlState.stages[stage || 'unknown'] = {
      timestamp: new Date().toISOString(),
      success: false,
      error: error
    };
  }
  
  // Update counters
  if (status === STAGES.COMPLETED) {
    progressState.completedCount++;
  } else if (status === STAGES.FAILED) {
    progressState.failedCount++;
  }
}

/**
 * Get URLs that need processing based on current state and mode
 */
function getUrlsToProcess(allUrls) {
  if (!CONFIG.resume && !CONFIG.retryFailed) {
    // Fresh start - process all URLs
    return allUrls;
  }
  
  if (CONFIG.retryFailed) {
    // Only retry failed URLs
    return allUrls.filter(url => {
      const urlState = progressState.urls[url];
      return !urlState || urlState.status === STAGES.FAILED;
    });
  }
  
  if (CONFIG.resume) {
    // Resume - skip completed URLs
    return allUrls.filter(url => {
      const urlState = progressState.urls[url];
      return !urlState || urlState.status !== STAGES.COMPLETED;
    });
  }
  
  return allUrls;
}

/**
 * Check if URL can be resumed from a specific stage
 */
function canResumeFromStage(url, stage) {
  const urlState = progressState.urls[url];
  if (!urlState || !urlState.stages) return false;
  
  const stageData = urlState.stages[stage];
  return stageData && stageData.success;
}

/**
 * Validation (relaxed for dry run mode)
 */
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
 * Extract data using Firecrawl API with resume capability
 */
async function extractDataWithFirecrawl(url) {
  console.log(`🔍 ${CONFIG.dryRun ? '[DRY RUN] ' : ''}Extracting data from: ${url}`);
  
  // Check if we can resume from extracted data
  if (canResumeFromStage(url, 'extracted')) {
    console.log(`🔄 Resuming with existing extracted data for: ${url}`);
    return progressState.urls[url].data.extractedData;
  }
  
  updateUrlStatus(url, STAGES.EXTRACTING, 'extracting');
  
  if (CONFIG.dryRun) {
    console.log(`🔍 [DRY RUN] Would extract data from Firecrawl API`);
    const mockData = {
      name: "Sample Tool Name",
      tagline: "Sample tagline for testing",
      summary: "This is a sample summary that would be extracted from the website. In a real run, this would contain detailed information about the tool, its features, benefits, and use cases.",
      descriptor: "A sample tool for demonstration purposes",
      category: "Sample",
      tags: ["Sample", "Testing", "Demo"]
    };
    updateUrlStatus(url, STAGES.EXTRACTED, 'extracted', { extractedData: mockData });
    return mockData;
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
      updateUrlStatus(url, STAGES.EXTRACTED, 'extracted', { extractedData });
      return extractedData;
    } else {
      throw new Error('No data returned from completed extraction job');
    }
  } catch (error) {
    console.error(`❌ Error extracting data from ${url}:`, error.message);
    updateUrlStatus(url, STAGES.FAILED, 'extracting', null, error.message);
    return null;
  }
}

/**
 * Take screenshot using Puppeteer with resume capability
 */
async function takeScreenshot(url, filename) {
  console.log(`📸 ${CONFIG.dryRun ? '[DRY RUN] ' : ''}Taking screenshot of: ${url}`);
  
  // Check if we can resume with existing screenshot
  if (canResumeFromStage(url, 'screenshot_taken')) {
    console.log(`🔄 Resuming with existing screenshot for: ${url}`);
    return progressState.urls[url].data.screenshotPath;
  }
  
  updateUrlStatus(url, STAGES.SCREENSHOTTING, 'screenshotting');
  
  if (CONFIG.dryRun) {
    console.log(`📸 [DRY RUN] Would take screenshot and save as ${filename}.PNG`);
    const mockPath = `/fake/screenshot/path/${filename}.PNG`;
    updateUrlStatus(url, STAGES.SCREENSHOT_TAKEN, 'screenshot_taken', { screenshotPath: mockPath });
    return mockPath;
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
    updateUrlStatus(url, STAGES.SCREENSHOT_TAKEN, 'screenshot_taken', { screenshotPath });
    return screenshotPath;
  } catch (error) {
    console.error(`❌ Error taking screenshot of ${url}:`, error.message);
    updateUrlStatus(url, STAGES.FAILED, 'screenshotting', null, error.message);
    return null;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Upload file to Convex storage with resume capability
 */
async function uploadToConvexStorage(filePath, url) {
  if (CONFIG.dryRun) {
    console.log(`☁️ [DRY RUN] Would upload file to Convex storage: ${path.basename(filePath)}`);
    const mockUrl = 'https://fake-convex-site.com/image?id=fake-storage-id-12345';
    updateUrlStatus(url, STAGES.UPLOADED, 'uploaded', { screenshotUrl: mockUrl });
    return mockUrl;
  }
  
  // Check if we can resume with existing upload
  if (canResumeFromStage(url, 'uploaded')) {
    console.log(`🔄 Resuming with existing uploaded screenshot for: ${url}`);
    return progressState.urls[url].data.screenshotUrl;
  }
  
  updateUrlStatus(url, STAGES.UPLOADING, 'uploading');
  
  try {
    const fileBuffer = await fs.readFile(filePath);
    const fileName = path.basename(filePath);
    
    // Get upload URL from Convex
    const uploadUrl = await convex.mutation('storage:generateUploadUrl', {});
    
    // Upload file directly as binary data with proper content type
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
    
    updateUrlStatus(url, STAGES.UPLOADED, 'uploaded', { screenshotUrl: publicImageUrl });
    return publicImageUrl;
  } catch (error) {
    console.error(`❌ Error uploading file to Convex:`, error.message);
    updateUrlStatus(url, STAGES.FAILED, 'uploading', null, error.message);
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
 * Save tool data to Convex database with resume capability
 */
async function saveToolToConvex(toolData, url) {
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
    updateUrlStatus(url, STAGES.COMPLETED, 'saving', { savedTool: { _id: 'fake-id-12345', ...toolData } });
    return { _id: 'fake-id-12345', ...toolData };
  }
  
  // Check if already completed
  if (canResumeFromStage(url, 'completed')) {
    console.log(`🔄 Tool already saved for: ${url}`);
    return progressState.urls[url].data.savedTool;
  }
  
  updateUrlStatus(url, STAGES.SAVING, 'saving');
  
  try {
    // Check for duplicate tool name
    const nameExists = await checkToolNameExists(toolData.name);
    if (nameExists) {
      console.log(`🚨 \x1b[33mWARNING: Tool name "${toolData.name}" already exists in database!\x1b[0m`);
      // Continue with save but alert the user
    }
    
    // First check if tool already exists by URL
    const existingTool = await convex.query('tools:getByUrl', { url: toolData.url });
    
    let result;
    if (existingTool) {
      // Update existing tool
      result = await convex.mutation('tools:updateTool', {
        id: existingTool._id,
        ...toolData
      });
      console.log(`✅ Tool updated in database: ${toolData.name}`);
    } else {
      // Create new tool
      result = await convex.mutation('tools:createTool', toolData);
      console.log(`✅ Tool created in database: ${toolData.name}`);
    }
    
    updateUrlStatus(url, STAGES.COMPLETED, 'saving', { savedTool: result });
    return result;
  } catch (error) {
    console.error(`❌ Error saving tool to Convex:`, error.message);
    updateUrlStatus(url, STAGES.FAILED, 'saving', null, error.message);
    return null;
  }
}

/**
 * Process a single URL with enhanced tracking and resume capability
 */
async function processUrl(url) {
  const urlDisplay = url.length > 50 ? url.substring(0, 47) + '...' : url;
  console.log(`\n│ 🚀 \x1b[1mProcessing:\x1b[0m \x1b[34m${urlDisplay}\x1b[0m`);
  
  // Initialize URL state if not exists
  if (!progressState.urls[url]) {
    updateUrlStatus(url, STAGES.PENDING);
  }
  
  // Increment attempts
  progressState.urls[url].attempts++;
  
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
      screenshotUrl = await uploadToConvexStorage(screenshotPath, url);
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
    const savedTool = await saveToolToConvex(toolData, url);
    
    if (savedTool) {
      console.log(`│ 🎉 \x1b[32m\x1b[1mSuccess:\x1b[0m ${extractedData.name}`);
      progressState.processedCount++;
      return toolData;
    } else {
      console.log(`│ ⚠️ \x1b[33mFailed to save:\x1b[0m ${extractedData.name}`);
      return null;
    }
  } catch (error) {
    console.error(`│ ❌ \x1b[31mError:\x1b[0m ${error.message}`);
    updateUrlStatus(url, STAGES.FAILED, null, null, error.message);
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
 * Process URLs in batches with enhanced tracking
 */
async function processBatch(urls, startIndex, batchSize) {
  const batch = urls.slice(startIndex, startIndex + batchSize);
  const results = [];
  
  for (const url of batch) {
    const result = await processUrl(url);
    results.push(result);
    
    // Save progress periodically
    if (progressState.processedCount % CONFIG.saveProgressInterval === 0) {
      await saveProgressState();
    }
    
    // Add delay between requests to be respectful
    if (batch.indexOf(url) < batch.length - 1) {
      console.log(`⏳ Waiting ${CONFIG.delayBetweenRequests}ms before next request...`);
      await new Promise(resolve => setTimeout(resolve, CONFIG.delayBetweenRequests));
    }
  }
  
  return results;
}

/**
 * Generate detailed analytics report
 */
function generateAnalytics() {
  const analytics = {
    overview: {
      totalUrls: progressState.totalUrls,
      processed: progressState.processedCount,
      completed: progressState.completedCount,
      failed: progressState.failedCount,
      pending: progressState.totalUrls - progressState.processedCount,
      successRate: progressState.totalUrls > 0 ? ((progressState.completedCount / progressState.totalUrls) * 100).toFixed(1) : 0
    },
    stages: {
      pending: 0,
      extracting: 0,
      extracted: 0,
      screenshotting: 0,
      screenshot_taken: 0,
      uploading: 0,
      uploaded: 0,
      saving: 0,
      completed: 0,
      failed: 0
    },
    errors: {},
    retryStats: {
      singleAttempt: 0,
      multipleAttempts: 0,
      maxRetries: 0
    }
  };
  
  // Analyze URL states
  Object.values(progressState.urls).forEach(urlState => {
    analytics.stages[urlState.status]++;
    
    // Track retry statistics
    if (urlState.attempts === 1) {
      analytics.retryStats.singleAttempt++;
    } else if (urlState.attempts > 1) {
      analytics.retryStats.multipleAttempts++;
    }
    if (urlState.attempts >= CONFIG.maxRetries) {
      analytics.retryStats.maxRetries++;
    }
    
    // Collect error patterns
    if (urlState.error) {
      const errorKey = urlState.error.substring(0, 50); // First 50 chars
      analytics.errors[errorKey] = (analytics.errors[errorKey] || 0) + 1;
    }
  });
  
  return analytics;
}

/**
 * Display beautiful progress dashboard
 */
function displayProgressDashboard(analytics) {
  console.log('\n' + '═'.repeat(75));
  console.log('📊 \x1b[1m\x1b[36mProcessing Dashboard\x1b[0m');
  console.log('═'.repeat(75));
  
  // Overview section
  console.log('\n🎯 \x1b[1mOverview:\x1b[0m');
  console.log(`   Total URLs: \x1b[1m${analytics.overview.totalUrls}\x1b[0m`);
  console.log(`   Completed: \x1b[32m\x1b[1m${analytics.overview.completed}\x1b[0m`);
  console.log(`   Failed: \x1b[31m\x1b[1m${analytics.overview.failed}\x1b[0m`);
  console.log(`   Pending: \x1b[33m\x1b[1m${analytics.overview.pending}\x1b[0m`);
  console.log(`   Success Rate: \x1b[${analytics.overview.successRate >= 80 ? '32' : analytics.overview.successRate >= 50 ? '33' : '31'}m\x1b[1m${analytics.overview.successRate}%\x1b[0m`);
  
  // Stage breakdown
  console.log('\n🔄 \x1b[1mStage Breakdown:\x1b[0m');
  Object.entries(analytics.stages).forEach(([stage, count]) => {
    if (count > 0) {
      const stageDisplay = stage.replace(/_/g, ' ').toUpperCase();
      console.log(`   ${stageDisplay}: \x1b[1m${count}\x1b[0m`);
    }
  });
  
  // Retry statistics
  console.log('\n🔁 \x1b[1mRetry Statistics:\x1b[0m');
  console.log(`   Single Attempt Success: \x1b[32m\x1b[1m${analytics.retryStats.singleAttempt}\x1b[0m`);
  console.log(`   Required Multiple Attempts: \x1b[33m\x1b[1m${analytics.retryStats.multipleAttempts}\x1b[0m`);
  console.log(`   Reached Max Retries: \x1b[31m\x1b[1m${analytics.retryStats.maxRetries}\x1b[0m`);
  
  // Top errors
  if (Object.keys(analytics.errors).length > 0) {
    console.log('\n❌ \x1b[1mTop Error Patterns:\x1b[0m');
    const sortedErrors = Object.entries(analytics.errors)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    sortedErrors.forEach(([error, count]) => {
      console.log(`   \x1b[31m${count}x\x1b[0m ${error}...`);
    });
  }
  
  console.log('\n' + '═'.repeat(75));
}

/**
 * Main execution function with enhanced tracking
 */
async function main() {
  // Beautiful header
  console.log('\n' + '═'.repeat(75));
  console.log('🚀 \x1b[1m\x1b[36mTrendiTools Enhanced Processing Pipeline\x1b[0m');
  console.log('═'.repeat(75));
  
  // Mode indicators
  if (CONFIG.dryRun) {
    console.log('\n🔍 \x1b[33m\x1b[1mDRY RUN MODE ACTIVATED\x1b[0m');
    console.log('   \x1b[2mNo actual API calls or database changes will be made\x1b[0m');
  } else {
    console.log('\n🎯 \x1b[32m\x1b[1mLIVE MODE ACTIVATED\x1b[0m');
    console.log('   \x1b[2mProcessing tools and saving to database\x1b[0m');
  }
  
  if (CONFIG.resume) {
    console.log('\n🔄 \x1b[34m\x1b[1mRESUME MODE ACTIVATED\x1b[0m');
    console.log('   \x1b[2mWill skip completed URLs and resume from interruption\x1b[0m');
  }
  
  if (CONFIG.retryFailed) {
    console.log('\n🔁 \x1b[35m\x1b[1mRETRY FAILED MODE ACTIVATED\x1b[0m');
    console.log('   \x1b[2mWill only retry previously failed URLs\x1b[0m');
  }
  
  // Configuration status
  console.log('\n📋 \x1b[1mConfiguration Status:\x1b[0m');
  console.log(`   📁 CSV file: \x1b[2m${path.basename(CONFIG.csvPath)}\x1b[0m`);
  console.log(`   📸 Images: \x1b[2m${path.basename(CONFIG.screenshotDir)}\x1b[0m`);
  console.log(`   🔥 Firecrawl API: ${CONFIG.firecrawlApiKey ? '\x1b[32m✅ Configured\x1b[0m' : '\x1b[31m❌ Missing\x1b[0m'}`);
  console.log(`   💾 Convex: ${CONFIG.convexUrl ? '\x1b[32m✅ Configured\x1b[0m' : '\x1b[31m❌ Missing\x1b[0m'}`);
  console.log(`   📊 Batch Size: \x1b[1m${CONFIG.batchSize}\x1b[0m`);
  console.log(`   🔄 Max Retries: \x1b[1m${CONFIG.maxRetries}\x1b[0m`);
  console.log('─'.repeat(75));
  
  try {
    // Initialize progress tracking
    progressState.startTime = new Date().toISOString();
    
    // Load existing progress if resuming
    if (CONFIG.resume || CONFIG.retryFailed) {
      await loadProgressState();
    }
    
    // Read URLs from CSV
    const allUrls = await readUrlsFromCsv();
    progressState.totalUrls = allUrls.length;
    
    if (allUrls.length === 0) {
      console.log('⚠️ No URLs found in CSV file');
      return;
    }
    
    // Determine which URLs to process
    const urlsToProcess = getUrlsToProcess(allUrls);
    
    if (urlsToProcess.length === 0) {
      console.log('✅ All URLs have been processed successfully!');
      const analytics = generateAnalytics();
      displayProgressDashboard(analytics);
      return;
    }
    
    console.log(`\n🎯 Processing ${urlsToProcess.length} URLs (${allUrls.length - urlsToProcess.length} already completed)`);
    
    // Process URLs in batches
    const allResults = [];
    const totalBatches = Math.ceil(urlsToProcess.length / CONFIG.batchSize);
    
    for (let i = 0; i < urlsToProcess.length; i += CONFIG.batchSize) {
      const batchNumber = Math.floor(i / CONFIG.batchSize) + 1;
      const batchUrls = urlsToProcess.slice(i, i + CONFIG.batchSize);
      progressState.currentBatch = batchNumber;
      
      console.log(`\n📦 \x1b[1m\x1b[35mBatch ${batchNumber}/${totalBatches}\x1b[0m \x1b[2m(${batchUrls.length} URLs)\x1b[0m`);
      console.log('┌' + '─'.repeat(73) + '┐');
      
      const batchResults = await processBatch(urlsToProcess, i, CONFIG.batchSize);
      allResults.push(...batchResults);
      
      const batchSuccessful = batchResults.filter(r => r !== null).length;
      console.log('└' + '─'.repeat(73) + '┘');
      console.log(`   \x1b[32m✓ ${batchSuccessful}/${batchUrls.length} successful\x1b[0m in batch ${batchNumber}`);
      
      // Save progress after each batch
      await saveProgressState();
      
      // Add delay between batches
      if (i + CONFIG.batchSize < urlsToProcess.length) {
        console.log(`\n⏳ \x1b[2mWaiting ${CONFIG.delayBetweenBatches}ms before next batch...\x1b[0m`);
        await new Promise(resolve => setTimeout(resolve, CONFIG.delayBetweenBatches));
      }
    }
    
    // Final save
    await saveProgressState();
    
    // Generate and display analytics
    const analytics = generateAnalytics();
    displayProgressDashboard(analytics);
    
    // Save final results
    const finalResults = {
      timestamp: new Date().toISOString(),
      startTime: progressState.startTime,
      endTime: new Date().toISOString(),
      configuration: {
        batchSize: CONFIG.batchSize,
        maxRetries: CONFIG.maxRetries,
        dryRun: CONFIG.dryRun,
        resume: CONFIG.resume,
        retryFailed: CONFIG.retryFailed
      },
      analytics,
      detailedResults: progressState.urls
    };
    
    await fs.writeFile(CONFIG.resultsPath, JSON.stringify(finalResults, null, 2));
    
    console.log('\n─'.repeat(75));
    console.log(`💾 Detailed results saved to: \x1b[2m${path.basename(CONFIG.resultsPath)}\x1b[0m`);
    console.log(`📊 Progress state saved to: \x1b[2m${path.basename(CONFIG.progressPath)}\x1b[0m`);
    console.log('🎉 \x1b[32m\x1b[1mProcessing complete!\x1b[0m');
    
    // Provide next steps if there are failures
    if (analytics.overview.failed > 0) {
      console.log('\n💡 \x1b[1mNext Steps:\x1b[0m');
      console.log('   To retry failed URLs: \x1b[33mnpm run process-tools:enhanced --retry-failed\x1b[0m');
      console.log('   To resume processing: \x1b[33mnpm run process-tools:enhanced --resume\x1b[0m');
    }
    
    console.log('═'.repeat(75) + '\n');
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    await saveProgressState(); // Save progress even on error
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
  processUrl,
  loadProgressState,
  saveProgressState,
  generateAnalytics
};