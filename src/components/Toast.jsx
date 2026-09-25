import React, { useEffect } from 'react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, toast.duration || 3500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 animate-slideIn">
      <span className="text-xl">
        {isSuccess ? '✅' : isError ? '❌' : 'ℹ️'}
      </span>
      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
        {toast.message}
      </p>
      <button
        onClick={onClose}
        className="ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
      >
        ✕
      </button>
    </div>
  );
}
