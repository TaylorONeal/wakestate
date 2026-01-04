import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Info, ChevronRight, Pill, FileText, Smartphone, Check, Coffee, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  getSettings,
  saveSettings,
  clearAllData,
} from '@/lib/storage';
import { type AppSettings } from '@/types';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { InstallInstructionsModal } from '@/components/InstallInstructionsModal';
import { SlideToConfirm } from '@/components/SlideToConfirm';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface SettingsScreenProps {
  onNavigateToAbout?: () => void;
  onNavigateToMedications?: () => void;
  onNavigateToExport?: () => void;
}

export function SettingsScreen({ onNavigateToAbout, onNavigateToMedications, onNavigateToExport }: SettingsScreenProps) {
  const [settings, setSettings] = useState<AppSettings>({
    showContextByDefault: false,
    theme: 'midnight',
  });
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showClearDataDialog, setShowClearDataDialog] = useState(false);
  const { canInstall, isInstalled, promptInstall } = usePWAInstall();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const data = await getSettings();
    setSettings(data);
  };

  const handleClearAllData = async () => {
    await clearAllData();
    setShowClearDataDialog(false);
    toast.success('All tracking data cleared');
    // Reload the page to reset all state
    window.location.reload();
  };

  const updateSetting = async <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await saveSettings(updated);
  };

  const handleInstallClick = async () => {
    if (canInstall) {
      await promptInstall();
    } else {
      setShowInstallModal(true);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Preferences */}
      <section className="section-card space-y-4">
        <h2 className="text-lg font-semibold">Preferences</h2>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Show Overlapping Symptoms</Label>
            <p className="text-sm text-muted-foreground">
              Expand other symptoms section by default
            </p>
          </div>
          <Switch
            checked={settings.showContextByDefault}
            onCheckedChange={(checked) => updateSetting('showContextByDefault', checked)}
          />
        </div>
      </section>

      {/* Install WakeState */}
      <motion.button
        onClick={handleInstallClick}
        className="section-card w-full flex items-center justify-between hover:bg-surface-3 transition-colors"
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-3">
          {isInstalled ? (
            <Check className="w-5 h-5 text-green-500" />
          ) : (
            <Smartphone className="w-5 h-5 text-primary" />
          )}
          <div className="text-left">
            <h2 className="text-lg font-semibold">
              {isInstalled ? 'WakeState Installed' : 'Install WakeState'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isInstalled ? 'Running as an app' : 'Add to home screen'}
            </p>
          </div>
        </div>
        {!isInstalled && <ChevronRight className="w-5 h-5 text-muted-foreground" />}
      </motion.button>

      {/* Export & Reports Link */}
      {onNavigateToExport && (
        <motion.button
          onClick={onNavigateToExport}
          className="section-card w-full flex items-center justify-between hover:bg-surface-3 transition-colors"
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-primary" />
            <div className="text-left">
              <h2 className="text-lg font-semibold">Export & Reports</h2>
              <p className="text-sm text-muted-foreground">Generate summaries or export data</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </motion.button>
      )}

      {/* Medications Link */}
      {onNavigateToMedications && (
        <motion.button
          onClick={onNavigateToMedications}
          className="section-card w-full flex items-center justify-between hover:bg-surface-3 transition-colors"
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-3">
            <Pill className="w-5 h-5 text-primary" />
            <div className="text-left">
              <h2 className="text-lg font-semibold">Medications</h2>
              <p className="text-sm text-muted-foreground">Track your narcolepsy medications</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </motion.button>
      )}

      {/* Privacy */}
      <section className="section-card space-y-4">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Privacy</h2>
        </div>
        
        <p className="text-sm text-muted-foreground leading-relaxed">
          All your data is stored locally on this device. Nothing is sent to any server. 
          Your tracking data never leaves your phone unless you export it.
        </p>
      </section>

      {/* Clear Data */}
      <section className="section-card space-y-4 border-destructive/30">
        <div className="flex items-center gap-3">
          <Trash2 className="w-5 h-5 text-destructive" />
          <h2 className="text-lg font-semibold">Clear Data</h2>
        </div>
        
        <p className="text-sm text-muted-foreground leading-relaxed">
          Delete all check-ins, events, sleep logs, and medication records. Your preferences will be kept.
        </p>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowClearDataDialog(true)}
          className="text-destructive border-destructive/50 hover:bg-destructive/10"
        >
          Clear All Tracking Data
        </Button>
      </section>

      {/* About Link */}
      {onNavigateToAbout && (
        <motion.button
          onClick={onNavigateToAbout}
          className="section-card w-full flex items-center justify-between hover:bg-surface-3 transition-colors"
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-primary" />
            <div className="text-left">
              <h2 className="text-lg font-semibold">About WakeState</h2>
              <p className="text-sm text-muted-foreground">Resources, how to use, and more</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </motion.button>
      )}

      {/* Buy Me a Coffee */}
      <a
        href="https://buymeacoffee.com/tayloroneal"
        target="_blank"
        rel="noopener noreferrer"
        className="section-card flex items-center justify-between hover:bg-surface-3 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <Coffee className="w-5 h-5 text-[#FFDD00]" />
          <div className="text-left">
            <h2 className="text-lg font-semibold group-hover:text-[#FFDD00] transition-colors">Support WakeState</h2>
            <p className="text-sm text-muted-foreground">Buy me a coffee ☕</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </a>

      {/* Version */}
      <p className="text-xs text-muted-foreground text-center">
        Version 1.0 • Not a medical device
      </p>

      {/* Install Instructions Modal */}
      <InstallInstructionsModal 
        isOpen={showInstallModal} 
        onClose={() => setShowInstallModal(false)} 
      />

      {/* Clear Data Confirmation */}
      <AlertDialog open={showClearDataDialog} onOpenChange={setShowClearDataDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all tracking data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all check-ins, events, sleep logs, and medication records. 
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-2">
            <SlideToConfirm 
              onConfirm={handleClearAllData}
              label="Slide to confirm it's gonna go poof"
            />
          </div>
          
          <div className="flex justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
