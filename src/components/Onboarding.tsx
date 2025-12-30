import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to WakeTrack',
      description:
        'A snapshot tool for people with narcolepsy to track wake-state patterns throughout the day.',
      icon: Moon,
    },
    {
      title: 'Track, Don\'t Judge',
      description:
        'WakeTrack is not a verdict. It helps you separate sleep-state instability from overlays like anxiety, mood, or digestion.',
    },
    {
      title: '30-Second Check-ins',
      description:
        'Quick, repeatable check-ins using sliders and chips. Designed for many snapshots per day with minimal effort.',
    },
    {
      title: 'Your Data, Your Device',
      description:
        'All data stays on your device. Nothing is sent to any server. Export anytime to share with clinicians.',
    },
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      localStorage.setItem('waketrack_onboarded', 'true');
      onComplete();
    }
  };

  const currentStep = steps[step];
  const Icon = currentStep.icon;

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-background flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="max-w-sm w-full space-y-8">
        {/* Progress Dots */}
        <div className="flex justify-center gap-2">
          {steps.map((_, i) => (
            <motion.div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? 'w-8 bg-primary' : 'w-1.5 bg-muted'
              }`}
              animate={{ scale: i === step ? 1 : 0.8 }}
            />
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="text-center space-y-6"
          >
            {Icon && (
              <motion.div
                className="w-20 h-20 mx-auto rounded-2xl bg-primary/20 flex items-center justify-center"
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Icon className="w-10 h-10 text-primary" />
              </motion.div>
            )}
            
            <h1 className="text-2xl font-bold text-foreground">
              {currentStep.title}
            </h1>
            
            <p className="text-muted-foreground leading-relaxed">
              {currentStep.description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleNext}
            className="w-full h-14 text-lg font-semibold glow-primary"
          >
            {step === steps.length - 1 ? 'Get Started' : 'Next'}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          
          {step < steps.length - 1 && (
            <Button
              variant="ghost"
              onClick={() => {
                localStorage.setItem('waketrack_onboarded', 'true');
                onComplete();
              }}
              className="text-muted-foreground"
            >
              Skip intro
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
