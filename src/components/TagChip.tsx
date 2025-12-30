import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TagChipProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  variant?: 'default' | 'emotion' | 'activity';
}

export function TagChip({ label, isActive, onClick, variant = 'default' }: TagChipProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={cn(
        'chip touch-target',
        isActive && 'chip-active',
        variant === 'emotion' && isActive && 'bg-domain-emotional/20 text-domain-emotional border-domain-emotional/50',
        variant === 'activity' && isActive && 'bg-domain-motor/20 text-domain-motor border-domain-motor/50'
      )}
      whileTap={{ scale: 0.95 }}
      animate={isActive ? { scale: 1.02 } : { scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {label}
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
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <TagChip
          key={tag}
          label={tag}
          isActive={activeTags.includes(tag)}
          onClick={() => onToggle(tag)}
          variant={variant}
        />
      ))}
    </div>
  );
}
