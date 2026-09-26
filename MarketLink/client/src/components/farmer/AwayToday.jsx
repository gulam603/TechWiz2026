import { useState } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { TodayBadge } from '../../utils/marketToday';
import { ConfirmModal } from '../common/Modal';
import { toDateKey } from '../../utils/format';
import { t } from '../../i18n';

/**
 * "Can't come to the market today?" on the farmer dashboard: marks today as a closed date, so customers
 * see "Not at the market today" and those with a pickup today get a message. It can be undone the same day.
 */
export default function AwayToday() {
  const { farmer, refresh } = useAuth();
  const { toast } = useToast();
  const [away, setAway] = useState(() => (farmer?.blockedDates || []).includes(toDateKey()));
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  if (!farmer) return null;

  async function save(next) {
    setBusy(true);
    try {
      const res = await api.post('/farmer/away-today', { away: next });
      setAway(res.away);
      setAsking(false);
      toast(res.message, next ? 'info' : 'success');
      refresh?.();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  const today = toDateKey();
  const shown = { ...farmer, blockedDates: away ? [...(farmer.blockedDates || []), today] : (farmer.blockedDates || []).filter((d) => d !== today) };
  return (
    <div className={`panel away-today mb-4 ${away ? 'is-away' : ''}`}>
      <div className="flex-grow-1 min-w-0">
        <span className="small fw-semi text-muted-2 d-block">{t('Your stall today')}</span>
        <TodayBadge farmer={shown} />
      </div>
      {away ? (
        <button type="button" className="btn btn-white btn-sm" onClick={() => save(false)} disabled={busy}>
          {busy ? <span className="spinner-border spinner-border-sm" aria-hidden="true" /> : <i className="bi bi-arrow-counterclockwise" aria-hidden="true" />} {t('I can come after all')}
        </button>
      ) : (
        <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => setAsking(true)} disabled={busy}>
          <i className="bi bi-calendar-x" aria-hidden="true" /> {t('I cannot come to the market today')}
        </button>
      )}
      <ConfirmModal
        open={asking}
        title={t('Not at the market today?')}
        message={t('Customers will see that you are not at the market today, and everyone with a pickup today gets a notification and an e-mail.')}
        confirmLabel={t('Yes, I cannot come')}
        danger
        busy={busy}
        onConfirm={() => save(true)}
        onClose={() => setAsking(false)}
      />
    </div>
  );
}
