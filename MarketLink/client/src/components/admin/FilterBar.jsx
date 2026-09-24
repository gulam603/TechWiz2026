import { useEffect, useState } from 'react';
import { api } from '../../api/client';

let cache = null;
let pending = null;

/** Lists for the admin filter dropdowns (cities, markets, farmers, categories), loaded once. */
export function useFilterOptions() {
  const [options, setOptions] = useState(cache);
  useEffect(() => {
    if (cache) return undefined;
    let alive = true;
    pending ||= api.get('/admin/filter-options').then((d) => (cache = d));
    pending.then((d) => alive && setOptions(d)).catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return options || { cities: [], markets: [], farmers: [], categories: [] };
}

/** Forget the cached lists (after adding a city, market or farmer). */
export function resetFilterOptions() {
  cache = null;
  pending = null;
}

function listFor(source, options) {
  if (Array.isArray(source)) return source;
  if (source === 'cities') return options.cities.map((c) => ({ value: c.name, label: c.name }));
  if (source === 'markets') return options.markets.map((m) => ({ value: m._id, label: m.name }));
  if (source === 'farmers') return options.farmers.map((f) => ({ value: f._id, label: f.stallName }));
  if (source === 'categories') return options.categories.map((c) => ({ value: c._id, label: c.name }));
  return [];
}

/**
 * Compact row of filter controls for a DataGrid.
 * fields: [{ name, label, type: 'select' | 'date' | 'number', options: [...] | 'cities' | 'markets' | 'farmers' | 'categories' }]
 */
export default function FilterBar({ fields, value, onChange }) {
  const options = useFilterOptions();
  const active = Object.values(value).filter((v) => v !== '' && v !== undefined).length;
  const set = (name, v) => onChange({ ...value, [name]: v });
  return (
    <div className="filter-bar" role="group" aria-label="Filters">
      {fields.map((f) => (
        <label key={f.name} className={`filter-field ${f.type === 'date' ? 'is-date' : ''} ${f.type === 'number' ? 'is-number' : ''} ${f.wide ? 'is-wide' : ''}`}>
          <span>{f.label}</span>
          {f.type === 'date' || f.type === 'number' ? (
            <input type={f.type} className="form-control form-control-sm" value={value[f.name] ?? ''} min={f.type === 'number' ? 0 : undefined} placeholder={f.placeholder} onChange={(e) => set(f.name, e.target.value)} />
          ) : (
            <select className="form-select form-select-sm" value={value[f.name] ?? ''} onChange={(e) => set(f.name, e.target.value)}>
              <option value="">{f.all || 'All'}</option>
              {listFor(f.options, options).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          )}
        </label>
      ))}
      {active > 0 && (
        <button type="button" className="btn btn-sm btn-link filter-reset" onClick={() => onChange(Object.fromEntries(fields.map((f) => [f.name, ''])))}>
          <i className="bi bi-x-circle" /> Clear {active} filter{active > 1 ? 's' : ''}
        </button>
      )}
    </div>
  );
}
