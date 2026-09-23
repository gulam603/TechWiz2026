import { CURRENCY } from '../config';

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAY_LETTER = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// A non-breaking space keeps "Rs 1,200" on one line inside tables and cards
export function money(value) {
  const n = Number(value) || 0;
  return `${CURRENCY}\u00a0${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}

/** Short money for big KPI tiles: Rs 836.7k */
export function moneyCompact(value) {
  const n = Number(value) || 0;
  return n >= 100000 ? `${CURRENCY}\u00a0${compactNumber(n)}` : money(Math.round(n));
}

export function compactNumber(value) {
  const n = Number(value) || 0;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
}

/** "2026-09-26" -> Date at local midnight (never shifted by time zones) */
export function parseDateKey(key) {
  const [y, m, d] = String(key).split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function toDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function formatDateKey(key, { withYear = false } = {}) {
  if (!key) return '';
  const d = parseDateKey(key);
  return `${DAY_SHORT[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}${withYear ? ` ${d.getFullYear()}` : ''}`;
}

export function formatDate(value, { time = false } = {}) {
  if (!value) return '';
  const d = new Date(value);
  const base = `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  return time ? `${base}, ${formatTime(d)}` : base;
}

export function formatTime(date) {
  const d = new Date(date);
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'pm' : 'am';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

/** "08:30" -> "8:30 am" */
export function time12(hhmm) {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'pm' : 'am'}`;
}

export function timeAgo(value) {
  const seconds = Math.round((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(value);
}

/** "in 2 days", "in 5 hours" */
export function timeUntil(value) {
  const ms = new Date(value).getTime() - Date.now();
  if (ms <= 0) return 'now';
  const hours = Math.round(ms / 3_600_000);
  if (hours < 1) return `in ${Math.max(1, Math.round(ms / 60000))} min`;
  if (hours < 48) return `in ${hours} h`;
  return `in ${Math.round(hours / 24)} days`;
}

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}

export const ORDER_STATUS_META = {
  placed: { label: 'Placed', icon: 'bi-receipt' },
  accepted: { label: 'Accepted', icon: 'bi-hand-thumbs-up' },
  ready: { label: 'Ready for pickup', icon: 'bi-bag-check' },
  completed: { label: 'Completed', icon: 'bi-check2-circle' },
  declined: { label: 'Declined', icon: 'bi-x-circle' },
  cancelled: { label: 'Cancelled', icon: 'bi-slash-circle' },
};

export const PRODUCT_STATUS_LABEL = { available: 'Available', sold_out: 'Sold out', unavailable: 'Unavailable' };

// Soft gradient covers picked from a name so every farmer / market looks different but stable
const COVERS = [
  'linear-gradient(135deg, #d9efc2 0%, #f7e9b8 100%)',
  'linear-gradient(135deg, #ffe0cf 0%, #fde9b9 100%)',
  'linear-gradient(135deg, #d4ecf7 0%, #e3f3d4 100%)',
  'linear-gradient(135deg, #f6dcea 0%, #fbeccd 100%)',
  'linear-gradient(135deg, #e0e9c2 0%, #cfe7d6 100%)',
  'linear-gradient(135deg, #fbe7c6 0%, #f3d6c4 100%)',
];
const DARK_COVERS = [
  'linear-gradient(135deg, #173b2c 0%, #2e7d4f 100%)',
  'linear-gradient(135deg, #1d3f4a 0%, #2f7d6b 100%)',
  'linear-gradient(135deg, #3b2f17 0%, #9a6b2c 100%)',
  'linear-gradient(135deg, #22381f 0%, #5f8f35 100%)',
  'linear-gradient(135deg, #3a1f2b 0%, #a0485c 100%)',
];

function hash(text = '') {
  let h = 0;
  for (let i = 0; i < text.length; i += 1) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h;
}

export const coverFor = (name) => COVERS[hash(name) % COVERS.length];
export const darkCoverFor = (name) => DARK_COVERS[hash(name) % DARK_COVERS.length];

/** Distance in km between two coordinates (Haversine) */
export function distanceKm(lat1, lng1, lat2, lng2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const a =
    Math.sin(toRad(lat2 - lat1) / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(toRad(lng2 - lng1) / 2) ** 2;
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

/** Next date (from today) when one of `days` happens: returns { date, inDays } */
export function nextOccurrence(days = [], from = new Date()) {
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(from);
    d.setDate(d.getDate() + i);
    if (days.includes(d.getDay())) return { date: d, inDays: i };
  }
  return null;
}

export function googleDirectionsUrl(lat, lng) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export function osmDirectionsUrl(lat, lng) {
  return `https://www.openstreetmap.org/directions?to=${lat}%2C${lng}#map=15/${lat}/${lng}`;
}

export function assetUrl(path) {
  if (!path) return '';
  return path;
}
