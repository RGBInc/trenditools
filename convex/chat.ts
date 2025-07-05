import { action, query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { Doc } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";

export const sendMessage = action({
  args: {
    message: v.string(),
    sessionId: v.string(),
  },
  handler: async (ctx, args): Promise<{
    response: string;
    toolRecommendations: Doc<"tools">[];
  }> => {
    // Get user context
    const userId = await getAuthUserId(ctx);
    
    // Search for relevant tools based on the message
    const toolRecommendations = await ctx.runQuery(api.tools.searchTools, {
      query: args.message,
      paginationOpts: { numItems: 5, cursor: null },
    });

    // Generate AI response with token tracking
    const { response: aiResponse, tokenUsage } = await generateAIResponse(args.message, toolRecommendations.page);
    
    // Save the chat message with token usage
    await ctx.runMutation(api.chat.saveChatMessage, {
      userId: userId || undefined,
      message: args.message,
      response: aiResponse,
      toolRecommendations: toolRecommendations.page.map((tool: Doc<"tools">) => tool._id),
      sessionId: args.sessionId,
      tokenUsage,
    });

    return {
      response: aiResponse,
      toolRecommendations: toolRecommendations.page,
    };
  },
});

export const saveChatMessage = mutation({
  args: {
    userId: v.optional(v.id("users")),
    message: v.string(),
    response: v.string(),
    toolRecommendations: v.optional(v.array(v.id("tools"))),
    sessionId: v.string(),
    tokenUsage: v.optional(v.object({
      promptTokens: v.number(),
      completionTokens: v.number(),
      totalTokens: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("chatMessages", args);
  },
});

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
function transformScreenshotUrl(screenshot: string | undefined, toolName?: string): string | undefined {
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

export const getChatHistory = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .order("asc")
      .take(50);

    // Get tool details for recommendations
    const messagesWithTools = await Promise.all(
      messages.map(async (message) => {
        if (message.toolRecommendations) {
          const tools = await Promise.all(
            message.toolRecommendations.map(toolId => ctx.db.get(toolId))
          );
          const validTools = tools.filter((tool): tool is Doc<"tools"> => tool !== null);
          return {
            ...message,
            recommendedTools: validTools.map((tool) => ({
              ...tool,
              screenshot: transformScreenshotUrl(tool.screenshot, tool.name)
            })),
          };
        }
        return { ...message, recommendedTools: [] as Doc<"tools">[] };
      })
    );

    return messagesWithTools;
  },
});

async function generateAIResponse(userMessage: string, relevantTools: Doc<"tools">[]): Promise<{
  response: string;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}> {
  const openai = new (await import("openai")).default({
    baseURL: process.env.CONVEX_OPENAI_BASE_URL,
    apiKey: process.env.OPENAI_API_KEY,
  });

  const toolsContext = relevantTools.length > 0 
    ? `Here are some relevant digital tools I found:\n${relevantTools.map(tool => 
        `- ${tool.name}: ${tool.tagline} (${tool.summary})`
      ).join('\n')}\n\n`
    : '';

  const systemPrompt = `You are an AI assistant for a digital tools search engine. Help users discover the perfect digital tools for their needs.

${toolsContext}Your role:
- Help users find digital tools that match their requirements
- Provide insights about tool features, use cases, and benefits
- Be enthusiastic and knowledgeable about digital tools and technology
- Keep responses concise but helpful
- If relevant tools are provided above, reference them naturally in responses
- Always encourage exploration of the tool database

User message: ${userMessage}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const content = response.choices[0].message.content || "Here to help find the perfect digital tools! What are you looking for?";
    
    // Extract token usage from OpenAI response
    const tokenUsage = response.usage ? {
      promptTokens: response.usage.prompt_tokens,
      completionTokens: response.usage.completion_tokens,
      totalTokens: response.usage.total_tokens,
    } : undefined;

    return { response: content, tokenUsage };
  } catch (error) {
    console.error("AI response generation failed:", error);
    return { 
      response: "Here to help discover amazing digital tools! What kind of tool are you looking for today?",
      tokenUsage: undefined 
    };
  }
}
