import React, { useMemo } from 'react';
import {
  formatSecondsToHMS,
  formatSecondsHuman,
  getLocalDateString,
  calculateStreak
} from '../utils/timeUtils.js';

export default function Dashboard({
  subjects,
  sessions,
  goals,
  onNavigateTab,
  onQuickStartSubject
}) {
  const todayStr = getLocalDateString(new Date());

  // Calculate start of current week (last 7 days or calendar week)
  const stats = useMemo(() => {
    let todaySec = 0;
    let weekSec = 0;
    let monthSec = 0;
    let lifetimeSec = 0;
    const subjectTimeMap = {};

    // 7 days ago
    const d7 = new Date();
    d7.setDate(d7.getDate() - 6);
    const startWeekStr = getLocalDateString(d7);

    // 30 days ago
    const d30 = new Date();
    d30.setDate(d30.getDate() - 29);
    const startMonthStr = getLocalDateString(d30);

    sessions.forEach(sess => {
      const dur = sess.durationSeconds || 0;
      lifetimeSec += dur;

      if (sess.date === todayStr) {
        todaySec += dur;
      }
      if (sess.date >= startWeekStr && sess.date <= todayStr) {
        weekSec += dur;
      }
      if (sess.date >= startMonthStr && sess.date <= todayStr) {
        monthSec += dur;
      }

      const sId = sess.subjectId || 'unassigned';
      subjectTimeMap[sId] = (subjectTimeMap[sId] || 0) + dur;
    });

    const streak = calculateStreak(sessions);
    return {
      todaySec,
      weekSec,
      monthSec,
      lifetimeSec,
      subjectTimeMap,
      streak,
      totalSessions: sessions.length
    };
  }, [sessions, todayStr]);

  // Daily Goal Calculations
  const dailyGoalMinutes = goals?.overallDailyMinutes || 240; // Default 4 hours
  const dailyGoalSeconds = dailyGoalMinutes * 60;
  const progressPercent = dailyGoalSeconds > 0
    ? Math.min(100, Math.round((stats.todaySec / dailyGoalSeconds) * 100))
    : 0;

  // Motivational message
  const getMotivationalMessage = () => {
    if (progressPercent >= 100) return '🎉 Daily Goal Crushed! Outstanding dedication today!';
    if (progressPercent >= 75) return '🔥 So close to the finish line! Keep pushing!';
    if (progressPercent >= 50) return '⚡ Halfway there! You are making great progress!';
    if (progressPercent > 0) return '🌱 Solid start! Keep your focus sharp.';
    return '✨ Ready to learn? Start your first study session today!';
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner / Goal Progress */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 md:p-8 text-white shadow-xl shadow-indigo-500/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md">
              <span>🎯</span> Daily Goal Tracker
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {getMotivationalMessage()}
            </h2>
            <p className="text-blue-100 text-sm">
              Today you studied <span className="font-bold text-white">{formatSecondsHuman(stats.todaySec)}</span> of your {formatSecondsHuman(dailyGoalSeconds)} goal.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
            <div className="text-right">
              <div className="text-3xl font-black">{progressPercent}%</div>
              <div className="text-xs text-blue-100 font-medium">Completed</div>
            </div>
            <button
              onClick={() => onNavigateTab('timer')}
              className="px-5 py-3 rounded-xl bg-white text-indigo-600 hover:bg-blue-50 font-bold text-sm shadow-lg transition active:scale-95"
            >
              Start Studying →
            </button>
          </div>
        </div>

        {/* Progress Bar Line */}
        <div className="relative z-10 mt-6 h-3 w-full bg-black/20 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-gradient-to-r from-emerald-300 to-teal-200 rounded-full transition-all duration-700 ease-out shadow-sm"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Today */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Today</span>
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-500 text-base">📅</span>
          </div>
          <div className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
            {formatSecondsToHMS(stats.todaySec)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {formatSecondsHuman(stats.todaySec)} studied today
          </div>
        </div>

        {/* This Week */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Past 7 Days</span>
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 text-base">🗓️</span>
          </div>
          <div className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
            {formatSecondsHuman(stats.weekSec)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Weekly consistency
          </div>
        </div>

        {/* This Month */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Past 30 Days</span>
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-500 text-base">📈</span>
          </div>
          <div className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
            {formatSecondsHuman(stats.monthSec)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Monthly aggregate
          </div>
        </div>

        {/* Streak & Total Sessions */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Study Streak</span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500 text-base">🔥</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
              {stats.streak}
            </span>
            <span className="text-xs font-semibold text-slate-500">{stats.streak === 1 ? 'day' : 'days'}</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {stats.totalSessions} total sessions completed
          </div>
        </div>
      </div>

      {/* Subject Breakdown & Lifetime Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject Progress Cards (2 cols) */}
        <div className="lg:col-span-2 p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Subject Breakdown</h3>
              <p className="text-xs text-slate-400">Total time recorded per subject</p>
            </div>
            <button
              onClick={() => onNavigateTab('subjects')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Manage Subjects →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {subjects.map(subj => {
              const totalSec = stats.subjectTimeMap[subj.id] || 0;
              const dailyGoalSec = (subj.dailyGoalMinutes || 0) * 60;
              const hasGoal = dailyGoalSec > 0;
              const percent = hasGoal ? Math.min(100, Math.round((totalSec / dailyGoalSec) * 100)) : 0;

              return (
                <div
                  key={subj.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col justify-between space-y-3 group hover:border-slate-300 dark:hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full shadow-sm"
                        style={{ backgroundColor: subj.color || '#3B82F6' }}
                      />
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                        {subj.name}
                      </span>
                    </div>

                    <button
                      onClick={() => onQuickStartSubject(subj.id)}
                      className="opacity-0 group-hover:opacity-100 text-xs font-medium px-2 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-sm text-indigo-600 dark:text-indigo-300 transition"
                      title="Launch timer with this subject"
                    >
                      ▶ Study
                    </button>
                  </div>

                  <div>
                    <div className="text-lg font-extrabold text-slate-900 dark:text-white">
                      {formatSecondsHuman(totalSec)}
                    </div>
                    {hasGoal && (
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-400">
                          <span>Daily goal: {subj.dailyGoalMinutes}m</span>
                          <span>{percent}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%`, backgroundColor: subj.color || '#3B82F6' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lifetime Overview Card (1 col) */}
        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Milestones</span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">Lifetime Achievement</h3>
            <p className="text-xs text-slate-400 mt-1">Total time invested in your future</p>

            <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900/40 text-center">
              <span className="text-4xl">🏆</span>
              <div className="text-2xl md:text-3xl font-black text-indigo-950 dark:text-indigo-200 mt-3">
                {formatSecondsHuman(stats.lifetimeSec)}
              </div>
              <div className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
                Total Study Time
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Total Sessions</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{stats.totalSessions}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Subjects Tracked</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{subjects.length}</span>
            </div>
            <button
              onClick={() => onNavigateTab('analytics')}
              className="w-full py-2.5 mt-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition"
            >
              View Detailed Analytics →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
