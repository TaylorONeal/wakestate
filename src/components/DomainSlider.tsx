import { motion, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DomainConfig } from '@/types';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DomainSliderProps {
  domainKey: string;
  config: DomainConfig;
  value: number;
  onChange: (value: number) => void;
}

const colorMap: Record<string, string> = {
  'domain-cataplexy': 'bg-domain-cataplexy',
  'domain-microsleeps': 'bg-domain-microsleeps',
  'domain-cognitive': 'bg-domain-cognitive',
  'domain-effort': 'bg-domain-effort',
  'domain-sleep-pressure': 'bg-domain-sleep-pressure',
  'domain-motor': 'bg-domain-motor',
  'domain-sensory': 'bg-domain-sensory',
  'domain-thermo': 'bg-domain-thermo',
  'domain-emotional': 'bg-domain-emotional',
  'domain-anxiety': 'bg-domain-anxiety',
  'domain-mood': 'bg-domain-mood',
  'domain-digestive': 'bg-domain-digestive',
};

const borderColorMap: Record<string, string> = {
  'domain-cataplexy': 'border-domain-cataplexy/50',
  'domain-microsleeps': 'border-domain-microsleeps/50',
  'domain-cognitive': 'border-domain-cognitive/50',
  'domain-effort': 'border-domain-effort/50',
  'domain-sleep-pressure': 'border-domain-sleep-pressure/50',
  'domain-motor': 'border-domain-motor/50',
  'domain-sensory': 'border-domain-sensory/50',
  'domain-thermo': 'border-domain-thermo/50',
  'domain-emotional': 'border-domain-emotional/50',
  'domain-anxiety': 'border-domain-anxiety/50',
  'domain-mood': 'border-domain-mood/50',
  'domain-digestive': 'border-domain-digestive/50',
};

export function DomainSlider({ domainKey, config, value, onChange }: DomainSliderProps) {
  const percentage = ((value - 1) / 4) * 100;
  const bgColor = colorMap[config.color] || 'bg-primary';
  const borderColor = borderColorMap[config.color] || 'border-primary/50';

  const getAnchorText = (val: number): string => {
    if (val <= 1.5) return config.anchors[1];
    if (val <= 3.5) return config.anchors[3];
    return config.anchors[5];
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    onChange(newValue);
    
    // Trigger haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <label className="text-sm font-medium text-foreground/90">
            {config.label}
          </label>
          {config.description && (
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="p-0.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-surface-3 transition-colors"
                  aria-label={`Info about ${config.label}`}
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </PopoverTrigger>
              <PopoverContent 
                side="top" 
                className="w-72 text-sm bg-popover border-border z-50"
                sideOffset={8}
              >
                <p className="text-foreground/90">{config.description}</p>
              </PopoverContent>
            </Popover>
          )}
        </div>
        <AnimatePresence mode="wait">
          <motion.span
            key={value}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="text-xs text-muted-foreground min-w-[100px] text-right"
          >
            {getAnchorText(value)}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className={cn('relative h-14 rounded-xl overflow-hidden bg-surface-2 border', borderColor)}>
        {/* Filled Track */}
        <motion.div
          className={cn('absolute inset-y-0 left-0 rounded-xl', bgColor)}
          style={{ opacity: 0.15 + (value / 5) * 0.6 }}
          initial={false}
          animate={{ width: `${percentage}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />

        {/* Value Indicators */}
        <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
          {[1, 2, 3, 4, 5].map((num) => (
            <motion.div
              key={num}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200',
                num <= value
                  ? cn('text-background', bgColor)
                  : 'bg-surface-3/50 text-muted-foreground'
              )}
              animate={{
                scale: num === value ? 1.15 : 1,
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              {num}
            </motion.div>
          ))}
        </div>

        {/* Hidden Range Input */}
        <input
          type="range"
          min={1}
          max={5}
          value={value}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer touch-target"
          aria-label={config.label}
        />
      </div>
    </div>
  );
}
