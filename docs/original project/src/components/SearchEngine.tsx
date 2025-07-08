import { useState, useEffect, useRef } from "react";
import { usePaginatedQuery, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import { ToolCard } from "./ToolCard";
import { ChatInterface } from "./ChatInterface";
import { SearchBar } from "./SearchBar";
import { CategoryFilter } from "./CategoryFilter";
import { ToolModal } from "./ToolModal";
import { BookmarksPanel } from "./BookmarksPanel";
import { ViewToggle } from "./ViewToggle";
import { Header } from "./Header";
import { ProfilePage } from "./ProfilePage";
import { Loader2, SearchX, Bookmark } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";

export function SearchEngine() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [mode, setMode] = useState<'search' | 'ai'>('search');
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedTool, setSelectedTool] = useState<(Doc<"tools"> & { isBookmarked?: boolean }) | null>(null);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [viewMode, setViewMode] = useState<1 | 2 | 3 | 4>(3);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Scroll to top when mode changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [mode, showProfile]);

  const {
    results: searchResults,
    status: searchStatus,
    loadMore,
  } = usePaginatedQuery(
    api.tools.searchTools,
    {
      query: debouncedQuery,
      category: selectedCategory || undefined,
    },
    { initialNumItems: 12 }
  );

  const categories = useQuery(api.tools.getCategories);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleViewDetails = (tool: Doc<"tools"> & { isBookmarked?: boolean }) => {
    setSelectedTool(tool);
  };

  const handleShowProfile = () => {
    setShowProfile(true);
  };

  const showResults = debouncedQuery.trim() || selectedCategory;

  const getGridCols = () => {
    switch (viewMode) {
      case 1: return "grid-cols-1";
      case 2: return "grid-cols-1 lg:grid-cols-2";
      case 3: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      case 4: return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
      default: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    }
  };

  // Show profile page without header toggle
  if (showProfile) {
    return (
      <div ref={containerRef} className="min-h-screen">
        <div className="fixed top-0 left-0 right-0 z-50">
          <Header onViewDetails={handleViewDetails} />
        </div>
        <div className="pt-16">
          <ProfilePage 
            onViewDetails={handleViewDetails} 
            onBack={() => setShowProfile(false)} 
          />
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen">
      {/* Header with mode toggle */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header 
          mode={mode} 
          onModeChange={setMode} 
          onViewDetails={handleViewDetails}
          onShowProfile={handleShowProfile}
        />
      </div>
      
      {/* Add top padding to account for fixed header */}
      <div className="pt-16 pb-8">
        {mode === 'search' ? (
          <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Hero Section - Always visible at top */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center py-8"
              >
                <div className="max-w-2xl mx-auto space-y-4">
                  <h2 className="text-2xl md:text-3xl font-bold">Find Your Perfect Tool</h2>
                  <p className="text-base md:text-lg text-muted-foreground">
                    Search through thousands of curated digital tools or let our AI assistant help you discover exactly what you need.
                  </p>
                </div>
              </motion.div>

              {/* Search Interface */}
              <div className="max-w-4xl mx-auto space-y-6">
                <SearchBar onSearch={handleSearch} />
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <CategoryFilter
                      categories={categories || []}
                      selectedCategory={selectedCategory}
                      onCategoryChange={handleCategoryChange}
                    />
                    <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                      {showResults && (
                        <div className="hidden lg:block">
                          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
                        </div>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowBookmarks(!showBookmarks)}
                        className="flex items-center space-x-2"
                      >
                        <Bookmark className="w-4 h-4" />
                        <span className="hidden sm:inline">Bookmarks</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bookmarks Panel */}
              <AnimatePresence>
                {showBookmarks && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <BookmarksPanel onViewDetails={handleViewDetails} onClose={() => setShowBookmarks(false)} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Search Results */}
              {showResults && !showBookmarks && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className={`grid ${getGridCols()} gap-4 md:gap-6`}>
                    <AnimatePresence>
                      {searchResults?.map((tool, index) => (
                        <motion.div
                          key={tool._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <ToolCard tool={tool} onViewDetails={handleViewDetails} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {searchStatus === "LoadingFirstPage" && (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  )}

                  {searchStatus !== "LoadingFirstPage" && searchResults.length === 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-16"
                    >
                      <SearchX className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No tools found</h3>
                      <p className="text-muted-foreground">Try adjusting your search or category.</p>
                    </motion.div>
                  )}

                  {searchStatus !== "Exhausted" && searchResults.length > 0 && (
                    <div className="flex justify-center">
                      <Button
                        onClick={() => loadMore(8)}
                        disabled={searchStatus === "LoadingMore"}
                        size="lg"
                        className="min-w-32"
                      >
                        {searchStatus === "LoadingMore" && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Load More
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          </div>
        ) : (
          /* AI Chat Interface - Full Page */
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="h-[calc(100vh-8rem)]"
          >
            <ChatInterface onViewDetails={handleViewDetails} />
          </motion.div>
        )}

        {/* Tool Modal */}
        <ToolModal
          tool={selectedTool!}
          isOpen={!!selectedTool}
          onClose={() => setSelectedTool(null)}
        />
      </div>
    </div>
  );
}
