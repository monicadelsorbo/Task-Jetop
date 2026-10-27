import React, { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);

const TOAST_COLORS = {
  info: { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af' },
  success: { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534' },
  error: { bg: '#fef2f2', border: '#fecaca', text: '#b91c1c' }
};

const TOAST_DURATION_MS = 4000;

// Notifiche temporanee in basso a destra, disponibili in tutta l'app con useToast().
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts([...toasts, { id, message, type }]);

    setTimeout(() => {
      setToasts(toasts.filter((t) => t.id !== id));
    }, TOAST_DURATION_MS);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 2000, maxWidth: '360px' }}>
        {toasts.map((toast) => {
          const colors = TOAST_COLORS[toast.type] || TOAST_COLORS.info;
          return (
            <div
              key={toast.id}
              role="status"
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: colors.bg,
                border: `1px solid ${colors.border}`,
                color: colors.text,
                fontSize: '14px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }}
            >
              {toast.message}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
