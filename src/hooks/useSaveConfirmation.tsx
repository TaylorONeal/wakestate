import { useState, useCallback, useRef, useEffect } from 'react';

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

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const trigger = useCallback((saveType: SaveType, logType: LogType) => {
    if (timer.current) clearTimeout(timer.current);
    setState({ isVisible: true, saveType, logType });
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(saveType === 'new' ? 30 : 15);
    }
    
    // Auto-hide after animation completes
    timer.current = setTimeout(() => {
      setState(prev => ({ ...prev, isVisible: false }));
    }, 1800);
  }, []);

  const hide = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setState(prev => ({ ...prev, isVisible: false }));
  }, []);

  return {
    ...state,
    trigger,
    hide,
  };
}