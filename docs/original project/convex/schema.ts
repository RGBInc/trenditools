import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  tools: defineTable({
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
  })
    .index("by_category", ["category"])
    .index("by_featured", ["featured"])
    .searchIndex("search_tools", {
      searchField: "name",
      filterFields: ["category", "featured"],
    })
    .searchIndex("search_content", {
      searchField: "descriptor",
      filterFields: ["category"],
    }),
  
  chatMessages: defineTable({
    userId: v.optional(v.id("users")),
    message: v.string(),
    response: v.string(),
    toolRecommendations: v.optional(v.array(v.id("tools"))),
    sessionId: v.string(),
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
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
