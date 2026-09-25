import React, { useState, useMemo } from 'react';
import {
  formatSecondsHuman,
  getLocalDateString,
  filterSessionsByPeriod
} from '../utils/timeUtils.js';

export default function StudyAnalytics({ subjects, sessions, goals }) {
  const [period, setPeriod] = useState('week'); // 'week' | 'month' | 'all' | 'custom'
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [hoveredBar, setHoveredBar] = useState(null);

  // Filtered session records
  const filteredSessions = useMemo(() => {
    return filterSessionsByPeriod(sessions, period, customStart, customEnd);
  }, [sessions, period, customStart, customEnd]);

  // Aggregate stats
  const {
    totalSeconds,
    subjectTotals,
    dailyLast7Days,
    dailyWeeklyTrend
  } = useMemo(() => {
    let total = 0;
    const subjMap = {};

    filteredSessions.forEach(s => {
      const dur = s.durationSeconds || 0;
      total += dur;
      const sId = s.subjectId || 'unassigned';
      subjMap[sId] = (subjMap[sId] || 0) + dur;
    });

    // Generate Past 7 Days data points
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = getLocalDateString(d);
      const dayName = d.toLocaleDateString(undefined, { weekday: 'short' });
      const dayNum = d.getDate();

      // Find sessions for this specific date in ALL sessions
      const daySec = sessions
        .filter(s => s.date === dateStr)
        .reduce((sum, s) => sum + (s.durationSeconds || 0), 0);

      last7.push({
        dateStr,
        label: `${dayName} ${dayNum}`,
        seconds: daySec,
        hours: (daySec / 3600).toFixed(1)
      });
    }

    return {
      totalSeconds: total,
      subjectTotals: subjMap,
      dailyLast7Days: last7,
      dailyWeeklyTrend: []
    };
  }, [filteredSessions, sessions]);

  // Max seconds in last 7 days for chart scaling
  const maxDaySeconds = Math.max(3600 * 2, ...dailyLast7Days.map(d => d.seconds));

  // Subject percentage calculation
  const subjectPercentages = useMemo(() => {
    return subjects.map(s => {
      const sec = subjectTotals[s.id] || 0;
      const pct = totalSeconds > 0 ? Math.round((sec / totalSeconds) * 100) : 0;
      return {
        ...s,
        seconds: sec,
        percentage: pct
      };
    }).sort((a, b) => b.seconds - a.seconds);
  }, [subjects, subjectTotals, totalSeconds]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Study Analytics</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Interactive breakdown of your study habits, distribution, and velocity
          </p>
        </div>

        {/* Date Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl self-start md:self-auto">
          {[
            { id: 'week', label: 'Last 7 Days' },
            { id: 'month', label: 'Last 30 Days' },
            { id: 'all', label: 'All Time' },
            { id: 'custom', label: 'Custom' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setPeriod(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                period === f.id
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Range Picker */}
      {period === 'custom' && (
        <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-semibold">From:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs"
            />
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-semibold">To:</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs"
            />
          </div>
        </div>
      )}

      {/* Primary Chart: Daily Study Hours (Past 7 Days) */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Daily Study Velocity</h3>
            <p className="text-xs text-slate-400">Hours spent studying each day over the past 7 days</p>
          </div>
          <div className="text-right">
            <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">
              {formatSecondsHuman(dailyLast7Days.reduce((a, b) => a + b.seconds, 0))}
            </div>
            <div className="text-[11px] text-slate-400 font-medium">7-Day Total</div>
          </div>
        </div>

        {/* Interactive Bar Chart with Hover Tooltips */}
        <div className="relative pt-8 pb-2">
          {/* Tooltip on hover */}
          {hoveredBar && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-slate-700 flex items-center gap-2 pointer-events-none">
              <span>{hoveredBar.label}:</span>
              <span className="text-indigo-400 font-bold">{formatSecondsHuman(hoveredBar.seconds)} ({hoveredBar.hours} hrs)</span>
            </div>
          )}

          {/* Bar Columns Container */}
          <div className="grid grid-cols-7 gap-2 sm:gap-4 h-56 items-end border-b border-slate-100 dark:border-slate-800 pb-2">
            {dailyLast7Days.map((day, idx) => {
              const heightPercent = maxDaySeconds > 0
                ? Math.min(100, Math.round((day.seconds / maxDaySeconds) * 100))
                : 0;
              const isToday = idx === 6;

              return (
                <div
                  key={day.dateStr}
                  className="flex flex-col items-center justify-end h-full group cursor-pointer"
                  onMouseEnter={() => setHoveredBar(day)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {/* Top value badge */}
                  <span className="text-[11px] font-bold text-slate-400 group-hover:text-indigo-500 mb-1 transition">
                    {day.seconds > 0 ? `${day.hours}h` : '0h'}
                  </span>

                  {/* The Bar */}
                  <div className="w-full max-w-[42px] bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden h-full flex flex-col justify-end p-0.5">
                    <div
                      className={`w-full rounded-lg transition-all duration-500 ${
                        isToday
                          ? 'bg-gradient-to-t from-blue-600 via-indigo-600 to-purple-600 shadow-md shadow-indigo-500/30'
                          : 'bg-gradient-to-t from-indigo-500/80 to-purple-500/80 group-hover:from-indigo-600 group-hover:to-purple-600'
                      }`}
                      style={{ height: `${Math.max(4, heightPercent)}%` }}
                    />
                  </div>

                  {/* Day label */}
                  <span className={`text-[11px] font-semibold mt-2 ${
                    isToday ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400'
                  }`}>
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2-Column: Subject Allocation & Goal Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Share / Percentage Breakdown */}
        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Subject Distribution</h3>
              <p className="text-xs text-slate-400">Percentage of study time allocated to each subject</p>
            </div>
            <span className="text-xs font-bold text-slate-400">
              {formatSecondsHuman(totalSeconds)}
            </span>
          </div>

          {/* Multi-segment Progress Bar */}
          <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
            {subjectPercentages.map(s => {
              if (s.percentage === 0) return null;
              return (
                <div
                  key={s.id}
                  style={{ width: `${s.percentage}%`, backgroundColor: s.color }}
                  className="h-full transition-all duration-500 hover:opacity-80"
                  title={`${s.name}: ${s.percentage}%`}
                />
              );
            })}
          </div>

          {/* List of Subjects with Percentages & Actual Time */}
          <div className="space-y-3 pt-2">
            {subjectPercentages.map(s => (
              <div key={s.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="font-bold text-slate-800 dark:text-slate-200">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 dark:text-slate-400">{formatSecondsHuman(s.seconds)}</span>
                    <span className="font-extrabold text-slate-900 dark:text-white w-8 text-right">{s.percentage}%</span>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${s.percentage}%`, backgroundColor: s.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Goal Progress & Performance Insights */}
        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Goal Adherence</h3>
            <p className="text-xs text-slate-400">Tracking against your targets</p>

            <div className="space-y-4 mt-6">
              {subjects.map(subj => {
                const sec = subjectTotals[subj.id] || 0;
                const dailyGoalSec = (subj.dailyGoalMinutes || 0) * 60;
                const weeklyGoalSec = (subj.weeklyGoalMinutes || 0) * 60;

                return (
                  <div key={subj.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white">{subj.name}</div>
                      <div className="text-[11px] text-slate-400">
                        Target: {subj.dailyGoalMinutes ? `${subj.dailyGoalMinutes}m daily` : 'No goal set'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                        {formatSecondsHuman(sec)}
                      </div>
                      {dailyGoalSec > 0 && (
                        <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          {Math.round((sec / dailyGoalSec) * 100)}% of daily target
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/80 border border-blue-100 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
            💡 <strong>Pro Tip:</strong> Consistent short daily study blocks yield higher retention and cognitive endurance than cramming in single marathon sessions.
          </div>
        </div>
      </div>
    </div>
  );
}
