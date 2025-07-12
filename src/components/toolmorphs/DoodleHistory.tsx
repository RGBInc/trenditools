import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Eye, Tag, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAllDoodlesSorted, type DoodleVersion } from './doodleVersions';
import { DoodleManager } from './DoodleManager';

interface DoodleHistoryProps {
  onSelectVersion?: (version: string) => void;
  currentVersion?: string;
}

export function DoodleHistory({ onSelectVersion, currentVersion }: DoodleHistoryProps) {
  const [selectedDoodle, setSelectedDoodle] = useState<string | null>(null);
  const [previewVersion, setPreviewVersion] = useState<string | null>(null);
  const doodles = getAllDoodlesSorted();

  const handlePreview = (version: string) => {
    setPreviewVersion(version);
  };

  const handleSelect = (version: string) => {
    setSelectedDoodle(version);
    onSelectVersion?.(version);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2"
        >
          <Sparkles className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
            TrendiTools Doodles
          </h1>
          <Sparkles className="w-8 h-8 text-orange-500" />
        </motion.div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore the evolution of our hero section through interactive doodles. 
          Each version tells a story and captures a moment in our journey.
        </p>
      </div>

      {/* Preview Section */}
      <AnimatePresence>
        {previewVersion && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-br from-background to-muted/50 rounded-xl border p-8 relative overflow-hidden"
          >
            {/* Background decoration */}
            <div className="absolute inset-0 bg-grid-pattern opacity-5" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Preview</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setPreviewVersion(null)}
                >
                  Close Preview
                </Button>
              </div>
              
              <div className="min-h-[200px] flex items-center justify-center">
                <DoodleManager 
                  currentVersion={previewVersion}
                  debouncedQuery=""
                  selectedCategory={null}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Doodles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doodles.map((doodle, index) => (
          <motion.div
            key={doodle.version}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`h-full transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer ${
              doodle.isActive ? 'ring-2 ring-primary' : ''
            } ${
              currentVersion === doodle.version ? 'bg-primary/5' : ''
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {doodle.name}
                      {doodle.isActive && (
                        <Badge variant="default" className="text-xs">
                          Active
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {doodle.description}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs font-mono">
                    {doodle.version}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Release Date */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(doodle.releaseDate)}</span>
                </div>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {doodle.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview(doodle.version)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </Button>
                  
                  {!doodle.isActive && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleSelect(doodle.version)}
                      className="flex-1"
                    >
                      <Sparkles className="w-4 h-4 mr-1" />
                      Activate
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-sm text-muted-foreground"
      >
        <p>
          {doodles.length} doodle{doodles.length !== 1 ? 's' : ''} created • 
          Latest: {formatDate(doodles[0]?.releaseDate || '')}
        </p>
      </motion.div>
    </div>
  );
}

export default DoodleHistory;