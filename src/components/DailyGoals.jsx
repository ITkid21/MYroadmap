import React, { useState } from 'react';
import { formatSecondsHuman, getLocalDateString } from '../utils/timeUtils.js';

export default function DailyGoals({
  goals,
  subjects,
  sessions,
  onSaveGoals,
  onShowToast
}) {
  const currentDailyMins = goals?.overallDailyMinutes || 240;
  const [dailyHours, setDailyHours] = useState(Math.floor(currentDailyMins / 60));
  const [dailyMins, setDailyMins] = useState(currentDailyMins % 60);

  const todayStr = getLocalDateString(new Date());
  const todaySeconds = sessions
    .filter(s => s.date === todayStr)
    .reduce((sum, s) => sum + (s.durationSeconds || 0), 0);

  const targetSeconds = (dailyHours * 60 + dailyMins) * 60;
  const progressPercent = targetSeconds > 0
    ? Math.min(100, Math.round((todaySeconds / targetSeconds) * 100))
    : 0;

  const handleSave = (e) => {
    e.preventDefault();
    const totalMinutes = (parseInt(dailyHours, 10) || 0) * 60 + (parseInt(dailyMins, 10) || 0);
    if (totalMinutes <= 0) {
      onShowToast({ type: 'error', message: 'Daily goal must be greater than 0 minutes.' });
      return;
    }

    onSaveGoals({ ...goals, overallDailyMinutes: totalMinutes });
    onShowToast({
      type: 'success',
      message: `Daily goal set to ${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m!`
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Daily Study Goals</h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Set ambitious yet sustainable daily study targets and build momentum
        </p>
      </div>

      {/* Goal Progress Hero Card */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Today's Achievement
            </span>
            <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {formatSecondsHuman(todaySeconds)}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Goal: {dailyHours}h {dailyMins}m ({formatSecondsHuman(targetSeconds)})
            </div>
          </div>

          <div className="w-20 h-20 rounded-full border-4 border-slate-100 dark:border-slate-800 flex items-center justify-center relative">
            <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              progressPercent >= 100
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Milestone Badge */}
        {progressPercent >= 100 ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
            <span>🎉</span>
            <span>You have reached your daily study goal today! Outstanding discipline.</span>
          </div>
        ) : (
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {targetSeconds - todaySeconds > 0
              ? `${formatSecondsHuman(targetSeconds - todaySeconds)} remaining to hit your target today.`
              : 'Goal achieved!'}
          </div>
        )}
      </div>

      {/* Edit Goal Form */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Customize Overall Daily Goal</h3>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Hours
              </label>
              <input
                type="number"
                min="0"
                max="24"
                value={dailyHours}
                onChange={(e) => setDailyHours(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Minutes
              </label>
              <input
                type="number"
                min="0"
                max="59"
                value={dailyMins}
                onChange={(e) => setDailyMins(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition active:scale-95"
            >
              Update Goal
            </button>
          </div>
        </form>
      </div>

      {/* Subject Goals Overview */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Individual Subject Goals</h3>
        <p className="text-xs text-slate-400">Configured inside the Subjects tab</p>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {subjects.map(s => (
            <div key={s.id} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="font-bold text-slate-800 dark:text-slate-200">{s.name}</span>
              </div>
              <div className="text-slate-500 dark:text-slate-400">
                {s.dailyGoalMinutes ? `${s.dailyGoalMinutes}m daily` : 'No daily goal'} • {s.weeklyGoalMinutes ? `${s.weeklyGoalMinutes}m weekly` : 'No weekly goal'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
