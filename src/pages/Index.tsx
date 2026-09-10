import { ScreenErrorBoundary } from '@/components/ScreenErrorBoundary';
import { Capacitor } from '@capacitor/core';
import { App as NativeApp } from '@capacitor/app';
import { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BottomNav, type TabId } from '@/components/BottomNav';
import { HomeScreen } from '@/components/HomeScreen';
import { CheckInScreen } from '@/components/CheckInScreen';
const TimelineScreen = lazy(() => import('@/components/TimelineScreen').then(module => ({ default: module.TimelineScreen })));
const Dashboard = lazy(() => import('@/components/Dashboard').then(module => ({ default: module.Dashboard })));
import { SettingsScreen } from '@/components/SettingsScreen';
const AboutScreen = lazy(() => import('@/components/AboutScreen').then(module => ({ default: module.AboutScreen })));
const MedicationsScreen = lazy(() => import('@/components/MedicationsScreen').then(module => ({ default: module.MedicationsScreen })));
const MedicationSetup = lazy(() => import('@/components/MedicationSetup').then(module => ({ default: module.MedicationSetup })));
const ExportScreen = lazy(() => import('@/components/ExportScreen').then(module => ({ default: module.ExportScreen })));
const FeedbackScreen = lazy(() => import('@/components/FeedbackScreen').then(module => ({ default: module.FeedbackScreen })));
import { SleepLogScreen } from '@/components/SleepLogScreen';
import { EventForm } from '@/components/EventForm';
import { Onboarding } from '@/components/Onboarding';
import { getCheckIns, getEvents } from '@/lib/storage';

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [showEventForm, setShowEventForm] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showMedications, setShowMedications] = useState(false);
  const [showMedicationSetup, setShowMedicationSetup] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSleepLog, setShowSleepLog] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [checkInCount, setCheckInCount] = useState(0);
  const [eventCount, setEventCount] = useState(0);

  useEffect(() => {
    if (Capacitor.getPlatform() !== 'android') return;
    const listener = NativeApp.addListener('backButton', () => {
      if (showEventForm) { setShowEventForm(false); return; }
      const dialog = document.querySelector('[role="dialog"], [role="alertdialog"]');
      if (dialog) { dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); return; }
      if (showSleepLog) setShowSleepLog(false);
      else if (showFeedback) setShowFeedback(false);
      else if (showExport) setShowExport(false);
      else if (showMedicationSetup) setShowMedicationSetup(false);
      else if (showMedications) setShowMedications(false);
      else if (showAbout) setShowAbout(false);
      else if (activeTab !== 'home') setActiveTab('home');
      else void NativeApp.minimizeApp();
    });
    return () => { void listener.then(handle => handle.remove()); };
  }, [activeTab, showEventForm, showSleepLog, showFeedback, showExport, showMedicationSetup, showMedications, showAbout]);

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
    if (showSleepLog) {
      return (
        <SleepLogScreen 
          onBack={() => setShowSleepLog(false)} 
          onSave={handleDataChange}
        />
      );
    }

    if (showFeedback) {
      return <FeedbackScreen onBack={() => setShowFeedback(false)} />;
    }

    if (showExport) {
      return <ExportScreen onBack={() => setShowExport(false)} onDataChange={handleDataChange} />;
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
            onPrivacy={() => setActiveTab('settings')}
            onLogWakeState={() => setActiveTab('log')}
            onLogEvent={() => setShowEventForm(true)}
            onLogSleep={() => setShowSleepLog(true)}
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
        return <Dashboard refreshTrigger={refreshTrigger} onNavigateToExport={() => setShowExport(true)} />;
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
    if (showSleepLog) return "Last Night's Sleep";
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
        return 'Patterns';
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
      <div hidden={showOnboarding} className="min-h-[100dvh] bg-background">
        {/* Header */}
        <header className="sticky top-0 z-40 glass border-b border-border/50 safe-area-top overflow-hidden">
          <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
            <h1 className="text-lg font-semibold tracking-tight text-foreground">{getTitle()}</h1>
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
              key={showSleepLog ? 'sleep' : showFeedback ? 'feedback' : showExport ? 'export' : showMedicationSetup ? 'med-setup' : showMedications ? 'medications' : showAbout ? 'about' : activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ScreenErrorBoundary><Suspense fallback={<p role="status" className="py-12 text-center text-sm text-muted-foreground">Loading your view…</p>}>
                {renderScreen()}
              </Suspense></ScreenErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom Navigation */}
        <BottomNav activeTab={activeTab} onTabChange={(tab) => { setShowAbout(false); setShowMedications(false); setShowMedicationSetup(false); setShowExport(false); setShowFeedback(false); setShowSleepLog(false); setActiveTab(tab); }} />
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
