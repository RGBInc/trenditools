import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatterProps {
  className?: string;
}

const chatterMessages = [
  "Screwed? But now you got the tools",
  "Building something amazing today?",
  "Tools make everything possible",
  "Ready to fix the world?",
  "Every problem has a solution",
  "Creativity meets functionality",
  "Making the impossible possible",
  "Your next breakthrough awaits",
  "Innovation starts here",
  "Tools for the modern creator",
  "Fixing one problem at a time",
  "Where ideas become reality",
  "The right tool changes everything",
  "Building tomorrow, today",
  "Solutions at your fingertips",
  "Craft your digital masterpiece",
  "Every creator needs their toolkit",
  "Transform ideas into action",
  "The perfect tool is waiting",
  "Build, create, innovate, repeat",
  "Your vision deserves the best tools",
  "Making magic with technology",
  "From concept to creation",
  "Tools that spark inspiration",
  "Unleash your creative potential",
  "Digital craftsmanship at its finest",
  "Where productivity meets passion",
  "Empowering creators worldwide",
  "The future is in your hands",
  "Create without limits",
  "Tools that understand your vision",
  "Bringing dreams to digital life",
  "Your creative journey starts here",
  "Innovation meets intuition",
  "Crafting the extraordinary"
];

export function Chatter({ className = '' }: ChatterProps) {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [messageHistory, setMessageHistory] = useState<string[]>([]);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const message = chatterMessages[currentMessage];
    setIsTyping(true);
    setDisplayText('');
    
    // Typing animation
    let index = 0;
    const typingInterval = setInterval(() => {
      if (index <= message.length) {
        setDisplayText(message.slice(0, index));
        index++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
        
        // Add to history
        setMessageHistory(prev => {
          const newHistory = [...prev, message];
          // Keep only last 10 messages
          return newHistory.slice(-10);
        });
        
        // Wait before next message
        setTimeout(() => {
          setCurrentMessage((prev) => (prev + 1) % chatterMessages.length);
        }, 2000);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, [currentMessage]);

  return (
    <div className={`relative flex items-center ${className}`}>
      <div className="relative overflow-hidden h-6 flex items-center w-full max-w-[200px] sm:max-w-xs">
        <motion.div
          className="text-xs sm:text-sm text-muted-foreground font-normal whitespace-nowrap"
          initial={{ opacity: 0, x: 30 }}
          animate={{ 
            opacity: 1, 
            x: 0,
            // Subtle floating effect
            y: [0, -1, 0]
          }}
          transition={{ 
            duration: 0.5,
            y: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
        >
          {displayText}
          {isTyping && (
            <motion.span
              className="inline-block w-0.5 h-3 sm:h-4 bg-primary ml-1"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          )}
        </motion.div>
      </div>
      
      {/* Subtle connecting line effect */}
      <motion.div 
        className="w-3 sm:w-4 h-px bg-gradient-to-r from-muted-foreground/30 to-transparent"
        animate={{ 
          opacity: [0.3, 0.7, 0.3],
          scaleX: [0.8, 1, 0.8]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
}

// Hook to access chatter history
export function useChatterHistory() {
  const [history, setHistory] = useState<string[]>([]);
  
  // This would be connected to a global state or context in a real implementation
  return history;
}