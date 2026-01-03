import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SaveType, LogType } from '@/hooks/useSaveConfirmation';

interface SaveConfirmationProps {
  isVisible: boolean;
  saveType: SaveType;
  logType: LogType;
}

// Check for reduced motion preference
const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export function SaveConfirmation({ isVisible, saveType, logType }: SaveConfirmationProps) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(prefersReducedMotion());
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const isNew = saveType === 'new';
  const isSleep = logType === 'sleep';
  const isMedication = logType === 'medication';
  
  // Color based on log type
  const primaryColor = isSleep 
    ? 'hsl(250, 60%, 65%)' // soft purple/blue for sleep
    : isMedication
    ? 'hsl(45, 90%, 55%)' // warm gold/yellow for meds
    : 'hsl(145, 55%, 55%)'; // soft green for wake
  
  const secondaryColor = isSleep
    ? 'hsl(250, 50%, 75%)'
    : isMedication
    ? 'hsl(45, 80%, 65%)'
    : 'hsl(145, 45%, 65%)';

  // Text/icon varies by save type and log type
  const displayText = isMedication ? '⚡' : (isNew ? 'ZZzzz' : 'zz');
  
  // Animation durations - satisfying timing with ASMR-like fade
  const textDuration = isNew ? 1.1 : 0.8;
  const cloudDuration = isNew ? 0.9 : 0.6;
  const textDelay = 0;
  const cloudDelay = isNew ? 0.15 : 0.1;

  if (reducedMotion) {
    // Simple fade + checkmark for reduced motion
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke={primaryColor}
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span 
                className="text-sm font-medium"
                style={{ color: primaryColor }}
              >
                Saved
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* ZZzzz Text */}
          <motion.span
            className="absolute text-3xl font-bold select-none"
            style={{ 
              color: primaryColor,
              textShadow: `0 0 20px ${primaryColor}40`,
              fontSize: isNew ? '2rem' : '1.25rem',
              opacity: isNew ? 1 : 0.8,
            }}
            initial={{ 
              y: 20, 
              opacity: 0, 
              scale: 0.8,
            }}
            animate={{ 
              y: isNew ? -30 : -15,
              opacity: [0, 1, 1, 0.8, 0],
              scale: 1,
            }}
            transition={{ 
              duration: textDuration,
              delay: textDelay,
              ease: [0.25, 0.46, 0.45, 0.94], // smooth easing
              opacity: {
                times: [0, 0.15, 0.5, 0.75, 1],
                duration: textDuration,
                ease: 'easeOut',
              }
            }}
          >
            {displayText}
          </motion.span>

          {/* Cloud Poof */}
          <motion.div
            className="absolute rounded-full"
            style={{
              background: `radial-gradient(circle, ${primaryColor}30 0%, ${secondaryColor}15 50%, transparent 70%)`,
              width: isNew ? 120 : 60,
              height: isNew ? 80 : 40,
            }}
            initial={{ 
              scale: 0.3, 
              opacity: 0,
            }}
            animate={{ 
              scale: isNew ? [0.3, 1.2, 1.4] : [0.5, 0.9, 1.0],
              opacity: [0, isNew ? 0.5 : 0.25, isNew ? 0.3 : 0.15, 0],
            }}
            transition={{ 
              duration: cloudDuration,
              delay: cloudDelay,
              ease: [0.25, 0.46, 0.45, 0.94],
              opacity: {
                times: [0, 0.3, 0.6, 1],
                ease: 'easeOut',
              }
            }}
          />

          {/* Additional sparkle particles for new saves */}
          {isNew && (
            <>
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: primaryColor }}
                  initial={{ 
                    x: 0, 
                    y: 0, 
                    opacity: 0, 
                    scale: 0 
                  }}
                  animate={{
                    x: [0, (i % 2 === 0 ? 1 : -1) * (20 + i * 10)],
                    y: [0, -20 - i * 8],
                    opacity: [0, 0.7, 0.4, 0],
                    scale: [0, 1, 0.6],
                  }}
                  transition={{
                    duration: 0.9,
                    delay: 0.2 + i * 0.08,
                    ease: [0.25, 0.46, 0.45, 0.94],
                    opacity: { times: [0, 0.2, 0.6, 1] },
                  }}
                />
              ))}
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}