import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import { GenericId } from "convex/values";

const http = httpRouter();

// SEO-optimized endpoint to serve images with tool names
http.route({
  path: "/images",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    // Extract tool slug and storage ID from URL like /images/figma-design-tool-kg2abc123.png
    const match = pathname.match(/\/images\/(.+)-(kg[a-zA-Z0-9]+)\.png$/);
    
    if (!match) {
      return new Response("Invalid image URL format", { status: 400 });
    }
    
    const [, toolSlug, storageId] = match;
    
    try {
      // Get tool info for SEO headers
      const tool = await ctx.runQuery(api.tools.getToolByStorageId, { storageId });
      
      // Get the file URL from storage
      const fileUrl = await ctx.runQuery(api.storage.getFileUrl, { storageId: storageId as GenericId<"_storage"> });
      
      if (!fileUrl) {
        return new Response("File not found", { status: 404 });
      }
      
      // Fetch the file and return it
      const response = await fetch(fileUrl);
      
      if (!response.ok) {
        return new Response("Failed to fetch file", { status: 500 });
      }
      
      const blob = await response.blob();
      
      // SEO-optimized headers
      const headers = new Headers({
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Access-Control-Allow-Origin": "*",
      });
      
      // Add SEO headers if tool info is available
      if (tool) {
        headers.set("X-Image-Title", tool.name);
        headers.set("X-Image-Description", tool.tagline || tool.summary?.substring(0, 160) || "");
        headers.set("X-Image-Alt", `${tool.name} - ${tool.tagline || 'Screenshot'}`);
      }
      
      return new Response(blob, { headers });
    } catch (error) {
      console.error("Error serving SEO image:", error);
      return new Response("Internal server error", { status: 500 });
    }
  }),
});

// Legacy endpoint for backward compatibility
http.route({
  path: "/image",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const storageId = url.searchParams.get("id");
    
    if (!storageId) {
      return new Response("Missing storage ID", { status: 400 });
    }
    
    try {
      // Get the file URL from storage
      const fileUrl = await ctx.runQuery(api.storage.getFileUrl, { storageId: storageId as GenericId<"_storage"> });
      
      if (!fileUrl) {
        return new Response("File not found", { status: 404 });
      }
      
      // Fetch the file and return it
      const response = await fetch(fileUrl);
      
      if (!response.ok) {
        return new Response("Failed to fetch file", { status: 500 });
      }
      
      const blob = await response.blob();
      
      return new Response(blob, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=31536000",
        },
      });
    } catch (error) {
      console.error("Error serving image:", error);
      return new Response("Internal server error", { status: 500 });
    }
  }),
});

export default http;
