import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { V0PlainText } from './versions/V0PlainText';
import { V1ScrewedStyled } from './versions/V1ScrewedStyled';

export interface DoodleComponentProps {
  debouncedQuery: string;
  selectedCategory: string | null;
}

export interface DoodleVersion {
  version: string;
  name: string;
  description: string;
  releaseDate: string;
  component: React.ComponentType<DoodleComponentProps>;
  isActive: boolean;
  tags: string[];
}

export const doodleVersions: DoodleVersion[] = [
  {
    version: 'v0',
    name: 'Plain Text Foundation',
    description: 'The original simple text version',
    releaseDate: '2024-01-15',
    component: V0PlainText,
    isActive: false,
    tags: ['foundation', 'simple', 'classic']
  },
  {
    version: 'v1',
    name: 'Screwed - The Awakening',
    description: 'Interactive and animated "Screwed" with modern styling and continuous animations',
    releaseDate: '2024-01-16',
    component: V1ScrewedStyled,
    isActive: true,
    tags: ['animated', 'interactive', 'modern', 'flagship']
  }
];

// Helper function to get current active doodle
export const getCurrentDoodle = (): DoodleVersion => {
  return doodleVersions.find(d => d.isActive) || doodleVersions[0];
};

// Helper function to get doodle by version
export const getDoodleByVersion = (version: string): DoodleVersion | undefined => {
  return doodleVersions.find(d => d.version === version);
};

// Helper function to get all doodles sorted by release date
export const getAllDoodlesSorted = (): DoodleVersion[] => {
  return [...doodleVersions].sort((a, b) => 
    new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
  );
};