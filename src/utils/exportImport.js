/**
 * StudyFlow - Export & Import System
 * Generates JSON full backups, CSV study history exports,
 * and validates imported JSON data to prevent corruption.
 */

import { Storage } from './storage.js';
import { formatSecondsToHMS } from './timeUtils.js';

// Trigger a browser file download
function triggerDownload(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

// Export All Data as JSON
export function exportToJSON() {
  const data = Storage.getAllData();
  const jsonString = JSON.stringify(data, null, 2);
  const dateStr = new Date().toISOString().slice(0, 10);
  triggerDownload(jsonString, `studyflow-backup-${dateStr}.json`, 'application/json');
}

// Export Sessions to CSV
export function exportToCSV(subjects = []) {
  const sessions = Storage.getSessions();
  const subjectMap = {};
  subjects.forEach(s => { subjectMap[s.id] = s.name; });

  const headers = ['Session ID', 'Date', 'Subject', 'Start Time', 'End Time', 'Duration (Seconds)', 'Duration (Formatted)', 'Notes'];
  const rows = sessions.map(sess => {
    const subjName = subjectMap[sess.subjectId] || 'Unassigned';
    const cleanNote = (sess.note || '').replace(/"/g, '""');
    const startFormatted = sess.startTime ? new Date(sess.startTime).toLocaleTimeString() : '';
    const endFormatted = sess.endTime ? new Date(sess.endTime).toLocaleTimeString() : '';
    const hms = formatSecondsToHMS(sess.durationSeconds || 0);

    return [
      `"${sess.id}"`,
      `"${sess.date || ''}"`,
      `"${subjName}"`,
      `"${startFormatted}"`,
      `"${endFormatted}"`,
      sess.durationSeconds || 0,
      `"${hms}"`,
      `"${cleanNote}"`
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  triggerDownload(csvContent, `studyflow-history-${dateStr}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Validate and Import JSON backup
 * Returns { success: boolean, message: string, data?: object }
 */
export function validateAndImportJSON(jsonText) {
  try {
    const parsed = JSON.parse(jsonText);

    if (!parsed || typeof parsed !== 'object') {
      return { success: false, message: 'Invalid JSON file: Content is not an object.' };
    }

    // Validate subjects if present
    if (parsed.subjects) {
      if (!Array.isArray(parsed.subjects)) {
        return { success: false, message: 'Invalid format: "subjects" must be a list.' };
      }
      for (const subj of parsed.subjects) {
        if (!subj.id || !subj.name) {
          return { success: false, message: 'Corrupted subject data found: each subject must have an id and name.' };
        }
      }
    }

    // Validate sessions if present
    if (parsed.sessions) {
      if (!Array.isArray(parsed.sessions)) {
        return { success: false, message: 'Invalid format: "sessions" must be a list.' };
      }
      for (const sess of parsed.sessions) {
        if (!sess.id || typeof sess.durationSeconds !== 'number') {
          return { success: false, message: 'Corrupted session data: sessions must contain a valid id and durationSeconds.' };
        }
      }
    }

    // Save validated data to Storage
    if (parsed.subjects) Storage.saveSubjects(parsed.subjects);
    if (parsed.sessions) Storage.saveSessions(parsed.sessions);
    if (parsed.goals) Storage.saveGoals(parsed.goals);
    if (parsed.settings) Storage.saveSettings(parsed.settings);

    return {
      success: true,
      message: `Successfully imported ${(parsed.subjects || []).length} subjects and ${(parsed.sessions || []).length} study sessions!`
    };
  } catch (err) {
    return { success: false, message: 'Failed to read file: ' + err.message };
  }
}
