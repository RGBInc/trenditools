import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  tools: defineTable({
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
  })
    .index("by_category", ["category"])
    .index("by_featured", ["featured"])
    .index("by_url", ["url"])
    .searchIndex("search_tools", {
      searchField: "name",
      filterFields: ["category", "featured"],
    })
    .searchIndex("search_content", {
      searchField: "descriptor",
      filterFields: ["category"],
    })
    .searchIndex("search_tags", {
      searchField: "tags",
      filterFields: ["category"],
    }),
  
  chatMessages: defineTable({
    userId: v.optional(v.id("users")),
    message: v.string(),
    response: v.string(),
    toolRecommendations: v.optional(v.array(v.id("tools"))),
    sessionId: v.string(),
    // Token usage tracking for OpenAI API calls
    tokenUsage: v.optional(v.object({
      promptTokens: v.number(),
      completionTokens: v.number(),
      totalTokens: v.number(),
    })),
  }).index("by_session", ["sessionId"]),
  
  searches: defineTable({
    userId: v.optional(v.id("users")),
    query: v.string(),
    resultsCount: v.number(),
    timestamp: v.number(),
  }).index("by_user", ["userId"]),

  userProfiles: defineTable({
    userId: v.id("users"),
    points: v.number(),
    profileImageUrl: v.optional(v.string()),
  }).index("by_userId", ["userId"]),

  bookmarks: defineTable({
    userId: v.id("users"),
    toolId: v.id("tools"),
  })
    .index("by_user_tool", ["userId", "toolId"])
    .index("by_user", ["userId"]),

  files: defineTable({
    storageId: v.id("_storage"),
    filename: v.string(),
    contentType: v.string(),
    size: v.number(),
    uploadedAt: v.number(),
  })
    .index("by_storageId", ["storageId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
