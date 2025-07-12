import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { doodleVersions, type DoodleVersion } from './doodleVersions';

interface DoodleManagerProps {
  currentVersion?: string;
  debouncedQuery: string;
  selectedCategory: string | null;
}

export function DoodleManager({ 
  currentVersion = 'v1', 
  debouncedQuery, 
  selectedCategory 
}: DoodleManagerProps) {
  const [currentDoodle, setCurrentDoodle] = useState<DoodleVersion | null>(null);

  useEffect(() => {
    const doodle = doodleVersions.find(d => d.version === currentVersion);
    setCurrentDoodle(doodle || doodleVersions[0]);
  }, [currentVersion]);

  if (!currentDoodle) return null;

  const DoodleComponent = currentDoodle.component;

  return (
    <motion.div 
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
        <DoodleComponent 
          debouncedQuery={debouncedQuery}
          selectedCategory={selectedCategory}
        />
      </motion.div>
    </motion.div>
  );
}

export default DoodleManager;