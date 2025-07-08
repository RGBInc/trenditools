import React, { useState, useEffect, useRef } from "react";
import { usePaginatedQuery, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { createSlug, slugToName } from "../lib/utils";
import { ToolCard } from "./ToolCard";

import { SearchBar } from "./SearchBar";
import { CategoryFilter } from "./CategoryFilter";

import { BookmarksPanel } from "./BookmarksPanel";
import { ViewToggle } from "./ViewToggle";
import { Header } from "./Header";
import { ProfilePage } from "./ProfilePage";
import { ToolPage } from "./ToolPage";
import { Loader2, SearchX, Bookmark } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";

export function SearchEngine() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [mode, setMode] = useState<'search' | 'saved'>('search');
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const [itemsPerPage] = useState(12);

  const [showProfile, setShowProfile] = useState(false);
  const [currentToolName, setCurrentToolName] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<1 | 2 | 3 | 4>(3);
  const containerRef = useRef<HTMLDivElement>(null);

  // URL-based routing
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const toolSlug = params.get('tool');
    if (toolSlug) {
      // Convert slug back to tool name for querying
      const toolName = slugToName(toolSlug);
      setCurrentToolName(toolName);
    }
  }, []);

  const navigateToTool = (tool: Doc<"tools">) => {
    const toolSlug = createSlug(tool.name);
    setCurrentToolName(tool.name);
    const url = new URL(window.location.href);
    url.searchParams.set('tool', toolSlug);
    window.history.pushState({}, '', url.toString());
  };

  const navigateBack = () => {
    setCurrentToolName(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('tool');
    window.history.pushState({}, '', url.toString());
  };

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

  // Always use paginated search - no more "show all" mode
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
    { initialNumItems: itemsPerPage }
  );

  const currentPageResults = searchResults;

  const categories = useQuery(api.tools.getCategories);



  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };



  const handleViewToolPage = (tool: Doc<"tools">) => {
    navigateToTool(tool);
  };



  // Get current tool data when viewing a specific tool
  const currentTool = useQuery(
    api.tools.getToolByName,
    currentToolName ? { name: currentToolName } : "skip"
  );

  const handleShowProfile = () => {
    setShowProfile(true);
  };

  const showResults = true; // Always show results - either search results or all tools

  const getGridCols = () => {
    switch (viewMode) {
      case 1: return "grid-cols-1";
      case 2: return "grid-cols-1 lg:grid-cols-2";
      case 3: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      case 4: return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
      default: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    }
  };

  // Show individual tool page
  if (currentTool) {
    return (
      <ToolPage 
        toolId={currentTool._id}
        onBack={navigateBack}
      />
    );
  }

  // Show profile page with header toggle
  if (showProfile) {
    return (
      <div ref={containerRef} className="min-h-screen">
        <div className="fixed top-0 left-0 right-0 z-50">
          <Header
          mode={mode}
          onModeChange={(newMode) => {
            setMode(newMode);
            setShowProfile(false);
          }}
          onShowProfile={handleShowProfile}
        />
        </div>
        <div className="pt-16">
          <ProfilePage 
              onViewToolPage={handleViewToolPage}
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
              onShowProfile={handleShowProfile}
            />
      </div>
      
      {/* Add top padding to account for fixed header */}
      <div className="pt-16 pb-8">
        {mode === 'search' ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  <h2 className="text-2xl md:text-3xl font-bold">Discover Digital Tools</h2>
                  <p className="text-base md:text-lg text-muted-foreground">
                    Browse and search thousands of curated digital tools to find exactly what you need.
                  </p>
                </div>
              </motion.div>

              {/* Search Interface */}
              <div className="max-w-4xl mx-auto space-y-6">
                <SearchBar onSearch={handleSearch} />
                <CategoryFilter
                  categories={categories || []}
                  selectedCategory={selectedCategory}
                  onCategoryChange={handleCategoryChange}
                />
              </div>

              {/* Search Results */}
              {showResults && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Results Header */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      {!debouncedQuery.trim() && !selectedCategory ? (
                        <h3 className="text-lg font-semibold text-muted-foreground">
                          Browsing all tools
                        </h3>
                      ) : (
                        <h3 className="text-lg font-semibold text-muted-foreground">
                          {debouncedQuery.trim() ? `Search results for "${debouncedQuery}"` : `Tools in ${selectedCategory}`}
                        </h3>
                      )}
                    </div>
                    {/* View Toggle - Hidden on Mobile */}
                    <div className="hidden md:flex">
                      <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
                    </div>
                  </div>
                  <div className={`grid ${getGridCols()} gap-4 md:gap-6`}>
                    <AnimatePresence>
                      {currentPageResults?.map((tool, index) => (
                        <motion.div
                          key={tool._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <ToolCard tool={tool} onViewToolPage={handleViewToolPage} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {searchStatus === "LoadingFirstPage" && (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  )}

                  {searchStatus !== "LoadingFirstPage" && searchResults?.length === 0 && (
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

                  {/* Load More for search/category */}
                  {searchStatus !== "Exhausted" && searchResults && searchResults.length > 0 && (
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
          /* Saved Tools - Bookmarks Panel */
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
          >
            <BookmarksPanel onViewToolPage={handleViewToolPage} />
          </motion.div>
        )}


      </div>
    </div>
  );
}
