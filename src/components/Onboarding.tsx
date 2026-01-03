import { motion } from 'framer-motion';
import { Moon, ArrowRight, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const handleStart = () => {
    localStorage.setItem('wakestate_onboarded', 'true');
    onComplete();
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-background flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="max-w-sm w-full space-y-8">
        {/* Logo & Title */}
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <motion.div
            className="w-20 h-20 mx-auto rounded-2xl bg-primary/20 flex items-center justify-center"
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
          >
            <Moon className="w-10 h-10 text-primary" />
          </motion.div>
          
          <h1 className="text-3xl font-bold text-foreground">
            WakeState
          </h1>
          
          <p className="text-muted-foreground leading-relaxed">
            Track wake-state patterns to understand your narcolepsy better.
          </p>
        </motion.div>

        {/* Value Props - Compact */}
        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Zap className="w-4 h-4 text-primary shrink-0" />
            <span>30-second check-ins, many times per day</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Shield className="w-4 h-4 text-primary shrink-0" />
            <span>Your data stays on your device, always</span>
          </div>
        </motion.div>

        {/* Single CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            onClick={handleStart}
            className="w-full h-14 text-lg font-semibold glow-primary"
          >
            Start Tracking
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
