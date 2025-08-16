import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Search, Plus } from "lucide-react";
import { useState } from "react";

interface CategoryFilterProps {
  onSearch: (query: string) => void;
  currentSearchQuery: string;
}

export function CategoryFilter({ 
  onSearch, 
  currentSearchQuery 
}: CategoryFilterProps) {
  const [showExpanded, setShowExpanded] = useState(false);
  const smartSuggestions = useQuery(api.tools.getSmartSearchSuggestions);
  const expandedSuggestions = useQuery(api.tools.getExpandedSearchSuggestions);
  
  const handleQuickSearch = (query: string) => {
    onSearch(query);
    // Update URL for SEO
    const url = new URL(window.location.href);
    if (query.trim()) {
      url.searchParams.set('q', query);
    } else {
      url.searchParams.delete('q');
    }
    window.history.replaceState({}, '', url.toString());
  };
  
  const toggleExpanded = () => {
    setShowExpanded(!showExpanded);
  };
  
  return (
    <div className="w-full space-y-3">
      {/* Search Suggestions */}
      {(smartSuggestions && smartSuggestions.length > 0) && (
        <div className="overflow-hidden">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <div className="flex gap-2 min-w-max">
              {/* Initial suggestions */}
              {!showExpanded && smartSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleQuickSearch(suggestion)}
                  className={`px-2 py-1 rounded-md text-xs transition-colors whitespace-nowrap flex-shrink-0 flex items-center gap-1 ${
                    currentSearchQuery === suggestion
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted/80 border border-transparent'
                  }`}
                >
                  <Search className="w-3 h-3" />
                  {suggestion}
                </button>
              ))}
              
              {/* Expanded suggestions */}
              {showExpanded && expandedSuggestions && expandedSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleQuickSearch(suggestion)}
                  className={`px-2 py-1 rounded-md text-xs transition-colors whitespace-nowrap flex-shrink-0 flex items-center gap-1 ${
                    currentSearchQuery === suggestion
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted/80 border border-transparent'
                  }`}
                >
                  <Search className="w-3 h-3" />
                  {suggestion}
                </button>
              ))}
              
              {/* Expand/Collapse button */}
              <button
                onClick={toggleExpanded}
                className="px-2 py-1 rounded-md text-xs transition-colors whitespace-nowrap flex-shrink-0 flex items-center gap-1 bg-muted/30 text-muted-foreground hover:bg-muted/60 border border-dashed border-muted-foreground/30"
                title={showExpanded ? 'Show less' : 'Show more suggestions'}
              >
                <Plus className={`w-3 h-3 transition-transform ${showExpanded ? 'rotate-45' : ''}`} />
                {showExpanded ? 'Less' : 'More'}
              </button>
            </div>
          </div>
        </div>
      )}
      

    </div>
  );
}
