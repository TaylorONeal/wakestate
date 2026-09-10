import { Check } from 'lucide-react';
import type { SaveType, LogType } from '@/hooks/useSaveConfirmation';

interface SaveConfirmationProps {
  isVisible: boolean;
  saveType: SaveType;
  logType: LogType;
}

export function SaveConfirmation({ isVisible, saveType, logType }: SaveConfirmationProps) {
  if (!isVisible) return null;
  const label = logType === 'medication' ? 'Medication' : logType === 'sleep' ? 'Sleep entry' : 'Entry';
  return (
    <div className="fixed inset-x-4 z-[100] pointer-events-none flex justify-center" style={{ bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}>
      <div role="status" className="flex items-center gap-2 rounded-full border border-primary/30 bg-card px-4 py-3 text-sm text-foreground shadow-lg">
        <Check className="h-4 w-4 text-primary" aria-hidden="true" />
        {label} {saveType === 'edit' ? 'updated' : 'saved'} on this device
      </div>
    </div>
  );
}
