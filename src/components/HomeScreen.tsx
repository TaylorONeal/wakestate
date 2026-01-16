import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Brain, Activity, TrendingUp, Info, X, Moon, BedDouble, Shield } from 'lucide-react';
import { NARCOLEPSY_DOMAIN_CONFIG, OVERLAPPING_DOMAIN_CONFIG } from '@/types';
import { MedicationsToday } from '@/components/MedicationsToday';
import { InstallBanner } from '@/components/InstallBanner';
import { getSleepEntryForDate } from '@/lib/storage';
import { format, subDays } from 'date-fns';

interface HomeScreenProps {
  onLogWakeState: () => void;
  onLogEvent: () => void;
  onLogSleep: () => void;
  onMedicationSetup: () => void;
  checkInCount: number;
  eventCount: number;
  refreshTrigger?: number;
}

const simonButtonVariants = {
  idle: { scale: 1 },
  pressed: {
    scale: 0.92,
    transition: { type: 'spring' as const, stiffness: 600, damping: 15 }
  },
  glow: {
    boxShadow: [
      '0 0 20px 0px currentColor',
      '0 0 40px 10px currentColor',
      '0 0 20px 0px currentColor'
    ],
    transition: { duration: 0.3 }
  }
};

export function HomeScreen({ onLogWakeState, onLogEvent, onLogSleep, onMedicationSetup, checkInCount, eventCount, refreshTrigger }: HomeScreenProps) {
  const [showLegend, setShowLegend] = useState(false);
  const [pressedButton, setPressedButton] = useState<string | null>(null);
  const [hasSleepLoggedToday, setHasSleepLoggedToday] = useState(false);

  // Check if sleep was logged for last night
  useEffect(() => {
    const checkSleepLog = async () => {
      const lastNight = format(subDays(new Date(), 1), 'yyyy-MM-dd');
      const entry = await getSleepEntryForDate(lastNight);
      setHasSleepLoggedToday(!!entry);
    };
    checkSleepLog();
  }, [refreshTrigger]);

  const handleButtonPress = (id: string, action: () => void) => {
    setPressedButton(id);
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
    setTimeout(() => {
      setPressedButton(null);
      action();
    }, 150);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Install Banner */}
      <InstallBanner />

      {/* App Intro */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3"
      >
        <h2 className="text-2xl font-bold text-foreground">
          Track Your <span className="text-primary">Wake State</span>
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed px-2">
          Track the different components of wakefulness and other symptoms to help understand your trends.
        </p>
        <a
          href="https://buymeacoffee.com/tayloroneal"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-xs text-muted-foreground/70 hover:text-primary transition-colors pt-1"
        >
          Getting value? I'm just a PWN (person with narcolepsy) ☕ buy me a coffee — I sure need one
        </a>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="flex gap-4 justify-center"
      >
        <div className="glass rounded-2xl px-6 py-4 text-center min-w-[120px]">
          <motion.div
            key={checkInCount}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            className="text-3xl font-bold text-primary"
          >
            {checkInCount}
          </motion.div>
          <div className="text-xs text-muted-foreground mt-1">Check-ins</div>
        </div>
        <div className="glass rounded-2xl px-6 py-4 text-center min-w-[120px]">
          <motion.div
            key={eventCount}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            className="text-3xl font-bold text-domain-cataplexy"
          >
            {eventCount}
          </motion.div>
          <div className="text-xs text-muted-foreground mt-1">Events</div>
        </div>
      </motion.div>

      {/* Why Track Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl p-4 space-y-3"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Why Track?
          </h3>
          <button
            onClick={() => setShowLegend(true)}
            className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
          >
            <Info className="w-3.5 h-3.5" />
            Categories
          </button>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-domain-cataplexy mt-0.5">•</span>
            <span>Distinguish <strong className="text-foreground">narcolepsy symptoms</strong> from other factors</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-domain-effort mt-0.5">•</span>
            <span>Spot <strong className="text-foreground">time-of-day patterns</strong> in your symptoms</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-domain-cognitive mt-0.5">•</span>
            <span>Share <strong className="text-foreground">objective trends</strong> with your care team</span>
          </li>
        </ul>
      </motion.div>

      {/* Medications Today */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <MedicationsToday onSetupClick={onMedicationSetup} refreshTrigger={refreshTrigger} />
      </motion.div>

      {/* Simon Says Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 gap-4"
      >
        {/* Log Wake State - Primary */}
        <motion.button
          variants={simonButtonVariants}
          animate={pressedButton === 'wake' ? 'pressed' : 'idle'}
          whileHover={{ scale: 1.02 }}
          onTouchStart={() => setPressedButton('wake')}
          onTouchEnd={() => handleButtonPress('wake', onLogWakeState)}
          onMouseDown={() => setPressedButton('wake')}
          onMouseUp={() => handleButtonPress('wake', onLogWakeState)}
          onMouseLeave={() => setPressedButton(null)}
          className={`
            relative col-span-2 h-24 rounded-3xl font-bold text-lg
            bg-gradient-to-br from-primary/80 to-primary
            text-primary-foreground
            border-4 border-primary/30
            shadow-lg shadow-primary/20
            transition-all duration-150
            ${pressedButton === 'wake' ? 'shadow-primary/50 shadow-2xl brightness-110' : ''}
          `}
        >
          <motion.div
            animate={pressedButton === 'wake' ? { opacity: [0.5, 1, 0.5] } : { opacity: 0 }}
            transition={{ duration: 0.3, repeat: pressedButton === 'wake' ? Infinity : 0 }}
            className="absolute inset-0 rounded-3xl bg-primary/30"
          />
          <span className="relative flex items-center justify-center gap-3">
            <Brain className="w-7 h-7" />
            Log Wake State
          </span>
        </motion.button>

        {/* Log Event - Cataplexy themed */}
        <motion.button
          variants={simonButtonVariants}
          animate={pressedButton === 'event' ? 'pressed' : 'idle'}
          whileHover={{ scale: 1.02 }}
          onTouchStart={() => setPressedButton('event')}
          onTouchEnd={() => handleButtonPress('event', onLogEvent)}
          onMouseDown={() => setPressedButton('event')}
          onMouseUp={() => handleButtonPress('event', onLogEvent)}
          onMouseLeave={() => setPressedButton(null)}
          className={`
            relative h-20 rounded-3xl font-semibold text-base
            bg-gradient-to-br from-domain-cataplexy/70 to-domain-cataplexy
            text-white
            border-4 border-domain-cataplexy/30
            shadow-lg shadow-domain-cataplexy/20
            transition-all duration-150
            ${pressedButton === 'event' ? 'shadow-domain-cataplexy/50 shadow-2xl brightness-110' : ''}
          `}
        >
          <motion.div
            animate={pressedButton === 'event' ? { opacity: [0.5, 1, 0.5] } : { opacity: 0 }}
            transition={{ duration: 0.3, repeat: pressedButton === 'event' ? Infinity : 0 }}
            className="absolute inset-0 rounded-3xl bg-domain-cataplexy/30"
          />
          <span className="relative flex flex-col items-center justify-center gap-1">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <Moon className="w-4 h-4" />
            </div>
            <span>Log Event</span>
          </span>
        </motion.button>

        {/* Log Last Night's Sleep */}
        <motion.button
          variants={simonButtonVariants}
          animate={pressedButton === 'sleep' ? 'pressed' : 'idle'}
          whileHover={{ scale: 1.02 }}
          onTouchStart={() => setPressedButton('sleep')}
          onTouchEnd={() => handleButtonPress('sleep', onLogSleep)}
          onMouseDown={() => setPressedButton('sleep')}
          onMouseUp={() => handleButtonPress('sleep', onLogSleep)}
          onMouseLeave={() => setPressedButton(null)}
          className={`
            relative h-20 rounded-3xl font-semibold text-base
            bg-gradient-to-br from-indigo-500/70 to-indigo-600
            text-white
            border-4 border-indigo-500/30
            shadow-lg shadow-indigo-500/20
            transition-all duration-150
            ${pressedButton === 'sleep' ? 'shadow-indigo-500/50 shadow-2xl brightness-110' : ''}
          `}
        >
          <motion.div
            animate={pressedButton === 'sleep' ? { opacity: [0.5, 1, 0.5] } : { opacity: 0 }}
            transition={{ duration: 0.3, repeat: pressedButton === 'sleep' ? Infinity : 0 }}
            className="absolute inset-0 rounded-3xl bg-indigo-500/30"
          />
          <span className="relative flex flex-col items-center justify-center gap-1">
            <BedDouble className="w-5 h-5" />
            <span className="text-sm">Last Night's Sleep</span>
            {hasSleepLoggedToday && (
              <span className="text-[10px] opacity-70">✓ logged</span>
            )}
          </span>
        </motion.button>
      </motion.div>

      {/* Quick Tip */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-xs text-muted-foreground px-4"
      >
        Quick 30-second check-ins throughout the day build the best patterns
      </motion.p>

      {/* Privacy Badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex items-center justify-center gap-2 py-2"
      >
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
          <Shield className="w-3 h-3 text-green-500" />
          <span className="text-xs text-green-500/90 font-medium">Local-only</span>
        </div>
        <span className="text-xs text-muted-foreground">Your data never leaves this device</span>
      </motion.div>

      {/* Legend Modal */}
      <AnimatePresence>
        {showLegend && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowLegend(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-3xl p-5 w-full max-w-sm max-h-[80vh] overflow-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">Categories Legend</h3>
                <button
                  onClick={() => setShowLegend(false)}
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Narcolepsy-Related */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Narcolepsy-Related
                </h4>
                <div className="space-y-1">
                  {Object.entries(NARCOLEPSY_DOMAIN_CONFIG).map(([key, config]) => (
                    <div
                      key={key}
                      className="flex flex-col gap-1 p-2 -mx-2 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full flex-shrink-0 bg-${config.color}`}
                        />
                        <span className="text-sm font-medium text-foreground">{config.label}</span>
                      </div>
                      {config.description && (
                        <p className="text-xs text-muted-foreground ml-6 leading-relaxed">
                          {config.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Other / Overlapping */}
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Other / Overlapping
                </h4>
                <div className="space-y-1">
                  {Object.entries(OVERLAPPING_DOMAIN_CONFIG).map(([key, config]) => (
                    <div
                      key={key}
                      className="flex flex-col gap-1 p-2 -mx-2 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full flex-shrink-0 bg-${config.color}`}
                        />
                        <span className="text-sm font-medium text-foreground">{config.label}</span>
                      </div>
                      {config.description && (
                        <p className="text-xs text-muted-foreground ml-6 leading-relaxed">
                          {config.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
