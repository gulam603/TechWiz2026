import { API_BASE } from '../config';

/** Error thrown for non-2xx responses. `status` and `details` come from the API. */
export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function request(method, path, body, { isForm = false, signal } = {}) {
  const options = { method, credentials: 'include', headers: {}, signal };
  if (body !== undefined) {
    if (isForm) options.body = body; // FormData: the browser sets the multipart header itself
    else {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }
  }
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, options);
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError('Cannot reach the server. Please check your connection.', 0);
  }
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(data?.message || `Request failed (${res.status})`, res.status, data?.details);
  return data;
}

/** Builds "?a=1&b=2" from an object, skipping empty values. */
export function toQuery(params = {}) {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '' || value === false) continue;
    q.set(key, value);
  }
  const s = q.toString();
  return s ? `?${s}` : '';
}

/** Turns a plain object into FormData (used for image uploads). */
export function toFormData(values, files = {}) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined || value === null) continue;
    fd.append(key, Array.isArray(value) ? value.join(',') : value);
  }
  for (const [key, file] of Object.entries(files)) if (file) fd.append(key, file);
  return fd;
}

export const api = {
  get: (path, opts) => request('GET', path, undefined, opts),
  post: (path, body) => request('POST', path, body ?? {}),
  put: (path, body) => request('PUT', path, body ?? {}),
  patch: (path, body) => request('PATCH', path, body ?? {}),
  del: (path) => request('DELETE', path),
  upload: (method, path, formData) => request(method, path, formData, { isForm: true }),
};
