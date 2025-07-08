import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import { ToolCard } from "./ToolCard";
import { X, Bookmark } from "lucide-react";

interface BookmarksPanelProps {
  onViewDetails: (tool: Doc<"tools">) => void;
  onClose: () => void;
}

export function BookmarksPanel({ onViewDetails, onClose }: BookmarksPanelProps) {
  const bookmarkedTools = useQuery(api.users.getBookmarkedTools);

  return (
    <div className="bg-card rounded-xl border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Bookmark className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Your Bookmarks</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-accent transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {!bookmarkedTools || bookmarkedTools.length === 0 ? (
        <div className="text-center py-8">
          <Bookmark className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No bookmarks yet. Start exploring tools!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookmarkedTools.map((tool) => 
            tool ? (
              <ToolCard 
                key={tool._id} 
                tool={{ ...tool, isBookmarked: true }} 
                onViewDetails={onViewDetails} 
              />
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
