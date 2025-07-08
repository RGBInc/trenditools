import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc } from "./_generated/dataModel";

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
      // Search by name first
      const nameResults = await ctx.db
        .query("tools")
        .withSearchIndex("search_tools", (q) => {
          let search = q.search("name", args.query);
          if (args.category) {
            search = search.eq("category", args.category);
          }
          return search;
        })
        .take(20);

      // Search by descriptor/content
      const contentResults = await ctx.db
        .query("tools")
        .withSearchIndex("search_content", (q) => {
          let search = q.search("descriptor", args.query);
          if (args.category) {
            search = search.eq("category", args.category);
          }
          return search;
        })
        .take(20);

      // Combine and deduplicate results
      const allResults = [...nameResults, ...contentResults];
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
        page: results.page.map((tool: Doc<"tools">) => ({ ...tool, isBookmarked: false })),
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
      return tools.map((tool) => ({ ...tool, isBookmarked: false }));
    }

    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    
    const bookmarkedToolIds = new Set(bookmarks.map((b) => b.toolId));

    return tools.map((tool) => ({
      ...tool,
      isBookmarked: bookmarkedToolIds.has(tool._id),
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
      return { ...tool, isBookmarked: false };
    }
    const bookmark = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_tool", (q) => q.eq("userId", userId).eq("toolId", args.id))
      .unique();
    return { ...tool, isBookmarked: !!bookmark };
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
