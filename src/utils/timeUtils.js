/**
 * StudyFlow - Time & Date Utility Functions
 * Handles formatting, midnight crossing distribution, streak calculation, and date math.
 */

// Format seconds into HH:MM:SS
export function formatSecondsToHMS(totalSeconds) {
  if (!totalSeconds || isNaN(totalSeconds) || totalSeconds < 0) totalSeconds = 0;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

// Format seconds into human readable e.g. "2h 30m" or "45m"
export function formatSecondsHuman(totalSeconds) {
  if (!totalSeconds || isNaN(totalSeconds) || totalSeconds < 0) return '0m';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  if (minutes > 0) {
    return `${minutes}m`;
  }
  return `${seconds}s`;
}

// Format Date object or ISO string to YYYY-MM-DD local date string
export function getLocalDateString(dateInput = new Date()) {
  const d = new Date(dateInput);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Format time string to 12-hour AM/PM format (e.g., "10:30 AM")
export function formatTime12H(dateInput) {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '--:--';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

// Format friendly date (e.g. "Today", "Yesterday", "Sep 24, 2026")
export function formatFriendlyDate(dateStr) {
  const todayStr = getLocalDateString(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  if (dateStr === todayStr) return 'Today';
  if (dateStr === yesterdayStr) return 'Yesterday';

  const [y, m, d] = dateStr.split('-');
  const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
  return dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Handle Midnight Crossing:
 * If a study session spans across midnight (starts on day A and ends on day B or later),
 * this function distributes the duration correctly across the calendar dates.
 *
 * @param {number} startTimestamp - Unix epoch ms when session started
 * @param {number} endTimestamp - Unix epoch ms when session ended
 * @param {number} actualStudySeconds - Total actual study time in seconds (excluding pauses)
 * @param {string} subjectId - Subject ID
 * @param {string} note - Optional notes
 * @returns {Array<Object>} List of session objects, one for each calendar day
 */
export function distributeSessionAcrossMidnight(startTimestamp, endTimestamp, actualStudySeconds, subjectId, note = '') {
  if (actualStudySeconds <= 0) return [];

  const startDate = new Date(startTimestamp);
  const endDate = new Date(endTimestamp);

  const startDateStr = getLocalDateString(startDate);
  const endDateStr = getLocalDateString(endDate);

  // If start and end are on the same calendar day, no split needed
  if (startDateStr === endDateStr) {
    return [{
      id: 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      subjectId,
      date: startDateStr,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      durationSeconds: Math.round(actualStudySeconds),
      note: note.trim()
    }];
  }

  // If session crosses midnight, split proportionally based on real-time passage in each day
  const totalElapsedMs = Math.max(1000, endTimestamp - startTimestamp);
  const sessions = [];

  let currentStart = new Date(startTimestamp);

  while (currentStart < endDate) {
    const curDateStr = getLocalDateString(currentStart);
    // Midnight at end of currentStart day
    const nextMidnight = new Date(currentStart.getFullYear(), currentStart.getMonth(), currentStart.getDate() + 1, 0, 0, 0, 0);
    const segmentEnd = nextMidnight < endDate ? nextMidnight : endDate;

    const segmentMs = segmentEnd.getTime() - currentStart.getTime();
    // Calculate fraction of study time for this day segment
    const segmentProportion = segmentMs / totalElapsedMs;
    const segmentStudySeconds = Math.round(actualStudySeconds * segmentProportion);

    if (segmentStudySeconds > 0) {
      sessions.push({
        id: 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7) + '_' + sessions.length,
        subjectId,
        date: curDateStr,
        startTime: currentStart.toISOString(),
        endTime: segmentEnd.toISOString(),
        durationSeconds: segmentStudySeconds,
        note: note.trim() ? `${note.trim()} (Midnight split for ${curDateStr})` : `Midnight split for ${curDateStr}`
      });
    }

    currentStart = nextMidnight;
  }

  return sessions;
}

/**
 * Calculate Study Streak in days
 * A streak is consecutive days with at least 1 study session.
 * If user studied today, today is counted.
 * If user hasn't studied today yet, yesterday's streak is still maintained.
 */
export function calculateStreak(sessions = []) {
  if (!sessions || sessions.length === 0) return 0;

  // Collect unique dates where study duration > 0
  const activeDates = new Set();
  sessions.forEach(s => {
    if (s.durationSeconds > 0 && s.date) {
      activeDates.add(s.date);
    }
  });

  if (activeDates.size === 0) return 0;

  const todayStr = getLocalDateString(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  let checkDate = new Date();
  // If user hasn't studied today, start checking from yesterday
  if (!activeDates.has(todayStr)) {
    if (!activeDates.has(yesterdayStr)) {
      return 0; // Streak broken
    }
    checkDate.setDate(checkDate.getDate() - 1);
  }

  let streak = 0;
  while (true) {
    const dStr = getLocalDateString(checkDate);
    if (activeDates.has(dStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Filter sessions by date range:
 * 'today', 'week' (last 7 days), 'month' (last 30 days), 'all', or custom [startDate, endDate]
 */
export function filterSessionsByPeriod(sessions, period = 'all', customStart = null, customEnd = null) {
  if (!sessions) return [];
  const todayStr = getLocalDateString(new Date());

  if (period === 'today') {
    return sessions.filter(s => s.date === todayStr);
  }

  if (period === 'week') {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    const startStr = getLocalDateString(d);
    return sessions.filter(s => s.date >= startStr && s.date <= todayStr);
  }

  if (period === 'month') {
    const d = new Date();
    d.setDate(d.getDate() - 29);
    const startStr = getLocalDateString(d);
    return sessions.filter(s => s.date >= startStr && s.date <= todayStr);
  }

  if (period === 'custom' && customStart && customEnd) {
    return sessions.filter(s => s.date >= customStart && s.date <= customEnd);
  }

  return sessions;
}
