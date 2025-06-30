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

    // Generate AI response
    const aiResponse: string = await generateAIResponse(args.message, toolRecommendations.page);
    
    // Save the chat message
    await ctx.runMutation(api.chat.saveChatMessage, {
      userId: userId || undefined,
      message: args.message,
      response: aiResponse,
      toolRecommendations: toolRecommendations.page.map((tool: Doc<"tools">) => tool._id),
      sessionId: args.sessionId,
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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("chatMessages", args);
  },
});

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
          return {
            ...message,
            recommendedTools: tools.filter(Boolean) as Doc<"tools">[],
          };
        }
        return { ...message, recommendedTools: [] as Doc<"tools">[] };
      })
    );

    return messagesWithTools;
  },
});

async function generateAIResponse(userMessage: string, relevantTools: Doc<"tools">[]): Promise<string> {
  const openai = new (await import("openai")).default({
    baseURL: process.env.CONVEX_OPENAI_BASE_URL,
    apiKey: process.env.CONVEX_OPENAI_API_KEY,
  });

  const toolsContext = relevantTools.length > 0 
    ? `Here are some relevant digital tools I found:\n${relevantTools.map(tool => 
        `- ${tool.name}: ${tool.tagline} (${tool.summary})`
      ).join('\n')}\n\n`
    : '';

  const systemPrompt = `You are the TrendiTools Assistant for Trendi Tools - a search engine for digital tools. Help users discover the perfect digital tools for their needs.

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
      model: "gpt-4.1-nano",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "Here to help find the perfect digital tools! What are you looking for?";
  } catch (error) {
    console.error("AI response generation failed:", error);
    return "Here to help discover amazing digital tools! What kind of tool are you looking for today?";
  }
}
