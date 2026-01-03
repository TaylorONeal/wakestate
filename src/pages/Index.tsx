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
import { MedicationSetup } from '@/components/MedicationSetup';
import { ExportScreen } from '@/components/ExportScreen';
import { FeedbackScreen } from '@/components/FeedbackScreen';
import { EventForm } from '@/components/EventForm';
import { Onboarding } from '@/components/Onboarding';
import { getCheckIns, getEvents, getMedicationConfig } from '@/lib/storage';

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [showEventForm, setShowEventForm] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showMedications, setShowMedications] = useState(false);
  const [showMedicationSetup, setShowMedicationSetup] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [checkInCount, setCheckInCount] = useState(0);
  const [eventCount, setEventCount] = useState(0);

  useEffect(() => {
    const onboarded = localStorage.getItem('wakestate_onboarded');
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
    if (showFeedback) {
      return <FeedbackScreen onBack={() => setShowFeedback(false)} />;
    }

    if (showExport) {
      return <ExportScreen onBack={() => setShowExport(false)} />;
    }

    if (showMedicationSetup) {
      return (
        <MedicationSetup
          onComplete={() => {
            setShowMedicationSetup(false);
            handleDataChange();
          }}
          onBack={() => setShowMedicationSetup(false)}
        />
      );
    }

    if (showMedications) {
      return <MedicationsScreen onBack={() => setShowMedications(false)} />;
    }

    if (showAbout) {
      return (
        <AboutScreen 
          onBack={() => setShowAbout(false)} 
          onNavigateToFeedback={() => {
            setShowAbout(false);
            setShowFeedback(true);
          }}
        />
      );
    }

    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            onLogWakeState={() => setActiveTab('log')}
            onLogEvent={() => setShowEventForm(true)}
            onMedicationSetup={() => setShowMedicationSetup(true)}
            checkInCount={checkInCount}
            eventCount={eventCount}
            refreshTrigger={refreshTrigger}
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
            onNavigateToExport={() => setShowExport(true)}
          />
        );
      default:
        return null;
    }
  };

  const getTitle = () => {
    if (showFeedback) return 'Feedback';
    if (showExport) return 'Export & Reports';
    if (showMedicationSetup) return 'Set Up Medications';
    if (showMedications) return 'Medications';
    if (showAbout) return 'About';
    switch (activeTab) {
      case 'home':
        return 'WakeState';
      case 'log':
        return 'Log Wake State';
      case 'timeline':
        return 'Timeline';
      case 'dashboard':
        return 'Dashboard';
      case 'settings':
        return 'Settings';
      default:
        return 'WakeState';
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
        <header className="sticky top-0 z-40 glass border-b border-border/50 safe-area-top overflow-hidden">
          {/* Animated Zzz Line */}
          <div className="absolute top-0 left-0 right-0 h-1 flex items-center overflow-hidden opacity-30">
            {[...Array(6)].map((_, i) => (
              <motion.span
                key={i}
                className="text-[8px] text-primary font-bold whitespace-nowrap"
                initial={{ x: -30 }}
                animate={{ x: '100vw' }}
                transition={{
                  duration: 10,
                  delay: i * 1.6,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                Zzz
              </motion.span>
            ))}
          </div>
          <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
            <h1 className="text-xl font-bold text-foreground">{getTitle()}</h1>
            {activeTab !== 'home' && !showAbout && !showMedications && !showMedicationSetup && (
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                WakeState
              </span>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 py-4 max-w-lg mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={showFeedback ? 'feedback' : showExport ? 'export' : showMedicationSetup ? 'med-setup' : showMedications ? 'medications' : showAbout ? 'about' : activeTab}
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
        <BottomNav activeTab={activeTab} onTabChange={(tab) => { setShowAbout(false); setShowMedications(false); setShowMedicationSetup(false); setShowExport(false); setShowFeedback(false); setActiveTab(tab); }} />
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
