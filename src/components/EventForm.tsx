import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { EventTypeSelector } from '@/components/EventTypeSelector';
import { CataplextyEventForm } from '@/components/CataplextyEventForm';
import { NapEventForm } from '@/components/NapEventForm';

interface EventFormProps {
  onClose: () => void;
  onSave: () => void;
}

type EventFormStep = 'select' | 'cataplexy' | 'nap';

export function EventForm({ onClose, onSave }: EventFormProps) {
  const [step, setStep] = useState<EventFormStep>('select');

  const handleBack = () => {
    if (step === 'select') {
      onClose();
    } else {
      setStep('select');
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-auto"
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
    >
      <div className="min-h-screen p-4 max-w-lg mx-auto pb-24">
        {step === 'select' && (
          <>
            {/* Back Button */}
            <motion.button
              onClick={onClose}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors -ml-1 mb-6"
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </motion.button>

            <EventTypeSelector
              onSelectCataplexy={() => setStep('cataplexy')}
              onSelectNap={() => setStep('nap')}
            />
          </>
        )}

        {step === 'cataplexy' && (
          <CataplextyEventForm
            onClose={onClose}
            onBack={handleBack}
            onSave={onSave}
          />
        )}

        {step === 'nap' && (
          <NapEventForm
            onClose={onClose}
            onBack={handleBack}
            onSave={onSave}
          />
        )}
      </div>
    </motion.div>
  );
}
