import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Trash2, Check } from 'lucide-react';

interface SlideToConfirmProps {
  onConfirm: () => void;
  label?: string;
}

export function SlideToConfirm({ onConfirm, label = "Slide to confirm" }: SlideToConfirmProps) {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [trackWidth, setTrackWidth] = useState(0);
  
  const thumbSize = 56;
  const threshold = 0.85;
  
  useEffect(() => {
    if (constraintsRef.current) {
      setTrackWidth(constraintsRef.current.getBoundingClientRect().width);
    }
  }, []);
  
  const background = useTransform(
    x,
    [0, trackWidth - thumbSize],
    ['hsl(var(--destructive) / 0.1)', 'hsl(var(--destructive) / 0.3)']
  );
  
  const textOpacity = useTransform(
    x,
    [0, (trackWidth - thumbSize) * 0.5],
    [1, 0]
  );

  const handleDragEnd = () => {
    const currentX = x.get();
    const maxX = trackWidth - thumbSize;
    
    if (currentX >= maxX * threshold) {
      animate(x, maxX, { type: 'spring', stiffness: 400, damping: 30 });
      setIsConfirmed(true);
      setTimeout(onConfirm, 300);
    } else {
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 30 });
    }
  };

  return (
    <motion.div
      ref={constraintsRef}
      style={{ background }}
      className="relative h-14 rounded-full border-2 border-destructive/30 overflow-hidden"
    >
      {/* Label */}
      <motion.div 
        style={{ opacity: textOpacity }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <span className="text-sm font-medium text-destructive/70 pl-14">
          {label}
        </span>
      </motion.div>

      {/* Thumb */}
      <motion.div
        drag="x"
        dragConstraints={constraintsRef}
        dragElastic={0}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className={`
          absolute top-1 left-1 w-12 h-12 rounded-full 
          flex items-center justify-center cursor-grab active:cursor-grabbing
          ${isConfirmed 
            ? 'bg-destructive' 
            : 'bg-destructive/80 hover:bg-destructive'
          }
          transition-colors shadow-lg
        `}
        whileTap={{ scale: 0.95 }}
      >
        {isConfirmed ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <Check className="w-6 h-6 text-destructive-foreground" />
          </motion.div>
        ) : (
          <Trash2 className="w-5 h-5 text-destructive-foreground" />
        )}
      </motion.div>

      {/* Confirmed state */}
      {isConfirmed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="text-sm font-medium text-destructive">💨 poof!</span>
        </motion.div>
      )}
    </motion.div>
  );
}
