import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, Upload, Shield, Info, ChevronRight, Pill } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  getSettings,
  saveSettings,
  exportAllData,
  importData,
  getCheckIns,
  exportToCSV,
} from '@/lib/storage';
import { type AppSettings } from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface SettingsScreenProps {
  onNavigateToAbout?: () => void;
  onNavigateToMedications?: () => void;
}

export function SettingsScreen({ onNavigateToAbout, onNavigateToMedications }: SettingsScreenProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [settings, setSettings] = useState<AppSettings>({
    showContextByDefault: false,
    theme: 'midnight',
  });
  const [showImportDialog, setShowImportDialog] = useState(false);

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

  const handleExportJSON = async () => {
    const data = await exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waketrack-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Export complete',
      description: 'Your data has been downloaded',
    });
  };

  const handleExportCSV = async () => {
    const checkIns = await getCheckIns();
    const csv = exportToCSV(checkIns);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waketrack-checkins-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: 'CSV Export complete',
      description: 'Check-ins exported to CSV',
    });
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const result = await importData(text);
      
      toast({
        title: 'Import complete',
        description: `Imported ${result.checkIns} check-ins and ${result.events} events`,
      });
      
      setShowImportDialog(false);
    } catch (error) {
      toast({
        title: 'Import failed',
        description: 'Please check the file format',
        variant: 'destructive',
      });
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

      {/* Data Management */}
      <section className="section-card space-y-4">
        <h2 className="text-lg font-semibold">Data Management</h2>
        
        <div className="space-y-3">
          <Button
            variant="outline"
            onClick={handleExportJSON}
            className="w-full justify-start gap-3 h-12"
          >
            <Download className="w-5 h-5" />
            Export all data (JSON)
          </Button>
          
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="w-full justify-start gap-3 h-12"
          >
            <Download className="w-5 h-5" />
            Export check-ins (CSV)
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowImportDialog(true)}
            className="w-full justify-start gap-3 h-12"
          >
            <Upload className="w-5 h-5" />
            Import data (JSON)
          </Button>
        </div>
      </section>

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
              <h2 className="text-lg font-semibold">About WakeTrack</h2>
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

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />

      {/* Import Confirmation Dialog */}
      <AlertDialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Import data</AlertDialogTitle>
            <AlertDialogDescription>
              This will merge imported data with your existing data. 
              Select a WakeTrack JSON export file.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => fileInputRef.current?.click()}>
              Select File
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
