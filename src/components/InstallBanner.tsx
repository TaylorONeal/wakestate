import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { InstallInstructionsModal } from '@/components/InstallInstructionsModal';

interface InstallBannerProps {
  onDismiss?: () => void;
}

export function InstallBanner({ onDismiss }: InstallBannerProps) {
  const { canInstall, isInstalled, isIOS, promptInstall } = usePWAInstall();
  const [showInstructions, setShowInstructions] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem('wakestate_install_dismissed') === 'true';
  });

  // Don't show if already installed or dismissed
  if (isInstalled || dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem('wakestate_install_dismissed', 'true');
    setDismissed(true);
    onDismiss?.();
  };

  const handleInstallClick = async () => {
    if (canInstall) {
      await promptInstall();
    } else {
      setShowInstructions(true);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="section-card border-primary/30 relative"
      >
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3 pr-6">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm">Install WakeState</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Add to your home screen for a faster, app-like experience.
            </p>
            <Button
              size="sm"
              onClick={handleInstallClick}
              className="mt-2 h-8 text-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              {canInstall ? 'Install' : 'How to install'}
            </Button>
          </div>
        </div>
      </motion.div>

      <InstallInstructionsModal 
        isOpen={showInstructions} 
        onClose={() => setShowInstructions(false)} 
      />
    </>
  );
}
