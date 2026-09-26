import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { t } from '../../i18n';

/** Accessible modal dialog controlled by React state (no Bootstrap JS needed). */
export default function Modal({ open, title, onClose, children, footer, size = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    ref.current?.focus({ preventScroll: true });
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="ml-modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={`ml-modal ${size}`} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={ref}>
        <div className="ml-modal-header">
          <h5>{title}</h5>
          <button type="button" className="btn-close" onClick={onClose} aria-label={t('Close')} />
        </div>
        <div className="ml-modal-body">{children}</div>
        {footer && <div className="ml-modal-footer">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

export function ConfirmModal({ open, title = t('Are you sure?'), message, confirmLabel = t('Confirm'), danger, busy, onConfirm, onClose, children }) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-white" onClick={onClose} disabled={busy}>
            {t('Cancel')}
          </button>
          <button type="button" className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm} disabled={busy}>
            {busy && <span className="spinner-border spinner-border-sm" />} {confirmLabel}
          </button>
        </>
      }
    >
      {message && <p className="mb-2 text-muted-2">{message}</p>}
      {children}
    </Modal>
  );
}
