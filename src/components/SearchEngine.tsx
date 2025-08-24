import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePaginatedQuery, useQuery, useMutation } from "convex/react";
import { useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { createSlug, slugToName } from "../lib/utils";
import { useScrollToTopManual } from "../hooks/useScrollToTop";
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

  const [mode, setMode] = useState<'search' | 'saved'>('search');
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSearchSticky, setIsSearchSticky] = useState(true);

  const [itemsPerPage] = useState(12);

  const [showProfile, setShowProfile] = useState(false);
  const [currentToolName, setCurrentToolName] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<1 | 2 | 3 | 4>(3);
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const scrollToTop = useScrollToTopManual();
  const navigate = useNavigate();

  // URL-based routing with proper browser history handling
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const toolSlug = params.get('tool');
    const queryParam = params.get('q');
    
    if (toolSlug) {
      // Convert slug back to tool name for querying
      const toolName = slugToName(toolSlug);
      setCurrentToolName(toolName);
    } else {
      setCurrentToolName(null);
    }
    
    // Set search query from URL parameter for SEO
    if (queryParam && queryParam !== searchQuery) {
      setSearchQuery(queryParam);
    }
  }, []);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const toolSlug = params.get('tool');
      const queryParam = params.get('q');
      
      if (toolSlug) {
        const toolName = slugToName(toolSlug);
        setCurrentToolName(toolName);
      } else {
        setCurrentToolName(null);
      }
      
      // Update search query from URL parameter
      if (queryParam !== searchQuery) {
        setSearchQuery(queryParam || '');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [searchQuery]);

  const navigateToTool = (tool: Doc<"tools">) => {
    const toolSlug = createSlug(tool.name);
    setCurrentToolName(tool.name);
    const url = new URL(window.location.href);
    url.searchParams.set('tool', toolSlug);
    window.history.pushState({}, '', url.toString());
    scrollToTop();
  };

  const navigateBack = () => {
    // Use browser's native back functionality to ensure it works
    // regardless of routing setup
    window.history.back();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);



  // Set sticky state based on mode
  useEffect(() => {
    if (mode === 'search') {
      setIsSearchSticky(true);
    } else {
      setIsSearchSticky(false);
    }
  }, [mode]);



  // Scroll to top only when mode changes or profile is shown
  // Note: We don't want to scroll when loading more results
  useEffect(() => {
    scrollToTop();
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
    },
    { initialNumItems: itemsPerPage }
  );

  const currentPageResults = searchResults;

  const logSearch = useMutation(api.tools.logSearch);

  // Log search when results are available
  useEffect(() => {
    if (debouncedQuery.trim() && searchResults && (searchStatus === "CanLoadMore" || searchStatus === "Exhausted")) {
      logSearch({
        query: debouncedQuery.trim(),
        resultsCount: searchResults.length
      }).catch(error => {
        console.error('Failed to log search:', error);
      });
    }
  }, [debouncedQuery, searchResults, searchStatus, logSearch]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);



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
    scrollToTop();
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
      
      {/* Sticky Search Bar - Always visible in search mode */}
      {mode === 'search' && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-background/95 backdrop-blur-md shadow-lg">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="space-y-4">
              <SearchBar onSearch={handleSearch} initialQuery={searchQuery} />
              <CategoryFilter
                onSearch={handleSearch}
                currentSearchQuery={searchQuery}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Add top padding to account for fixed header and sticky search */}
      <div 
        className={`pb-8 ${
          mode === 'search' ? 'pt-40' : 'pt-0'
        }`}
      >
        {mode === 'search' ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Dynamic Hero Section - Shrinks when searching */}
              <motion.div 
                ref={heroRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  height: debouncedQuery.trim() ? 'auto' : 'auto'
                }}
                transition={{ duration: 0.5 }}
                className={`text-center transition-all duration-500 ease-in-out ${
                  debouncedQuery.trim() ? 'py-4' : 'py-8'
                }`}
              >
                <motion.div 
                  animate={{
                    scale: debouncedQuery.trim() ? 0.9 : 1,
                    opacity: debouncedQuery.trim() ? 0.8 : 1
                  }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="max-w-2xl mx-auto space-y-4"
                >
                  {/* Removed: Discover Digital Tools heading and subtitle */}
                </motion.div>
              </motion.div>



              {/* Search Results - Expands smoothly when searching */}
              <AnimatePresence>
                {showResults && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      marginTop: debouncedQuery.trim() ? '0rem' : '0rem'
                    }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ 
                      duration: 0.4, 
                      ease: "easeOut",
                      delay: debouncedQuery.trim() ? 0.1 : 0
                    }}
                    className="space-y-2"
                  >
                  {/* View Toggle - Hidden on Mobile */}
                  <div className="hidden md:flex justify-end">
                    <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
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

                  {/* Load More for search/category - only show when there are results and not exhausted */}
                  {searchStatus !== "Exhausted" && searchResults && searchResults.length > 0 && searchStatus !== "LoadingFirstPage" && (
                    <div className="flex justify-center mt-16">
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
              </AnimatePresence>
            </motion.div>
          </div>
        ) : (
          /* Saved Tools - Bookmarks Panel */
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0"
          >
            <BookmarksPanel onViewToolPage={handleViewToolPage} />
          </motion.div>
        )}


      </div>
    </div>
  );
}
