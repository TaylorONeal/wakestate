import { motion, AnimatePresence } from 'framer-motion';
import { X, Share, MoreVertical, Plus, Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface InstallInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InstallInstructionsModal({ isOpen, onClose }: InstallInstructionsModalProps) {
  const [activeTab, setActiveTab] = useState<'ios' | 'android'>('ios');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="glass rounded-3xl p-5 w-full max-w-sm max-h-[80vh] overflow-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-primary" />
                Add to Home Screen
              </h3>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Switcher */}
            <div className="flex gap-1 bg-surface-2 rounded-lg p-1 mb-4">
              <button
                onClick={() => setActiveTab('ios')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  activeTab === 'ios'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                iPhone / iPad
              </button>
              <button
                onClick={() => setActiveTab('android')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  activeTab === 'android'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Android / Desktop
              </button>
            </div>

            {/* iOS Instructions */}
            {activeTab === 'ios' && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <p className="text-sm text-foreground font-medium">Open in Safari</p>
                      <p className="text-xs text-muted-foreground">WakeState must be opened in Safari (not Chrome or other browsers)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                      2
                    </div>
                    <div className="flex items-start gap-2">
                      <div>
                        <p className="text-sm text-foreground font-medium">Tap Share</p>
                        <p className="text-xs text-muted-foreground">The square with an arrow pointing up</p>
                      </div>
                      <Share className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                      3
                    </div>
                    <div className="flex items-start gap-2">
                      <div>
                        <p className="text-sm text-foreground font-medium">Add to Home Screen</p>
                        <p className="text-xs text-muted-foreground">Scroll down and tap this option</p>
                      </div>
                      <Plus className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                      4
                    </div>
                    <div>
                      <p className="text-sm text-foreground font-medium">Tap Add</p>
                      <p className="text-xs text-muted-foreground">Confirm in the top right corner</p>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-3 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-foreground">Note:</strong> iOS doesn't show an automatic install prompt. Safari is required for home screen installation.
                  </p>
                </div>
              </div>
            )}

            {/* Android/Desktop Instructions */}
            {activeTab === 'android' && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <p className="text-sm text-foreground font-medium">Open WakeState</p>
                      <p className="text-xs text-muted-foreground">In Chrome, Edge, or Brave browser</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                      2
                    </div>
                    <div className="flex items-start gap-2">
                      <div>
                        <p className="text-sm text-foreground font-medium">Tap browser menu</p>
                        <p className="text-xs text-muted-foreground">Three dots (⋮) or install icon in address bar</p>
                      </div>
                      <MoreVertical className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                      3
                    </div>
                    <div className="flex items-start gap-2">
                      <div>
                        <p className="text-sm text-foreground font-medium">Select Install or Add to Home screen</p>
                        <p className="text-xs text-muted-foreground">The wording varies by browser</p>
                      </div>
                      <Download className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                      4
                    </div>
                    <div>
                      <p className="text-sm text-foreground font-medium">Confirm</p>
                      <p className="text-xs text-muted-foreground">Tap Install or Add when prompted</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground text-center">
                After installing, WakeState opens like a normal app — no browser chrome.
              </p>
            </div>

            <Button onClick={onClose} className="w-full mt-4">
              Got it
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
