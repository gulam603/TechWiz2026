import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { t } from '../i18n';

const ToastContext = createContext(null);
let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((tx) => tx.id !== id)), []);

  const toast = useCallback(
    (message, type = 'success') => {
      const id = nextId++;
      setToasts((list) => [...list.slice(-2), { id, message, type }]);
      setTimeout(() => dismiss(id), 3800);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toast, success: (m) => toast(m, 'success'), error: (m) => toast(m, 'error') }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((tx) => (
          <div key={tx.id} className={`ml-toast ${tx.type}`}>
            <i className={`bi ${tx.type === 'error' ? 'bi-exclamation-octagon' : 'bi-check-circle-fill'}`} />
            <span>{t(tx.message)}</span>
            <button type="button" onClick={() => dismiss(tx.id)} aria-label={t('Dismiss')}>
              <i className="bi bi-x-lg" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
