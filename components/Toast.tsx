'use client';
import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

let toastCallbacks: ((toast: ToastData) => void)[] = [];

export const showToast = (type: ToastType, title: string, message?: string) => {
  const toast: ToastData = { id: Date.now().toString(), type, title, message };
  toastCallbacks.forEach(cb => cb(toast));
};

const icons = { success: CheckCircle, error: XCircle, warning: AlertCircle, info: Info };
const colors = {
  success: { bg: 'rgba(0,229,160,0.12)', border: 'rgba(0,229,160,0.3)', icon: '#00e5a0' },
  error: { bg: 'rgba(255,77,109,0.12)', border: 'rgba(255,77,109,0.3)', icon: '#ff4d6d' },
  warning: { bg: 'rgba(255,140,66,0.12)', border: 'rgba(255,140,66,0.3)', icon: '#ff8c42' },
  info: { bg: 'rgba(0,212,255,0.12)', border: 'rgba(0,212,255,0.3)', icon: '#00d4ff' },
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    const handler = (toast: ToastData) => {
      setToasts(prev => [...prev, toast]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== toast.id)), 4000);
    };
    toastCallbacks.push(handler);
    return () => { toastCallbacks = toastCallbacks.filter(cb => cb !== handler); };
  }, []);

  return (
    <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map(toast => {
        const Icon = icons[toast.type];
        const c = colors[toast.type];
        return (
          <div key={toast.id} className="toast-enter" style={{
            background: 'var(--bg-card)',
            border: `1px solid ${c.border}`,
            borderRadius: 10,
            padding: '12px 16px',
            display: 'flex', alignItems: 'flex-start', gap: 10,
            minWidth: 280, maxWidth: 340,
            boxShadow: `0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px ${c.border}`,
          }}>
            <Icon size={16} style={{ color: c.icon, flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: toast.message ? 2 : 0 }}>{toast.title}</div>
              {toast.message && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{toast.message}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
