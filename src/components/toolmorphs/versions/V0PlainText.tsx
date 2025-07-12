import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DoodleComponentProps } from '../doodleVersions';

export function V0PlainText({ debouncedQuery, selectedCategory }: DoodleComponentProps) {
  return (
    <>
      <motion.h2 
        animate={{
          fontSize: debouncedQuery.trim() || selectedCategory ? '1.5rem' : '1.875rem'
        }}
        transition={{ duration: 0.4 }}
        className="font-bold md:text-3xl text-foreground"
      >
        Discover Digital Tools
      </motion.h2>
      <AnimatePresence>
        {!debouncedQuery.trim() && !selectedCategory && (
          <motion.p 
            initial={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="text-base md:text-lg text-muted-foreground"
          >
            Browse and search thousands of curated digital tools
          </motion.p>
        )}
      </AnimatePresence>
    </>
  );
}