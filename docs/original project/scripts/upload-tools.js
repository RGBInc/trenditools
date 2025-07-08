#!/usr/bin/env node

/**
 * TrendiTools CSV Upload Script
 * 
 * This script uploads tools from a CSV file to the Convex database.
 * CSV columns must be in this exact order: URL, name, tagline, summary, descriptor, tags
 * 
 * Usage:
 *   node scripts/upload-tools.js path/to/your/tools.csv
 * 
 * Requirements:
 *   - CSV file with headers: URL, name, tagline, summary, descriptor, tags
 *   - Tags should be comma-separated within the cell (e.g., "design,productivity,ai")
 *   - Convex deployment must be running
 */

const fs = require('fs');
const path = require('path');
const { ConvexHttpClient } = require('convex/browser');

// Configuration
const CONVEX_URL = process.env.CONVEX_URL || process.env.VITE_CONVEX_URL;
const BATCH_SIZE = 10; // Process tools in batches to avoid overwhelming the database

if (!CONVEX_URL) {
  console.error('❌ Error: CONVEX_URL environment variable is required');
  console.error('   Set it in your .env.local file or as an environment variable');
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

/**
 * Parse CSV content into an array of objects
 */
function parseCSV(content) {
  const lines = content.trim().split('\n');
  const headers = ['URL', 'name', 'tagline', 'summary', 'descriptor', 'tags'];
  
  // Skip header row if it exists
  const dataLines = lines[0].toLowerCase().includes('url') ? lines.slice(1) : lines;
  
  return dataLines.map((line, index) => {
    // Simple CSV parsing - handles basic cases
    const values = line.split(',').map(val => val.trim().replace(/^"|"$/g, ''));
    
    if (values.length < 6) {
      console.warn(`⚠️  Warning: Row ${index + 1} has insufficient columns, skipping`);
      return null;
    }
    
    const tool = {
      url: values[0],
      name: values[1],
      tagline: values[2],
      summary: values[3],
      descriptor: values[4],
      tags: values[5] ? values[5].split(',').map(tag => tag.trim()).filter(Boolean) : [],
    };
    
    // Validate required fields
    if (!tool.url || !tool.name || !tool.tagline) {
      console.warn(`⚠️  Warning: Row ${index + 1} missing required fields (URL, name, or tagline), skipping`);
      return null;
    }
    
    // Auto-detect category based on tags and content
    tool.category = detectCategory(tool);
    
    return tool;
  }).filter(Boolean);
}

/**
 * Auto-detect category based on tool content
 */
function detectCategory(tool) {
  const content = `${tool.name} ${tool.tagline} ${tool.summary} ${tool.descriptor} ${tool.tags.join(' ')}`.toLowerCase();
  
  const categories = {
    'Design': ['design', 'ui', 'ux', 'graphic', 'logo', 'branding', 'color', 'typography', 'mockup', 'prototype'],
    'Development': ['code', 'developer', 'programming', 'api', 'framework', 'library', 'github', 'deployment', 'hosting'],
    'Productivity': ['productivity', 'task', 'project management', 'calendar', 'note', 'organization', 'workflow'],
    'Marketing': ['marketing', 'seo', 'social media', 'analytics', 'email', 'campaign', 'advertising', 'growth'],
    'AI': ['ai', 'artificial intelligence', 'machine learning', 'chatbot', 'automation', 'gpt', 'neural'],
    'Business': ['business', 'finance', 'accounting', 'crm', 'sales', 'invoice', 'startup', 'entrepreneur'],
    'Communication': ['chat', 'video call', 'messaging', 'collaboration', 'team', 'meeting', 'slack'],
    'Content': ['content', 'writing', 'blog', 'cms', 'publishing', 'editor', 'copywriting'],
    'Analytics': ['analytics', 'data', 'metrics', 'tracking', 'dashboard', 'reporting', 'insights'],
    'E-commerce': ['ecommerce', 'shop', 'store', 'payment', 'checkout', 'inventory', 'retail'],
  };
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => content.includes(keyword))) {
      return category;
    }
  }
  
  return 'Other';
}

/**
 * Upload tools to Convex in batches
 */
async function uploadTools(tools) {
  console.log(`📤 Starting upload of ${tools.length} tools...`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < tools.length; i += BATCH_SIZE) {
    const batch = tools.slice(i, i + BATCH_SIZE);
    console.log(`\n📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(tools.length / BATCH_SIZE)}`);
    
    for (const tool of batch) {
      try {
        // Check if tool already exists
        const existingTool = await client.query('tools.getByUrl', { url: tool.url });
        
        if (existingTool) {
          console.log(`⏭️  Skipping ${tool.name} - already exists`);
          continue;
        }
        
        // Insert new tool
        await client.mutation('tools.create', tool);
        console.log(`✅ Uploaded: ${tool.name}`);
        successCount++;
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Failed to upload ${tool.name}:`, error.message);
        errorCount++;
      }
    }
  }
  
  console.log(`\n🎉 Upload complete!`);
  console.log(`   ✅ Successfully uploaded: ${successCount} tools`);
  console.log(`   ❌ Failed uploads: ${errorCount} tools`);
  
  if (errorCount > 0) {
    console.log(`\n💡 Tip: Check the error messages above and verify your CSV format`);
  }
}

/**
 * Main execution
 */
async function main() {
  const csvPath = process.argv[2];
  
  if (!csvPath) {
    console.error('❌ Error: Please provide a CSV file path');
    console.error('   Usage: node scripts/upload-tools.js path/to/your/tools.csv');
    process.exit(1);
  }
  
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ Error: File not found: ${csvPath}`);
    process.exit(1);
  }
  
  try {
    console.log(`📁 Reading CSV file: ${csvPath}`);
    const content = fs.readFileSync(csvPath, 'utf-8');
    
    console.log(`📊 Parsing CSV data...`);
    const tools = parseCSV(content);
    
    if (tools.length === 0) {
      console.error('❌ Error: No valid tools found in CSV file');
      process.exit(1);
    }
    
    console.log(`📋 Found ${tools.length} valid tools to upload`);
    console.log(`🏷️  Categories detected: ${[...new Set(tools.map(t => t.category))].join(', ')}`);
    
    // Confirm before uploading
    console.log(`\n⚠️  This will upload ${tools.length} tools to your Convex database.`);
    console.log(`   Press Ctrl+C to cancel, or press Enter to continue...`);
    
    await new Promise(resolve => {
      process.stdin.once('data', resolve);
    });
    
    await uploadTools(tools);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Upload cancelled by user');
  process.exit(0);
});

main().catch(console.error);
