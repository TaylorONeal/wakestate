import { motion } from 'framer-motion';
import { Zap, Moon } from 'lucide-react';

interface EventTypeSelectorProps {
  onSelectCataplexy: () => void;
  onSelectNap: () => void;
}

export function EventTypeSelector({ onSelectCataplexy, onSelectNap }: EventTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground text-center mb-6">
        What would you like to log?
      </h2>

      <div className="grid grid-cols-1 gap-4">
        {/* Cataplexy Card */}
        <motion.button
          onClick={onSelectCataplexy}
          className="relative p-6 rounded-2xl bg-gradient-to-br from-domain-cataplexy/20 to-domain-cataplexy/10 border-2 border-domain-cataplexy/30 text-left transition-all hover:border-domain-cataplexy/50 hover:shadow-lg hover:shadow-domain-cataplexy/10"
          whileTap={{ scale: 0.98 }}
          whileHover={{ scale: 1.01 }}
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-domain-cataplexy/20 flex items-center justify-center flex-shrink-0">
              <Zap className="w-7 h-7 text-domain-cataplexy" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-foreground mb-1">Cataplexy</h3>
              <p className="text-sm text-muted-foreground">
                Log muscle weakness triggered by emotions
              </p>
            </div>
          </div>
        </motion.button>

        {/* Nap Card */}
        <motion.button
          onClick={onSelectNap}
          className="relative p-6 rounded-2xl bg-gradient-to-br from-domain-sleep-pressure/20 to-domain-sleep-pressure/10 border-2 border-domain-sleep-pressure/30 text-left transition-all hover:border-domain-sleep-pressure/50 hover:shadow-lg hover:shadow-domain-sleep-pressure/10"
          whileTap={{ scale: 0.98 }}
          whileHover={{ scale: 1.01 }}
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-domain-sleep-pressure/20 flex items-center justify-center flex-shrink-0">
              <Moon className="w-7 h-7 text-domain-sleep-pressure" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-foreground mb-1">Nap</h3>
              <p className="text-sm text-muted-foreground">
                Log a planned or unplanned nap
              </p>
            </div>
          </div>
        </motion.button>
      </div>
    </div>
  );
}
