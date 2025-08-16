import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc } from "./_generated/dataModel";

// Helper function to create SEO-friendly URL slug from tool name
function createToolSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
}

// Helper function to transform storage IDs to SEO-optimized image URLs
function transformScreenshotUrl(screenshot: string | undefined, ctx: any, toolName?: string): string | undefined {
  if (!screenshot) return undefined;
  
  // If it's already a full URL (like seed data), return as-is
  if (screenshot.startsWith('http')) {
    return screenshot;
  }
  
  const baseUrl = process.env.CONVEX_SITE_URL || 'https://watchful-gazelle-766.convex.cloud';
  
  // If it's a relative URL path starting with /image?id=, convert to full URL
  if (screenshot.startsWith('/image?id=')) {
    return `${baseUrl}${screenshot}`;
  }
  
  // If we have a tool name, create SEO-friendly URL
  if (toolName && screenshot.startsWith('kg')) {
    const slug = createToolSlug(toolName);
    return `${baseUrl}/images/${slug}-${screenshot}.png`;
  }
  
  // Fallback to legacy format for storage IDs
  return `${baseUrl}/image?id=${screenshot}`;
}

export const searchTools = query({
  args: { 
    query: v.string(),
    category: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    let results;
    if (!args.query.trim()) {
      // If no search query, return all tools with optional category filter
      if (args.category) {
        results = await ctx.db
          .query("tools")
          .withIndex("by_category", (q) => q.eq("category", args.category))
          .order("desc")
          .paginate(args.paginationOpts);
      } else {
        results = await ctx.db
          .query("tools")
          .order("desc")
          .paginate(args.paginationOpts);
      }
    } else {
      // Search by name first (broad search, not constrained by category)
      const nameResults = await ctx.db
        .query("tools")
        .withSearchIndex("search_tools", (q) => {
          return q.search("name", args.query);
        })
        .take(20);

      // Search by descriptor/content (broad search, not constrained by category)
      const contentResults = await ctx.db
        .query("tools")
        .withSearchIndex("search_content", (q) => {
          return q.search("descriptor", args.query);
        })
        .take(20);

      // Search by tags (broad search, not constrained by category)
      const tagResults = await ctx.db
        .query("tools")
        .withSearchIndex("search_tags", (q) => {
          return q.search("tags", args.query);
        })
        .take(20);

      // Combine and deduplicate results
      const allResults = [...nameResults, ...contentResults, ...tagResults];
      const uniqueResults = allResults.filter((tool, index, self) => 
        index === self.findIndex(t => t._id === tool._id)
      );

      // Simulate pagination for combined results
      const startIndex = (args.paginationOpts.cursor ? parseInt(args.paginationOpts.cursor) : 0);
      const endIndex = startIndex + args.paginationOpts.numItems;
      const page = uniqueResults.slice(startIndex, endIndex);
      
      results = {
        page,
        isDone: endIndex >= uniqueResults.length,
        continueCursor: endIndex >= uniqueResults.length ? "" : endIndex.toString(),
      };
    }

    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        ...results,
        page: results.page.map((tool: Doc<"tools">) => ({ 
          ...tool, 
          isBookmarked: false,
          screenshot: transformScreenshotUrl(tool.screenshot, ctx, tool.name)
        })),
      };
    }

    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    
    const bookmarkedToolIds = new Set(bookmarks.map((b) => b.toolId));

    return {
      ...results,
      page: results.page.map((tool: Doc<"tools">) => ({
        ...tool,
        isBookmarked: bookmarkedToolIds.has(tool._id),
        screenshot: transformScreenshotUrl(tool.screenshot, ctx, tool.name)
      })),
    };
  },
});

export const getFeaturedTools = query({
  args: {},
  handler: async (ctx) => {
    const tools = await ctx.db
      .query("tools")
      .withIndex("by_featured", (q) => q.eq("featured", true))
      .take(6);

    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return tools.map((tool) => ({
        ...tool, 
        isBookmarked: false,
        screenshot: transformScreenshotUrl(tool.screenshot, ctx, tool.name)
      }));
    }

    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    
    const bookmarkedToolIds = new Set(bookmarks.map((b) => b.toolId));

    return tools.map((tool) => ({
      ...tool,
      isBookmarked: bookmarkedToolIds.has(tool._id),
      screenshot: transformScreenshotUrl(tool.screenshot, ctx, tool.name)
    }));
  },
});

export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    const tools = await ctx.db.query("tools").collect();
    const categories = [...new Set(tools.map(tool => tool.category).filter(Boolean))] as string[];
    return categories.sort();
  },
});

