import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TagChipProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  variant?: 'default' | 'emotion' | 'activity';
}

export function TagChip({ label, isActive, onClick, variant = 'default' }: TagChipProps) {
  const handleClick = () => {
    if (navigator.vibrate) {
      navigator.vibrate(isActive ? 8 : 15);
    }
    onClick();
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      className={cn(
        'chip touch-target relative overflow-hidden',
        isActive && 'chip-active',
        variant === 'emotion' && isActive && 'bg-domain-emotional/20 text-domain-emotional border-domain-emotional/50',
        variant === 'activity' && isActive && 'bg-domain-motor/20 text-domain-motor border-domain-motor/50'
      )}
      whileTap={{ scale: 0.92 }}
      animate={isActive ? { scale: 1.02 } : { scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      layout
    >
      <motion.span
        className="inline-flex items-center gap-1"
        animate={{ x: isActive ? 2 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <motion.span
          initial={false}
          animate={{ 
            width: isActive ? 14 : 0, 
            opacity: isActive ? 1 : 0,
            marginRight: isActive ? 2 : 0,
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="inline-flex items-center overflow-hidden"
        >
          <Check className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.5} />
        </motion.span>
        {label}
      </motion.span>
    </motion.button>
  );
}

interface TagGroupProps {
  tags: readonly string[];
  activeTags: string[];
  onToggle: (tag: string) => void;
  variant?: 'default' | 'emotion' | 'activity';
}

export function TagGroup({ tags, activeTags, onToggle, variant = 'default' }: TagGroupProps) {
  return (
    <motion.div className="flex flex-wrap gap-2" layout>
      {tags.map((tag, index) => (
        <motion.div
          key={tag}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.02, duration: 0.2 }}
        >
          <TagChip
            label={tag}
            isActive={activeTags.includes(tag)}
            onClick={() => onToggle(tag)}
            variant={variant}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
