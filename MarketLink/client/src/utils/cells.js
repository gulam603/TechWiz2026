import { ORDER_STATUS_META, PRODUCT_STATUS_LABEL, formatDate, formatDateKey, initials, money } from './format';

// HTML helpers for DataTables cells. DataTables renders plain HTML, so every value is escaped.
// Links use data-href so the grid can open them with the React router (no page reload).

export const esc = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export const link = (href, text, cls = 'fw-semi') => `<a href="${esc(href)}" data-href="${esc(href)}" class="${cls}">${esc(text)}</a>`;

export function badge(status, label) {
  const raw = label || ORDER_STATUS_META[status]?.label || PRODUCT_STATUS_LABEL[status] || String(status || '');
  return `<span class="status-badge s-${esc(status)}"><span class="dot"></span>${esc(raw.charAt(0).toUpperCase() + raw.slice(1))}</span>`;
}

export const moneyCell = (v) => `<span class="text-nowrap fw-semi">${esc(money(v))}</span>`;
export const dateCell = (v, time = false) => (v ? `<span class="text-nowrap">${esc(formatDate(v, { time }))}</span>` : '<span class="text-muted-2">–</span>');
export const dayCell = (key) => (key ? `<span class="text-nowrap">${esc(formatDateKey(key))}</span>` : '–');
export const muted = (text) => `<span class="fs-7 text-muted-2">${esc(text)}</span>`;

export function person(name, sub, avatar) {
  const pic = avatar ? `<span class="avatar avatar-sm has-photo"><img src="${esc(avatar)}" alt=""></span>` : `<span class="avatar avatar-sm">${esc(initials(name || '?'))}</span>`;
  return `<div class="d-flex align-items-center gap-2">${pic}<div class="min-w-0"><strong class="d-block small text-truncate">${esc(name)}</strong>${sub ? muted(sub) : ''}</div></div>`;
}

/** Row action button handled by DataGrid's onAction(action, row). */
export const action = (name, label, cls = 'btn-white', icon = '') =>
  `<button type="button" class="btn btn-sm ${cls}" data-action="${esc(name)}" aria-label="${esc(label || name)}">${icon ? `<i class="bi ${esc(icon)}"></i> ` : ''}${esc(label)}</button>`;

/**
 * Column renderer: HTML for the screen, plain values for sorting, search and CSV/Excel export.
 * `plain(value, row)` can turn objects into export text.
 */
export const display = (fn, plain) => (value, type, row) => {
  if (type === 'display') return fn(value, row);
  const v = plain ? plain(value, row) : value;
  return v ?? '';
};
