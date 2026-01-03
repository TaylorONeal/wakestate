import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Info, ChevronRight, Pill, FileText } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  getSettings,
  saveSettings,
} from '@/lib/storage';
import { type AppSettings } from '@/types';

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

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const data = await getSettings();
    setSettings(data);
  };

  const updateSetting = async <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await saveSettings(updated);
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

      {/* Version */}
      <p className="text-xs text-muted-foreground text-center">
        Version 1.0 • Not a medical device
      </p>
    </div>
  );
}
