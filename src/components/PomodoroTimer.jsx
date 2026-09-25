import React, { useState, useEffect, useRef } from 'react';
import { formatSecondsToHMS, getLocalDateString } from '../utils/timeUtils.js';
import { sound } from '../utils/audioUtils.js';

export default function PomodoroTimer({
  subjects,
  settings,
  onCompleteSession,
  onShowToast
}) {
  const pomodoroSettings = settings?.pomodoro || {
    studyMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    longBreakInterval: 4
  };

  const [mode, setMode] = useState('study'); // 'study' | 'shortBreak' | 'longBreak'
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [completedCycles, setCompletedCycles] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(pomodoroSettings.studyMinutes * 60);
  const [note, setNote] = useState('');

  // Track the timestamp when interval started to log actual study time
  const studyStartTimestampRef = useRef(null);

  // Request browser notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch (err) {
        console.warn('Notification permission error:', err);
      }
    }
  };

  const sendBrowserNotification = (title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: 'favicon.ico'
        });
      } catch (e) {
        console.warn('Could not fire notification:', e);
      }
    }
  };

  // Switch modes and reset time
  const switchMode = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
    if (newMode === 'study') {
      setTimeLeft(pomodoroSettings.studyMinutes * 60);
    } else if (newMode === 'shortBreak') {
      setTimeLeft(pomodoroSettings.shortBreakMinutes * 60);
    } else if (newMode === 'longBreak') {
      setTimeLeft(pomodoroSettings.longBreakMinutes * 60);
    }
  };

  // Handle timer countdown
  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleIntervalComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, mode, completedCycles]);

  // When timer hits 0
  const handleIntervalComplete = () => {
    setIsRunning(false);
    sound.playBell();

    if (mode === 'study') {
      // ONLY ACTUAL STUDY TIME COUNTS! (Breaks never count)
      const studySeconds = pomodoroSettings.studyMinutes * 60;
      const now = Date.now();
      const startTime = studyStartTimestampRef.current || (now - studySeconds * 1000);

      const sessionObj = {
        id: 'sess_pomo_' + now + '_' + Math.random().toString(36).substring(2, 6),
        subjectId: selectedSubjectId || (subjects[0]?.id || 'unassigned'),
        date: getLocalDateString(new Date(now)),
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(now).toISOString(),
        durationSeconds: studySeconds,
        note: note.trim() ? `Pomodoro: ${note.trim()}` : 'Pomodoro focus session'
      };

      onCompleteSession([sessionObj]);
      sendBrowserNotification('Pomodoro Finished!', 'Great focus! Time for a well-deserved break.');

      const nextCycles = completedCycles + 1;
      setCompletedCycles(nextCycles);

      onShowToast({
        type: 'success',
        message: `🍅 Study session of ${pomodoroSettings.studyMinutes}m logged! Time for a break.`
      });

      // Check if time for long break or short break
      if (nextCycles % pomodoroSettings.longBreakInterval === 0) {
        switchMode('longBreak');
      } else {
        switchMode('shortBreak');
      }
    } else {
      // Break completed (BREAKS NEVER COUNT AS STUDY TIME!)
      sendBrowserNotification('Break Over!', 'Ready to dive back into your studies?');
      onShowToast({
        type: 'info',
        message: 'Break finished! Let’s get back to studying.'
      });
      switchMode('study');
    }
  };

  const handleStart = () => {
    requestNotificationPermission();
    if (mode === 'study') {
      studyStartTimestampRef.current = Date.now();
    }
    setIsRunning(true);
    sound.playStart();
  };

  const handlePause = () => {
    setIsRunning(false);
    sound.playPause();
  };

  const handleReset = () => {
    setIsRunning(false);
    if (mode === 'study') {
      setTimeLeft(pomodoroSettings.studyMinutes * 60);
    } else if (mode === 'shortBreak') {
      setTimeLeft(pomodoroSettings.shortBreakMinutes * 60);
    } else {
      setTimeLeft(pomodoroSettings.longBreakMinutes * 60);
    }
  };

  const totalDuration = mode === 'study'
    ? pomodoroSettings.studyMinutes * 60
    : mode === 'shortBreak'
      ? pomodoroSettings.shortBreakMinutes * 60
      : pomodoroSettings.longBreakMinutes * 60;

  const progressPercent = totalDuration > 0
    ? Math.round(((totalDuration - timeLeft) / totalDuration) * 100)
    : 0;

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white">
          Pomodoro Mode
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Structured intervals: 25m Focus • 5m Short Break • 15m Long Break
        </p>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex justify-center p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl max-w-sm mx-auto">
        <button
          onClick={() => switchMode('study')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
            mode === 'study'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          🍅 Focus ({pomodoroSettings.studyMinutes}m)
        </button>
        <button
          onClick={() => switchMode('shortBreak')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
            mode === 'shortBreak'
              ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          ☕ Short ({pomodoroSettings.shortBreakMinutes}m)
        </button>
        <button
          onClick={() => switchMode('longBreak')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
            mode === 'longBreak'
              ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          🌴 Long ({pomodoroSettings.longBreakMinutes}m)
        </button>
      </div>

      {/* Main Pomodoro Card */}
      <div className="p-8 md:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl text-center space-y-6">
        {/* Subject selector for study mode */}
        {mode === 'study' ? (
          <div className="inline-block">
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              disabled={isRunning}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-bold text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span>☕</span> Rest & Recharge (Breaks are not logged as study time)
          </span>
        )}

        {/* Large Timer Countdown */}
        <div className="text-7xl sm:text-8xl font-black font-mono tracking-tight text-slate-900 dark:text-white select-none">
          {formatSecondsToHMS(timeLeft).substring(3)} {/* Show MM:SS */}
        </div>

        {/* Circular / Linear Progress Bar */}
        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              mode === 'study' ? 'bg-indigo-600' : 'bg-emerald-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Optional Note */}
        {mode === 'study' && (
          <input
            type="text"
            placeholder="Focus target (e.g. Chapter 4 Exercises)..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={isRunning}
            className="w-full max-w-sm px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-center text-slate-900 dark:text-white"
          />
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 pt-4">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 transition active:scale-95"
            >
              ▶ Start
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="px-8 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-xl shadow-amber-500/25 transition active:scale-95"
            >
              ⏸ Pause
            </button>
          )}

          <button
            onClick={handleReset}
            className="px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 text-xs font-bold transition"
          >
            Reset
          </button>
        </div>

        {/* Cycle indicators */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-400">
          <span>Cycles completed:</span>
          <span className="font-extrabold text-slate-700 dark:text-slate-200">{completedCycles}</span>
          <div className="flex gap-1 ml-2">
            {[...Array(pomodoroSettings.longBreakInterval)].map((_, i) => (
              <span
                key={i}
                className={`w-2.5 h-2.5 rounded-full ${
                  i < (completedCycles % pomodoroSettings.longBreakInterval)
                    ? 'bg-indigo-600'
                    : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
