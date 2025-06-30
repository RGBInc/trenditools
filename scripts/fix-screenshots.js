#!/usr/bin/env node

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, "../.env.local") });

const client = new ConvexHttpClient(process.env.VITE_CONVEX_URL);

async function main() {
  try {
    console.log("🔍 Checking for malformed screenshot URLs...");
    
    // Debug current state
    const debugResults = await client.query(api.tools.debugScreenshotUrls);
    const malformedTools = debugResults.filter(tool => tool.hasDoublePrefix);
    
    console.log(`Found ${malformedTools.length} tools with malformed URLs:`);
    malformedTools.forEach(tool => {
      console.log(`- ${tool.name}: ${tool.screenshot}`);
    });
    
    if (malformedTools.length > 0) {
      console.log("\n🔧 Fixing malformed URLs...");
      const fixes = await client.mutation(api.tools.fixMalformedScreenshots);
      
      console.log(`✅ Fixed ${fixes.length} malformed URLs:`);
      fixes.forEach(fix => {
        console.log(`- ${fix.name}:`);
        console.log(`  Old: ${fix.oldUrl}`);
        console.log(`  New: ${fix.newUrl}`);
      });
    } else {
      console.log("✅ No malformed URLs found!");
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main();