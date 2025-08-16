import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { ArrowLeft, ExternalLink, Bookmark, BookmarkCheck, Calendar, Globe, ImageIcon, Wrench } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import SEOToolStructuredData from "./SEOToolStructuredData";
import { useNavigate } from "react-router-dom";


interface ToolPageProps {
  toolId: Id<"tools">;
  onBack: () => void;
}

export function ToolPage({ toolId, onBack }: ToolPageProps) {
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const tool = useQuery(api.tools.getTool, { id: toolId });
  const navigate = useNavigate();

  const handleLogoClick = () => {
    void navigate('/');
  };

  // Preload image for faster loading
  useEffect(() => {
    if (tool?.screenshot) {
      setImageError(false);
      setImageLoading(true);
      
      // Preload the image
      const img = new Image();
      img.onload = () => {
        setImageLoading(false);
        setImageError(false);
      };
      img.onerror = () => {
        setImageLoading(false);
        setImageError(true);
      };
      img.src = tool.screenshot;
    }
  }, [tool?.screenshot]);
  const user = useQuery(api.users.get);
  const userBookmarks = useQuery(api.users.getBookmarks);
  const bookmarkTool = useMutation(api.users.addBookmark);
  const unbookmarkTool = useMutation(api.users.removeBookmark);

  const isBookmarked = userBookmarks && userBookmarks.includes(toolId);

  useEffect(() => {
    if (tool) {
      document.title = `${tool.name} - TrendiTools`;
    }
    return () => {
      document.title = "TrendiTools";
    };
  }, [tool]);

  const handleBookmark = async () => {
    if (!user) {
      toast.error("Please sign in to bookmark tools");
      return;
    }

    setIsBookmarking(true);
    try {
      if (isBookmarked) {
        await unbookmarkTool({ toolId });
        toast.success("Removed from bookmarks");
      } else {
        await bookmarkTool({ toolId });
        toast.success("Added to bookmarks");
      }
    } catch (error) {
      toast.error("Failed to update bookmark");
    } finally {
      setIsBookmarking(false);
    }
  };

  const handleVisit = () => {
    if (tool) {
      window.open(tool.url, '_blank', 'noopener,noreferrer');
    }
  };

  if (!tool) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading tool...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* SEO Structured Data */}
      <SEOToolStructuredData tool={tool as any} />
      
      {/* Fixed Header - Always visible */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={onBack}
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to tools</span>
            </Button>
            
            {/* Logo */}
            <button
              onClick={handleLogoClick}
              className="cursor-pointer hover:opacity-80 transition-opacity"
            >
              <Wrench className="w-6 h-6 text-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content with top padding to account for fixed header */}
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">{tool.name}</h1>
                  <p className="text-lg text-muted-foreground mb-4">{tool.tagline}</p>
                  <div className="flex items-center space-x-4">
                    {tool.category && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                        {tool.category}
                      </span>
                    )}
                    {tool._creationTime && (
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Added {new Date(tool._creationTime).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <Button
                  onClick={handleVisit}
                  size="lg"
                  className="flex items-center space-x-2"
                >
                  <Globe className="w-4 h-4" />
                  <span>Visit Website</span>
                  <ExternalLink className="w-4 h-4" />
                </Button>
                {user && (
                  <Button
                    variant="outline"
                    onClick={() => void handleBookmark()}
                    disabled={isBookmarking}
                    className="flex items-center space-x-2"
                  >
                    {isBookmarked ? (
                      <BookmarkCheck className="w-4 h-4" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                    <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Screenshot */}
            <div className="rounded-xl overflow-hidden bg-muted aspect-video relative">
              {tool.screenshot ? (
                <>
                  {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
                      <div className="animate-pulse flex flex-col items-center space-y-2">
                        <ImageIcon className="w-12 h-12 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Loading preview...</span>
                      </div>
                    </div>
                  )}
                  <img
                    src={tool.screenshot}
                    alt={`${tool.name} screenshot`}
                    className={`w-full h-full object-cover transition-all duration-500 ${
                      imageLoading ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
                    }`}
                    loading="eager"
                    decoding="async"
                  />
                  {imageError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted text-muted-foreground">
                      <ImageIcon className="w-16 h-16 mb-2 opacity-50" />
                      <p className="text-sm">Failed to load preview</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted text-muted-foreground">
                  <ImageIcon className="w-16 h-16 mb-2 opacity-50" />
                  <p className="text-sm">No preview available</p>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">About {tool.name}</h2>
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  {tool.summary || 'No description available.'}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-card rounded-xl p-6 space-y-4">
              <h3 className="font-semibold">Tool Information</h3>
              <div className="space-y-3">
                {tool.category && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Category</label>
                    <p className="text-sm">{tool.category}</p>
                  </div>
                )}
                {tool.tags && tool.tags.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tags</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {tool.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {tool.url && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Website</label>
                    <a 
                      href={tool.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline block truncate"
                    >
                      {new URL(tool.url).hostname}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}