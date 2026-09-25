/**
 * StudyFlow - LocalStorage Data Manager & Cloud-Sync Ready Abstraction
 * Manages subjects, sessions, goals, and settings with validation and backup support.
 */

export const STORAGE_KEYS = {
  SUBJECTS: 'studyflow_subjects',
  SESSIONS: 'studyflow_sessions',
  GOALS: 'studyflow_goals',
  SETTINGS: 'studyflow_settings',
  ACTIVE_TIMER: 'studyflow_active_timer',
  ROADMAP_PROGRESS: 'studyflow_roadmap_progress',
  SUBJECT_ROADMAPS: 'studyflow_subject_roadmaps'
};

// Default seed subjects as requested (Mathematics, DBMS, DSA, Python)
export const DEFAULT_SUBJECTS = [
  {
    id: 'subj_math',
    name: 'Mathematics',
    color: '#3B82F6', // Blue
    dailyGoalMinutes: 60,
    weeklyGoalMinutes: 300,
    order: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'subj_dbms',
    name: 'DBMS',
    color: '#8B5CF6', // Purple
    dailyGoalMinutes: 45,
    weeklyGoalMinutes: 225,
    order: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'subj_dsa',
    name: 'DSA',
    color: '#10B981', // Emerald Green
    dailyGoalMinutes: 90,
    weeklyGoalMinutes: 450,
    order: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: 'subj_python',
    name: 'Python',
    color: '#F59E0B', // Amber
    dailyGoalMinutes: 60,
    weeklyGoalMinutes: 300,
    order: 3,
    createdAt: new Date().toISOString()
  }
];

export const DEFAULT_GOALS = {
  overallDailyMinutes: 240 // 4 hours overall goal
};

export const DEFAULT_SETTINGS = {
  darkMode: true,
  soundEnabled: true,
  notificationsEnabled: false,
  pomodoro: {
    studyMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    longBreakInterval: 4
  }
};

// Safe JSON parser
function safeGet(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
}

// Safe JSON writer
function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`Error writing ${key} to localStorage:`, err);
    return false;
  }
}

export const Storage = {
  // Subjects
  getSubjects() {
    const stored = safeGet(STORAGE_KEYS.SUBJECTS, null);
    if (!stored || !Array.isArray(stored) || stored.length === 0) {
      safeSet(STORAGE_KEYS.SUBJECTS, DEFAULT_SUBJECTS);
      return DEFAULT_SUBJECTS;
    }
    return stored.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  },

  saveSubjects(subjects) {
    return safeSet(STORAGE_KEYS.SUBJECTS, subjects);
  },

  // Sessions
  getSessions() {
    const stored = safeGet(STORAGE_KEYS.SESSIONS, []);
    return Array.isArray(stored) ? stored : [];
  },

  saveSessions(sessions) {
    return safeSet(STORAGE_KEYS.SESSIONS, sessions);
  },

  addSession(session) {
    const current = this.getSessions();
    const updated = [session, ...current];
    this.saveSessions(updated);
    return updated;
  },

  addMultipleSessions(newSessions) {
    const current = this.getSessions();
    const updated = [...newSessions, ...current];
    this.saveSessions(updated);
    return updated;
  },

  updateSession(updatedSession) {
    const current = this.getSessions();
    const updated = current.map(s => s.id === updatedSession.id ? updatedSession : s);
    this.saveSessions(updated);
    return updated;
  },

  deleteSession(sessionId) {
    const current = this.getSessions();
    const updated = current.filter(s => s.id !== sessionId);
    this.saveSessions(updated);
    return updated;
  },

  // Goals
  getGoals() {
    return safeGet(STORAGE_KEYS.GOALS, DEFAULT_GOALS);
  },

  saveGoals(goals) {
    return safeSet(STORAGE_KEYS.GOALS, goals);
  },

  // Settings
  getSettings() {
    return { ...DEFAULT_SETTINGS, ...safeGet(STORAGE_KEYS.SETTINGS, {}) };
  },

  saveSettings(settings) {
    return safeSet(STORAGE_KEYS.SETTINGS, settings);
  },

  // Active Timer state (persisted across refresh/reopen)
  getActiveTimer() {
    return safeGet(STORAGE_KEYS.ACTIVE_TIMER, null);
  },

  saveActiveTimer(timerState) {
    if (!timerState) {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_TIMER);
    } else {
      safeSet(STORAGE_KEYS.ACTIVE_TIMER, timerState);
    }
  },

  clearActiveTimer() {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_TIMER);
  },

  getRoadmapProgress() {
    const stored = safeGet(STORAGE_KEYS.ROADMAP_PROGRESS, {});
    return stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {};
  },

  saveRoadmapProgress(progress) {
    return safeSet(STORAGE_KEYS.ROADMAP_PROGRESS, progress);
  },

  getSubjectRoadmaps() {
    const stored = safeGet(STORAGE_KEYS.SUBJECT_ROADMAPS, []);
    return Array.isArray(stored) ? stored : [];
  },

  saveSubjectRoadmaps(roadmaps) {
    return safeSet(STORAGE_KEYS.SUBJECT_ROADMAPS, roadmaps);
  },

  // Full backup payload
  getAllData() {
    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      subjects: this.getSubjects(),
      sessions: this.getSessions(),
      goals: this.getGoals(),
      settings: this.getSettings()
    };
  },

  // Clear all data
  clearAll() {
    localStorage.removeItem(STORAGE_KEYS.SUBJECTS);
    localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.GOALS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_TIMER);
    localStorage.removeItem(STORAGE_KEYS.ROADMAP_PROGRESS);
    localStorage.removeItem(STORAGE_KEYS.SUBJECT_ROADMAPS);
  }
};
