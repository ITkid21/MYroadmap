import React, { useState, useRef } from 'react';
import { exportToJSON, exportToCSV, validateAndImportJSON } from '../utils/exportImport.js';
import ConfirmationModal from './ConfirmationModal.jsx';

export default function SettingsModal({
  settings,
  subjects,
  onSaveSettings,
  onReloadAllData,
  onClearAllData,
  onShowToast
}) {
  const [pomoStudy, setPomoStudy] = useState(settings?.pomodoro?.studyMinutes || 25);
  const [pomoShort, setPomoShort] = useState(settings?.pomodoro?.shortBreakMinutes || 5);
  const [pomoLong, setPomoLong] = useState(settings?.pomodoro?.longBreakMinutes || 15);
  const [soundEnabled, setSoundEnabled] = useState(settings?.soundEnabled ?? true);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  const fileInputRef = useRef(null);

  const handleSavePomodoro = (e) => {
    e.preventDefault();
    const updated = {
      ...settings,
      soundEnabled,
      pomodoro: {
        studyMinutes: parseInt(pomoStudy, 10) || 25,
        shortBreakMinutes: parseInt(pomoShort, 10) || 5,
        longBreakMinutes: parseInt(pomoLong, 10) || 15,
        longBreakInterval: 4
      }
    };
    onSaveSettings(updated);
    onShowToast({ type: 'success', message: 'Settings saved successfully!' });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const result = validateAndImportJSON(content);
        if (result.success) {
          onShowToast({ type: 'success', message: result.message });
          onReloadAllData();
        } else {
          onShowToast({ type: 'error', message: result.message });
        }
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const handleConfirmClear = () => {
    onClearAllData();
    setClearConfirmOpen(false);
    onShowToast({ type: 'info', message: 'All local study data cleared.' });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Settings & Data Management</h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Configure study intervals, sound effects, backups, and local storage
        </p>
      </div>

      {/* LocalStorage Notice & Cloud Sync Readiness */}
      <div className="p-6 rounded-3xl bg-blue-50/80 dark:bg-slate-800/60 border border-blue-200/80 dark:border-slate-700 space-y-3">
        <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-bold text-sm">
          <span>💾</span>
          <span>How Your Data is Stored</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          StudyFlow automatically saves your subjects, goals, and study sessions directly in your browser's <strong>localStorage</strong>.
          Your data remains saved when you refresh or reopen the website.
        </p>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <strong>Important Note:</strong> Because data is stored in your current browser, it does not automatically synchronize to another computer or phone.
          To keep your records safe or transfer them to another device, use the <strong>Export Backup (JSON)</strong> button below!
        </p>
      </div>

      {/* Backup & Data Transfer Section */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-5">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Backup & Restore</h3>
          <p className="text-xs text-slate-400">Export your data or restore from a previous JSON backup file</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* JSON Export */}
          <button
            onClick={() => {
              exportToJSON();
              onShowToast({ type: 'success', message: 'Backup file downloaded (JSON)!' });
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition active:scale-95"
          >
            <span>💾</span>
            <span>Export Backup (JSON)</span>
          </button>

          {/* CSV Export */}
          <button
            onClick={() => {
              exportToCSV(subjects);
              onShowToast({ type: 'success', message: 'Study history downloaded (CSV)!' });
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition active:scale-95"
          >
            <span>📊</span>
            <span>Export History (CSV)</span>
          </button>

          {/* JSON Import */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs transition active:scale-95"
          >
            <span>📥</span>
            <span>Import Backup (JSON)</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,application/json"
            className="hidden"
          />
        </div>
      </div>

      {/* Pomodoro & Audio Preferences Form */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pomodoro & Sound Preferences</h3>
          <p className="text-xs text-slate-400">Customize default focus and break durations</p>
        </div>

        <form onSubmit={handleSavePomodoro} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Study Interval (min)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={pomoStudy}
                onChange={(e) => setPomoStudy(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Short Break (min)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={pomoShort}
                onChange={(e) => setPomoShort(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Long Break (min)
              </label>
              <input
                type="number"
                min="1"
                max="90"
                value={pomoLong}
                onChange={(e) => setPomoLong(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Synthesizer Sound Effects</div>
              <div className="text-[11px] text-slate-400">Play pleasant chimes on timer start, pause, and finish</div>
            </div>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition active:scale-95"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone: Clear Data */}
      <div className="p-6 md:p-8 rounded-3xl bg-red-50/50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/40 space-y-4">
        <div>
          <h3 className="text-base font-bold text-red-600 dark:text-red-400">Danger Zone</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Erase all local data and reset StudyFlow to default settings</p>
        </div>

        <button
          onClick={() => setClearConfirmOpen(true)}
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-500/20 transition active:scale-95"
        >
          Reset All StudyFlow Data
        </button>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={clearConfirmOpen}
        danger={true}
        title="Reset All Data?"
        message="This will permanently delete all your logged study sessions, customized subjects, and goals from this browser. Please export a JSON backup first if you want to keep your records."
        confirmText="Yes, Erase Everything"
        cancelText="Cancel"
        onConfirm={handleConfirmClear}
        onCancel={() => setClearConfirmOpen(false)}
      />
    </div>
  );
}
