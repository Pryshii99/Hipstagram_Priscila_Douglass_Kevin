import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ToastState } from '../types';

interface Toast { id: number; message: string; type: 'success'|'error'|'info'; }

const ToastContext = createContext<ToastState | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success'|'error'|'info' = 'success') => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);

  const icons: Record<string, string> = {
    success: 'bi-check-circle-fill',
    error:   'bi-x-circle-fill',
    info:    'bi-info-circle-fill',
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="hip-toasts">
        {toasts.map(t => (
          <div key={t.id} className={`hip-toast ${t.type}`}>
            <i className={`bi ${icons[t.type]}`}></i>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastState {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider');
  return ctx;
}
