import { motion } from 'framer-motion';
import { Clock, BarChart3, Calendar, AlertTriangle, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TabId = 'checkin' | 'timeline' | 'trends' | 'events' | 'settings';

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs: { id: TabId; label: string; icon: typeof Clock }[] = [
  { id: 'checkin', label: 'Check-In', icon: Clock },
  { id: 'timeline', label: 'Timeline', icon: Calendar },
  { id: 'trends', label: 'Trends', icon: BarChart3 },
  { id: 'events', label: 'Events', icon: AlertTriangle },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'tab-item relative flex-1 touch-target',
                isActive && 'tab-item-active'
              )}
              whileTap={{ scale: 0.9 }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-x-2 -top-1 h-0.5 bg-primary rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={cn('w-5 h-5', isActive && 'text-primary')} />
              <span className="text-xs font-medium">{tab.label}</span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
