import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((toast) => {
    const id = Math.random().toString(36).slice(2);
    const t = { id, type: toast.type || 'info', message: toast.message || '' };
    setToasts((prev) => [...prev, t]);
    const timeout = toast.duration ?? 3000;
    if (timeout > 0) setTimeout(() => remove(id), timeout);
    return id;
  }, [remove]);

  const api = useMemo(() => ({
    success: (message, duration) => push({ type: 'success', message, duration }),
    error: (message, duration) => push({ type: 'error', message, duration }),
    info: (message, duration) => push({ type: 'info', message, duration }),
    remove,
  }), [push, remove]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed z-50 top-4 right-4 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={
              'shadow-lg rounded-md px-4 py-3 text-sm border ' +
              (t.type === 'success'
                ? 'bg-green-50 text-green-800 border-green-200'
                : t.type === 'error'
                ? 'bg-red-50 text-red-800 border-red-200'
                : 'bg-blue-50 text-blue-800 border-blue-200')
            }
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
