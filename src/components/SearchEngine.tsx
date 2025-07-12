import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePaginatedQuery, useQuery } from "convex/react";
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
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [mode, setMode] = useState<'search' | 'saved'>('search');
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSearchSticky, setIsSearchSticky] = useState(false);

  const [itemsPerPage] = useState(12);

  const [showProfile, setShowProfile] = useState(false);
  const [currentToolName, setCurrentToolName] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<1 | 2 | 3 | 4>(3);
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const scrollToTop = useScrollToTopManual();

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
    scrollToTop();
  };

  const navigateBack = () => {
    setCurrentToolName(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('tool');
    window.history.pushState({}, '', url.toString());
    scrollToTop();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Scroll detection for sticky search bar
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current && mode === 'search') {
        const heroBottom = heroRef.current.offsetTop + heroRef.current.offsetHeight;
        const scrollPosition = window.scrollY + 80; // Account for header height
        
        setIsSearchSticky(scrollPosition > heroBottom);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mode, debouncedQuery, selectedCategory]);



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
      category: selectedCategory || undefined,
    },
    { initialNumItems: itemsPerPage }
  );

  const currentPageResults = searchResults;

  const categories = useQuery(api.tools.getCategories);



  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
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
      
      {/* Sticky Search Bar - Appears when scrolling */}
      <AnimatePresence>
        {isSearchSticky && mode === 'search' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ 
              duration: 0.3, 
              ease: "easeOut",
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
            className="fixed top-16 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/50 shadow-lg"
          >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="space-y-4"
              >
                <SearchBar onSearch={handleSearch} initialQuery={searchQuery} />
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <CategoryFilter
                    categories={categories || []}
                    selectedCategory={selectedCategory}
                    onCategoryChange={handleCategoryChange}
                  />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Add top padding to account for fixed header and sticky search */}
      <motion.div 
        animate={{
          paddingTop: isSearchSticky && mode === 'search' ? '10rem' : '4rem'
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="pb-8"
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
                  height: debouncedQuery.trim() || selectedCategory ? 'auto' : 'auto'
                }}
                transition={{ duration: 0.5 }}
                className={`text-center transition-all duration-500 ease-in-out ${
                  debouncedQuery.trim() || selectedCategory ? 'py-4' : 'py-8'
                }`}
              >
                <motion.div 
                  animate={{
                    scale: debouncedQuery.trim() || selectedCategory ? 0.9 : 1,
                    opacity: debouncedQuery.trim() || selectedCategory ? 0.8 : 1
                  }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="max-w-2xl mx-auto space-y-4"
                >
                  <motion.h2 
                    animate={{
                      fontSize: debouncedQuery.trim() || selectedCategory ? '1.25rem' : '1.5rem'
                    }}
                    transition={{ duration: 0.4 }}
                    className="text-xl font-bold md:text-3xl"
                  >
                    Discover Digital Tools
                  </motion.h2>
                  <AnimatePresence>
                    {!debouncedQuery.trim() && !selectedCategory && (
                      <motion.p 
                        initial={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-sm md:text-lg text-muted-foreground"
                      >
                        Browse and search thousands of curated digital tools
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>

              {/* Search Interface - Becomes more prominent when active */}
              <motion.div 
                animate={{
                  marginTop: debouncedQuery.trim() || selectedCategory ? '0rem' : '0rem',
                  marginBottom: debouncedQuery.trim() || selectedCategory ? '1.5rem' : '2rem'
                }}
                transition={{ duration: 0.4 }}
                className="max-w-4xl mx-auto space-y-6"
              >
                <motion.div
                  animate={{
                    scale: debouncedQuery.trim() || selectedCategory ? 1.02 : 1
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <SearchBar onSearch={handleSearch} initialQuery={searchQuery} />
                </motion.div>
                <motion.div
                  animate={{
                    opacity: debouncedQuery.trim() || selectedCategory ? 1 : 0.8
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <CategoryFilter
                    categories={categories || []}
                    selectedCategory={selectedCategory}
                    onCategoryChange={handleCategoryChange}
                  />
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
                      marginTop: debouncedQuery.trim() || selectedCategory ? '0rem' : '1rem'
                    }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ 
                      duration: 0.4, 
                      ease: "easeOut",
                      delay: debouncedQuery.trim() || selectedCategory ? 0.1 : 0
                    }}
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
              </AnimatePresence>
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


      </motion.div>
    </div>
  );
}
