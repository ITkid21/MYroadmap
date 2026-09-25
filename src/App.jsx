import React, { useState, useEffect } from 'react';
import { Storage } from './utils/storage.js';
import { sound } from './utils/audioUtils.js';

import Sidebar from './components/Sidebar.jsx';
import Dashboard from './components/Dashboard.jsx';
import SubjectManager from './components/SubjectManager.jsx';
import StudyTimer from './components/StudyTimer.jsx';
import PomodoroTimer from './components/PomodoroTimer.jsx';
import StudyAnalytics from './components/StudyAnalytics.jsx';
import StudyHistory from './components/StudyHistory.jsx';
import DailyGoals from './components/DailyGoals.jsx';
import Roadmap from './components/Roadmap.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import Toast from './components/Toast.jsx';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState('dashboard');
  const [timerMode, setTimerMode] = useState('stopwatch'); // 'stopwatch' | 'pomodoro'
  const [quickStartSubjId, setQuickStartSubjId] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // App Data States
  const [subjects, setSubjects] = useState(() => Storage.getSubjects());
  const [sessions, setSessions] = useState(() => Storage.getSessions());
  const [goals, setGoals] = useState(() => Storage.getGoals());
  const [settings, setSettings] = useState(() => Storage.getSettings());
  const [activeTimerState, setActiveTimerState] = useState(() => Storage.getActiveTimer());
  const [roadmapProgress, setRoadmapProgress] = useState(() => Storage.getRoadmapProgress());
  const [subjectRoadmaps, setSubjectRoadmaps] = useState(() => Storage.getSubjectRoadmaps());

  // UI States
  const [darkMode, setDarkMode] = useState(() => settings.darkMode ?? true);
  const [toast, setToast] = useState(null);

  // Sync dark mode class to <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    const updated = { ...settings, darkMode };
    setSettings(updated);
    Storage.saveSettings(updated);
  }, [darkMode]);

  // Sync sound muted state
  useEffect(() => {
    sound.setMuted(!settings.soundEnabled);
  }, [settings.soundEnabled]);

  const showToast = (toastObj) => {
    setToast(toastObj);
  };

  // Subject Handlers
  const handleSaveSubject = (subject) => {
    const exists = subjects.some(s => s.id === subject.id);
    let updated;
    if (exists) {
      updated = subjects.map(s => s.id === subject.id ? subject : s);
    } else {
      updated = [...subjects, subject];
    }
    setSubjects(updated);
    Storage.saveSubjects(updated);
  };

  const handleDeleteSubject = (subjectId) => {
    const updated = subjects.filter(s => s.id !== subjectId);
    setSubjects(updated);
    Storage.saveSubjects(updated);
  };

  const handleReorderSubjects = (reordered) => {
    setSubjects(reordered);
    Storage.saveSubjects(reordered);
  };

  // Session Handlers
  const handleCompleteSession = (newSessions) => {
    const updated = Storage.addMultipleSessions(newSessions);
    setSessions(updated);
  };

  const handleUpdateSession = (updatedSession) => {
    const updated = Storage.updateSession(updatedSession);
    setSessions(updated);
  };

  const handleDeleteSession = (sessionId) => {
    const updated = Storage.deleteSession(sessionId);
    setSessions(updated);
  };

  // Active Timer Persistence
  const handleSaveActiveTimer = (timerObj) => {
    setActiveTimerState(timerObj);
    Storage.saveActiveTimer(timerObj);
  };

  const handleClearActiveTimer = () => {
    setActiveTimerState(null);
    Storage.clearActiveTimer();
  };

  const handleRoadmapProgressChange = (nextProgress) => {
    setRoadmapProgress(nextProgress);
    Storage.saveRoadmapProgress(nextProgress);
  };

  const handleSubjectRoadmapsChange = (nextRoadmaps) => {
    setSubjectRoadmaps(nextRoadmaps);
    Storage.saveSubjectRoadmaps(nextRoadmaps);
  };

  // Goal & Settings Handlers
  const handleSaveGoals = (newGoals) => {
    setGoals(newGoals);
    Storage.saveGoals(newGoals);
  };

  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    Storage.saveSettings(newSettings);
    if (newSettings.darkMode !== darkMode) {
      setDarkMode(newSettings.darkMode);
    }
  };

  // Reload data from storage after import
  const handleReloadAllData = () => {
    setSubjects(Storage.getSubjects());
    setSessions(Storage.getSessions());
    setGoals(Storage.getGoals());
    setSettings(Storage.getSettings());
    setActiveTimerState(Storage.getActiveTimer());
    setRoadmapProgress(Storage.getRoadmapProgress());
    setSubjectRoadmaps(Storage.getSubjectRoadmaps());
  };

  const handleClearAllData = () => {
    Storage.clearAll();
    handleReloadAllData();
  };

  // Quick start a specific subject from Dashboard
  const handleQuickStartSubject = (subjectId) => {
    setQuickStartSubjId(subjectId);
    setTimerMode('stopwatch');
    setActiveTab('timer');
  };

  const isTimerRunning = Boolean(activeTimerState?.isRunning);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isTimerRunning={isTimerRunning}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        isOpenMobile={isMobileMenuOpen}
        setIsOpenMobile={setIsMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top Navbar Header */}
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Hamburger button for mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              ☰
            </button>
            <div className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab === 'subjects' && 'Subject Manager'}
              {activeTab === 'timer' && (timerMode === 'stopwatch' ? 'Stopwatch Study Timer' : 'Pomodoro Focus Timer')}
              {activeTab === 'roadmap' && 'Career & Subject Roadmaps'}
              {activeTab === 'analytics' && 'Study Analytics & Trends'}
              {activeTab === 'history' && 'Completed Sessions Log'}
              {activeTab === 'goals' && 'Daily Study Targets'}
              {activeTab === 'settings' && 'App Settings & Backups'}
            </div>
          </div>

          {/* Quick Header Navigation & Active Timer Pill */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Direct Link to Goals */}
            <button
              onClick={() => setActiveTab('goals')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'goals'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span>🎯</span>
              <span className="hidden sm:inline">Goals</span>
            </button>

            {/* Quick Timer Pill */}
            {isTimerRunning && (
              <button
                onClick={() => setActiveTab('timer')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold hover:bg-emerald-500/20 transition animate-pulse"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Active Timer</span>
              </button>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm transition"
              title="Toggle Light / Dark mode"
            >
              {darkMode ? '🌙' : '☀️'}
            </button>
          </div>
        </header>

        {/* View Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              subjects={subjects}
              sessions={sessions}
              goals={goals}
              onNavigateTab={setActiveTab}
              onQuickStartSubject={handleQuickStartSubject}
            />
          )}

          {activeTab === 'subjects' && (
            <SubjectManager
              subjects={subjects}
              sessions={sessions}
              onSaveSubject={handleSaveSubject}
              onDeleteSubject={handleDeleteSubject}
              onReorderSubjects={handleReorderSubjects}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'timer' && (
            <div className="space-y-6">
              {/* Mode Switcher between Stopwatch and Pomodoro */}
              <div className="flex justify-center">
                <div className="p-1 bg-slate-200 dark:bg-slate-800 rounded-2xl flex gap-1">
                  <button
                    onClick={() => setTimerMode('stopwatch')}
                    className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
                      timerMode === 'stopwatch'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    ⏱️ Stopwatch
                  </button>
                  <button
                    onClick={() => setTimerMode('pomodoro')}
                    className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
                      timerMode === 'pomodoro'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    🍅 Pomodoro
                  </button>
                </div>
              </div>

              {timerMode === 'stopwatch' ? (
                <StudyTimer
                  subjects={subjects}
                  activeTimerState={activeTimerState}
                  onSaveActiveTimer={handleSaveActiveTimer}
                  onClearActiveTimer={handleClearActiveTimer}
                  onCompleteSession={handleCompleteSession}
                  onShowToast={showToast}
                  initialSubjectId={quickStartSubjId}
                />
              ) : (
                <PomodoroTimer
                  subjects={subjects}
                  settings={settings}
                  onCompleteSession={handleCompleteSession}
                  onShowToast={showToast}
                />
              )}
            </div>
          )}

          {activeTab === 'roadmap' && (
            <Roadmap
              progress={roadmapProgress}
              onProgressChange={handleRoadmapProgressChange}
              customRoadmaps={subjectRoadmaps}
              onCustomRoadmapsChange={handleSubjectRoadmapsChange}
              subjects={subjects}
              onQuickStartSubject={handleQuickStartSubject}
            />
          )}

          {activeTab === 'analytics' && (
            <StudyAnalytics
              subjects={subjects}
              sessions={sessions}
              goals={goals}
            />
          )}

          {activeTab === 'history' && (
            <StudyHistory
              subjects={subjects}
              sessions={sessions}
              onUpdateSession={handleUpdateSession}
              onDeleteSession={handleDeleteSession}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'goals' && (
            <DailyGoals
              goals={goals}
              subjects={subjects}
              sessions={sessions}
              onSaveGoals={handleSaveGoals}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsModal
              settings={settings}
              subjects={subjects}
              onSaveSettings={handleSaveSettings}
              onReloadAllData={handleReloadAllData}
              onClearAllData={handleClearAllData}
              onShowToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Floating Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
