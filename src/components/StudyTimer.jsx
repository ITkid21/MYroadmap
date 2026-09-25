import React, { useState, useEffect, useRef } from 'react';
import {
  formatSecondsToHMS,
  distributeSessionAcrossMidnight
} from '../utils/timeUtils.js';
import { sound } from '../utils/audioUtils.js';

export default function StudyTimer({
  subjects,
  activeTimerState,
  onSaveActiveTimer,
  onClearActiveTimer,
  onCompleteSession,
  onShowToast,
  initialSubjectId
}) {
  // If active timer exists in storage, restore it; otherwise initial values
  const [selectedSubjectId, setSelectedSubjectId] = useState(
    activeTimerState?.subjectId || initialSubjectId || (subjects[0]?.id || '')
  );
  const [sessionNote, setSessionNote] = useState(activeTimerState?.note || '');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(Boolean(activeTimerState?.isRunning));
  const [isFinishing, setIsFinishing] = useState(false);

  // Keep a ref to prevent duplicate finishes
  const isSubmittingRef = useRef(false);

  // Sync selectedSubjectId if initialSubjectId changes from external trigger
  useEffect(() => {
    if (initialSubjectId && !activeTimerState) {
      setSelectedSubjectId(initialSubjectId);
    }
  }, [initialSubjectId, activeTimerState]);

  // Recalculate elapsed seconds from timestamps whenever activeTimerState is set or on tick
  const computeCurrentElapsedMs = (timer) => {
    if (!timer) return 0;
    const base = timer.accumulatedMs || 0;
    if (timer.isRunning && timer.lastStartedAt) {
      return base + Math.max(0, Date.now() - timer.lastStartedAt);
    }
    return base;
  };

  // Sync internal state when activeTimerState changes (e.g. from local storage reload)
  useEffect(() => {
    if (activeTimerState) {
      setSelectedSubjectId(activeTimerState.subjectId || (subjects[0]?.id || ''));
      setSessionNote(activeTimerState.note || '');
      setIsRunning(Boolean(activeTimerState.isRunning));
      const totalMs = computeCurrentElapsedMs(activeTimerState);
      setElapsedSeconds(Math.floor(totalMs / 1000));
    } else {
      setElapsedSeconds(0);
      setIsRunning(false);
      setSessionNote('');
    }
  }, [activeTimerState, subjects]);

  // High precision interval ticker (100ms) to ensure smooth display and accurate timestamp sync
  useEffect(() => {
    if (!isRunning || !activeTimerState) return;

    const interval = setInterval(() => {
      const totalMs = computeCurrentElapsedMs(activeTimerState);
      setElapsedSeconds(Math.floor(totalMs / 1000));
    }, 200);

    return () => clearInterval(interval);
  }, [isRunning, activeTimerState]);

  // Handler: START
  const handleStart = () => {
    if (!selectedSubjectId) {
      onShowToast({ type: 'error', message: 'Please select a subject first!' });
      return;
    }

    const now = Date.now();
    const newTimer = {
      id: 'timer_' + now,
      mode: 'stopwatch',
      subjectId: selectedSubjectId,
      startTime: now,
      accumulatedMs: 0,
      lastStartedAt: now,
      isRunning: true,
      note: sessionNote
    };

    setIsRunning(true);
    onSaveActiveTimer(newTimer);
    sound.playStart();
    onShowToast({ type: 'success', message: 'Study timer started! Focus mode on.' });
  };

  // Handler: PAUSE (Paused time must NOT count toward study time)
  const handlePause = () => {
    if (!activeTimerState || !activeTimerState.isRunning) return;

    const now = Date.now();
    const addedMs = Math.max(0, now - (activeTimerState.lastStartedAt || now));
    const newAccumulated = (activeTimerState.accumulatedMs || 0) + addedMs;

    const updated = {
      ...activeTimerState,
      accumulatedMs: newAccumulated,
      lastStartedAt: null,
      isRunning: false,
      note: sessionNote
    };

    setIsRunning(false);
    onSaveActiveTimer(updated);
    sound.playPause();
    onShowToast({ type: 'info', message: 'Timer paused. Take a breath!' });
  };

  // Handler: RESUME
  const handleResume = () => {
    if (!activeTimerState) return;

    const now = Date.now();
    const updated = {
      ...activeTimerState,
      lastStartedAt: now,
      isRunning: true,
      note: sessionNote
    };

    setIsRunning(true);
    onSaveActiveTimer(updated);
    sound.playStart();
    onShowToast({ type: 'success', message: 'Study session resumed!' });
  };

  // Handler: FINISH & SAVE
  const handleFinish = () => {
    if (!activeTimerState || isSubmittingRef.current) return;

    // Prevent duplicate submission immediately
    isSubmittingRef.current = true;
    setIsFinishing(true);

    const now = Date.now();
    let totalMs = activeTimerState.accumulatedMs || 0;
    if (activeTimerState.isRunning && activeTimerState.lastStartedAt) {
      totalMs += Math.max(0, now - activeTimerState.lastStartedAt);
    }

    const totalSeconds = Math.round(totalMs / 1000);

    if (totalSeconds < 1) {
      onShowToast({ type: 'error', message: 'Session too short to record (< 1 second).' });
      onClearActiveTimer();
      setIsRunning(false);
      setElapsedSeconds(0);
      setSessionNote('');
      setIsFinishing(false);
      isSubmittingRef.current = false;
      return;
    }

    // Handle Midnight Crossing:
    // If session crossed midnight, split into appropriate calendar day records
    const sessionStartTime = activeTimerState.startTime || (now - totalMs);
    const sessionEndTime = now;

    const splitSessions = distributeSessionAcrossMidnight(
      sessionStartTime,
      sessionEndTime,
      totalSeconds,
      activeTimerState.subjectId || selectedSubjectId,
      sessionNote
    );

    // Save sessions to storage
    onCompleteSession(splitSessions);
    sound.playComplete();

    // Clear active timer state from local storage
    onClearActiveTimer();
    setIsRunning(false);
    setElapsedSeconds(0);
    setSessionNote('');

    onShowToast({
      type: 'success',
      message: `Completed ${formatSecondsToHMS(totalSeconds)} study session! Saved to history.`
    });

    setTimeout(() => {
      setIsFinishing(false);
      isSubmittingRef.current = false;
    }, 400);
  };

  // Discard / Reset
  const handleDiscard = () => {
    if (window.confirm('Are you sure you want to discard this active session? It will not be saved.')) {
      onClearActiveTimer();
      setIsRunning(false);
      setElapsedSeconds(0);
      setSessionNote('');
      onShowToast({ type: 'info', message: 'Session discarded.' });
    }
  };

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white">
          Focus Stopwatch
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Precision study tracker with persistent session recovery & midnight splitting
        </p>
      </div>

      {/* Main Timer Card */}
      <div className="relative overflow-hidden p-8 md:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl text-center">
        {/* Glow ambient background effect */}
        <div
          className={`absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700 ${
            isRunning ? 'bg-indigo-500 scale-125' : 'bg-blue-500 scale-100'
          }`}
        />
        <div
          className={`absolute -bottom-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700 ${
            isRunning ? 'bg-purple-500 scale-125' : 'bg-slate-500 scale-100'
          }`}
        />

        {/* Subject Selection Pill */}
        <div className="relative z-10 mb-8 inline-block">
          <div className="flex items-center gap-2 p-1.5 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span
              className="w-3.5 h-3.5 rounded-full shadow-sm"
              style={{ backgroundColor: selectedSubject?.color || '#3B82F6' }}
            />
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                setSelectedSubjectId(e.target.value);
                if (activeTimerState) {
                  onSaveActiveTimer({ ...activeTimerState, subjectId: e.target.value });
                }
              }}
              disabled={isRunning}
              className="bg-transparent text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer disabled:cursor-not-allowed"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id} className="dark:bg-slate-800 text-slate-900 dark:text-white">
                  {s.name}
                </option>
              ))}
              {subjects.length === 0 && (
                <option value="">No subjects created</option>
              )}
            </select>
          </div>
        </div>

        {/* Large Stopwatch Display (Hours : Minutes : Seconds) */}
        <div className="relative z-10 my-4">
          <div className="text-6xl sm:text-7xl md:text-8xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 drop-shadow-sm select-none">
            {formatSecondsToHMS(elapsedSeconds)}
          </div>
          <div className="flex justify-center gap-12 sm:gap-16 text-[10px] sm:text-xs uppercase font-extrabold tracking-widest text-slate-400 mt-2">
            <span>Hours</span>
            <span>Minutes</span>
            <span>Seconds</span>
          </div>
        </div>

        {/* Notes Input Field */}
        <div className="relative z-10 my-6 max-w-md mx-auto">
          <input
            type="text"
            placeholder="Add note: e.g., Solved LeetCode 33, reviewed SQL indexing..."
            value={sessionNote}
            onChange={(e) => {
              setSessionNote(e.target.value);
              if (activeTimerState) {
                onSaveActiveTimer({ ...activeTimerState, note: e.target.value });
              }
            }}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/70 text-slate-900 dark:text-white text-xs sm:text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
          />
        </div>

        {/* Control Buttons */}
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-4 mt-8">
          {!activeTimerState ? (
            /* Start button */
            <button
              onClick={handleStart}
              disabled={subjects.length === 0}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-extrabold text-base shadow-xl shadow-indigo-500/30 transition transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
            >
              ▶ Start Session
            </button>
          ) : (
            <>
              {isRunning ? (
                /* Pause button */
                <button
                  onClick={handlePause}
                  className="px-7 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-lg shadow-amber-500/25 transition active:scale-95"
                >
                  ⏸ Pause
                </button>
              ) : (
                /* Resume button */
                <button
                  onClick={handleResume}
                  className="px-7 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition active:scale-95"
                >
                  ▶ Resume
                </button>
              )}

              {/* Finish button */}
              <button
                onClick={handleFinish}
                disabled={isFinishing}
                className="px-7 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition active:scale-95 disabled:opacity-50"
              >
                {isFinishing ? 'Saving...' : '✓ Finish & Save'}
              </button>

              {/* Discard button */}
              <button
                onClick={handleDiscard}
                className="px-4 py-3 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 text-xs font-semibold transition"
                title="Discard session"
              >
                Discard
              </button>
            </>
          )}
        </div>
      </div>

      {/* Info Tips for User */}
      <div className="p-5 rounded-2xl bg-blue-50/60 dark:bg-slate-800/40 border border-blue-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed">
        <div className="font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
          <span>💡</span> Smart Session Guarantees:
        </div>
        <p>• <strong>Refresh Resilience:</strong> If your browser crashes or you refresh the page, your elapsed time is safely restored using actual real-time timestamps.</p>
        <p>• <strong>Accurate Pausing:</strong> Pauses are strictly excluded so you only record genuine study time.</p>
        <p>• <strong>Midnight Crossing:</strong> Late night study sessions spanning past midnight are automatically partitioned into their respective calendar dates for 100% accurate daily analytics.</p>
      </div>
    </div>
  );
}
