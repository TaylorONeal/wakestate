import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BottomNav, type TabId } from '@/components/BottomNav';
import { HomeScreen } from '@/components/HomeScreen';
import { CheckInScreen } from '@/components/CheckInScreen';
import { TimelineScreen } from '@/components/TimelineScreen';
import { Dashboard } from '@/components/Dashboard';
import { SettingsScreen } from '@/components/SettingsScreen';
import { AboutScreen } from '@/components/AboutScreen';
import { MedicationsScreen } from '@/components/MedicationsScreen';
import { EventForm } from '@/components/EventForm';
import { Onboarding } from '@/components/Onboarding';
import { getCheckIns, getEvents } from '@/lib/storage';

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [showEventForm, setShowEventForm] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showMedications, setShowMedications] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [checkInCount, setCheckInCount] = useState(0);
  const [eventCount, setEventCount] = useState(0);

  useEffect(() => {
    const onboarded = localStorage.getItem('waketrack_onboarded');
    if (!onboarded) {
      setShowOnboarding(true);
    }
  }, []);

  useEffect(() => {
    const loadCounts = async () => {
      const checkIns = await getCheckIns();
      const events = await getEvents();
      setCheckInCount(checkIns.length);
      setEventCount(events.length);
    };
    loadCounts();
  }, [refreshTrigger]);

  const handleDataChange = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const renderScreen = () => {
    if (showMedications) {
      return <MedicationsScreen onBack={() => setShowMedications(false)} />;
    }

    if (showAbout) {
      return <AboutScreen onBack={() => setShowAbout(false)} />;
    }

    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            onLogWakeState={() => setActiveTab('log')}
            onLogEvent={() => setShowEventForm(true)}
            checkInCount={checkInCount}
            eventCount={eventCount}
          />
        );
      case 'log':
        return (
          <CheckInScreen
            onEventClick={() => setShowEventForm(true)}
            onSave={handleDataChange}
            onNavigateToTrends={() => setActiveTab('dashboard')}
            onBack={() => setActiveTab('home')}
          />
        );
      case 'timeline':
        return <TimelineScreen refreshTrigger={refreshTrigger} />;
      case 'dashboard':
        return <Dashboard refreshTrigger={refreshTrigger} />;
      case 'settings':
        return (
          <SettingsScreen
            onNavigateToAbout={() => setShowAbout(true)}
            onNavigateToMedications={() => setShowMedications(true)}
          />
        );
      default:
        return null;
    }
  };

  const getTitle = () => {
    if (showMedications) return 'Medications';
    if (showAbout) return 'About';
    switch (activeTab) {
      case 'home':
        return 'WakeTrack';
      case 'log':
        return 'Log Wake State';
      case 'timeline':
        return 'Timeline';
      case 'dashboard':
        return 'Dashboard';
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
            {activeTab !== 'home' && !showAbout && !showMedications && (
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                WakeTrack
              </span>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 py-4 max-w-lg mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={showMedications ? 'medications' : showAbout ? 'about' : activeTab}
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
        <BottomNav activeTab={activeTab} onTabChange={(tab) => { setShowAbout(false); setShowMedications(false); setActiveTab(tab); }} />
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
