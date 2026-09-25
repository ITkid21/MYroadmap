import React, { useMemo, useState } from 'react';
import careerRoadmap from '../../database/career-roadmap.json';
import pythonRoadmap from '../../database/subject-roadmaps/roadmapPYTHON.json';

function ProgressBar({ value }) {
  return (
    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
      <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${value}%` }} />
    </div>
  );
}

export default function Roadmap({ progress, onProgressChange, customRoadmaps = [], onCustomRoadmapsChange, subjects, onQuickStartSubject }) {
  const [view, setView] = useState('career');
  const [selectedRoadmapId, setSelectedRoadmapId] = useState('python');
  const [uploadError, setUploadError] = useState('');
  const isCareer = view === 'career';
  const subjectRoadmaps = [{ id: 'python', ...pythonRoadmap }, ...customRoadmaps];
  const selectedRoadmap = subjectRoadmaps.find(roadmap => roadmap.id === selectedRoadmapId) || subjectRoadmaps[0];
  const careerItems = useMemo(() => careerRoadmap.groups.flatMap(group => group.items), []);
  const completedCount = isCareer
    ? careerItems.filter(item => progress[item.id]).length
    : selectedRoadmap.phases.filter(phase => progress[phase.id]).length;
  const totalCount = isCareer ? careerItems.length : selectedRoadmap.phases.length;
  const percent = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  const toggleItem = (id) => onProgressChange({ ...progress, [id]: !progress[id] });
  const startSubject = (name) => {
    const subject = subjects.find(item => item.name.toLowerCase() === name.toLowerCase());
    if (subject) onQuickStartSubject(subject.id);
  };

  const handleRoadmapUpload = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!parsed.title || !Array.isArray(parsed.phases) || parsed.phases.length === 0) {
          throw new Error('A roadmap needs a title and at least one phases array item.');
        }
        const phases = parsed.phases.map((phase, index) => {
          if (!phase.name || !Array.isArray(phase.topics)) {
            throw new Error('Each phase needs a name and topics array.');
          }
          return { ...phase, id: String(phase.id || `${file.name}-${index}`) };
        });
        const roadmap = { ...parsed, id: `custom-${Date.now()}`, phases };
        onCustomRoadmapsChange([...customRoadmaps, roadmap]);
        setSelectedRoadmapId(roadmap.id);
        setView('python');
        setUploadError('');
      } catch (error) {
        setUploadError(error.message || 'That file is not valid roadmap JSON.');
      }
    };
    reader.readAsText(file);
  };

  const removeSelectedRoadmap = () => {
    if (!selectedRoadmapId.startsWith('custom-')) return;
    const remaining = customRoadmaps.filter(roadmap => roadmap.id !== selectedRoadmapId);
    onCustomRoadmapsChange(remaining);
    setSelectedRoadmapId('python');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <section className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 md:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Your learning path</p>
            <h2 className="mt-2 text-2xl md:text-3xl font-black">{isCareer ? careerRoadmap.title : selectedRoadmap.title}</h2>
            <p className="mt-2 text-sm text-slate-300">{isCareer ? careerRoadmap.description : selectedRoadmap.description}</p>
          </div>
          <div className="min-w-40 md:text-right"><div className="text-3xl font-black">{percent}%</div><p className="text-xs text-slate-300">{completedCount} of {totalCount} milestones complete</p></div>
        </div>
        <div className="mt-6"><ProgressBar value={percent} /></div>
      </section>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setView('career')} className={`px-4 py-2 rounded-xl text-sm font-bold ${isCareer ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'}`}>Backend + DSA</button>
        <button onClick={() => setView('python')} className={`px-4 py-2 rounded-xl text-sm font-bold ${!isCareer ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'}`}>Subject roadmap</button>
        {!isCareer && subjectRoadmaps.map(roadmap => <button key={roadmap.id} onClick={() => setSelectedRoadmapId(roadmap.id)} className={`px-4 py-2 rounded-xl text-sm font-bold ${selectedRoadmap.id === roadmap.id ? 'bg-slate-700 text-white dark:bg-slate-200 dark:text-slate-900' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'}`}>{roadmap.title}</button>)}
        <label className="px-4 py-2 rounded-xl text-sm font-bold bg-amber-500 text-white cursor-pointer">Upload JSON<input type="file" accept="application/json,.json" onChange={handleRoadmapUpload} className="hidden" /></label>
        {!isCareer && selectedRoadmap.id.startsWith('custom-') && <button onClick={removeSelectedRoadmap} className="px-4 py-2 rounded-xl text-sm font-bold text-rose-600 border border-rose-200 dark:border-rose-900">Remove uploaded roadmap</button>}
      </div>
      {uploadError && <p className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-700 dark:text-rose-300">{uploadError}</p>}

      {isCareer ? (
        <div className="space-y-5">
          {careerRoadmap.groups.map(group => {
            const groupComplete = group.items.filter(item => progress[item.id]).length;
            return (
              <section key={group.id} className="p-5 md:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4"><div><h3 className="text-lg font-black">{group.name}</h3><p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{group.description}</p></div><button onClick={() => startSubject(group.subject)} className="self-start px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold">Study {group.subject} -&gt;</button></div>
                <div className="space-y-2">{group.items.map(item => <label key={item.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer"><input type="checkbox" checked={Boolean(progress[item.id])} onChange={() => toggleItem(item.id)} className="mt-1 h-4 w-4 accent-emerald-500" /><span className={`text-sm ${progress[item.id] ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>{item.label}</span></label>)}</div>
                <div className="mt-4 flex items-center gap-3"><div className="flex-1"><ProgressBar value={group.items.length ? Math.round((groupComplete / group.items.length) * 100) : 0} /></div><span className="text-xs text-slate-400">{groupComplete}/{group.items.length}</span></div>
                <div className="mt-4 flex flex-wrap gap-2">{group.resources.map(resource => <a key={resource.name} href={resource.url} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">{resource.name} ↗</a>)}</div>
              </section>
            );
          })}
          <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/20"><h3 className="font-bold text-amber-800 dark:text-amber-300">Keep these reminders close</h3><ul className="mt-2 space-y-1 text-sm text-amber-900/80 dark:text-amber-200/80">{careerRoadmap.reminders.map(reminder => <li key={reminder}>• {reminder}</li>)}</ul></div>
        </div>
      ) : (
        <div className="space-y-5">
          {selectedRoadmap.phases.map(phase => <section key={phase.id} className="p-5 md:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm"><div className="flex items-start gap-3"><input type="checkbox" checked={Boolean(progress[phase.id])} onChange={() => toggleItem(phase.id)} className="mt-1 h-4 w-4 accent-emerald-500" /><div className="flex-1"><div className="flex flex-wrap items-baseline justify-between gap-2"><h3 className={`text-lg font-black ${progress[phase.id] ? 'line-through text-slate-400' : ''}`}>{phase.name}</h3><span className="text-xs text-slate-400">{phase.duration}</span></div><div className="mt-3 flex flex-wrap gap-2">{phase.topics.map(topic => <span key={topic} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">{topic}</span>)}</div><div className="mt-4 flex flex-wrap gap-3">{(phase.resources || []).map(resource => <a key={resource.name} href={resource.url} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">{resource.name} ↗</a>)}</div></div></div></section>)}
          {selectedRoadmap.weekly_rhythm && <div className="p-5 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"><h3 className="font-bold">Weekly rhythm</h3><div className="mt-3 grid gap-2 sm:grid-cols-3">{selectedRoadmap.weekly_rhythm.map(item => <div key={item.days}><p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{item.days}</p><p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{item.activity}</p></div>)}</div><p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{selectedRoadmap.tip}</p></div>}
        </div>
      )}
    </div>
  );
}