export const getTool = query({
  args: { id: v.id("tools") },
  handler: async (ctx, args) => {
    const tool = await ctx.db.get(args.id);
    if (!tool) {
      return null;
    }
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { 
        ...tool, 
        isBookmarked: false,
        screenshot: transformScreenshotUrl(tool.screenshot, ctx, tool.name)
      };
    }
    const bookmark = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_tool", (q) => q.eq("userId", userId).eq("toolId", args.id))
      .unique();
    return { 
      ...tool, 
      isBookmarked: !!bookmark,
      screenshot: transformScreenshotUrl(tool.screenshot, ctx, tool.name)
    };
  },
});

export const getByUrl = query({
  args: { url: v.string() },
  handler: async (ctx, args) => {
    const tool = await ctx.db
      .query("tools")
      .withIndex("by_url", (q) => q.eq("url", args.url))
      .first();
    if (!tool) {
      return null;
    }
    return {
      ...tool,
      screenshot: transformScreenshotUrl(tool.screenshot, ctx, tool.name)
    };
  },
});

export const create = mutation({
  args: {
    url: v.string(),
    descriptor: v.string(),
    name: v.string(),
    screenshot: v.optional(v.string()),
    summary: v.string(),
    tagline: v.string(),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    rating: v.optional(v.number()),
    featured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const toolData = {
      ...args,
      screenshot: args.screenshot || "", // Provide default empty string
    };
    return await ctx.db.insert("tools", toolData);
  },
});

export const addTool = mutation({
  args: {
    url: v.string(),
    descriptor: v.string(),
    name: v.string(),
    screenshot: v.string(),
    summary: v.string(),
    tagline: v.string(),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    rating: v.optional(v.number()),
    featured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tools", args);
  },
});

export const logSearch = mutation({
  args: {
    query: v.string(),
    resultsCount: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    
    await ctx.db.insert("searches", {
      userId: userId || undefined,
      query: args.query,
      resultsCount: args.resultsCount,
      timestamp: Date.now(),
    });
  },
});

