import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { ExternalLink, Bookmark, BookmarkCheck, ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface ToolCardProps {
  tool: Doc<"tools"> & { isBookmarked?: boolean };
  onViewDetails?: (tool: Doc<"tools"> & { isBookmarked?: boolean }) => void;
  onViewToolPage?: (tool: Doc<"tools">) => void;
}

export function ToolCard({ tool, onViewDetails, onViewToolPage }: ToolCardProps) {
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const user = useQuery(api.users.get);
  const bookmarkTool = useMutation(api.users.addBookmark);
  const unbookmarkTool = useMutation(api.users.removeBookmark);
  const userBookmarks = useQuery(api.users.getBookmarks);

  const isBookmarked = tool.isBookmarked || (userBookmarks && userBookmarks.includes(tool._id));

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Please sign in to bookmark tools");
      return;
    }

    setIsBookmarking(true);
    try {
      if (isBookmarked) {
        await unbookmarkTool({ toolId: tool._id });
        toast.success("Removed from bookmarks");
      } else {
        await bookmarkTool({ toolId: tool._id });
        toast.success("Added to bookmarks");
      }
    } catch (error) {
      toast.error("Failed to update bookmark");
    } finally {
      setIsBookmarking(false);
    }
  };

  const handleVisit = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(tool.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="bg-card border rounded-xl p-4 md:p-6 cursor-pointer hover:shadow-lg transition-all duration-200 group"
      onClick={() => onViewToolPage ? onViewToolPage(tool) : onViewDetails?.(tool)}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base md:text-lg line-clamp-1 group-hover:text-primary transition-colors">
              {tool.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
              {tool.tagline}
            </p>
          </div>
          <div className="flex items-center space-x-2 ml-3 flex-shrink-0">
            {user && (
              <button
                onClick={handleBookmark}
                disabled={isBookmarking}
                className="p-1.5 rounded-lg hover:bg-accent transition-colors"
                title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
              >
                {isBookmarked ? (
                  <BookmarkCheck className="w-4 h-4 text-primary" />
                ) : (
                  <Bookmark className="w-4 h-4 text-muted-foreground hover:text-primary" />
                )}
              </button>
            )}
            <button
              onClick={handleVisit}
              className="p-1.5 rounded-lg hover:bg-accent transition-colors"
              title="Visit website"
            >
              <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-primary" />
            </button>
          </div>
        </div>

        {/* Screenshot */}
        <div className="aspect-video rounded-lg overflow-hidden bg-muted relative">
          {tool.screenshot ? (
            <>
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
                  <div className="animate-pulse flex flex-col items-center space-y-2">
                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Loading...</span>
                  </div>
                </div>
              )}
              <img
                src={tool.screenshot}
                alt={`${tool.name} screenshot`}
                className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-300 ${
                  imageLoading ? 'opacity-0' : 'opacity-100'
                }`}
                loading="lazy"
                decoding="async"
                onLoad={() => {
                  setImageLoading(false);
                  setImageError(false);
                }}
                onError={() => {
                  setImageError(true);
                  setImageLoading(false);
                }}
              />
              {imageError && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <div className="flex flex-col items-center space-y-2">
                    <ImageIcon className="w-6 h-6 text-muted-foreground opacity-50" />
                    <span className="text-xs text-muted-foreground">Failed to load</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="flex flex-col items-center space-y-2">
                <ImageIcon className="w-6 h-6 text-muted-foreground opacity-50" />
                <span className="text-xs text-muted-foreground">No preview</span>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {tool.summary}
        </p>

        {/* Tags */}
        {tool.tags && tool.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tool.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
              >
                {tag}
              </span>
            ))}
            {tool.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">+{tool.tags.length - 3} more</span>
            )}
          </div>
        )}

        {/* Category and Actions */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
            {tool.category}
          </span>
          {onViewToolPage && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewToolPage(tool);
              }}
              className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
            >
              View Details
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
