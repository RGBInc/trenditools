import { httpAction } from "./_generated/server";
import { httpRouter } from "convex/server";
import { api } from "./_generated/api";
import { GenericId } from "convex/values";

const http = httpRouter();

// Public endpoint to serve images from Convex storage
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
      
      // Determine content type based on file extension or default to image/png
      let contentType = "image/png";
      const originalContentType = response.headers.get("Content-Type");
      
      // Only use the original content type if it's actually an image type
      if (originalContentType && originalContentType.startsWith("image/")) {
        contentType = originalContentType;
      }
      
      return new Response(blob, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000", // Cache for 1 year
        },
      });
    } catch (error) {
      console.error("Error serving image:", error);
      return new Response("Internal server error", { status: 500 });
    }
  }),
});

export default http;
