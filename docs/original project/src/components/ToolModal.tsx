import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "./ui/dialog";
import { ExternalLink, Bookmark, BookmarkCheck, X } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface ToolModalProps {
  tool: Doc<"tools"> & { isBookmarked?: boolean };
  isOpen: boolean;
  onClose: () => void;
}

export function ToolModal({ tool, isOpen, onClose }: ToolModalProps) {
  const [isBookmarking, setIsBookmarking] = useState(false);
  const user = useQuery(api.users.get);
  const bookmarkTool = useMutation(api.users.addBookmark);
  const unbookmarkTool = useMutation(api.users.removeBookmark);
  const userBookmarks = useQuery(api.users.getBookmarks);

  if (!tool) return null;

  const isBookmarked = tool.isBookmarked || (userBookmarks && userBookmarks.includes(tool._id));

  const handleBookmark = async () => {
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

  const handleVisit = () => {
    window.open(tool.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl md:text-2xl font-bold">
                {tool.name}
              </DialogTitle>
              <DialogDescription className="text-base mt-2">
                {tool.tagline}
              </DialogDescription>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-accent transition-colors flex-shrink-0 ml-4"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <Button onClick={handleVisit} className="flex items-center space-x-2">
              <ExternalLink className="w-4 h-4" />
              <span>Visit Website</span>
            </Button>
            {user && (
              <Button
                variant="outline"
                onClick={handleBookmark}
                disabled={isBookmarking}
                className="flex items-center space-x-2"
              >
                {isBookmarked ? (
                  <>
                    <BookmarkCheck className="w-4 h-4" />
                    <span>Bookmarked</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" />
                    <span>Bookmark</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Screenshot */}
          {tool.screenshot && (
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <img
                src={tool.screenshot}
                alt={`${tool.name} screenshot`}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Description */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">About {tool.name}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {tool.descriptor || tool.summary}
            </p>
          </div>

          {/* Category and Tags */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Category</h4>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                  {tool.category}
                </span>
              </div>
            </div>

            {tool.tags && tool.tags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {tool.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded text-sm bg-muted text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Website Link */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Website</h4>
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  {tool.url}
                </a>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
