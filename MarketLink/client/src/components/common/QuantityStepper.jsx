import { t } from '../../i18n';
export default function QuantityStepper({ value, onChange, min = 1, max = 999, size = '', label = t('Quantity') }) {
  const set = (n) => onChange(Math.max(min, Math.min(max, Number.isFinite(n) ? n : min)));
  return (
    <div className={`qty-stepper ${size}`}>
      <button type="button" onClick={() => set(value - 1)} disabled={value <= min} aria-label={t('Decrease quantity')}>
        <i className="bi bi-dash" />
      </button>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        aria-label={label}
        onChange={(e) => set(parseInt(e.target.value, 10))}
      />
      <button type="button" onClick={() => set(value + 1)} disabled={value >= max} aria-label={t('Increase quantity')}>
        <i className="bi bi-plus" />
      </button>
    </div>
  );
}
