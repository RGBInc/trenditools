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
    console.log("🔍 Checking all screenshot URLs...");
    
    const tools = await client.query(api.tools.debugScreenshotUrls);
    
    console.log(`Found ${tools.length} tools:`);
    tools.forEach(tool => {
      console.log(`- ${tool.name}: ${tool.screenshot}`);
    });
    
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main();