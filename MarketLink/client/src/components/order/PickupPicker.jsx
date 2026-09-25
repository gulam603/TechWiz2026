import useFetch from '../../hooks/useFetch';
import { DAY_SHORT, MONTHS, parseDateKey, time12 } from '../../utils/format';
import { t } from '../../i18n';

/**
 * Lets the customer choose a pickup date, then a market window and a time slot.
 * value = { pickupDate, marketId, slotStart }
 */
export default function PickupPicker({ farmerId, value, onChange, excludeOrder }) {
  const { data, loading, error } = useFetch(`/farmers/${farmerId}/availability${excludeOrder ? `?excludeOrder=${excludeOrder}` : ''}`);
  const dates = data?.dates || [];
  // The first available date is selected until the customer picks another one
  const selectedDate = dates.some((d) => d.date === value.pickupDate) ? value.pickupDate : dates[0]?.date;
  const day = dates.find((d) => d.date === selectedDate);

  if (loading && !data) return <div className="skeleton" style={{ height: 150 }} />;
  if (error) return <div className="text-danger small">{error.message}</div>;
  if (!dates.length)
    return (
      <div className="alert alert-warning small mb-0">
        {t('This farmer has no open pickup slots in the next two weeks. Please remove these items or try again later.')}
      </div>
    );

  return (
    <div>
      <div className="small fw-bold mb-2">{t('1. Pickup date')}</div>
      <div className="date-chips mb-3" role="radiogroup" aria-label={t('Pickup date')}>
        {dates.map((d) => {
          const date = parseDateKey(d.date);
          return (
            <button
              type="button"
              key={d.date}
              className={selectedDate === d.date ? 'active' : ''}
              onClick={() => onChange({ pickupDate: d.date, marketId: '', slotStart: '' })}
              role="radio"
              aria-checked={selectedDate === d.date}
            >
              <div className="dow">{DAY_SHORT[date.getDay()]}</div>
              <div className="dnum">{date.getDate()}</div>
              <div className="mon">{MONTHS[date.getMonth()]}</div>
            </button>
          );
        })}
      </div>
      {day && (
        <>
          <div className="small fw-bold mb-2">{t('2. Time slot')}</div>
          {day.windows.map((w) => (
            <div key={w.market._id + w.start} className="mb-3">
              <div className="small text-muted-2 mb-2">
                <i className="bi bi-geo-alt-fill text-success" /> <strong className="text-forest">{w.market.name}</strong> · {time12(w.start)} {t('to')} {time12(w.end)}
              </div>
              <div className="slot-grid">
                {w.slots.map((s) => {
                  const active = value.pickupDate === selectedDate && value.slotStart === s.start && value.marketId === w.market._id;
                  return (
                    <button
                      type="button"
                      key={s.start}
                      disabled={!s.available}
                      className={active ? 'active' : ''}
                      onClick={() => onChange({ pickupDate: selectedDate, marketId: w.market._id, slotStart: s.start })}
                      aria-pressed={active}
                    >
                      {time12(s.start)}
                      <small>{s.available ? t('{n} left', { n: s.remaining }) : s.remaining === 0 ? t('Full') : t('Closed')}</small>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
