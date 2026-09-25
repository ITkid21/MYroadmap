import React, { useState } from 'react';
import ConfirmationModal from './ConfirmationModal.jsx';

const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#84CC16', // Lime
];

export default function SubjectManager({
  subjects,
  sessions,
  onSaveSubject,
  onDeleteSubject,
  onReorderSubjects,
  onShowToast
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState('');
  const [weeklyGoalMinutes, setWeeklyGoalMinutes] = useState('');
  const [formError, setFormError] = useState('');

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState(null);

  const openAddModal = () => {
    setEditingSubject(null);
    setName('');
    setColor(PRESET_COLORS[subjects.length % PRESET_COLORS.length]);
    setDailyGoalMinutes('');
    setWeeklyGoalMinutes('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (subject) => {
    setEditingSubject(subject);
    setName(subject.name);
    setColor(subject.color || PRESET_COLORS[0]);
    setDailyGoalMinutes(subject.dailyGoalMinutes ? String(subject.dailyGoalMinutes) : '');
    setWeeklyGoalMinutes(subject.weeklyGoalMinutes ? String(subject.weeklyGoalMinutes) : '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Subject name is required.');
      return;
    }

    const dailyVal = dailyGoalMinutes ? parseInt(dailyGoalMinutes, 10) : 0;
    const weeklyVal = weeklyGoalMinutes ? parseInt(weeklyGoalMinutes, 10) : 0;

    if (dailyVal < 0 || weeklyVal < 0) {
      setFormError('Goal minutes cannot be negative.');
      return;
    }

    const newSubject = {
      id: editingSubject ? editingSubject.id : 'subj_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: name.trim(),
      color: color || PRESET_COLORS[0],
      dailyGoalMinutes: dailyVal || 0,
      weeklyGoalMinutes: weeklyVal || 0,
      order: editingSubject ? editingSubject.order : subjects.length,
      createdAt: editingSubject ? editingSubject.createdAt : new Date().toISOString()
    };

    onSaveSubject(newSubject);
    setIsModalOpen(false);
    onShowToast({
      type: 'success',
      message: editingSubject ? `Updated "${newSubject.name}"!` : `Added new subject "${newSubject.name}"!`
    });
  };

  const promptDelete = (subject) => {
    setSubjectToDelete(subject);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (subjectToDelete) {
      onDeleteSubject(subjectToDelete.id);
      onShowToast({
        type: 'info',
        message: `Deleted subject "${subjectToDelete.name}".`
      });
    }
    setDeleteConfirmOpen(false);
    setSubjectToDelete(null);
  };

  // Reorder subjects
  const moveSubject = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= subjects.length) return;

    const reordered = [...subjects];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    // Update order property
    const updated = reordered.map((s, idx) => ({ ...s, order: idx }));
    onReorderSubjects(updated);
  };

  // Check how many sessions exist for subjectToDelete
  const recordedSessionCount = subjectToDelete
    ? sessions.filter(s => s.subjectId === subjectToDelete.id).length
    : 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Subject Management</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Create subjects, customize colors, configure daily or weekly study goals, and reorder.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition active:scale-95 self-start sm:self-auto"
        >
          <span>＋</span>
          <span>Add Subject</span>
        </button>
      </div>

      {/* Subjects Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subjects.map((subject, idx) => {
          const sessionCount = sessions.filter(s => s.subjectId === subject.id).length;
          const totalSeconds = sessions
            .filter(s => s.subjectId === subject.id)
            .reduce((sum, s) => sum + (s.durationSeconds || 0), 0);
          const totalHours = (totalSeconds / 3600).toFixed(1);

          return (
            <div
              key={subject.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className="w-4 h-4 rounded-full ring-4 ring-offset-2 dark:ring-offset-slate-900"
                    style={{ backgroundColor: subject.color, ringColor: `${subject.color}30` }}
                  />
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      {subject.name}
                    </h3>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {sessionCount} {sessionCount === 1 ? 'session' : 'sessions'} • {totalHours}h logged
                    </div>
                  </div>
                </div>

                {/* Move Up/Down Controls */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                  <button
                    onClick={() => moveSubject(idx, -1)}
                    disabled={idx === 0}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 text-xs"
                    title="Move up"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveSubject(idx, 1)}
                    disabled={idx === subjects.length - 1}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 text-xs"
                    title="Move down"
                  >
                    ▼
                  </button>
                </div>
              </div>

              {/* Goals Summary */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="space-y-0.5">
                  <div>Daily: {subject.dailyGoalMinutes ? `${subject.dailyGoalMinutes} min` : 'None'}</div>
                  <div>Weekly: {subject.weeklyGoalMinutes ? `${subject.weeklyGoalMinutes} min` : 'None'}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(subject)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold text-slate-700 dark:text-slate-200 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => promptDelete(subject)}
                    className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-semibold transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {subjects.length === 0 && (
        <div className="p-12 text-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
          <span className="text-4xl">📚</span>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-3">No subjects yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Add your subjects (like Mathematics, DBMS, DSA, or Python) to start tracking your study sessions.
          </p>
          <button
            onClick={openAddModal}
            className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
          >
            Create First Subject
          </button>
        </div>
      )}

      {/* Add / Edit Subject Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingSubject ? 'Edit Subject' : 'Add New Subject'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium">
                  {formError}
                </div>
              )}

              {/* Subject Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Mathematics, DBMS, DSA, Python"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Subject Color
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        color === c ? 'scale-125 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Goals */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Daily Goal (minutes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 60"
                    value={dailyGoalMinutes}
                    onChange={(e) => setDailyGoalMinutes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Weekly Goal (minutes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 300"
                    value={weeklyGoalMinutes}
                    onChange={(e) => setWeeklyGoalMinutes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/25"
                >
                  {editingSubject ? 'Save Changes' : 'Create Subject'}
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
        title={`Delete "${subjectToDelete?.name}"?`}
        message={
          recordedSessionCount > 0
            ? `⚠️ Warning: "${subjectToDelete?.name}" has ${recordedSessionCount} recorded study sessions in your history. Deleting this subject will unassign its study history, but your total study time will remain intact. Are you sure you want to proceed?`
            : `Are you sure you want to delete "${subjectToDelete?.name}"? This action cannot be undone.`
        }
        confirmText="Yes, Delete Subject"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </div>
  );
}