export const getPopularSearches = query({
  args: {},
  handler: async (ctx) => {
    const searches = await ctx.db.query("searches").collect();
    const queryCount = searches.reduce((acc, search) => {
      acc[search.query] = (acc[search.query] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(queryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([query]) => query);
  },
});

export const getSmartSearchSuggestions = query({
  args: {},
  handler: async (ctx) => {
    // Get popular search terms
    const searches = await ctx.db.query("searches").collect();
    const queryCount = searches.reduce((acc, search) => {
      acc[search.query] = (acc[search.query] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const popularSearches = Object.entries(queryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6)
      .map(([query]) => query)
      .filter(query => query.length > 2); // Filter out very short queries
    
    // Get all tools to analyze common tags and create smart suggestions
    const allTools = await ctx.db.query("tools").collect();
    
    // Extract and count popular tags
    const tagCount = allTools.reduce((acc, tool) => {
      if (tool.tags) {
        tool.tags.forEach(tag => {
          acc[tag] = (acc[tag] || 0) + 1;
        });
      }
      return acc;
    }, {} as Record<string, number>);
    
    const popularTags = Object.entries(tagCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6)
      .map(([tag]) => tag)
      .filter(tag => tag.length > 2);
    
    // Create smart suggestions combining popular searches and tags
    const smartSuggestions = [
      ...popularSearches.slice(0, 3),
      ...popularTags.slice(0, 3)
    ].filter((item, index, self) => self.indexOf(item) === index); // Remove duplicates
    
    return smartSuggestions.slice(0, 6); // Return max 6 suggestions for initial load
  },
});

export const getExpandedSearchSuggestions = query({
  args: {},
  handler: async (ctx) => {
    // Get popular search terms
    const searches = await ctx.db.query("searches").collect();
    const queryCount = searches.reduce((acc, search) => {
      acc[search.query] = (acc[search.query] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const popularSearches = Object.entries(queryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15)
      .map(([query]) => query)
      .filter(query => query.length > 2);
    
    // Get all tools to analyze common tags and create smart suggestions
    const allTools = await ctx.db.query("tools").collect();
    
    // Extract and count popular tags
    const tagCount = allTools.reduce((acc, tool) => {
      if (tool.tags) {
        tool.tags.forEach(tag => {
          acc[tag] = (acc[tag] || 0) + 1;
        });
      }
      return acc;
    }, {} as Record<string, number>);
    
    const popularTags = Object.entries(tagCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15)
      .map(([tag]) => tag)
      .filter(tag => tag.length > 2);
    
    // Add some curated suggestions for better discovery
    const curatedSuggestions = [
      "AI tools", "productivity", "design", "development", "marketing", 
      "analytics", "automation", "collaboration", "writing", "video editing",
      "image generation", "code editor", "project management", "social media",
      "data visualization", "SEO tools", "email marketing", "chatbots"
    ];
    
    // Create expanded suggestions combining all sources
    const expandedSuggestions = [
      ...popularSearches.slice(0, 8),
      ...popularTags.slice(0, 8),
      ...curatedSuggestions.slice(0, 8)
    ].filter((item, index, self) => self.indexOf(item) === index); // Remove duplicates
    
    return expandedSuggestions.slice(0, 20); // Return max 20 suggestions for expanded view
  },
});

export const getByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    // Find tool by exact name match (case-insensitive)
    const tools = await ctx.db.query("tools").collect();
    const tool = tools.find(t => t.name.toLowerCase() === args.name.toLowerCase());
    
    return tool || null;
  },
});

export const getToolByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    
    // Find tool by exact name match (case-insensitive)
    const tools = await ctx.db.query("tools").collect();
    const tool = tools.find(t => t.name.toLowerCase() === args.name.toLowerCase());
    
    if (!tool) {
      return null;
    }
    
    // Check if bookmarked by current user
    let isBookmarked = false;
    if (userId) {
      const bookmark = await ctx.db
        .query("bookmarks")
        .withIndex("by_user_tool", (q) => q.eq("userId", userId).eq("toolId", tool._id))
        .first();
      isBookmarked = !!bookmark;
    }
    
    return { ...tool, isBookmarked };
  },
});



export const updateTool = mutation({
  args: {
    id: v.id("tools"),
    url: v.optional(v.string()),
    descriptor: v.optional(v.string()),
    name: v.optional(v.string()),
    screenshot: v.optional(v.string()),
    summary: v.optional(v.string()),
    tagline: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    rating: v.optional(v.number()),
    featured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    
    return await ctx.db.patch(id, cleanUpdates);
  },
});

export const createTool = mutation({
  args: {
    url: v.string(),
    name: v.string(),
    tagline: v.string(),
    summary: v.string(),
    descriptor: v.string(),
    screenshot: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    category: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    rating: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check if tool with this URL already exists
    const existingTool = await ctx.db
      .query("tools")
      .withIndex("by_url", (q) => q.eq("url", args.url))
      .first();
    
    if (existingTool) {
      throw new Error(`Tool with URL ${args.url} already exists`);
    }
    
    return await ctx.db.insert("tools", args);
  },
});

export const deleteTool = mutation({
  args: { id: v.id("tools") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

export const deleteMultipleTools = mutation({
  args: { ids: v.array(v.id("tools")) },
  handler: async (ctx, args) => {
    const results = [];
    for (const id of args.ids) {
      try {
        await ctx.db.delete(id);
        results.push({ id, success: true });
      } catch (error) {
        results.push({ id, success: false, error: error instanceof Error ? error.message : String(error) });
      }
    }
    return results;
  },
});

// Debug function to check screenshot URLs
export const debugScreenshotUrls = query({
  args: {},
  handler: async (ctx) => {
    const tools = await ctx.db.query("tools").collect();
    return tools.map(tool => ({
      id: tool._id,
      name: tool.name,
      screenshot: tool.screenshot,
      hasDoublePrefix: tool.screenshot?.includes('/image?id=/image?id=')
    }));
  },
});

// Mutation to fix malformed screenshot URLs
export const fixMalformedScreenshots = mutation({
  args: {},
  handler: async (ctx) => {
    const tools = await ctx.db.query("tools").collect();
    const fixes = [];
    
    for (const tool of tools) {
      if (tool.screenshot?.includes('/image?id=/image?id=')) {
        // Extract the actual storage ID from the malformed URL
        const match = tool.screenshot.match(/\/image\?id=\/image\?id=(.+)$/);
        if (match) {
          const storageId = match[1];
          const fixedUrl = `/image?id=${storageId}`;
          await ctx.db.patch(tool._id, { screenshot: fixedUrl });
          fixes.push({
            id: tool._id,
            name: tool.name,
            oldUrl: tool.screenshot,
            newUrl: fixedUrl
          });
        }
      }
    }
    
    return fixes;
  },
});

// Query to get tool by storage ID for SEO image serving
export const getToolByStorageId = query({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    const tool = await ctx.db
      .query("tools")
      .filter((q) => q.eq(q.field("screenshot"), args.storageId))
      .first();
    
    return tool;
  },
});
