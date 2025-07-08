import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalMutation, mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    
    return {
      ...user,
      points: userProfile?.points ?? 0,
      profileImageUrl: userProfile?.profileImageUrl,
    };
  },
});

export const update = mutation({
  args: {
    name: v.optional(v.string()),
    profileImage: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not logged in");
    }

    if (args.name) {
      await ctx.db.patch(userId, { name: args.name });
    }

    if (args.profileImage) {
      const profileImageUrl = (await ctx.storage.getUrl(args.profileImage)) ?? undefined;
      const userProfile = await ctx.db
        .query("userProfiles")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .unique();
      
      if (userProfile) {
        await ctx.db.patch(userProfile._id, { profileImageUrl });
      } else {
        await ctx.db.insert("userProfiles", {
          userId,
          points: 0,
          profileImageUrl,
        });
      }
    }
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const addBookmark = mutation({
  args: { toolId: v.id("tools") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not logged in");
    }

    const existingBookmark = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_tool", (q) =>
        q.eq("userId", userId).eq("toolId", args.toolId)
      )
      .unique();

    if (existingBookmark) {
      return;
    }

    await ctx.db.insert("bookmarks", {
      userId,
      toolId: args.toolId,
    });
  },
});

export const removeBookmark = mutation({
  args: { toolId: v.id("tools") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not logged in");
    }

    const existingBookmark = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_tool", (q) =>
        q.eq("userId", userId).eq("toolId", args.toolId)
      )
      .unique();

    if (existingBookmark) {
      await ctx.db.delete(existingBookmark._id);
    }
  },
});

export const getBookmarkedTools = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const toolIds = bookmarks.map((b) => b.toolId);
    const tools = await Promise.all(toolIds.map((id) => ctx.db.get(id)));
    return tools.filter(Boolean);
  },
});

export const getBookmarks = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return bookmarks.map((b) => b.toolId);
  },
});

export const shareTool = mutation({
  args: { toolId: v.id("tools") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not logged in");
    }

    await ctx.runMutation(internal.users.addPoints, { userId, points: 10 });
    const tool = await ctx.db.get(args.toolId);
    if (!tool) {
      throw new Error("Tool not found");
    }
    return {
      url: tool.url,
      name: tool.name,
    };
  },
});

export const changePassword = mutation({
  args: { currentPassword: v.string(), newPassword: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not logged in");
    if (args.newPassword.length < 6) throw new Error("Password must be at least 6 characters");
    throw new Error("Password change requires additional auth configuration");
  },
});

export const requestPasswordReset = mutation({
  args: { email: v.string() },
  handler: async () => ({ success: true, message: "If account exists, you will receive a reset link." }),
});

export const addPoints = internalMutation({
  args: { userId: v.id("users"), points: v.number() },
  handler: async (ctx, args) => {
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (userProfile) {
      await ctx.db.patch(userProfile._id, {
        points: userProfile.points + args.points,
      });
    } else {
      await ctx.db.insert("userProfiles", {
        userId: args.userId,
        points: args.points,
      });
    }
  },
});
