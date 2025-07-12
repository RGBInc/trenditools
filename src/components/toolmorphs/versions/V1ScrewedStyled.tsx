import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DoodleComponentProps } from '../doodleVersions';

export function V1ScrewedStyled({ debouncedQuery, selectedCategory }: DoodleComponentProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);

  // Periodic glitch effect
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 200);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const letterVariants = {
    initial: { 
      y: 0, 
      rotateX: 0, 
      scale: 1,
      color: '#ef4444' // red-500
    },
    hover: { 
      y: -8, 
      rotateX: 15, 
      scale: 1.1,
      color: '#dc2626', // red-600
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 10
      }
    },
    glitch: {
      x: [0, -2, 2, -1, 1, 0],
      y: [0, 1, -1, 0],
      skewX: [0, -5, 5, 0],
      filter: [
        'hue-rotate(0deg)',
        'hue-rotate(90deg)',
        'hue-rotate(180deg)',
        'hue-rotate(0deg)'
      ],
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };

  const containerVariants = {
    initial: {},
    hover: {
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const screwedLetters = "SCREWED".split("");

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate={isHovered ? "hover" : "initial"}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="cursor-pointer select-none"
      >
        <motion.h2 
          animate={{
            fontSize: debouncedQuery.trim() || selectedCategory ? '1.5rem' : '1.875rem'
          }}
          transition={{ duration: 0.4 }}
          className="font-bold md:text-3xl flex items-center justify-center gap-1 relative"
        >
          {/* Glitch background effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-red-500/20 blur-xl"
            animate={{
              opacity: glitchActive ? [0, 0.8, 0] : 0,
              scale: glitchActive ? [1, 1.2, 1] : 1
            }}
            transition={{ duration: 0.2 }}
          />
          
          {/* Main letters */}
          {screwedLetters.map((letter, index) => (
            <motion.span
              key={index}
              variants={letterVariants}
              animate={glitchActive ? "glitch" : undefined}
              className="inline-block font-black tracking-tight"
              style={{
                textShadow: isHovered 
                  ? '0 0 20px rgba(239, 68, 68, 0.5), 0 0 40px rgba(239, 68, 68, 0.3)'
                  : '0 2px 4px rgba(0, 0, 0, 0.1)',
                background: isHovered 
                  ? 'linear-gradient(45deg, #ef4444, #f97316, #ef4444)'
                  : '#ef4444',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: isHovered ? 'transparent' : '#ef4444',
                filter: glitchActive ? 'drop-shadow(0 0 10px #ef4444)' : 'none'
              }}
            >
              {letter}
            </motion.span>
          ))}
          
          {/* Floating question mark */}
          <motion.span
            animate={{
              y: [-2, 2, -2],
              rotate: [-5, 5, -5],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-orange-500 ml-1 font-light"
            style={{
              fontSize: '0.8em',
              textShadow: '0 0 10px rgba(249, 115, 22, 0.5)'
            }}
          >
            ?
          </motion.span>
        </motion.h2>
      </motion.div>
      
      <AnimatePresence>
        {!debouncedQuery.trim() && !selectedCategory && (
          <motion.p 
            initial={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="text-base md:text-lg text-muted-foreground relative"
          >
            <motion.span
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear"
              }}
              className="bg-gradient-to-r from-muted-foreground via-foreground to-muted-foreground bg-[length:200%_100%] bg-clip-text"
              style={{
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              But now you got the tools
            </motion.span>
            
            {/* Subtle sparkle effects */}
            <motion.span
              animate={{
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 1
              }}
              className="absolute -top-1 left-1/4 text-orange-400 text-xs"
            >
              ✨
            </motion.span>
            
            <motion.span
              animate={{
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 2.5
              }}
              className="absolute -bottom-1 right-1/3 text-red-400 text-xs"
            >
              ⚡
            </motion.span>
          </motion.p>
        )}
      </AnimatePresence>
    </>
  );
}