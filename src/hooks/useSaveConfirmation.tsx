import { useState, useCallback } from 'react';

export type SaveType = 'new' | 'edit';
export type LogType = 'wake' | 'sleep' | 'medication';

interface SaveConfirmationState {
  isVisible: boolean;
  saveType: SaveType;
  logType: LogType;
}

export function useSaveConfirmation() {
  const [state, setState] = useState<SaveConfirmationState>({
    isVisible: false,
    saveType: 'new',
    logType: 'wake',
  });

  const trigger = useCallback((saveType: SaveType, logType: LogType) => {
    setState({ isVisible: true, saveType, logType });
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(saveType === 'new' ? 30 : 15);
    }
    
    // Auto-hide after animation completes
    setTimeout(() => {
      setState(prev => ({ ...prev, isVisible: false }));
    }, 1200);
  }, []);

  const hide = useCallback(() => {
    setState(prev => ({ ...prev, isVisible: false }));
  }, []);

  return {
    ...state,
    trigger,
    hide,
  };
}