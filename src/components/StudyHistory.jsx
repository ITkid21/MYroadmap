import React, { useState, useMemo } from 'react';
import {
  formatSecondsToHMS,
  formatFriendlyDate,
  formatTime12H,
  getLocalDateString
} from '../utils/timeUtils.js';
import ConfirmationModal from './ConfirmationModal.jsx';
import { exportToCSV } from '../utils/exportImport.js';

export default function StudyHistory({
  subjects,
  sessions,
  onUpdateSession,
  onDeleteSession,
  onShowToast
}) {
  const [filterSubjectId, setFilterSubjectId] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Editing state
  const [editingSession, setEditingSession] = useState(null);
  const [editDurationMinutes, setEditDurationMinutes] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editDate, setEditDate] = useState('');

  // Deletion state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);

  // Map subjects for fast lookup
  const subjectMap = useMemo(() => {
    const map = {};
    subjects.forEach(s => { map[s.id] = s; });
    return map;
  }, [subjects]);

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter(sess => {
      // Subject filter
      if (filterSubjectId !== 'all' && sess.subjectId !== filterSubjectId) {
        return false;
      }
      // Date filter
      if (filterDate && sess.date !== filterDate) {
        return false;
      }
      // Search note
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const noteMatch = (sess.note || '').toLowerCase().includes(query);
        const subjName = (subjectMap[sess.subjectId]?.name || '').toLowerCase();
        if (!noteMatch && !subjName.includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [sessions, filterSubjectId, filterDate, searchQuery, subjectMap]);

  // Open edit modal
  const openEditModal = (sess) => {
    setEditingSession(sess);
    setEditDurationMinutes(String(Math.round((sess.durationSeconds || 0) / 60)));
    setEditNote(sess.note || '');
    setEditDate(sess.date || getLocalDateString(new Date()));
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingSession) return;

    const mins = parseInt(editDurationMinutes, 10);
    if (isNaN(mins) || mins <= 0) {
      onShowToast({ type: 'error', message: 'Duration must be a positive number of minutes.' });
      return;
    }

    const updated = {
      ...editingSession,
      durationSeconds: mins * 60,
      note: editNote.trim(),
      date: editDate || editingSession.date
    };

    onUpdateSession(updated);
    setEditingSession(null);
    onShowToast({ type: 'success', message: 'Study session updated! Statistics recalculated.' });
  };

  // Prompt delete
  const promptDelete = (sess) => {
    setSessionToDelete(sess);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (sessionToDelete) {
      onDeleteSession(sessionToDelete.id);
      onShowToast({ type: 'info', message: 'Study session deleted. Statistics recalculated.' });
    }
    setDeleteConfirmOpen(false);
    setSessionToDelete(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Study History</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Audit, edit, and review every logged study session
          </p>
        </div>

        <button
          onClick={() => exportToCSV(subjects)}
          disabled={sessions.length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition disabled:opacity-40 self-start sm:self-auto"
        >
          <span>📥</span>
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-wrap items-center gap-3">
        {/* Subject Filter */}
        <div className="flex-1 min-w-[160px]">
          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Subject</label>
          <select
            value={filterSubjectId}
            onChange={(e) => setFilterSubjectId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Subjects</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div className="min-w-[150px]">
          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Date</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
          />
        </div>

        {/* Search note */}
        <div className="flex-1 min-w-[180px]">
          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Search Notes</label>
          <input
            type="text"
            placeholder="Search keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
          />
        </div>

        {/* Clear Filters */}
        {(filterSubjectId !== 'all' || filterDate || searchQuery) && (
          <div className="self-end">
            <button
              onClick={() => {
                setFilterSubjectId('all');
                setFilterDate('');
                setSearchQuery('');
              }}
              className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* History Table */}
      <div className="overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-4">Time Window</th>
                <th className="py-3.5 px-4">Study Duration</th>
                <th className="py-3.5 px-4">Notes</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200 font-medium">
              {filteredSessions.map((sess) => {
                const subj = subjectMap[sess.subjectId];
                const startTimeStr = sess.startTime ? formatTime12H(sess.startTime) : '--';
                const endTimeStr = sess.endTime ? formatTime12H(sess.endTime) : '--';

                return (
                  <tr key={sess.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-900 dark:text-white">
                      {formatFriendlyDate(sess.date)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                            style={{
                              backgroundColor: `${subj?.color || '#94A3B8'}18`,
                              color: subj?.color || '#94A3B8'
                            }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: subj?.color || '#94A3B8' }} />
                        {subj?.name || 'Unassigned'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-400">
                      {startTimeStr} - {endTimeStr}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-bold font-mono text-slate-900 dark:text-white">
                      {formatSecondsToHMS(sess.durationSeconds || 0)}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-500 dark:text-slate-400" title={sess.note}>
                      {sess.note || <span className="italic text-slate-300 dark:text-slate-600">No notes</span>}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => openEditModal(sess)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => promptDelete(sess)}
                        className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 font-semibold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredSessions.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            <span className="text-3xl">📭</span>
            <p className="mt-2 text-sm font-semibold">No study sessions found</p>
            <p className="text-xs text-slate-400 mt-1">
              {sessions.length === 0
                ? 'Start your study timer to record your first session!'
                : 'Try adjusting your subject or date filters.'}
            </p>
          </div>
        )}
      </div>

      {/* Edit Session Modal */}
      {editingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit Study Record</h3>
              <button
                onClick={() => setEditingSession(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Study Duration (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  value={editDurationMinutes}
                  onChange={(e) => setEditDurationMinutes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Notes
                </label>
                <textarea
                  rows="3"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingSession(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/25"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmOpen}
        danger={true}
        title="Delete Study Record?"
        message="Are you sure you want to delete this study session record? Dashboard statistics will be recalculated immediately."
        confirmText="Yes, Delete Session"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </div>
  );
}
