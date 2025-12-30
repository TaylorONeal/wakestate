import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BottomNav, type TabId } from '@/components/BottomNav';
import { CheckInScreen } from '@/components/CheckInScreen';
import { TimelineScreen } from '@/components/TimelineScreen';
import { TrendsScreen } from '@/components/TrendsScreen';
import { EventsScreen } from '@/components/EventsScreen';
import { SettingsScreen } from '@/components/SettingsScreen';
import { EventForm } from '@/components/EventForm';
import { Onboarding } from '@/components/Onboarding';

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabId>('checkin');
  const [showEventForm, setShowEventForm] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const onboarded = localStorage.getItem('waketrack_onboarded');
    if (!onboarded) {
      setShowOnboarding(true);
    }
  }, []);

  const handleDataChange = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'checkin':
        return (
          <CheckInScreen
            onEventClick={() => setShowEventForm(true)}
            onSave={handleDataChange}
          />
        );
      case 'timeline':
        return <TimelineScreen refreshTrigger={refreshTrigger} />;
      case 'trends':
        return <TrendsScreen refreshTrigger={refreshTrigger} />;
      case 'events':
        return (
          <EventsScreen
            refreshTrigger={refreshTrigger}
            onAddEvent={() => setShowEventForm(true)}
          />
        );
      case 'settings':
        return <SettingsScreen />;
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'checkin':
        return 'Check-In';
      case 'timeline':
        return 'Timeline';
      case 'trends':
        return 'Trends';
      case 'events':
        return 'Events';
      case 'settings':
        return 'Settings';
      default:
        return 'WakeTrack';
    }
  };

  return (
    <>
      {/* Onboarding */}
      <AnimatePresence>
        {showOnboarding && (
          <Onboarding onComplete={() => setShowOnboarding(false)} />
        )}
      </AnimatePresence>

      {/* Main App */}
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-40 glass border-b border-border/50 safe-area-top">
          <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
            <h1 className="text-xl font-bold text-foreground">{getTitle()}</h1>
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
              WakeTrack
            </span>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 py-4 max-w-lg mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderScreen()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom Navigation */}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Event Form Modal */}
      <AnimatePresence>
        {showEventForm && (
          <EventForm
            onClose={() => setShowEventForm(false)}
            onSave={handleDataChange}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Index;
