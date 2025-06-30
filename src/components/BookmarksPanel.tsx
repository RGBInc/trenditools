import React from "react";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { ToolCard } from "./ToolCard";
import { ViewToggle } from "./ViewToggle";
import { Bookmark } from "lucide-react";

interface BookmarksPanelProps {
  onViewToolPage: (tool: Doc<"tools">) => void;
}

export function BookmarksPanel({ onViewToolPage }: BookmarksPanelProps) {
  const [viewMode, setViewMode] = useState<1 | 2 | 3 | 4>(3);
  const bookmarkedTools = useQuery(api.users.getBookmarkedTools);

  const getGridCols = () => {
    switch (viewMode) {
      case 1: return "grid-cols-1";
      case 2: return "grid-cols-1 lg:grid-cols-2";
      case 3: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      case 4: return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
      default: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    }
  };

  return (
    <div className="bg-card rounded-xl border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Bookmark className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Your Bookmarks</h2>
          </div>
          {bookmarkedTools && bookmarkedTools.length > 0 && (
            <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          )}
        </div>

      {!bookmarkedTools || bookmarkedTools.length === 0 ? (
        <div className="text-center py-8">
          <Bookmark className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No bookmarks yet. Start exploring tools!</p>
        </div>
      ) : (
        <div className={`grid ${getGridCols()} gap-4`}>
          {bookmarkedTools.map((tool) => 
            tool ? (
              <ToolCard 
                key={tool._id} 
                tool={{ ...tool, isBookmarked: true }} 
                onViewToolPage={onViewToolPage}
              />
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
